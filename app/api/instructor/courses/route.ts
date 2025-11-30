import { NextResponse } from 'next/server';
import { requireInstructor } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Instructor role with valid instructor code
    const session = await requireInstructor();

    // Get courses taught by this instructor
    const courses: any = await query({
      query: `
        SELECT
          c.course_id,
          c.course_code,
          c.title,
          c.credits,
          c.department,
          c.start_date,
          c.end_date,
          t.semester,
          t.role as teaching_role,
          (SELECT COUNT(*) FROM Enrollments WHERE course_id = c.course_id) as enrolled_count
        FROM Teaching t
        JOIN Courses c ON t.course_id = c.course_id
        WHERE t.instructor_code = ?
        ORDER BY t.semester DESC, c.course_code
      `,
      values: [session.instructorCode],
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    return handleApiError(error, 'fetch instructor courses');
  }
}
