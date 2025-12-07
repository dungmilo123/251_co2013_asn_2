import { z } from 'zod';

export const courseFormSchema = z.object({
  course_code: z.string()
    .min(1, 'Please enter a course code (e.g., "CS101" or "MATH200")')
    .max(20, 'Course code is too long — please use 20 characters or fewer')
    .regex(/^[A-Za-z0-9]+$/, 'Course code can only contain letters and numbers (no spaces or special characters)'),
  title: z.string()
    .min(1, 'Please enter a course title')
    .min(5, 'Course title is too short — please use at least 5 characters')
    .max(255, 'Course title is too long — please use 255 characters or fewer'),
  credits: z.number()
    .int('Credits must be a whole number (e.g., 3, not 3.5)')
    .min(1, 'Course must be worth at least 1 credit')
    .max(10, 'Course cannot exceed 10 credits'),
  department: z.string().optional(),
  academic_level: z.string({ message: 'Academic level is required' })
    .min(1, 'Please select an academic level'),
  max_capacity: z.number()
    .int('Capacity must be a whole number')
    .min(1, 'Course must allow at least 1 student')
    .max(1000, 'Course capacity cannot exceed 1000 students')
    .optional(),
  start_date: z.string({ message: 'Course start date is required' }).min(1, 'Please select a course start date'),
  end_date: z.string({ message: 'Course end date is required' }).min(1, 'Please select a course end date'),
  description: z.string()
    .max(2000, 'Description is too long — please use 2000 characters or fewer')
    .optional(),
  enrollment_start_date: z.string({ message: 'Enrollment start date is required' })
    .min(1, 'Please select when enrollment opens'),
  enrollment_end_date: z.string({ message: 'Enrollment end date is required' })
    .min(1, 'Please select when enrollment closes'),
  status: z.string().optional(),
  passing_score: z.number()
    .min(0, 'Passing score cannot be negative')
    .max(10, 'Passing score cannot exceed 10 (using 0-10 scale)')
    .optional(),
  prerequisites: z.array(
    z.object({
      prerequisite_id: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
        z.number()
      ),
      course_code: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      min_grade: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? null : typeof val === 'string' ? parseFloat(val) : val),
        z.number()
          .min(0, 'Minimum grade cannot be negative')
          .max(10, 'Minimum grade cannot exceed 10')
          .nullable()
          .optional()
      )
    })
  ).optional().nullable()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: 'Course end date must be after the start date — please check your dates',
  path: ['end_date']
}).refine((data) => {
  if (data.enrollment_start_date && data.enrollment_end_date) {
    return new Date(data.enrollment_end_date) > new Date(data.enrollment_start_date);
  }
  return true;
}, {
  message: 'Enrollment closing date must be after the opening date',
  path: ['enrollment_end_date']
});