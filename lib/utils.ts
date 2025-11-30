import { Role } from './definitions';

export function getDashboardPath(role: Role): string {
  switch (role) {
    case 'Student':
      return '/dashboard/student';
    case 'Instructor':
      return '/dashboard/instructor';
    case 'Administrator':
      return '/dashboard/admin';
    default:
      return '/';
  }
}