import { NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';
import { userCreateSchema } from '@/lib/validations/user';


export async function GET() {
  try {
    // Require Administrator role with valid admin code
    await requireAdministrator();

    // Get all users with their role information
    const users = await query({
      query: `
        SELECT
          user_id,
          username,
          email,
          first_name,
          last_name,
          role,
          status,
          department,
          last_login,
          date_of_birth
        FROM Users
        ORDER BY role, last_name, first_name
      `,
      values: [],
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    return handleApiError(error, 'fetch users');
  }
}

export async function POST(request: Request) {
  try {
    await requireAdministrator();

    const body = await request.json();
    const validatedData = userCreateSchema.parse(body);

    // Store password directly for demo (no hashing)
    const password_hash = validatedData.password;

    // Insert into Users table
    const userResult = await query({
      query: `
        INSERT INTO Users (username, email, password_hash, first_name, last_name, 
                          date_of_birth, department, status, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        validatedData.username,
        validatedData.email,
        password_hash,
        validatedData.first_name,
        validatedData.last_name,
        validatedData.date_of_birth || null,
        validatedData.department || null,
        validatedData.status || 'Active',
        validatedData.role,
      ],
    });

    const userId = (userResult as any).insertId;

    // Insert role-specific data
    if (validatedData.role === 'Student') {
      await query({
        query: `
          INSERT INTO Students (user_id, program, year_level, address_city, address_country)
          VALUES (?, ?, ?, ?, ?)
        `,
        values: [
          userId,
          validatedData.program || null,
          validatedData.year_level || null,
          validatedData.address_city || null,
          validatedData.address_country || null,
        ],
      });
    } else if (validatedData.role === 'Instructor') {
      // Get the generated instructor_code
      const instructorResult = await query({
        query: `INSERT INTO Instructors (user_id) VALUES (?)`,
        values: [userId],
      });

      // Add specializations if provided
      if (validatedData.specializations && validatedData.specializations.length > 0) {
        const instructors = await query({
          query: `SELECT instructor_code FROM Instructors WHERE user_id = ?`,
          values: [userId],
        });
        const instructorCode = (instructors as any[])[0].instructor_code;

        for (const spec of validatedData.specializations) {
          await query({
            query: `INSERT INTO Instructor_Specializations (instructor_code, specialization) VALUES (?, ?)`,
            values: [instructorCode, spec],
          });
        }
      }
    } else if (validatedData.role === 'Administrator') {
      await query({
        query: `INSERT INTO Administrators (user_id, position) VALUES (?, ?)`,
        values: [userId, validatedData.position || null],
      });

      // Add privileges if provided
      if (validatedData.privileges && validatedData.privileges.length > 0) {
        const admins = await query({
          query: `SELECT admin_code FROM Administrators WHERE user_id = ?`,
          values: [userId],
        });
        const adminCode = (admins as any[])[0].admin_code;

        for (const priv of validatedData.privileges) {
          await query({
            query: `INSERT INTO Admin_Privileges (admin_code, privilege) VALUES (?, ?)`,
            values: [adminCode, priv],
          });
        }
      }
    }

    // Add phone numbers if provided
    if (validatedData.phones && validatedData.phones.length > 0) {
      for (const phone of validatedData.phones) {
        await query({
          query: `INSERT INTO User_Phones (user_id, phone_number) VALUES (?, ?)`,
          values: [userId, phone],
        });
      }
    }

    // Fetch the created user
    const createdUsers = await query({
      query: `SELECT user_id, username, email, first_name, last_name, role, status, department, date_of_birth FROM Users WHERE user_id = ?`,
      values: [userId],
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: (createdUsers as any[])[0],
    }, { status: 201 });

  } catch (error: unknown) {
    // Handle duplicate username/email
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      if (error.message.includes('username')) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
      if (error.message.includes('email')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }

    return handleApiError(error, 'create user');
  }
}
