import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';
import fs from 'fs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    const session = await getSession();
    
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get Submission Info
    const submissions = await query({
        query: `
            SELECT s.student_code, s.file_path, s.file_name, a.course_id
            FROM Submissions s
            JOIN Assignments a ON s.assignment_id = a.assignment_id
            WHERE s.submission_id = ?
        `,
        values: [submissionId]
    });

    if ((submissions as any[]).length === 0) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = (submissions as any[])[0];

    if (!submission.file_path) {
         return NextResponse.json({ error: 'No file attached to this submission' }, { status: 400 });
    }

    // 2. Check Permissions
    let authorized = false;

    if (session.role === 'Administrator') {
        authorized = true;
    } else if (session.role === 'Student') {
        if (session.studentCode === submission.student_code) {
            authorized = true;
        }
    } else if (session.role === 'Instructor') {
        const teaching = await query({
            query: 'SELECT 1 FROM Teaching WHERE instructor_code = ? AND course_id = ?',
            values: [session.instructorCode, submission.course_id]
        });
        if ((teaching as any[]).length > 0) {
            authorized = true;
        }
    }

    if (!authorized) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Serve File
    const filePath = submission.file_path;
    
    if (!fs.existsSync(filePath)) {
         return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Disposition': `attachment; filename="${submission.file_name}"`,
            'Content-Type': 'application/octet-stream',
        }
    });

  } catch (error: any) {
    return handleApiError(error, 'downloading file');
  }
}
