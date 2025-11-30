export type Role = 'Student' | 'Instructor' | 'Administrator';

export interface SessionUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  studentCode?: string;
  instructorCode?: string;
  adminCode?: string;
}

export interface TokenPayload extends SessionUser {}