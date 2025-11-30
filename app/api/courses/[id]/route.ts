import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdministrator, requireAuth } from "@/lib/auth";
import { handleApiError } from '@/lib/api-helpers';
import { Course, Section, Material, Assignment, Quiz } from "@/lib/definitions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();

        const { id } = await params;

        const [courses, sections, materials, assignments, quizzes] = await Promise.all([
            query({ query: "SELECT * FROM Courses WHERE course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Sections WHERE course_id = ? ORDER BY order_num", values: [id] }),
            query({ query: "SELECT m.* FROM Materials m JOIN Sections s ON m.section_id = s.section_id WHERE s.course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Assignments WHERE course_id = ?", values: [id] }),
            query({ query: "SELECT * FROM Quizzes WHERE course_id = ?", values: [id] })
        ]) as [any[], any[], any[], any[], any[]];

        if (courses.length === 0) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const course = courses[0] as Course;
        const sectionList = sections as Section[];
        const materialList = materials as Material[];
        const assignmentList = assignments as Assignment[];
        const quizList = quizzes as Quiz[];

        const sectionsWithMaterials = sectionList.map(section => ({
            ...section,
            materials: materialList.filter(m => m.section_id === section.section_id)
        }));

        const fullCourse: Course = {
            ...course,
            sections: sectionsWithMaterials,
            assignments: assignmentList,
            quizzes: quizList
        };

        return NextResponse.json(fullCourse);

    } catch (error: any) {
        return handleApiError(error, 'fetch course details');
    }
}

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
