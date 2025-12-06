import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        // Require Administrator role with valid admin code
        await requireAdministrator();

        // Get distinct departments from Courses table
        const result = await query({
            query: 'SELECT DISTINCT department FROM Courses WHERE department IS NOT NULL AND department != "" ORDER BY department ASC',
            values: []
        });

        // Extract department names into a simple array
        const departments = (result as { department: string }[]).map(row => row.department);

        return NextResponse.json(departments);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch departments');
    }
}
