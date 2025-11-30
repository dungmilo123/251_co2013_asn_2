"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    GraduationCap,
    Plus,
    Check,
    X,
    AlertCircle,
    TrendingUp,
    Award,
    Calendar,
} from "lucide-react";

interface Course {
    course_id: number;
    course_code: string;
    title: string;
    credits: number;
    department?: string;
    enrollment_date?: string;
    final_grade?: number;
    completion_status?: string;
}

interface AvailableCourse extends Course {
    description?: string;
    max_capacity?: number;
    enrolled_count?: number;
    prerequisites?: Array<{
        course_code: string;
        title: string;
        min_grade: number;
        completed: boolean;
    }>;
    prereqsMet?: boolean;
    canEnroll?: boolean;
    isFull?: boolean;
}

interface Student {
    student_code: string;
    gpa: number;
    year_level: number;
    program: string;
}

export default function StudentDashboard() {
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
        [],
    );
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch enrolled courses and student info
            const coursesRes = await fetch("/api/student/courses");
            const coursesData = await coursesRes.json();

            if (coursesRes.ok) {
                setEnrolledCourses(coursesData.courses);
                setStudent(coursesData.student);
            }

            // Fetch available courses
            const availableRes = await fetch("/api/student/available-courses");
            const availableData = await availableRes.json();

            if (availableRes.ok) {
                setAvailableCourses(availableData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: number) => {
        setEnrolling(true);
        setMessage(null);

        try {
            const res = await fetch("/api/student/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    type: "success",
                    text: "Successfully enrolled in course!",
                });
                // Refresh data
                fetchData();
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to enroll",
                });
            }
        } catch {
            setMessage({
                type: "error",
                text: "Connection error. Please try again.",
            });
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap");

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-15px) rotate(1deg);
                    }
                }

                .animate-slide-in-up {
                    opacity: 0;
                    animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)
                        forwards;
                }

                .animate-fade-in {
                    opacity: 0;
                    animation: fadeIn 1s ease-out forwards;
                }

                /* Prevent animation flickering by ensuring smooth transitions */
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .floating-shape {
                    animation: float 8s ease-in-out infinite;
                }

                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .card-hover:hover {
                    transform: translateY(-4px);
                    box-shadow:
                        0 20px 25px -5px rgba(0, 85, 141, 0.1),
                        0 10px 10px -5px rgba(0, 85, 141, 0.04);
                }

                .stat-card {
                    background: linear-gradient(
                        135deg,
                        #ffffff 0%,
                        #f8fafc 100%
                    );
                    border: 1px solid rgba(0, 85, 141, 0.1);
                    position: relative;
                    overflow: hidden;
                }

                .stat-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(
                        135deg,
                        rgba(0, 85, 141, 0.05) 0%,
                        transparent 70%
                    );
                    border-radius: 0 0 0 100%;
                }

                .hcmut-gradient {
                    background: linear-gradient(
                        135deg,
                        #00558d 0%,
                        #003d66 100%
                    );
                }

                .course-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-left: 4px solid transparent;
                }

                .course-card:hover {
                    border-left-color: #00558d;
                    transform: translateX(8px);
                }

                .btn-primary {
                    background: linear-gradient(
                        135deg,
                        #00558d 0%,
                        #003d66 100%
                    );
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .btn-primary::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    transition: left 0.5s;
                }

                .btn-primary:hover::before {
                    left: 100%;
                }

                .input-focus-effect:focus {
                    outline: none;
                    border-color: #00558d;
                    box-shadow: 0 0 0 3px rgba(0, 85, 141, 0.1);
                }
            `}</style>

            <div
                className="space-y-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                {/* Page Header with Geometric Design */}
                <div className="relative overflow-hidden rounded-2xl p-8 hcmut-gradient text-white animate-slide-in-up">
                    <div className="absolute top-8 right-8 w-24 h-24 floating-shape opacity-20">
                        <div className="w-full h-full border-4 border-white transform rotate-45"></div>
                    </div>
                    <div
                        className="absolute bottom-8 right-32 w-16 h-16 floating-shape opacity-15"
                        style={{ animationDelay: "2s" }}
                    >
                        <div className="w-full h-full bg-white transform rotate-12"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <GraduationCap className="w-12 h-12" />
                            <h1 className="text-4xl font-bold tracking-tight">
                                Student Dashboard
                            </h1>
                        </div>
                        <p className="text-lg opacity-90 max-w-2xl">
                            Manage your academic journey, track progress, and
                            discover new learning opportunities
                        </p>
                    </div>
                </div>

                {/* GPA and Student Info Cards */}
                {student && (
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <div className="stat-card rounded-2xl p-6 card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Academic GPA
                                    </div>
                                    <div
                                        className="text-4xl font-bold"
                                        style={{ color: "#00558d" }}
                                    >
                                        {Number(student.gpa || 0).toFixed(2)}
                                    </div>
                                </div>
                                <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Award className="w-4 h-4" />
                                <span>Current Semester</span>
                            </div>
                        </div>

                        <div className="stat-card rounded-2xl p-6 card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        Year Level
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900">
                                        {student.year_level || "N/A"}
                                    </div>
                                </div>
                                <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span>Academic Progress</span>
                            </div>
                        </div>


                    </div>
                )}

                {/* Message Alert */}
                {message && (
                    <div
                        className="animate-fade-in"
                        style={{ animationDelay: "0.4s" }}
                    >
                        <div
                            className={`relative rounded-2xl px-6 py-4 border-l-4 ${
                                message.type === "success"
                                    ? "bg-linear-to-r from-green-50 to-emerald-50 border-l-green-500 text-green-800"
                                    : "bg-linear-to-r from-red-50 to-pink-50 border-l-red-500 text-red-800"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {message.type === "success" ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className="font-medium">
                                    {message.text}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrolled Courses */}
                <div
                    className="animate-fade-in"
                    style={{ animationDelay: "0.6s" }}
                >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
                        <div className="hcmut-gradient text-white px-8 py-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <BookOpen className="w-6 h-6" />
                                My Enrolled Courses
                            </h2>
                            <p className="mt-2 opacity-90">
                                Track your current academic progress and
                                achievements
                            </p>
                        </div>
                        <div className="p-8">
                            {enrolledCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-lg font-medium">
                                        No enrolled courses yet
                                    </p>
                                    <p className="text-gray-400 mt-2">
                                        Start building your academic journey
                                        below
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left pb-3 font-semibold text-gray-700">
                                                    Course Code
                                                </th>
                                                <th className="text-left pb-3 font-semibold text-gray-700">
                                                    Title
                                                </th>
                                                <th className="text-left pb-3 font-semibold text-gray-700">
                                                    Credits
                                                </th>
                                                <th className="text-left pb-3 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                                <th className="text-left pb-3 font-semibold text-gray-700">
                                                    Grade
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledCourses.map(
                                                (course, index) => (
                                                    <tr
                                                        key={course.course_id}
                                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                                        style={{
                                                            animationDelay: `${0.8 + index * 0.05}s`,
                                                        }}
                                                    >
                                                        <td className="py-4">
                                                            <div
                                                                className="px-3 py-1 rounded-lg font-mono font-bold inline-block"
                                                                style={{
                                                                    color: "#00558d",
                                                                    background:
                                                                        "#e6f0f5",
                                                                }}
                                                            >
                                                                {
                                                                    course.course_code
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <Link href={`/dashboard/courses/${course.course_id}`} className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                                                                {course.title}
                                                            </Link>
                                                            {course.department && (
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {
                                                                        course.department
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 text-gray-900">
                                                            {course.credits}
                                                        </td>
                                                        <td className="py-4">
                                                            <span
                                                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                                    course.completion_status ===
                                                                    "Completed"
                                                                        ? "bg-linear-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                                                        : "bg-linear-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                                                                }`}
                                                            >
                                                                {
                                                                    course.completion_status
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <div
                                                                className="text-xl font-bold"
                                                                style={{
                                                                    color: "#00558d",
                                                                }}
                                                            >
                                                                {course.final_grade
                                                                    ? Number(
                                                                          course.final_grade,
                                                                      ).toFixed(
                                                                          1,
                                                                      )
                                                                    : "-"}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Course Registration */}
                <div
                    className="animate-fade-in"
                    style={{ animationDelay: "1.0s" }}
                >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Plus
                                    className="w-6 h-6"
                                    style={{ color: "#00558d" }}
                                />
                                Available Courses
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Discover new learning opportunities and expand
                                your horizons
                            </p>
                        </div>
                        <div className="p-8">
                            {availableCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Plus className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-lg font-medium">
                                        No courses available for registration
                                    </p>
                                    <p className="text-gray-400 mt-2">
                                        Check back later for new opportunities
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {availableCourses.map((course, index) => (
                                        <div
                                            key={course.course_id}
                                            className="relative rounded-2xl p-6 border border-gray-200 bg-linear-to-br from-gray-50 via-white to-blue-50/30"
                                            style={{
                                                animationDelay: `${1.2 + index * 0.15}s`,
                                            }}
                                        >
                                            {/* Course Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="px-4 py-2 rounded-lg font-mono font-bold text-white hcmut-gradient">
                                                            {course.course_code}
                                                        </div>
                                                        <span className="text-gray-400">
                                                            •
                                                        </span>
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            <Link href={`/dashboard/courses/${course.course_id}`} className="hover:text-blue-600 transition-colors">
                                                                {course.title}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            {course.credits}{" "}
                                                            credits
                                                        </span>
                                                        {course.department && (
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                                {
                                                                    course.department
                                                                }
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            {
                                                                course.enrolled_count
                                                            }
                                                            /
                                                            {
                                                                course.max_capacity
                                                            }{" "}
                                                            enrolled
                                                        </span>
                                                    </div>
                                                    {course.description && (
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {course.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Prerequisites */}
                                            {course.prerequisites &&
                                                course.prerequisites.length >
                                                    0 && (
                                                    <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                                                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Prerequisites
                                                        </p>
                                                        <div className="space-y-2">
                                                            {course.prerequisites.map(
                                                                (
                                                                    prereq,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center gap-3 text-sm"
                                                                    >
                                                                        <div className="shrink-0">
                                                                            {prereq.completed ? (
                                                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                                                    <Check className="w-4 h-4 text-green-600" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                                                    <X className="w-4 h-4 text-red-600" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <span
                                                                                className={`font-medium ${prereq.completed ? "text-green-700" : "text-red-700"}`}
                                                                            >
                                                                                {
                                                                                    prereq.course_code
                                                                                }
                                                                            </span>
                                                                            <span className="text-gray-500 ml-2">
                                                                                (minimum
                                                                                grade:{" "}
                                                                                {
                                                                                    prereq.min_grade
                                                                                }
                                                                                )
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Warnings */}
                                            {!course.prereqsMet &&
                                                course.prerequisites &&
                                                course.prerequisites.length >
                                                    0 && (
                                                    <div className="mb-4 p-4 rounded-xl bg-linear-to-r from-red-50 to-pink-50 border-l-4 border-l-red-500">
                                                        <div className="flex items-start gap-3">
                                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-red-800">
                                                                    Prerequisites
                                                                    not met
                                                                </p>
                                                                <p className="text-sm text-red-700 mt-1">
                                                                    Complete the
                                                                    required
                                                                    courses
                                                                    before
                                                                    enrolling
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            {course.isFull && (
                                                <div className="mb-4 p-4 rounded-xl bg-linear-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-orange-800">
                                                                Course is full
                                                            </p>
                                                            <p className="text-sm text-orange-700 mt-1">
                                                                Maximum capacity
                                                                reached. Check
                                                                back for
                                                                openings.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() =>
                                                        handleEnroll(
                                                            course.course_id,
                                                        )
                                                    }
                                                    disabled={
                                                        !course.canEnroll ||
                                                        enrolling
                                                    }
                                                    className={`btn-primary px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                                                        course.canEnroll &&
                                                        !enrolling
                                                            ? "hover:shadow-xl hover:scale-[1.02]"
                                                            : "opacity-50 cursor-not-allowed"
                                                    }`}
                                                >
                                                    {enrolling ? (
                                                        <span className="flex items-center gap-2">
                                                            <svg
                                                                className="animate-spin h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Enrolling...
                                                        </span>
                                                    ) : (
                                                        "Enroll Now"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
