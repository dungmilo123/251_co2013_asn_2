import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
