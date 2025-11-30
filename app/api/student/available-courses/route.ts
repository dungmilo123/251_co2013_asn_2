import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Student role with valid student code
    const session = await requireStudent();

    // Get courses available for enrollment
    // Criteria: not already enrolled, enrollment period is open or no enrollment dates set
    const courses: any = await query({
      query: `
        SELECT
          c.course_id,
          c.course_code,
          c.title,
          c.credits,
          c.department,
          c.description,
          c.max_capacity,
          c.enrollment_start_date,
          c.enrollment_end_date,
          c.status,
          (SELECT COUNT(*) FROM Enrollments WHERE course_id = c.course_id) as enrolled_count
        FROM Courses c
        WHERE c.course_id NOT IN (
          SELECT course_id FROM Enrollments WHERE student_code = ?
        )
        AND (
          c.status = 'Planned' OR c.status = 'Active' OR
          (c.enrollment_start_date IS NULL OR NOW() >= c.enrollment_start_date)
        )
        AND (
          c.enrollment_end_date IS NULL OR NOW() <= c.enrollment_end_date
        )
        ORDER BY c.course_code
      `,
      values: [session.studentCode],
    });

    // For each course, check if prerequisites are met
    const coursesWithPrereqs = await Promise.all(
      courses.map(async (course: any) => {
        // Get prerequisites for this course
        const prereqs: any = await query({
          query: `
            SELECT
              p.prerequisite_id,
              p.min_grade,
              c.course_code,
              c.title
            FROM Prerequisites p
            JOIN Courses c ON p.prerequisite_id = c.course_id
            WHERE p.course_id = ?
          `,
          values: [course.course_id],
        });

        // Check if student has completed each prerequisite
        let prereqsMet = true;
        const prereqDetails = await Promise.all(
          prereqs.map(async (prereq: any) => {
            const studentGrade: any = await query({
              query: `
                SELECT final_grade, completion_status
                FROM Enrollments
                WHERE student_code = ? AND course_id = ?
              `,
              values: [session.studentCode, prereq.prerequisite_id],
            });

            const completed = studentGrade.length > 0 &&
              studentGrade[0].completion_status === 'Completed' &&
              (studentGrade[0].final_grade || 0) >= (prereq.min_grade || 5.0);

            if (!completed) {
              prereqsMet = false;
            }

            return {
              course_code: prereq.course_code,
              title: prereq.title,
              min_grade: prereq.min_grade,
              completed,
            };
          })
        );

        // Check capacity
        const isFull = course.enrolled_count >= course.max_capacity;

        return {
          ...course,
          prerequisites: prereqDetails,
          prereqsMet,
          canEnroll: prereqsMet && !isFull,
          isFull,
        };
      })
    );

    return NextResponse.json(coursesWithPrereqs);
  } catch (error: any) {
    return handleApiError(error, 'fetch available courses');
  }
}
