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

export type TokenPayload = SessionUser;

export interface Material {
  material_id: number;
  section_id: number;
  title: string;
  type: string;
  file_path: string;
  file_size: string;
  upload_date: string;
  visibility: boolean;
}

export interface Section {
  section_id: number;
  course_id: number;
  title: string;
  description: string;
  order_num: number;
  visibility: boolean;
  available_from?: string;
  available_until?: string;
  materials: Material[];
}

export interface Assignment {
  assignment_id: number;
  course_id: number;
  title: string;
  instruction: string;
  weight: number;
  max_score: number;
  opening_date: string;
  due_date: string;
  submission_type: string;
  late_submission_allowed: boolean;
  late_penalty: number;
}

export interface Submission {
  submission_id: number;
  assignment_id: number;
  student_code: string;
  date: string;
  content: string | null;
  file_path: string | null;
  file_name: string | null;
  score: number | null;
  status: string;
  is_late: boolean;
}

export interface Quiz {
  quiz_id: number;
  course_id: number;
  title: string;
  description: string;
  open_time: string;
  close_time: string;
  time_limit_minutes: number;
  attempts_allowed: number;
  grading_method: string;
  passing_score: number;
}

export interface Course {
  course_id: number;
  course_code: string;
  title: string;
  credits: number;
  department: string;
  academic_level: string;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  sections: Section[];
  assignments: Assignment[];
  quizzes: Quiz[];
}