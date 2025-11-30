import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Administrator role with valid admin code
    await requireAdministrator();

    const results: any = await query({
      query: 'CALL get_course_stats(?)',
      values: ['HK251'],
    });

    return NextResponse.json(results[0]);
  } catch (error: any) {
    return handleApiError(error, 'fetch stats');
  }
}