'use client';
import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Trash2, ArrowLeft, Plus, Pencil, X, Eye, Calendar, Users, GraduationCap, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
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

type SortField = 'start_date' | 'title' | null;
type SortOrder = 'asc' | 'desc';

// Status filter options
const STATUSES = ['Planned', 'Active', 'Completed'];
const ACADEMIC_LEVELS = ['Undergraduate', 'Postgraduate', 'Foundation'];

export default function CourseManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [loadingCourse, setLoadingCourse] = useState<number | null>(null);

    // Filter states
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterAcademicLevel, setFilterAcademicLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Sort states
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Fetch available departments from the database
    const fetchDepartments = useCallback(async () => {
        const res = await fetch('/api/courses/departments');
        if (res.ok) {
            const data = await res.json();
            setDepartments(data);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const fetchCourses = useCallback(async () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filterDepartment) params.set('department', filterDepartment);
        if (filterAcademicLevel) params.set('academic_level', filterAcademicLevel);
        if (filterStatus) params.set('status', filterStatus);
        if (sortField) {
            params.set('sort_by', sortField);
            params.set('sort_order', sortOrder);
        }

        const res = await fetch(`/api/courses?${params.toString()}`);
        if (res.ok) {
            setCourses(await res.json());
        }
    }, [search, filterDepartment, filterAcademicLevel, filterStatus, sortField, sortOrder]);

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
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Active':
            case 'Open': return 'bg-green-100 text-green-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'Cancelled':
            case 'Closed': return 'bg-red-100 text-red-700';
            case 'Suspended': return 'bg-orange-100 text-orange-700';
            case 'Planned': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-300" />;
        }
        return sortOrder === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    const clearFilters = () => {
        setFilterDepartment('');
        setFilterAcademicLevel('');
        setFilterStatus('');
        setSearch('');
        setSortField(null);
    };

    const hasActiveFilters = filterDepartment || filterAcademicLevel || filterStatus || search;

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

        .table-header-sortable {
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }

        .table-header-sortable:hover {
          color: #00558d;
        }

        .table-row {
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f8fafc;
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

                {/* Filters and Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative lg:col-span-2">
                            <input
                                placeholder="Search by title or code..."
                                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500 text-black"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Department Filter */}
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept: string) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        {/* Academic Level Filter */}
                        <select
                            value={filterAcademicLevel}
                            onChange={(e) => setFilterAcademicLevel(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700"
                        >
                            <option value="">All Levels</option>
                            {ACADEMIC_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700"
                        >
                            <option value="">All Statuses</option>
                            {STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Add Course Button */}
                <div className="flex justify-end">
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

                {/* Course Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            Course Catalog ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {courses.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No courses found</p>
                                <p className="text-gray-400 mt-2">
                                    {hasActiveFilters
                                        ? 'Try adjusting your filters'
                                        : 'Click "Add Course" to create your first course'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Course Code
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider table-header-sortable"
                                            onClick={() => handleSort('title')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Title
                                                <SortIcon field="title" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Credits
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider table-header-sortable"
                                            onClick={() => handleSort('start_date')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Start Date
                                                <SortIcon field="start_date" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr key={course.course_id} className="table-row">
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-lg font-mono font-bold text-sm" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                                    {course.course_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{course.title}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600">{course.department || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-medium text-gray-900">{course.credits}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600">{formatDate(course.start_date)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                                                    {course.status || 'Planned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleView(course)}
                                                        disabled={loadingCourse === course.course_id}
                                                        className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(course)}
                                                        disabled={loadingCourse === course.course_id}
                                                        className="p-2 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(course.course_id)}
                                                        className="p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
