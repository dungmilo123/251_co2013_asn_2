import { NextResponse } from "next/server";
import { query } from '@/lib/db';

export async function GET(request : Request){
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let sql = 'SELECT * FROM Courses';
    let values: any[] = [];
    
    if (search){
        sql += 'WHERE title LIKE ?';
        values = [`%${search}%`];
    }
    
    const courses = await query({ query: sql, values });
    return NextResponse.json(courses);
}

export async function POST(request: Request){
    const { code, title, credits } = await request.json();
    try{
        await query({
            query: 'INSERT INTO Courses (course_code, title, credits) VALUES (?, ?, ?)',
            values: [code, title, credits],
        });
        return NextResponse.json({ message: 'Course created' });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}