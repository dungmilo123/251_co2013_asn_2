import { z } from 'zod';

export const courseFormSchema = z.object({
  course_code: z.string().min(1, 'Course code is required').max(20, 'Course code must be 20 characters or less'),
  title: z.string().min(1, 'Course title is required').max(255, 'Title must be 255 characters or less'),
  credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits cannot exceed 10'),
  department: z.string().optional(),
  academic_level: z.string().optional(),
  max_capacity: z.number().min(1, 'Capacity must be at least 1').max(1000, 'Capacity cannot exceed 1000').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  enrollment_start_date: z.string().optional(),
  enrollment_end_date: z.string().optional(),
  status: z.string().optional(),
  passing_score: z.number().min(0, 'Passing score cannot be negative').max(10, 'Passing score cannot exceed 10').optional()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
}).refine((data) => {
  if (data.enrollment_start_date && data.enrollment_end_date) {
    return new Date(data.enrollment_end_date) > new Date(data.enrollment_start_date);
  }
  return true;
}, {
  message: 'Enrollment end must be after enrollment start',
  path: ['enrollment_end_date']
});