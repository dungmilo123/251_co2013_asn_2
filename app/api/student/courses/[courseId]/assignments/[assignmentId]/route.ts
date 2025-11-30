import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const { courseId, assignmentId } = await params;
    const session = await requireStudent();
    const studentCode = session.studentCode!;

    // 1. Verify enrollment
    const enrollment = await query({
      query: 'SELECT 1 FROM Enrollments WHERE student_code = ? AND course_id = ?',
      values: [studentCode, courseId],
    });

    if ((enrollment as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // 2. Fetch Assignment Details
    const assignments = await query({
      query: `
        SELECT 
            assignment_id, course_id, title, instruction, weight, max_score, 
            opening_date, due_date, submission_type, late_submission_allowed, late_penalty
        FROM Assignments 
        WHERE assignment_id = ? AND course_id = ?
      `,
      values: [assignmentId, courseId],
    });

    if ((assignments as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignment = (assignments as any[])[0];

    // 3. Fetch Submission Status
    const submissions = await query({
      query: `
        SELECT 
            submission_id, date, content, file_path, file_name, score, status, is_late
        FROM Submissions
        WHERE assignment_id = ? AND student_code = ?
      `,
      values: [assignmentId, studentCode],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = (submissions as unknown[]).length > 0 ? (submissions as any[])[0] : null;

    return NextResponse.json({
      assignment,
      submission,
    });

  } catch (error: unknown) {
    return handleApiError(error, 'fetching assignment details');
  }
}
