import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    // Require Student role with valid student code
    const session = await requireStudent();

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await query({
      query: 'SELECT * FROM Enrollments WHERE student_code = ? AND course_id = ?',
      values: [session.studentCode, courseId],
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Check course capacity
    const courseInfo = await query({
      query: `
        SELECT c.max_capacity, COUNT(e.enrollment_id) as enrolled_count
        FROM Courses c
        LEFT JOIN Enrollments e ON c.course_id = e.course_id
        WHERE c.course_id = ?
        GROUP BY c.course_id, c.max_capacity
      `,
      values: [courseId],
    });

    if (courseInfo.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseInfoRow = courseInfo[0];
    if (courseInfoRow.enrolled_count >= courseInfoRow.max_capacity) {
      return NextResponse.json(
        { error: 'Course is full' },
        { status: 400 }
      );
    }

    // Check prerequisites
    const prereqs = await query({
      query: `
        SELECT prerequisite_id, min_grade
        FROM Prerequisites
        WHERE course_id = ?
      `,
      values: [courseId],
    });

    for (const prereq of prereqs) {
      const studentGrade = await query({
        query: `
          SELECT final_grade, completion_status
          FROM Enrollments
          WHERE student_code = ? AND course_id = ?
        `,
        values: [session.studentCode, prereq.prerequisite_id],
      });

      const gradeRow = studentGrade[0];

      if (
        studentGrade.length === 0 ||
        gradeRow.completion_status !== 'Completed' ||
        (gradeRow.final_grade || 0) < (prereq.min_grade || 5.0)
      ) {
        return NextResponse.json(
          { error: 'Prerequisites not met' },
          { status: 400 }
        );
      }
    }

    // Enroll the student
    await query({
      query: `
        INSERT INTO Enrollments (student_code, course_id, enrollment_date, completion_status)
        VALUES (?, ?, NOW(), 'Active')
      `,
      values: [session.studentCode, courseId],
    });

    return NextResponse.json({
      message: 'Successfully enrolled in course',
    });
  } catch {
    return handleApiError(null, 'enroll in course');
  }
}
