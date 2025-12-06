'use client';
import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Trash2, Database, ArrowLeft, Plus, Pencil, X, Eye, Calendar, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { CourseForm } from '@/components/admin/CourseForm';

interface Course {
    course_id: number;
    course_code: string;
    title: string;
    credits: number;
    department?: string;
    academic_level?: string;
    max_capacity?: number;
    start_date?: string;
    end_date?: string;
    description?: string;
    enrollment_start_date?: string;
    enrollment_end_date?: string;
    status?: string;
    passing_score?: number;
}

export default function CourseManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [loadingCourse, setLoadingCourse] = useState<number | null>(null);

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

    const handleEdit = async (course: Course) => {
        setLoadingCourse(course.course_id);
        try {
            // Fetch full course details
            const res = await fetch(`/api/courses/${course.course_id}`);
            if (res.ok) {
                const fullCourse = await res.json();
                setEditingCourse(fullCourse);
                setShowForm(false);
                setViewingCourse(null);
            }
        } finally {
            setLoadingCourse(null);
        }
    };

    const handleView = async (course: Course) => {
        setLoadingCourse(course.course_id);
        try {
            const res = await fetch(`/api/courses/${course.course_id}`);
            if (res.ok) {
                const fullCourse = await res.json();
                setViewingCourse(fullCourse);
                setEditingCourse(null);
                setShowForm(false);
            }
        } finally {
            setLoadingCourse(null);
        }
    };

    const handleFormSuccess = () => {
        fetchCourses();
        setShowForm(false);
        setEditingCourse(null);
    };

    const handleCancelEdit = () => {
        setEditingCourse(null);
    };

    const handleCloseView = () => {
        setViewingCourse(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'Suspended': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
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
                            Create, view, edit, and manage all courses in the system
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
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingCourse(null);
                            setViewingCourse(null);
                        }}
                        className="btn-primary text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {showForm ? 'Hide Form' : 'Add Course'}
                    </button>
                </div>

                {/* Create Course Form */}
                {showForm && !editingCourse && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
                        </div>
                        <div className="p-8">
                            <CourseForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
                        </div>
                    </div>
                )}

                {/* Edit Course Form */}
                {editingCourse && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit Course: {editingCourse.course_code}
                            </h2>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            <CourseForm
                                onSuccess={handleFormSuccess}
                                onCancel={handleCancelEdit}
                                course={editingCourse}
                                mode="edit"
                            />
                        </div>
                    </div>
                )}

                {/* View Course Modal */}
                {viewingCourse && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                    {viewingCourse.course_code}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{viewingCourse.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingCourse.status)}`}>
                                    {viewingCourse.status || 'Planned'}
                                </span>
                            </div>
                            <button
                                onClick={handleCloseView}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Course Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-500" />
                                        Course Info
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Credits</span>
                                            <span className="font-medium text-gray-900">{viewingCourse.credits}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Department</span>
                                            <span className="font-medium text-gray-900">{viewingCourse.department || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Academic Level</span>
                                            <span className="font-medium text-gray-900">{viewingCourse.academic_level || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Passing Score</span>
                                            <span className="font-medium text-gray-900">{viewingCourse.passing_score || 5.0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-green-500" />
                                        Capacity
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Max Capacity</span>
                                            <span className="font-medium text-gray-900">{viewingCourse.max_capacity || 60}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-500" />
                                        Schedule
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Start Date</span>
                                            <span className="font-medium text-gray-900">{formatDate(viewingCourse.start_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">End Date</span>
                                            <span className="font-medium text-gray-900">{formatDate(viewingCourse.end_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Enrollment Start</span>
                                            <span className="font-medium text-gray-900">{formatDate(viewingCourse.enrollment_start_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Enrollment End</span>
                                            <span className="font-medium text-gray-900">{formatDate(viewingCourse.enrollment_end_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {viewingCourse.description && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{viewingCourse.description}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button
                                    onClick={handleCloseView}
                                    className="px-6 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleEdit(viewingCourse)}
                                    className="btn-primary px-6 py-2 rounded-xl font-medium text-white flex items-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Course
                                </button>
                            </div>
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
                                                    {course.status && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                                                            {course.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{course.credits} credits {course.department && `• ${course.department}`}</p>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => handleView(course)}
                                                    disabled={loadingCourse === course.course_id}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm font-medium">View</span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(course)}
                                                    disabled={loadingCourse === course.course_id}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.course_id)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Remove</span>
                                                </button>
                                            </div>
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
