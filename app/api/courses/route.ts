import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';
import { courseCreateSchema, type CourseCreateInput } from '@/lib/validations/course';

export async function GET(request : Request){
    try {
        // Require Administrator role with valid admin code
        await requireAdministrator();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let sql = 'SELECT * FROM Courses';
        let values: unknown[] = [];

        if (search){
            sql += ' WHERE title LIKE ?';
            values = [`%${search}%`];
        }

        const courses = await query({ query: sql, values });
        return NextResponse.json(courses);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch courses');
    }
}

export async function POST(request: Request){
    try{
        // Require Administrator role with valid admin code
        await requireAdministrator();

        // Parse and validate request body
        const body = await request.json();

        // Validate input using Zod schema
        const validatedData = courseCreateSchema.parse(body) as CourseCreateInput;

        // Check if course code already exists
        const existingCourse = await query({
            query: 'SELECT course_id FROM Courses WHERE course_code = ?',
            values: [validatedData.course_code]
        });

        if (existingCourse.length > 0) {
            return NextResponse.json(
                { error: 'Course code already exists' },
                { status: 409 }
            );
        }

        // Build the INSERT query dynamically based on provided fields
        const fields = ['course_code', 'title', 'credits'];
        const placeholders = ['?', '?', '?'];
        const values = [validatedData.course_code, validatedData.title, validatedData.credits];

        // Add optional fields if provided
        const optionalFields = [
            { key: 'department', value: validatedData.department },
            { key: 'academic_level', value: validatedData.academic_level },
            { key: 'max_capacity', value: validatedData.max_capacity },
            { key: 'start_date', value: validatedData.start_date },
            { key: 'end_date', value: validatedData.end_date },
            { key: 'description', value: validatedData.description },
            { key: 'enrollment_start_date', value: validatedData.enrollment_start_date },
            { key: 'enrollment_end_date', value: validatedData.enrollment_end_date },
            { key: 'status', value: validatedData.status },
            { key: 'passing_score', value: validatedData.passing_score }
        ];

        for (const field of optionalFields) {
            if (field.value !== undefined && field.value !== null && field.value !== '') {
                fields.push(field.key);
                placeholders.push('?');
                values.push(field.value);
            }
        }

        const insertQuery = `INSERT INTO Courses (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

        // Insert the course
        const result = await query({
            query: insertQuery,
            values
        });

        // Fetch the created course for response
        const createdCourse = await query({
            query: 'SELECT * FROM Courses WHERE course_id = ?',
            values: [(result as any).insertId]
        });

        return NextResponse.json({
            message: 'Course created successfully',
            course: createdCourse[0]
        });
    } catch (error: unknown) {
        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: JSON.parse(error.message)
                },
                { status: 400 }
            );
        }

        return handleApiError(error, 'create course');
    }
}