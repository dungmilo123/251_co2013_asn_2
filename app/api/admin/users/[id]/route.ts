import { NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/auth';
import { query } from '@/lib/db';
import { handleApiError } from '@/lib/api-helpers';
import { userUpdateSchema } from '@/lib/validations/user';

// GET - Fetch a single user with all role-specific data
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdministrator();
        const { id } = await params;

        // Get base user data
        const users = await query({
            query: `
                SELECT user_id, username, email, first_name, last_name, 
                       date_of_birth, department, last_login, status, role
                FROM Users WHERE user_id = ?
            `,
            values: [id],
        });

        if ((users as any[]).length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = (users as any[])[0];

        // Get phone numbers
        const phones = await query({
            query: `SELECT phone_number FROM User_Phones WHERE user_id = ?`,
            values: [id],
        });
        user.phones = (phones as any[]).map(p => p.phone_number);

        // Get role-specific data
        if (user.role === 'Student') {
            const students = await query({
                query: `SELECT student_code, program, year_level, gpa, address_city, address_country 
                        FROM Students WHERE user_id = ?`,
                values: [id],
            });
            if ((students as any[]).length > 0) {
                user.student = (students as any[])[0];
            }
        } else if (user.role === 'Instructor') {
            const instructors = await query({
                query: `SELECT instructor_code FROM Instructors WHERE user_id = ?`,
                values: [id],
            });
            if ((instructors as any[]).length > 0) {
                user.instructor = (instructors as any[])[0];
                // Get specializations
                const specs = await query({
                    query: `SELECT specialization FROM Instructor_Specializations WHERE instructor_code = ?`,
                    values: [user.instructor.instructor_code],
                });
                user.instructor.specializations = (specs as any[]).map(s => s.specialization);
            }
        } else if (user.role === 'Administrator') {
            const admins = await query({
                query: `SELECT admin_code, position FROM Administrators WHERE user_id = ?`,
                values: [id],
            });
            if ((admins as any[]).length > 0) {
                user.administrator = (admins as any[])[0];
                // Get privileges
                const privs = await query({
                    query: `SELECT privilege FROM Admin_Privileges WHERE admin_code = ?`,
                    values: [user.administrator.admin_code],
                });
                user.administrator.privileges = (privs as any[]).map(p => p.privilege);
            }
        }

        return NextResponse.json(user);
    } catch (error: unknown) {
        return handleApiError(error, 'fetch user');
    }
}

