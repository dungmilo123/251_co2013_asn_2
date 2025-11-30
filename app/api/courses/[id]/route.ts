import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdministrator } from "@/lib/auth";
import { handleApiError } from '@/lib/api-helpers';
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await requireAdministrator();

        const { id } = await params;

        await query({
            query: "DELETE FROM Courses WHERE course_id = ?",
            values: [id],
        });
        return NextResponse.json({ message: "Deleted" });
    } catch (error: any) {
        return handleApiError(error, 'delete course');
    }
}
