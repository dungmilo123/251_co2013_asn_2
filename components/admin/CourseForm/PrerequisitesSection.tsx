'use client';
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { BookOpen, X, Plus } from 'lucide-react';
import { CourseFormData, Prerequisite } from '@/types/course';

interface CourseOption {
    course_id: number;
    course_code: string;
    title: string;
}

interface PrerequisitesSectionProps {
    currentCourseId?: number; // For edit mode - exclude current course from options
}

export const PrerequisitesSection: React.FC<PrerequisitesSectionProps> = ({ currentCourseId }) => {
    const { watch, setValue } = useFormContext<CourseFormData>();
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    const prerequisites = watch('prerequisites') || [];

    // Fetch available courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses/list');
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Filter out current course (for edit mode) and already selected prerequisites
    const availableCourses = courses.filter(course => {
        if (currentCourseId && course.course_id === currentCourseId) return false;
        return !prerequisites.some(p => p.prerequisite_id === course.course_id);
    });

    const handleAddPrerequisite = () => {
        if (!selectedCourse) return;

        const courseId = parseInt(selectedCourse);
        const course = courses.find(c => c.course_id === courseId);
        if (!course) return;

        const newPrereq: Prerequisite = {
            prerequisite_id: courseId,
            course_code: course.course_code,
            title: course.title,
            min_grade: 5.0
        };

        setValue('prerequisites', [...prerequisites, newPrereq]);
        setSelectedCourse('');
    };

    const handleRemovePrerequisite = (prereqId: number) => {
        setValue('prerequisites', prerequisites.filter(p => p.prerequisite_id !== prereqId));
    };

    const handleUpdateMinGrade = (prereqId: number, grade: number) => {
        setValue('prerequisites', prerequisites.map(p =>
            p.prerequisite_id === prereqId ? { ...p, min_grade: grade } : p
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                Loading courses...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Add Prerequisite */}
            <div className="flex gap-3">
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    disabled={availableCourses.length === 0}
                >
                    <option value="">
                        {availableCourses.length === 0
                            ? 'No more courses available'
                            : 'Select a prerequisite course...'}
                    </option>
                    {availableCourses.map(course => (
                        <option key={course.course_id} value={course.course_id}>
                            {course.course_code} - {course.title}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleAddPrerequisite}
                    disabled={!selectedCourse}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Selected Prerequisites List */}
            {prerequisites.length > 0 ? (
                <div className="space-y-3">
                    {prerequisites.map(prereq => (
                        <div
                            key={prereq.prerequisite_id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <div>
                                    <span className="font-mono font-bold text-sm px-2 py-0.5 rounded" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                        {prereq.course_code}
                                    </span>
                                    <span className="ml-2 text-gray-700">{prereq.title}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Min Grade:</label>
                                <input
                                    type="number"
                                    value={prereq.min_grade ?? 5.0}
                                    onChange={(e) => handleUpdateMinGrade(prereq.prerequisite_id, parseFloat(e.target.value))}
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 text-center text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRemovePrerequisite(prereq.prerequisite_id)}
                                className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Remove prerequisite"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No prerequisites added yet</p>
                    <p className="text-sm">Select a course above to add it as a prerequisite</p>
                </div>
            )}
        </div>
    );
};
