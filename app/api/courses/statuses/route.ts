import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        // Require Administrator role with valid admin code
        await requireAdministrator();

        // Get distinct statuses from Courses table
        const result = await query({
            query: 'SELECT DISTINCT status FROM Courses WHERE status IS NOT NULL AND status != "" ORDER BY status ASC',
            values: []
        });

        // Extract status names into a simple array
        const statuses = (result as { status: string }[]).map(row => row.status);

        return NextResponse.json(statuses);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch statuses');
    }
}
