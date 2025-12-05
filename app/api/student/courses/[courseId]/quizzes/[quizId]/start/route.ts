import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await requireStudent();
    const { courseId, quizId } = await params;

    console.log(
      "[QUIZ START] Student:",
      session.studentCode,
      "CourseId:",
      courseId,
      "QuizId:",
      quizId
    );

    // Validate enrollment and quiz availability
    const [enrollment, quiz] = await Promise.all([
      query({
        query:
          "SELECT 1 FROM Enrollments WHERE student_code = ? AND course_id = ?",
        values: [session.studentCode, courseId],
      }),
      query({
        query: "SELECT * FROM Quizzes WHERE quiz_id = ? AND course_id = ?",
        values: [quizId, courseId],
      }),
    ]);

    console.log(
      "[QUIZ START] Enrollment check:",
      enrollment.length > 0 ? "PASS" : "FAIL"
    );
    console.log("[QUIZ START] Quiz found:", quiz.length > 0 ? "PASS" : "FAIL");

    if (enrollment.length === 0) {
      console.log("[QUIZ START] ERROR: Not enrolled in course");
      return NextResponse.json(
        { error: "Not enrolled in course" },
        { status: 403 }
      );
    }

    if (quiz.length === 0) {
      console.log("[QUIZ START] ERROR: Quiz not found");
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quizData = quiz[0];
    const now = new Date();
    const openTime = new Date(quizData.open_time);
    const closeTime = new Date(quizData.close_time);

    console.log(
      "[QUIZ START] Time check - Now:",
      now.toISOString(),
      "Open:",
      openTime.toISOString(),
      "Close:",
      closeTime.toISOString()
    );
    console.log("[QUIZ START] Quiz data:", {
      title: quizData.title,
      attemptsAllowed: quizData.attempts_allowed,
      timeLimit: quizData.time_limit_minutes,
    });

    // Check existing attempts with full details
    const existingAttempts = await query({
      query:
        "SELECT * FROM Quiz_Attempts WHERE quiz_id = ? AND student_code = ? ORDER BY attempt_number",
      values: [quizId, session.studentCode],
    });
    console.log(
      "[QUIZ START] Existing attempts count:",
      existingAttempts.length,
      "/ Max:",
      quizData.attempts_allowed
    );
    console.log(
      "[QUIZ START] Attempt details:",
      existingAttempts.map((a: any) => ({
        attemptId: a.attempt_id,
        attemptNumber: a.attempt_number,
        status: a.status,
        startTime: a.start_time,
        completionTime: a.completion_time,
      }))
    );

    if (now < openTime || now > closeTime) {
      console.log("[QUIZ START] ERROR: Quiz not available - timing issue");
      return NextResponse.json(
        { error: "Quiz not available" },
        { status: 400 }
      );
    }

    // Check for existing InProgress attempt (idempotency check)
    const inProgressAttempts = existingAttempts.filter(
      (a: any) => a.status === "InProgress"
    );

    let attemptId: number;

    if (inProgressAttempts.length > 0) {
      // Reuse existing in-progress attempt
      attemptId = inProgressAttempts[0].attempt_id;
      console.log(
        "[QUIZ START] Reusing existing InProgress attempt - AttemptId:",
        attemptId
      );
    } else {
      // Create new attempt (trigger will handle attempt number and limits)
      console.log("[QUIZ START] Attempting to create quiz attempt...");
      const attemptResult = await query({
        query:
          "INSERT INTO Quiz_Attempts (quiz_id, student_code, status) VALUES (?, ?, ?)",
        values: [quizId, session.studentCode, "InProgress"],
      });

      attemptId = (attemptResult as { insertId: number }).insertId;
      console.log(
        "[QUIZ START] Attempt created successfully - AttemptId:",
        attemptId
      );
    }

    // Fetch questions with optional shuffling
    const questionsQuery = `
      SELECT q.*,
             CASE
               WHEN q.question_type = 'MultipleChoice' THEN (
                 SELECT JSON_ARRAYAGG(
                   JSON_OBJECT('choice_id', c.choice_id, 'choice_text', c.choice_text, 'is_correct', c.is_correct)
                 )
                 FROM Question_Choices c WHERE c.question_id = q.question_id
               )
               ELSE NULL
             END as choices
      FROM Questions q
      WHERE q.quiz_id = ?
      ORDER BY ${quizData.shuffle_questions ? "RAND()" : "q.question_id"}
    `;

    const questions = await query({
      query: questionsQuery,
      values: [quizId],
    });

    console.log("[QUIZ START] Fetched", questions.length, "questions");

    // Process questions and handle answer shuffling if needed
    // Note: MySQL JSON_ARRAYAGG with mysql2 driver returns already-parsed objects, not JSON strings
    let processedQuestions = questions.map((q: Record<string, unknown>) => {
      // Choices are already parsed objects from MySQL - no JSON.parse needed
      return { ...q };
    });

    if (quizData.shuffle_answers) {
      processedQuestions = processedQuestions.map(
        (q: Record<string, unknown>) => ({
          ...q,
          choices: q.choices
            ? [...(q.choices as unknown[])].sort(() => Math.random() - 0.5)
            : null,
        })
      );
    }

    console.log("[QUIZ START] SUCCESS - Returning quiz data");
    return NextResponse.json({
      attemptId,
      quiz: {
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.time_limit_minutes,
        closeTime: quizData.close_time,
      },
      questions: processedQuestions,
    });
  } catch (error: unknown) {
    console.error("[QUIZ START] ERROR:", error);
    console.error("[QUIZ START] Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return handleApiError(error, "start quiz attempt");
  }
}
