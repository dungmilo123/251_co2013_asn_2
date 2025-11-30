import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET(request : Request){
    try {
        // Require Administrator role with valid admin code
        await requireAdministrator();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let sql = 'SELECT * FROM Courses';
        let values: any[] = [];

        if (search){
            sql += ' WHERE title LIKE ?';
            values = [`%${search}%`];
        }

        const courses = await query({ query: sql, values });
        return NextResponse.json(courses);
    } catch (error: any) {
        return handleApiError(error, 'fetch courses');
    }
}

export async function POST(request: Request){
    try{
        // Require Administrator role with valid admin code
        await requireAdministrator();

        const { code, title, credits } = await request.json();

        await query({
            query: 'INSERT INTO Courses (course_code, title, credits) VALUES (?, ?, ?)',
            values: [code, title, credits],
        });
        return NextResponse.json({ message: 'Course created' });
    } catch (error: any) {
        return handleApiError(error, 'create course');
    }
}