'use client';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { CourseFormData } from '@/types/course';
import { courseFormSchema } from './validation';
import { BasicSection } from './BasicSection';
import { DetailsSection } from './DetailsSection';
import { ScheduleSection } from './ScheduleSection';
import { ExpandableSection } from './ExpandableSection';

interface CourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ onSuccess, onCancel }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      credits: 3,
      max_capacity: 60,
      status: 'Planned',
      passing_score: 5.0
    }
  });

  const { handleSubmit, formState: { isSubmitting }, reset } = methods;

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

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create course');
      }

      // Reset form and show success
      reset();
      onSuccess?.();
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while creating the course');
      console.error(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="rounded-xl p-4 bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        <BasicSection />

        <ExpandableSection
          title="Course Details"
          icon={<Plus className="w-5 h-5" />}
          defaultExpanded={false}
        >
          <DetailsSection />
        </ExpandableSection>

        <ExpandableSection
          title="Schedule & Status"
          icon={<Plus className="w-5 h-5" />}
          defaultExpanded={false}
        >
          <ScheduleSection />
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
                Creating Course...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};