import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request : Request){
    try {
        // Require Administrator role
        await requireRole(['Administrator']);

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
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request: Request){
    try{
        // Require Administrator role
        await requireRole(['Administrator']);

        const { code, title, credits } = await request.json();

        await query({
            query: 'INSERT INTO Courses (course_code, title, credits) VALUES (?, ?, ?)',
            values: [code, title, credits],
        });
        return NextResponse.json({ message: 'Course created' });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}