// PUT - Update a user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdministrator();
        const { id } = await params;

        // Check if user exists
        const existingUsers = await query({
            query: 'SELECT * FROM Users WHERE user_id = ?',
            values: [id],
        });

        if ((existingUsers as any[]).length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existingUser = (existingUsers as any[])[0];

        const body = await request.json();
        const validatedData = userUpdateSchema.parse(body);

        // Build dynamic update query for Users table
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedData.username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(validatedData.username);
        }
        if (validatedData.email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(validatedData.email);
        }
        if (validatedData.password) {
            updateFields.push('password_hash = ?');
            updateValues.push(validatedData.password); // Demo: no hashing
        }
        if (validatedData.first_name !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(validatedData.first_name);
        }
        if (validatedData.last_name !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(validatedData.last_name);
        }
        if (validatedData.date_of_birth !== undefined) {
            updateFields.push('date_of_birth = ?');
            updateValues.push(validatedData.date_of_birth || null);
        }
        if (validatedData.department !== undefined) {
            updateFields.push('department = ?');
            updateValues.push(validatedData.department || null);
        }
        if (validatedData.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(validatedData.status);
        }

        // Update Users table if there are fields to update
        if (updateFields.length > 0) {
            await query({
                query: `UPDATE Users SET ${updateFields.join(', ')} WHERE user_id = ?`,
                values: [...updateValues, id],
            });
        }

        // Update phone numbers if provided
        if (validatedData.phones !== undefined) {
            // Delete existing phones
            await query({
                query: `DELETE FROM User_Phones WHERE user_id = ?`,
                values: [id],
            });
            // Insert new phones
            if (validatedData.phones && validatedData.phones.length > 0) {
                for (const phone of validatedData.phones) {
                    await query({
                        query: `INSERT INTO User_Phones (user_id, phone_number) VALUES (?, ?)`,
                        values: [id, phone],
                    });
                }
            }
        }

        // Update role-specific data (role cannot be changed)
        if (existingUser.role === 'Student') {
            const studentFields: string[] = [];
            const studentValues: any[] = [];

            if (validatedData.program !== undefined) {
                studentFields.push('program = ?');
                studentValues.push(validatedData.program || null);
            }
            if (validatedData.year_level !== undefined) {
                studentFields.push('year_level = ?');
                studentValues.push(validatedData.year_level || null);
            }
            if (validatedData.address_city !== undefined) {
                studentFields.push('address_city = ?');
                studentValues.push(validatedData.address_city || null);
            }
            if (validatedData.address_country !== undefined) {
                studentFields.push('address_country = ?');
                studentValues.push(validatedData.address_country || null);
            }

            if (studentFields.length > 0) {
                await query({
                    query: `UPDATE Students SET ${studentFields.join(', ')} WHERE user_id = ?`,
                    values: [...studentValues, id],
                });
            }
        } else if (existingUser.role === 'Instructor') {
            if (validatedData.specializations !== undefined) {
                const instructors = await query({
                    query: `SELECT instructor_code FROM Instructors WHERE user_id = ?`,
                    values: [id],
                });
                if ((instructors as any[]).length > 0) {
                    const instructorCode = (instructors as any[])[0].instructor_code;
                    // Delete existing specializations
                    await query({
                        query: `DELETE FROM Instructor_Specializations WHERE instructor_code = ?`,
                        values: [instructorCode],
                    });
                    // Insert new specializations
                    if (validatedData.specializations && validatedData.specializations.length > 0) {
                        for (const spec of validatedData.specializations) {
                            await query({
                                query: `INSERT INTO Instructor_Specializations (instructor_code, specialization) VALUES (?, ?)`,
                                values: [instructorCode, spec],
                            });
                        }
                    }
                }
            }
        } else if (existingUser.role === 'Administrator') {
            if (validatedData.position !== undefined) {
                await query({
                    query: `UPDATE Administrators SET position = ? WHERE user_id = ?`,
                    values: [validatedData.position || null, id],
                });
            }

            if (validatedData.privileges !== undefined) {
                const admins = await query({
                    query: `SELECT admin_code FROM Administrators WHERE user_id = ?`,
                    values: [id],
                });
                if ((admins as any[]).length > 0) {
                    const adminCode = (admins as any[])[0].admin_code;
                    // Delete existing privileges
                    await query({
                        query: `DELETE FROM Admin_Privileges WHERE admin_code = ?`,
                        values: [adminCode],
                    });
                    // Insert new privileges
                    if (validatedData.privileges && validatedData.privileges.length > 0) {
                        for (const priv of validatedData.privileges) {
                            await query({
                                query: `INSERT INTO Admin_Privileges (admin_code, privilege) VALUES (?, ?)`,
                                values: [adminCode, priv],
                            });
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: 'User updated successfully' });

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

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        return handleApiError(error, 'update user');
    }
}

// DELETE - Delete a user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdministrator();
        const { id } = await params;

        // Check if user exists
        const existingUsers = await query({
            query: 'SELECT user_id FROM Users WHERE user_id = ?',
            values: [id],
        });

        if ((existingUsers as any[]).length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user (cascade will handle role-specific tables and phones)
        await query({
            query: 'DELETE FROM Users WHERE user_id = ?',
            values: [id],
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: unknown) {
        return handleApiError(error, 'delete user');
    }
}
