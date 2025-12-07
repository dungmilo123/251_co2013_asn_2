import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        await requireAdministrator();

        // Get distinct roles from Users table
        const result = await query({
            query: 'SELECT DISTINCT role FROM Users WHERE role IS NOT NULL AND role != "" ORDER BY role ASC',
            values: []
        });

        const roles = (result as { role: string }[]).map(row => row.role);

        return NextResponse.json(roles);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch user roles');
    }
}
