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
          .min(3, "Course code is too short — use at least 3 characters (e.g., 'CS101')")
          .max(20, "Course code is too long — please use 20 characters or fewer")
          .regex(
            /^[A-Z0-9]+$/,
            "Course code can only contain letters and numbers (no spaces or special characters)"
          )
      ),

    title: z
      .string()
      .min(5, "Course title is too short — please provide a more descriptive name (at least 5 characters)")
      .max(255, "Course title is too long — please use 255 characters or fewer")
      .trim(),

    credits: z.coerce
      .number()
      .int("Credits must be a whole number (e.g., 3, not 3.5)")
      .min(1, "Course must be worth at least 1 credit")
      .max(10, "Course cannot exceed 10 credits — contact admin if this is intentional"),

    department: z
      .string()
      .max(100, "Department name is too long — please use 100 characters or fewer")
      .trim()
      .optional(),

    academic_level: z
      .string({ error: "Academic level is required" })
      .min(1, "Please select an academic level")
      .refine(
        (val) =>
          ["Undergraduate", "Graduate", "Postgraduate", "Certificate"].includes(
            val
          ),
        {
          message:
            "Please select a valid academic level: Undergraduate, Graduate, Postgraduate, or Certificate",
        }
      ),

    max_capacity: z.coerce
      .number()
      .int("Capacity must be a whole number of students")
      .min(1, "Course must allow at least 1 student to enroll")
      .max(1000, "Course capacity cannot exceed 1000 students — contact admin for larger courses")
      .optional(),

    start_date: z
      .string({ error: "Course start date is required" })
      .min(1, "Please select a course start date")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format — please use YYYY-MM-DD (e.g., 2024-09-01)")
      .transform((val) => new Date(val)),

    end_date: z
      .string({ error: "Course end date is required" })
      .min(1, "Please select a course end date")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format — please use YYYY-MM-DD (e.g., 2024-12-15)")
      .transform((val) => new Date(val)),

    description: z
      .string()
      .max(5000, "Description is too long — please use 5000 characters or fewer")
      .trim()
      .optional(),

    enrollment_start_date: z
      .string({ error: "Enrollment start date is required" })
      .min(1, "Please select when enrollment opens")
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Invalid enrollment date format — please use YYYY-MM-DDTHH:MM (e.g., 2024-08-15T09:00)"
      )
      .transform((val) => new Date(val)),

    enrollment_end_date: z
      .string({ error: "Enrollment end date is required" })
      .min(1, "Please select when enrollment closes")
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Invalid enrollment date format — please use YYYY-MM-DDTHH:MM (e.g., 2024-09-01T17:00)"
      )
      .transform((val) => new Date(val)),

    status: z
      .string()
      .refine(
        (val) =>
          ["Planned", "Active", "Completed", "Cancelled", "Suspended"].includes(
            val
          ),
        {
          message:
            "Please select a valid status: Planned, Active, Completed, Cancelled, or Suspended",
        }
      )
      .optional(),

    passing_score: z.coerce
      .number()
      .min(0, "Passing score cannot be negative")
      .max(10, "Passing score cannot exceed 10 (we use a 0-10 grading scale)")
      .optional(),

    prerequisites: z
      .array(
        z.object({
          prerequisite_id: z.coerce
            .number()
            .int("Prerequisite course ID must be valid")
            .positive("Please select a valid prerequisite course"),
          min_grade: z.coerce
            .number()
            .min(0, "Minimum grade cannot be negative")
            .max(10, "Minimum grade cannot exceed 10")
            .optional(),
        })
      )
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
      message: "Course end date must be after the start date — please check your dates",
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
      message: "Enrollment closing date must be after the enrollment opening date",
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
          .min(3, "Course code is too short — use at least 3 characters (e.g., 'CS101')")
          .max(20, "Course code is too long — please use 20 characters or fewer")
          .regex(
            /^[A-Z0-9]+$/,
            "Course code can only contain letters and numbers (no spaces or special characters)"
          )
      )
      .optional(),

    title: z
      .string()
      .min(5, "Course title is too short — please provide a more descriptive name (at least 5 characters)")
      .max(255, "Course title is too long — please use 255 characters or fewer")
      .trim()
      .optional(),

    credits: z.coerce
      .number()
      .int("Credits must be a whole number (e.g., 3, not 3.5)")
      .min(1, "Course must be worth at least 1 credit")
      .max(10, "Course cannot exceed 10 credits — contact admin if this is intentional")
      .optional(),

    department: z
      .string()
      .max(100, "Department name is too long — please use 100 characters or fewer")
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
            "Please select a valid academic level: Undergraduate, Graduate, Postgraduate, or Certificate",
        }
      )
      .optional()
      .nullable(),

    max_capacity: z.coerce
      .number()
      .int("Capacity must be a whole number of students")
      .min(1, "Course must allow at least 1 student to enroll")
      .max(1000, "Course capacity cannot exceed 1000 students — contact admin for larger courses")
      .optional()
      .nullable(),

    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format — please use YYYY-MM-DD (e.g., 2024-09-01)")
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format — please use YYYY-MM-DD (e.g., 2024-12-15)")
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    description: z
      .string()
      .max(5000, "Description is too long — please use 5000 characters or fewer")
      .trim()
      .optional()
      .nullable(),

    enrollment_start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Invalid enrollment date format — please use YYYY-MM-DDTHH:MM (e.g., 2024-08-15T09:00)"
      )
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),

    enrollment_end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Invalid enrollment date format — please use YYYY-MM-DDTHH:MM (e.g., 2024-09-01T17:00)"
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
            "Please select a valid status: Planned, Active, Completed, Cancelled, or Suspended",
        }
      )
      .optional()
      .nullable(),

    passing_score: z.coerce
      .number()
      .min(0, "Passing score cannot be negative")
      .max(10, "Passing score cannot exceed 10 (we use a 0-10 grading scale)")
      .optional()
      .nullable(),

    prerequisites: z
      .array(
        z.object({
          prerequisite_id: z.coerce
            .number()
            .int("Prerequisite course ID must be valid")
            .positive("Please select a valid prerequisite course"),
          min_grade: z.coerce
            .number()
            .min(0, "Minimum grade cannot be negative")
            .max(10, "Minimum grade cannot exceed 10")
            .optional()
            .nullable(),
        })
      )
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
      message: "Course end date must be after the start date — please check your dates",
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
      message: "Enrollment closing date must be after the enrollment opening date",
      path: ["enrollment_end_date"],
    }
  );

// Type inference from the update schema
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
