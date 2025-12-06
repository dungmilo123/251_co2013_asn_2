'use client';
import { z } from 'zod';

export const userFormSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    email: z.string().email('Invalid email format'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional()
        .or(z.literal('')),

    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),

    date_of_birth: z.string().optional(),
    department: z.string().optional(),
    status: z.string().default('Active'),
    role: z.enum(['Student', 'Instructor', 'Administrator']),

    phones: z.array(z.string()).optional(),

    // Student fields
    program: z.string().optional(),
    year_level: z.coerce.number().int().min(1).max(10).optional().or(z.literal('')),
    address_city: z.string().optional(),
    address_country: z.string().optional(),

    // Instructor fields
    specializations: z.array(z.string()).optional(),

    // Administrator fields
    position: z.string().optional(),
    privileges: z.array(z.string()).optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
