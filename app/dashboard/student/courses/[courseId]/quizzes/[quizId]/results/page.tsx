"use client";
import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, XCircle, Clock, Award, AlertCircle } from "lucide-react";
import { QuizAttempt, QuizAnswer } from "@/lib/definitions";

interface ResultsData {
  quiz: {
    title: string;
    description: string;
    totalPoints: number;
    passingScore: number;
    attemptsAllowed: number;
  };
  attempts: (QuizAttempt & { answers: QuizAnswer[] })[];
}

export default function QuizResultsPage({
  params
}: {
  params: Promise<{ courseId: string; quizId: string }>
}) {
  const { courseId, quizId } = use(params);
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttempt, setExpandedAttempt] = useState<number | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}/quizzes/${quizId}/results`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch results');
      }

      const data = await res.json();
      setResults(data);
    } catch (error: unknown) {
      console.error('Failed to fetch results:', error);
      setError((error as Error).message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBg = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
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

  if (!results) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load results</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{results.quiz.title}</h1>
            {results.quiz.description && (
              <p className="text-gray-600">{results.quiz.description}</p>
            )}
          </div>
          <button
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Total Points</div>
            <div className="text-2xl font-bold text-blue-800">{results.quiz.totalPoints}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Passing Score</div>
            <div className="text-2xl font-bold text-green-800">{results.quiz.passingScore}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Attempts</div>
            <div className="text-2xl font-bold text-purple-800">
              {results.attempts.length}/{results.quiz.attemptsAllowed}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-orange-600 text-sm font-medium">Best Score</div>
            <div className={`text-2xl font-bold ${getGradeColor(
              Math.max(...results.attempts.map(a => a.total_score)),
              results.quiz.totalPoints || 100
            )}`}>
              {Math.max(...results.attempts.map(a => a.total_score)).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Attempt History
        </h2>

        {results.attempts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            No attempts recorded yet.
          </div>
        ) : (
          results.attempts.map((attempt) => (
            <div key={attempt.attempt_id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Attempt Header */}
              <div 
                className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedAttempt(expandedAttempt === attempt.attempt_id ? null : attempt.attempt_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-gray-800">
                      Attempt #{attempt.attempt_number}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getGradeBg(attempt.total_score, results.quiz.totalPoints || 100)
                    }`}>
                      {attempt.total_score.toFixed(1)}/{results.quiz.totalPoints || 100}
                    </div>
                    <div className={`text-sm font-medium ${getGradeColor(
                      attempt.total_score, results.quiz.totalPoints || 100
                    )}`}>
                      {((attempt.total_score / (results.quiz.totalPoints || 100)) * 100).toFixed(1)}%
                    </div>
                    {attempt.status === 'Submitted' && attempt.total_score >= (results.quiz.passingScore || 0) && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Passed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {attempt.duration ? formatDuration(attempt.duration) : 'N/A'}
                    </div>
                    <div>
                      {new Date(attempt.completion_time || attempt.start_time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attempt Details */}
              {expandedAttempt === attempt.attempt_id && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Answer Breakdown</h3>
                  <div className="space-y-4">
                    {attempt.answers.map((answer) => (
                      <div key={answer.answer_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            answer.is_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {answer.is_correct ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 mb-2">
                              {(answer as { question_text?: string }).question_text || `Question ${answer.question_id}`}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {answer.selected_choice_id && (
                                <div>Your answer: {answer.selected_choice_id}</div>
                              )}
                              {answer.text_answer && (
                                <div>Your answer: {answer.text_answer}</div>
                              )}
                              <div className="flex items-center gap-2">
                                Points: <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                                  {answer.points_earned}/{(answer as { max_points?: number }).max_points || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
