import { NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Administrator role with valid admin code
    await requireAdministrator();

    // Get all users with their role information
    const users = await query({
      query: `
        SELECT
          user_id,
          username,
          email,
          first_name,
          last_name,
          role,
          status,
          department,
          last_login
        FROM Users
        ORDER BY role, last_name, first_name
      `,
      values: [],
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    return handleApiError(error, 'fetch users');
  }
}
