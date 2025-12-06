export interface Prerequisite {
  prerequisite_id: number;
  course_code?: string | null;
  title?: string | null;
  min_grade?: number | null;
}

export interface CourseFormData {
  course_code: string;
  title: string;
  credits: number;
  department?: string;
  academic_level?: string;
  max_capacity?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  enrollment_start_date?: string;
  enrollment_end_date?: string;
  status?: string;
  passing_score?: number;
  prerequisites?: Prerequisite[] | null;
}

export interface CourseFormSection {
  id: string;
  title: string;
  expanded: boolean;
  required?: boolean;
}

export interface FormFieldProps {
  label: string;
  name: keyof CourseFormData;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  options?: { value: string; label: string }[];
  step?: string;
  min?: string;
  max?: string;
}
