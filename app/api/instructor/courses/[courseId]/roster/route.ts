import { NextResponse } from 'next/server';
import { requireInstructor } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require Instructor role with valid instructor code
    const session = await requireInstructor();

    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Verify instructor teaches this course
    const teaching: any = await query({
      query: `
        SELECT * FROM Teaching
        WHERE instructor_code = ? AND course_id = ?
      `,
      values: [session.instructorCode, courseId],
    });

    if (teaching.length === 0) {
      return NextResponse.json(
        { error: 'You do not teach this course' },
        { status: 403 }
      );
    }

    // Get course information
    const courseInfo: any = await query({
      query: `
        SELECT course_code, title, credits
        FROM Courses
        WHERE course_id = ?
      `,
      values: [courseId],
    });

    // Get enrolled students with their details
    const roster: any = await query({
      query: `
        SELECT
          e.enrollment_id,
          e.student_code,
          u.first_name,
          u.last_name,
          u.email,
          s.program,
          s.year_level,
          s.gpa,
          e.enrollment_date,
          e.final_grade,
          e.completion_status
        FROM Enrollments e
        JOIN Students s ON e.student_code = s.student_code
        JOIN Users u ON s.user_id = u.user_id
        WHERE e.course_id = ?
        ORDER BY u.last_name, u.first_name
      `,
      values: [courseId],
    });

    return NextResponse.json({
      course: courseInfo[0] || {},
      students: roster,
    });
  } catch (error: any) {
    return handleApiError(error, 'fetch course roster');
  }
}
