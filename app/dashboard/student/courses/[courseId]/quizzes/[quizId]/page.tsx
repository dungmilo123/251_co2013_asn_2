"use client";
import { useEffect, useState, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Question } from "@/lib/definitions";

interface Answer {
  choiceId?: number;
  value?: string;
}

interface QuizData {
  attemptId: number;
  quiz: {
    title: string;
    description: string;
    timeLimit: number;
    closeTime: string;
  };
  questions: Question[];
}

export default function QuizTakingPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = use(params);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useCallback(async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/student/courses/${courseId}/quizzes/${quizId}/start`,
        {
          method: "POST",
          signal: abortControllerRef.current.signal,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start quiz");
      }

      const quizDataResponse = await res.json();
      setQuizData(quizDataResponse);
      setTimeRemaining(quizDataResponse.quiz.timeLimit * 60); // Convert to seconds
    } catch (error: unknown) {
      // Ignore abort errors from React Strict Mode double-mount
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("Failed to start quiz:", error);
      setError((error as Error).message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId]);

  const handleAnswer = async (questionId: number, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (!quizData) return;

    try {
      const res = await fetch(
        `/api/student/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answer,
            attemptId: quizData.attemptId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save answer");
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!quizData || submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/student/courses/${courseId}/quizzes/${quizId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId: quizData.attemptId }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      await res.json();
      router.push(
        `/dashboard/student/courses/${courseId}/quizzes/${quizId}/results`
      );
    } catch (error: unknown) {
      console.error("Failed to submit quiz:", error);
      setError((error as Error).message || "Failed to submit quiz");
      setSubmitting(false);
    }
  }, [courseId, quizId, quizData, submitting, router]);

  useEffect(() => {
    startQuiz();

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [startQuiz]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit(); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 mb-4 text-red-600" />
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Course
        </button>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load quiz</div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizData.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {quizData.quiz.title}
          </h1>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {quizData.quiz.description && (
          <p className="text-gray-600">{quizData.quiz.description}</p>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
            {currentQuestion + 1}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQ.question_text}
            </h2>

            <div className="text-sm text-gray-500 mb-4">
              {currentQ.points} points
            </div>

            {/* Answer Options */}
            {currentQ.question_type === "MultipleChoice" && (
              <div className="space-y-3">
                {currentQ.choices?.map((choice) => (
                  <label
                    key={choice.choice_id}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-purple-50"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.question_id}`}
                      value={choice.choice_id}
                      checked={
                        answers[currentQ.question_id]?.choiceId ===
                        choice.choice_id
                      }
                      onChange={(e) =>
                        handleAnswer(currentQ.question_id, {
                          choiceId: parseInt(e.target.value),
                        })
                      }
                      className="mr-3"
                    />
                    <span className="text-gray-700">{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQ.question_type === "TrueFalse" && (
              <div className="space-y-3">
                {["true", "false"].map((value) => (
                  <label
                    key={value}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-purple-50"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.question_id}`}
                      value={value}
                      checked={answers[currentQ.question_id]?.value === value}
                      onChange={(e) =>
                        handleAnswer(currentQ.question_id, {
                          value: e.target.value,
                        })
                      }
                      className="mr-3"
                    />
                    <span className="text-gray-700 capitalize">{value}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQ.question_type === "ShortAnswer" && (
              <textarea
                value={answers[currentQ.question_id]?.value || ""}
                onChange={(e) =>
                  handleAnswer(currentQ.question_id, { value: e.target.value })
                }
                className="w-full p-4 border-2 rounded-lg focus:border-purple-500 focus:outline-none"
                rows={4}
                placeholder="Type your answer here..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {quizData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                index === currentQuestion
                  ? "bg-purple-600 text-white"
                  : answers[quizData.questions[index].question_id]
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quizData.questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentQuestion(
                Math.min(quizData.questions.length - 1, currentQuestion + 1)
              )
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
