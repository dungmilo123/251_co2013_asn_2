import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: session.userId,
      username: session.username,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      role: session.role,
      studentCode: session.studentCode,
      instructorCode: session.instructorCode,
      adminCode: session.adminCode,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get user session' },
      { status: 500 }
    );
  }
}
