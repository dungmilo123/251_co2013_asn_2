// User types for the admin user management system

export interface User {
    user_id: number;
    username: string;
    email: string;
    password_hash?: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    department?: string;
    last_login?: string;
    status: string;
    role: 'Student' | 'Instructor' | 'Administrator';
    phones?: string[];
}

export interface StudentData {
    student_code?: string;
    program?: string;
    year_level?: number;
    gpa?: number;
    address_city?: string;
    address_country?: string;
}

export interface InstructorData {
    instructor_code?: string;
    specializations?: string[];
}

export interface AdministratorData {
    admin_code?: string;
    position?: string;
    privileges?: string[];
}

export interface UserWithRoleData extends User {
    student?: StudentData;
    instructor?: InstructorData;
    administrator?: AdministratorData;
}

export interface UserFormData {
    username: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    department?: string;
    status?: string;
    role: 'Student' | 'Instructor' | 'Administrator';
    phones?: string[];
    // Student fields
    program?: string;
    year_level?: number;
    address_city?: string;
    address_country?: string;
    // Instructor fields
    specializations?: string[];
    // Administrator fields
    position?: string;
    privileges?: string[];
}
