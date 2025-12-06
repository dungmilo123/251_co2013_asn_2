import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

// GET /api/courses/list - Fetch all courses for selection (e.g., prerequisites dropdown)
export async function GET() {
    try {
        await requireAuth();

        const courses = await query({
            query: 'SELECT course_id, course_code, title FROM Courses ORDER BY course_code ASC',
            values: []
        });

        return NextResponse.json(courses);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch course list');
    }
}
