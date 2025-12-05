import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

interface AttemptWithTotal {
  attempt_id: number;
  total_attempts: number;
  [key: string]: unknown;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await requireStudent();
    const { courseId, quizId } = await params;

    // Get quiz info and all attempts
    const [quiz, attempts] = await Promise.all([
      query({
        query: "SELECT * FROM Quizzes WHERE quiz_id = ? AND course_id = ?",
        values: [quizId, courseId],
      }),
      query({
        query: `
          SELECT qa.*,
                 (SELECT COUNT(*) FROM Quiz_Attempts WHERE quiz_id = ? AND student_code = ?) as total_attempts
          FROM Quiz_Attempts qa
          WHERE qa.quiz_id = ? AND qa.student_code = ?
          ORDER BY qa.attempt_number DESC
        `,
        values: [quizId, session.studentCode, quizId, session.studentCode],
      }),
    ]);

    if (quiz.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quizData = quiz[0];

    // For each attempt, get detailed answers
    const attemptsWithDetails = await Promise.all(
      (attempts as AttemptWithTotal[]).map(async (attempt) => {
        const answers = await query({
          query: `
            SELECT qa.*, q.question_text, q.question_type, q.points as max_points,
                   qc.choice_text, qc.is_correct as correct_choice
            FROM Quiz_Answers qa
            JOIN Questions q ON qa.question_id = q.question_id
            LEFT JOIN Question_Choices qc ON qa.selected_choice_id = qc.choice_id
            WHERE qa.attempt_id = ?
            ORDER BY q.question_id
          `,
          values: [attempt.attempt_id],
        });

        // Convert DECIMAL fields from strings to numbers
        return {
          ...attempt,
          total_score: attempt.total_score
            ? parseFloat(attempt.total_score as string)
            : 0,
          duration: attempt.duration ? parseInt(attempt.duration as string) : 0,
          answers: answers.map((answer: any) => ({
            ...answer,
            points_earned: answer.points_earned
              ? parseFloat(answer.points_earned)
              : 0,
            max_points: answer.max_points ? parseFloat(answer.max_points) : 0,
            time_taken: answer.time_taken ? parseInt(answer.time_taken) : 0,
          })),
        };
      })
    );

    return NextResponse.json({
      quiz: {
        title: quizData.title,
        description: quizData.description,
        totalPoints: quizData.total_points
          ? parseFloat(quizData.total_points)
          : 0,
        passingScore: quizData.passing_score
          ? parseFloat(quizData.passing_score)
          : 0,
        attemptsAllowed: quizData.attempts_allowed
          ? parseInt(quizData.attempts_allowed)
          : 1,
      },
      attempts: attemptsWithDetails,
    });
  } catch (error: unknown) {
    return handleApiError(error, "get quiz results");
  }
}
