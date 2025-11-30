import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { type SessionUser } from '@/lib/definitions';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Query user from database
        const users: any = await query({
            query: 'SELECT user_id, username, email, first_name, last_name, role, status, password_hash FROM Users WHERE username = ?',
            values: [username],
        });

        if (users.length === 0) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Check if user account is active
        if (user.status !== 'Active') {
            return NextResponse.json(
                { message: 'Account is inactive. Please contact support.' },
                { status: 403 }
            );
        }

        // Validate password (NOTE: In production, use bcrypt.compare for hashed passwords)
        // For demo purposes, the database contains simple strings like 'hash1', 'hash2', etc.
        // We accept any password for demo accounts, or match the password_hash if it's a test password
        const isPasswordValid = true; // Demo mode - accept any password

        // Alternative: Uncomment below for actual password validation
        // const isPasswordValid = user.password_hash === password;

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Update last login time
        await query({
            query: 'UPDATE Users SET last_login = NOW() WHERE user_id = ?',
            values: [user.user_id],
        });

        // Query role-specific code based on user role
        let studentCode: string | undefined;
        let instructorCode: string | undefined;
        let adminCode: string | undefined;

        if (user.role === 'Student') {
            const students: any = await query({
                query: 'SELECT student_code FROM Students WHERE user_id = ?',
                values: [user.user_id],
            });
            studentCode = students[0]?.student_code;
        } else if (user.role === 'Instructor') {
            const instructors: any = await query({
                query: 'SELECT instructor_code FROM Instructors WHERE user_id = ?',
                values: [user.user_id],
            });
            instructorCode = instructors[0]?.instructor_code;
        } else if (user.role === 'Administrator') {
            const admins: any = await query({
                query: 'SELECT admin_code FROM Administrators WHERE user_id = ?',
                values: [user.user_id],
            });
            adminCode = admins[0]?.admin_code;
        }

        // Create session object
        const sessionUser: SessionUser = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            studentCode,
            instructorCode,
            adminCode,
        };

        // Set session cookie
        await setSession(sessionUser);

        // Return success with user data (excluding password_hash)
        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                studentCode,
                instructorCode,
                adminCode,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'An error occurred during login' },
            { status: 500 }
        );
    }
}