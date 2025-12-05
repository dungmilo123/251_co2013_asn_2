import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { handleApiError } from '@/lib/api-helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string; questionId: string }> }
) {
  try {
    const session = await requireStudent();
    const { courseId: _cid, quizId, questionId } = await params;
    const { answer, attemptId } = await request.json();

    // Validate active attempt
    const attempts = await query({
      query: `
        SELECT qa.*, q.time_limit_minutes, q.close_time
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
    const startTime = new Date(attempt.start_time);
    const timeLimitMs = attempt.time_limit_minutes * 60 * 1000;
    const closeTime = new Date(attempt.close_time);

    // Check time limits
    if (now > closeTime || (now.getTime() - startTime.getTime()) > timeLimitMs) {
      return NextResponse.json({ error: 'Time limit exceeded' }, { status: 400 });
    }

    // Get question details
    const questions = await query({
      query: 'SELECT * FROM Questions WHERE question_id = ? AND quiz_id = ?',
      values: [questionId, quizId]
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = questions[0];
    let isCorrect = false;
    let pointsEarned = 0;
    let selectedChoiceId = null;
    let textAnswer = null;

    // Validate answer based on question type
    switch (question.question_type) {
      case 'MultipleChoice':
        selectedChoiceId = answer.choiceId;
        const correctChoice = await query({
          query: 'SELECT choice_id FROM Question_Choices WHERE question_id = ? AND is_correct = TRUE',
          values: [questionId]
        });
        isCorrect = correctChoice.length > 0 && correctChoice[0].choice_id === selectedChoiceId;
        pointsEarned = isCorrect ? parseFloat(question.points.toString()) : 0;
        break;

      case 'TrueFalse':
        textAnswer = answer.value.toString();
        isCorrect = textAnswer.toLowerCase() === question.correct_answer?.toLowerCase();
        pointsEarned = isCorrect ? parseFloat(question.points.toString()) : 0;
        break;

      case 'ShortAnswer':
        textAnswer = answer.value.toString();
        // Simple exact match for now - could be enhanced with fuzzy matching
        isCorrect = textAnswer.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
        pointsEarned = isCorrect ? parseFloat(question.points.toString()) : 0;
        break;

      default:
        return NextResponse.json({ error: 'Invalid question type' }, { status: 400 });
    }

    // Store answer (UPSERT to handle re-answers)
    await query({
      query: `
        INSERT INTO Quiz_Answers
        (attempt_id, question_id, selected_choice_id, text_answer, is_correct, points_earned)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        selected_choice_id = VALUES(selected_choice_id),
        text_answer = VALUES(text_answer),
        is_correct = VALUES(is_correct),
        points_earned = VALUES(points_earned),
        answered_at = CURRENT_TIMESTAMP
      `,
      values: [attemptId, questionId, selectedChoiceId, textAnswer, isCorrect, pointsEarned]
    });

    return NextResponse.json({
      success: true,
      pointsEarned
    });

  } catch (error: unknown) {
    return handleApiError(error, 'submit quiz answer');
  }
}
