'use client';
import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Trash2, Database, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { CourseForm } from '@/components/admin/CourseForm';

interface Course {
    course_id: number;
    course_code: string;
    title: string;
    credits: number;
}

export default function CourseManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchCourses = useCallback(async () => {
        const res = await fetch(`/api/courses?search=${search}`);
        if (res.ok) {
            setCourses(await res.json());
        }
    }, [search]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this course?')) return;
        const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchCourses();
        }
    };

    const handleFormSuccess = () => {
        fetchCourses();
        setShowForm(false);
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

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
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-in-up {
          opacity: 0;
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }

        .hcmut-gradient {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
        }

        .btn-primary {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 85, 141, 0.2);
        }

        .course-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .course-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 85, 141, 0.1);
        }
      `}</style>

            <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl p-8 hcmut-gradient text-white animate-slide-in-up">
                    <div className="relative z-10">
                        <Link
                            href="/dashboard/admin"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <BookOpen className="w-10 h-10" />
                            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
                        </div>
                        <p className="mt-2 text-white/80">
                            Create, view, and manage all courses in the system
                        </p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="relative flex-1 max-w-md">
                        <input
                            placeholder="Search courses..."
                            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500 text-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Database className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {showForm ? 'Hide Form' : 'Add Course'}
                    </button>
                </div>

                {/* Course Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
                        </div>
                        <div className="p-8">
                            <CourseForm onSuccess={handleFormSuccess} />
                        </div>
                    </div>
                )}

                {/* Course List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            Course Catalog ({courses.length} courses)
                        </h2>
                    </div>
                    <div className="p-8">
                        {courses.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No courses found</p>
                                <p className="text-gray-400 mt-2">Click &quot;Add Course&quot; to create your first course</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courses.map((course) => (
                                    <div
                                        key={course.course_id}
                                        className="course-card group rounded-xl p-4 border border-gray-200 bg-gradient-to-r from-gray-50 via-white to-blue-50/30"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                                        {course.course_code}
                                                    </div>
                                                    <span className="text-gray-400">•</span>
                                                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500">{course.credits} credits</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(course.course_id)}
                                                className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
