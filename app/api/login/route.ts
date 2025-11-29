import { NextResponse } from "next/server";
import { query } from '@/lib/db';

export async function POST (request: Request){
    const { username, password } = await request.json();
    
    const users: any = await query({
        query: 'SELECT * FROM Users WHERE username = ?',
        values: [username],
    });
    
    if (users.length > 0){
        return NextResponse.json({ message: 'Login successful', role: users[0].role });
    } else {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
}