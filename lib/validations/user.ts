import { z } from "zod";

// Base user schema fields
const baseUserFields = {
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username cannot exceed 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    email: z
        .string()
        .trim()
        .email("Invalid email format")
        .max(100, "Email cannot exceed 100 characters"),

    first_name: z
        .string()
        .trim()
        .min(1, "First name is required")
        .max(50, "First name cannot exceed 50 characters"),

    last_name: z
        .string()
        .trim()
        .min(1, "Last name is required")
        .max(50, "Last name cannot exceed 50 characters"),

    date_of_birth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .optional()
        .nullable(),

    department: z
        .string()
        .trim()
        .max(100, "Department cannot exceed 100 characters")
        .optional()
        .nullable(),

    status: z
        .string()
        .refine(
            (val) => ["Active", "Inactive", "Suspended", "Pending"].includes(val),
            { message: "Status must be one of: Active, Inactive, Suspended, Pending" }
        )
        .optional()
        .default("Active"),

    role: z
        .enum(["Student", "Instructor", "Administrator"], {
            message: "Role must be Student, Instructor, or Administrator"
        }),

    phones: z
        .array(z.string().trim().min(1).max(20))
        .optional()
        .nullable(),
};

// Student-specific fields
const studentFields = {
    program: z
        .string()
        .trim()
        .max(100, "Program cannot exceed 100 characters")
        .optional()
        .nullable(),

    year_level: z.coerce
        .number()
        .int("Year level must be an integer")
        .min(1, "Year level must be at least 1")
        .max(10, "Year level cannot exceed 10")
        .optional()
        .nullable(),

    address_city: z
        .string()
        .trim()
        .max(50, "City cannot exceed 50 characters")
        .optional()
        .nullable(),

    address_country: z
        .string()
        .trim()
        .max(50, "Country cannot exceed 50 characters")
        .optional()
        .nullable(),
};

// Instructor-specific fields
const instructorFields = {
    specializations: z
        .array(z.string().trim().min(1).max(100))
        .optional()
        .nullable(),
};

// Administrator-specific fields
const administratorFields = {
    position: z
        .string()
        .trim()
        .max(100, "Position cannot exceed 100 characters")
        .optional()
        .nullable(),

    privileges: z
        .array(z.string().trim().min(1).max(50))
        .optional()
        .nullable(),
};

// Schema for creating a new user
export const userCreateSchema = z.object({
    ...baseUserFields,
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),
    ...studentFields,
    ...instructorFields,
    ...administratorFields,
});

// Schema for updating a user (password optional)
export const userUpdateSchema = z.object({
    ...baseUserFields,
    username: baseUserFields.username.optional(),
    email: baseUserFields.email.optional(),
    first_name: baseUserFields.first_name.optional(),
    last_name: baseUserFields.last_name.optional(),
    role: baseUserFields.role.optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters")
        .optional()
        .nullable(),
    ...studentFields,
    ...instructorFields,
    ...administratorFields,
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
