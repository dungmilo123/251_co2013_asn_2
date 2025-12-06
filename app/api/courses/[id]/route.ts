import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdministrator, requireAuth } from "@/lib/auth";
import { handleApiError } from '@/lib/api-helpers';
import { Course, Section, Material, Assignment, Quiz } from "@/lib/definitions";
import { courseUpdateSchema, type CourseUpdateInput } from '@/lib/validations/course';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();

        const { id } = await params;

        const [courses, sections, materials, assignments, quizzes] = await Promise.all([
            query({ query: "SELECT * FROM Courses WHERE course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Sections WHERE course_id = ? ORDER BY order_num", values: [id] }),
            query({ query: "SELECT m.* FROM Materials m JOIN Sections s ON m.section_id = s.section_id WHERE s.course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Assignments WHERE course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Quizzes WHERE course_id = ?", values: [id] })
        ]) as [unknown[], unknown[], unknown[], unknown[], unknown[]];

        if (courses.length === 0) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const course = courses[0] as Course;
        const sectionList = sections as Section[];
        const materialList = materials as Material[];
        const assignmentList = assignments as Assignment[];
        const quizList = quizzes as Quiz[];

        const sectionsWithMaterials = sectionList.map(section => ({
            ...section,
            materials: materialList.filter(m => m.section_id === section.section_id)
        }));

        const fullCourse: Course = {
            ...course,
            sections: sectionsWithMaterials,
            assignments: assignmentList,
            quizzes: quizList
        };

        return NextResponse.json(fullCourse);

    } catch (error: unknown) {
        return handleApiError(error, 'fetch course details');
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdministrator();

        const { id } = await params;

        // Check if course exists
        const existingCourses = await query({
            query: 'SELECT * FROM Courses WHERE course_id = ?',
            values: [id]
        });

        if (existingCourses.length === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = courseUpdateSchema.parse(body) as CourseUpdateInput;

        // Check if course_code is being changed and ensure uniqueness
        if (validatedData.course_code) {
            const duplicateCourse = await query({
                query: 'SELECT course_id FROM Courses WHERE course_code = ? AND course_id != ?',
                values: [validatedData.course_code, id]
            });

            if (duplicateCourse.length > 0) {
                return NextResponse.json(
                    { error: 'Course code already exists' },
                    { status: 409 }
                );
            }
        }

        // Build dynamic UPDATE query for only provided fields
        const updateFields: string[] = [];
        const values: unknown[] = [];

        const fieldMappings = [
            { key: 'course_code', value: validatedData.course_code },
            { key: 'title', value: validatedData.title },
            { key: 'credits', value: validatedData.credits },
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

        for (const field of fieldMappings) {
            if (field.value !== undefined) {
                updateFields.push(`${field.key} = ?`);
                values.push(field.value);
            }
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        values.push(id);

        const updateQuery = `UPDATE Courses SET ${updateFields.join(', ')} WHERE course_id = ?`;

        await query({
            query: updateQuery,
            values
        });

        // Fetch and return the updated course
        const updatedCourse = await query({
            query: 'SELECT * FROM Courses WHERE course_id = ?',
            values: [id]
        });

        return NextResponse.json({
            message: 'Course updated successfully',
            course: updatedCourse[0]
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

        return handleApiError(error, 'update course');
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await requireAdministrator();

        const { id } = await params;

        await query({
            query: "DELETE FROM Courses WHERE course_id = ?",
            values: [id],
        });
        return NextResponse.json({ message: "Deleted" });
    } catch (error: unknown) {
        return handleApiError(error, 'delete course');
    }
}
