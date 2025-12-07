import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        await requireAdministrator();

        // Get distinct statuses from Users table
        const result = await query({
            query: 'SELECT DISTINCT status FROM Users WHERE status IS NOT NULL AND status != "" ORDER BY status ASC',
            values: []
        });

        const statuses = (result as { status: string }[]).map(row => row.status);

        return NextResponse.json(statuses);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch user statuses');
    }
}
