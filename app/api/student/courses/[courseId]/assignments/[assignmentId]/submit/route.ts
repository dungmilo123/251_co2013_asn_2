import { NextResponse } from 'next/server';
import { requireStudent } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const { courseId, assignmentId } = await params;
    const session = await requireStudent();
    const studentCode = session.studentCode!;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string | null;

    if (!file && !content) {
      return NextResponse.json({ error: 'No file or content provided' }, { status: 400 });
    }

    // 1. Verify Enrollment
     const enrollment = await query({
      query: 'SELECT 1 FROM Enrollments WHERE student_code = ? AND course_id = ?',
      values: [studentCode, courseId],
    });

    if ((enrollment as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // 2. Check Assignment Logic
    const assignments = await query({
        query: 'SELECT due_date, late_submission_allowed, opening_date FROM Assignments WHERE assignment_id = ?',
        values: [assignmentId]
    });
    if ((assignments as unknown[]).length === 0) return NextResponse.json({error: 'Assignment not found'}, {status: 404});
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignment = (assignments as any[])[0];
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const openingDate = new Date(assignment.opening_date);

    if (now < openingDate) {
        return NextResponse.json({error: 'Assignment is not open yet'}, {status: 400});
    }

    let isLate = false;
    if (now > dueDate) {
        if (!assignment.late_submission_allowed) {
             return NextResponse.json({error: 'Late submissions are not allowed'}, {status: 400});
        }
        isLate = true;
    }

    let filePath = null;
    let fileName = null;

    // 3. Handle File
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), 'uploads', 'submissions');
      
      // Ensure dir exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate safe filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.name;
      const extension = path.extname(originalName);
      const safeName = path.basename(originalName, extension).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const storedFileName = `${assignmentId}-${studentCode}-${safeName}-${uniqueSuffix}${extension}`;
      
      filePath = path.join(uploadDir, storedFileName);
      fileName = originalName;

      await writeFile(filePath, buffer);
    }

    // 4. Upsert Submission
    await query({
        query: `
            INSERT INTO Submissions (assignment_id, student_code, date, content, file_path, file_name, is_late, status)
            VALUES (?, ?, NOW(), ?, ?, ?, ?, 'Submitted')
            ON DUPLICATE KEY UPDATE
                date = NOW(),
                content = VALUES(content),
                file_path = VALUES(file_path),
                file_name = VALUES(file_name),
                is_late = VALUES(is_late),
                status = 'Submitted'
        `,
        values: [assignmentId, studentCode, content, filePath, fileName, isLate]
    });

    return NextResponse.json({ success: true, message: 'Assignment submitted successfully' });

  } catch (error: unknown) {
    return handleApiError(error, 'submitting assignment');
  }
}
