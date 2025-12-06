import { NextResponse } from "next/server";
import { query } from '@/lib/db';
import { requireAdministrator } from '@/lib/auth';
import { handleApiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        // Require Administrator role with valid admin code
        await requireAdministrator();

        // Get distinct academic levels from Courses table
        const result = await query({
            query: 'SELECT DISTINCT academic_level FROM Courses WHERE academic_level IS NOT NULL AND academic_level != "" ORDER BY academic_level ASC',
            values: []
        });

        // Extract academic level names into a simple array
        const academicLevels = (result as { academic_level: string }[]).map(row => row.academic_level);

        return NextResponse.json(academicLevels);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch academic levels');
    }
}
