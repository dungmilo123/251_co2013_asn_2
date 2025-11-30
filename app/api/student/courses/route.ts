import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Student role with valid student code
    const session = await requireStudent();

    // Get enrolled courses for this student
    const courses: any = await query({
      query: `
        SELECT
          c.course_id,
          c.course_code,
          c.title,
          c.credits,
          c.department,
          e.enrollment_date,
          e.final_grade,
          e.completion_status
        FROM Enrollments e
        JOIN Courses c ON e.course_id = c.course_id
        WHERE e.student_code = ?
        ORDER BY e.enrollment_date DESC
      `,
      values: [session.studentCode],
    });

    // Also get student GPA and year level
    const studentInfo: any = await query({
      query: `
        SELECT gpa, year_level, program
        FROM Students
        WHERE student_code = ?
      `,
      values: [session.studentCode],
    });

    return NextResponse.json({
      courses,
      student: studentInfo[0] || {},
    });
  } catch (error: any) {
    return handleApiError(error, 'fetch student courses');
  }
}
