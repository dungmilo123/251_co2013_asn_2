'use client';
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2, Save, Link } from 'lucide-react';
import { CourseFormData, Prerequisite } from '@/types/course';
import { courseFormSchema } from './validation';
import { BasicSection } from './BasicSection';
import { DetailsSection } from './DetailsSection';
import { ScheduleSection } from './ScheduleSection';
import { ExpandableSection } from './ExpandableSection';
import { PrerequisitesSection } from './PrerequisitesSection';

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
  prerequisites?: Prerequisite[];
}

interface CourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  course?: Course;
  mode?: 'create' | 'edit';
}

// Helper to format date string for input fields
const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

const formatDateTimeForInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

export const CourseForm: React.FC<CourseFormProps> = ({
  onSuccess,
  onCancel,
  course,
  mode = 'create'
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = mode === 'edit' && !!course;

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema) as any,
    defaultValues: isEditMode ? {
      course_code: course.course_code,
      title: course.title,
      credits: course.credits,
      department: course.department || '',
      academic_level: course.academic_level || '',
      max_capacity: course.max_capacity || 60,
      start_date: formatDateForInput(course.start_date),
      end_date: formatDateForInput(course.end_date),
      description: course.description || '',
      enrollment_start_date: formatDateTimeForInput(course.enrollment_start_date),
      enrollment_end_date: formatDateTimeForInput(course.enrollment_end_date),
      status: course.status || 'Planned',
      passing_score: course.passing_score || 5.0,
      prerequisites: course.prerequisites || []
    } : {
      credits: 3,
      max_capacity: 60,
      status: 'Planned',
      passing_score: 5.0,
      prerequisites: []
    }
  });

  const { handleSubmit, formState: { isSubmitting }, reset } = methods;

  // Reset form when course changes (for edit mode)
  useEffect(() => {
    if (isEditMode) {
      reset({
        course_code: course.course_code,
        title: course.title,
        credits: course.credits,
        department: course.department || '',
        academic_level: course.academic_level || '',
        max_capacity: course.max_capacity || 60,
        start_date: formatDateForInput(course.start_date),
        end_date: formatDateForInput(course.end_date),
        description: course.description || '',
        enrollment_start_date: formatDateTimeForInput(course.enrollment_start_date),
        enrollment_end_date: formatDateTimeForInput(course.enrollment_end_date),
        status: course.status || 'Planned',
        passing_score: course.passing_score || 5.0,
        prerequisites: course.prerequisites || []
      });
    }
  }, [course, isEditMode, reset]);

  const onSubmit = async (data: CourseFormData) => {
    setSubmitError(null);

    try {
      // Convert number fields from string to actual numbers
      const submitData = {
        ...data,
        credits: Number(data.credits),
        max_capacity: data.max_capacity ? Number(data.max_capacity) : undefined,
        passing_score: data.passing_score ? Number(data.passing_score) : undefined
      };

      const url = isEditMode ? `/api/courses/${course.course_id}` : '/api/courses';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || `Failed to ${isEditMode ? 'update' : 'create'} course`);
      }

      // Reset form only for create mode
      if (!isEditMode) {
        reset();
      }
      onSuccess?.();
    } catch (error: any) {
      setSubmitError(error.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} the course`);
      console.error(error);
    }
  };

  const onFormError = (errors: any) => {
    console.error('Form validation errors:', errors);
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => `${field}: ${error?.message || 'Invalid'}`)
      .join(', ');
    setSubmitError(`Validation failed: ${errorMessages}`);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
        {submitError && (
          <div className="rounded-xl p-4 bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        <BasicSection />

        <ExpandableSection
          title="Course Details"
          icon={<Plus className="w-5 h-5" />}
          defaultExpanded={isEditMode}
        >
          <DetailsSection />
        </ExpandableSection>

        <ExpandableSection
          title="Schedule & Status"
          icon={<Plus className="w-5 h-5" />}
          defaultExpanded={isEditMode}
        >
          <ScheduleSection />
        </ExpandableSection>

        <ExpandableSection
          title="Prerequisites"
          icon={<Link className="w-5 h-5" />}
          defaultExpanded={isEditMode && (course?.prerequisites?.length ?? 0) > 0}
        >
          <PrerequisitesSection currentCourseId={course?.course_id} />
        </ExpandableSection>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-3 px-8 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? 'Updating Course...' : 'Creating Course...'}
              </>
            ) : (
              <>
                {isEditMode ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditMode ? 'Update Course' : 'Create Course'}
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};