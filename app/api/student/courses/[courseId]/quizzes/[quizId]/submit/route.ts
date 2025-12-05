import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { handleApiError } from '@/lib/api-helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await requireStudent();
    const { courseId: _cid, quizId } = await params;
    const { attemptId } = await request.json();

    // Validate and get attempt details
    const attempts = await query({
      query: `
        SELECT qa.*, q.grading_method, q.attempts_allowed
        FROM Quiz_Attempts qa
        JOIN Quizzes q ON qa.quiz_id = q.quiz_id
        WHERE qa.attempt_id = ? AND qa.student_code = ? AND qa.status = 'InProgress'
      `,
      values: [attemptId, session.studentCode]
    });

    if (attempts.length === 0) {
      return NextResponse.json({ error: 'No active attempt found' }, { status: 404 });
    }

    const attempt = attempts[0];
    const now = new Date();

    // Calculate total score and duration
    const scoreResult = await query({
      query: `
        SELECT COALESCE(SUM(points_earned), 0) as total_score,
               COUNT(*) as questions_answered
        FROM Quiz_Answers
        WHERE attempt_id = ?
      `,
      values: [attemptId]
    });

    const totalScore = parseFloat(scoreResult[0].total_score);
    const duration = Math.floor((now.getTime() - new Date(attempt.start_time).getTime()) / 1000);

    // Update attempt with completion data
    await query({
      query: `
        UPDATE Quiz_Attempts
        SET completion_time = ?, duration = ?, total_score = ?, status = 'Submitted'
        WHERE attempt_id = ?
      `,
      values: [now.toISOString().slice(0, 19).replace('T', ' '), duration, totalScore, attemptId]
    });

    // If grading method is not 'Highest' and this isn't the first attempt,
    // we might need to recalculate the final grade based on all attempts
    if (attempt.attempts_allowed > 1) {
      const allAttempts = await query({
        query: `
          SELECT total_score, status
          FROM Quiz_Attempts
          WHERE quiz_id = ? AND student_code = ? AND status = 'Submitted'
          ORDER BY attempt_number
        `,
        values: [quizId, session.studentCode]
      });

      let finalScore = totalScore;

      switch (attempt.grading_method) {
        case 'Average':
          const avgScore = allAttempts.reduce((sum: number, att: { total_score: string }) => sum + parseFloat(att.total_score), 0) / allAttempts.length;
          finalScore = avgScore;
          break;
        case 'Last':
          finalScore = totalScore; // Already using current attempt
          break;
        // 'Highest' is default - already handled
      }

      // Update current attempt with final score if different method
      if (attempt.grading_method !== 'Highest') {
        await query({
          query: `
            UPDATE Quiz_Attempts
            SET total_score = ?
            WHERE attempt_id = ?
          `,
          values: [finalScore, attemptId]
        });
      }
    }

    return NextResponse.json({
      success: true,
      score: totalScore,
      duration,
      submittedAt: now
    });

  } catch (error: unknown) {
    return handleApiError(error, 'submit quiz attempt');
  }
}
