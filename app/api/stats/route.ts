import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Require Administrator role with valid admin code
    await requireAdministrator();

    const results = await query({
      query: 'CALL get_course_stats(?)',
      values: ['HK251'],
    });

    // Cast results to handle stored procedure return type (usually [rows, fields])
    // but query() returns results[0] of execute(), which for CALL is [[rows], fields] or similar depending on driver
    // If query() returns RowDataPacket[], for stored proc it might be different.
    // Assuming results is an array where first element is the result set.
    // We will cast to unknown[] then to appropriate type if needed, or just rely on runtime.
    // Since we return JSON, explicit type isn't strictly required for NextResponse if not inspecting.
    
    // However, results from CALL in mysql2 is [[rows...], metadata]. 
    // Our query helper returns results directly.
    // So results is likely [RowDataPacket[]].
    
    const rows = results[0];

    return NextResponse.json(rows);
  } catch {
    return handleApiError(null, 'fetch stats');
  }
}