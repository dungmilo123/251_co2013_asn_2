import { z } from "zod";

// Zod schema for course creation validation
export const courseCreateSchema = z
  .object({
    course_code: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .pipe(
        z
          .string()
          .min(3, "Course code must be at least 3 characters")
          .max(20, "Course code cannot exceed 20 characters")
          .regex(
            /^[A-Z0-9]+$/,
            "Course code must contain only uppercase letters and numbers"
          )
      ),

    title: z
      .string()
      .min(5, "Course title must be at least 5 characters")
      .max(255, "Course title cannot exceed 255 characters")
      .trim(),

    credits: z.coerce
      .number()
      .int("Credits must be an integer")
      .min(1, "Credits must be at least 1")
      .max(10, "Credits cannot exceed 10"),

    department: z
      .string()
      .max(100, "Department name cannot exceed 100 characters")
      .trim()
      .optional(),

    academic_level: z
      .string()
      .refine(
        (val) =>
          ["Undergraduate", "Graduate", "Postgraduate", "Certificate"].includes(
            val
          ),
        {
          message:
            "Academic level must be one of: Undergraduate, Graduate, Postgraduate, Certificate",
        }
      )
      .optional(),

    max_capacity: z.coerce
      .number()
      .int("Maximum capacity must be an integer")
      .min(1, "Maximum capacity must be at least 1")
      .max(1000, "Maximum capacity cannot exceed 1000")
      .optional(),

    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    description: z
      .string()
      .max(5000, "Description cannot exceed 5000 characters")
      .trim()
      .optional(),

    enrollment_start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Enrollment start date must be in YYYY-MM-DDTHH:MM format"
      )
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    enrollment_end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Enrollment end date must be in YYYY-MM-DDTHH:MM format"
      )
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    status: z
      .string()
      .refine(
        (val) =>
          ["Planned", "Active", "Completed", "Cancelled", "Suspended"].includes(
            val
          ),
        {
          message:
            "Status must be one of: Planned, Active, Completed, Cancelled, Suspended",
        }
      )
      .optional(),

    passing_score: z.coerce
      .number()
      .min(0, "Passing score cannot be negative")
      .max(10, "Passing score cannot exceed 10")
      .optional(),
  })
  .refine(
    (data) => {
      // Custom validation: end_date must be after start_date if both provided
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // Custom validation: enrollment_end_date must be after enrollment_start_date if both provided
      if (data.enrollment_start_date && data.enrollment_end_date) {
        return data.enrollment_end_date > data.enrollment_start_date;
      }
      return true;
    },
    {
      message: "Enrollment end date must be after enrollment start date",
      path: ["enrollment_end_date"],
    }
  );

// Type inference from the schema
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

// Zod schema for course update validation (all fields optional for partial updates)
export const courseUpdateSchema = z
  .object({
    course_code: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .pipe(
        z
          .string()
          .min(3, "Course code must be at least 3 characters")
          .max(20, "Course code cannot exceed 20 characters")
          .regex(
            /^[A-Z0-9]+$/,
            "Course code must contain only uppercase letters and numbers"
          )
      )
      .optional(),

    title: z
      .string()
      .min(5, "Course title must be at least 5 characters")
      .max(255, "Course title cannot exceed 255 characters")
      .trim()
      .optional(),

    credits: z.coerce
      .number()
      .int("Credits must be an integer")
      .min(1, "Credits must be at least 1")
      .max(10, "Credits cannot exceed 10")
      .optional(),

    department: z
      .string()
      .max(100, "Department name cannot exceed 100 characters")
      .trim()
      .optional()
      .nullable(),

    academic_level: z
      .string()
      .refine(
        (val) =>
          ["Undergraduate", "Graduate", "Postgraduate", "Certificate"].includes(
            val
          ),
        {
          message:
            "Academic level must be one of: Undergraduate, Graduate, Postgraduate, Certificate",
        }
      )
      .optional()
      .nullable(),

    max_capacity: z.coerce
      .number()
      .int("Maximum capacity must be an integer")
      .min(1, "Maximum capacity must be at least 1")
      .max(1000, "Maximum capacity cannot exceed 1000")
      .optional()
      .nullable(),

    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    description: z
      .string()
      .max(5000, "Description cannot exceed 5000 characters")
      .trim()
      .optional()
      .nullable(),

    enrollment_start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Enrollment start date must be in YYYY-MM-DDTHH:MM format"
      )
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    enrollment_end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Enrollment end date must be in YYYY-MM-DDTHH:MM format"
      )
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    status: z
      .string()
      .refine(
        (val) =>
          ["Planned", "Active", "Completed", "Cancelled", "Suspended"].includes(
            val
          ),
        {
          message:
            "Status must be one of: Planned, Active, Completed, Cancelled, Suspended",
        }
      )
      .optional()
      .nullable(),

    passing_score: z.coerce
      .number()
      .min(0, "Passing score cannot be negative")
      .max(10, "Passing score cannot exceed 10")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Custom validation: end_date must be after start_date if both provided
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // Custom validation: enrollment_end_date must be after enrollment_start_date if both provided
      if (data.enrollment_start_date && data.enrollment_end_date) {
        return data.enrollment_end_date > data.enrollment_start_date;
      }
      return true;
    },
    {
      message: "Enrollment end date must be after enrollment start date",
      path: ["enrollment_end_date"],
    }
  );

// Type inference from the update schema
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
