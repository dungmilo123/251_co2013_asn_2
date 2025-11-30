import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionUser, TokenPayload, Role } from './definitions';

// Secret key for JWT signing (in production, use environment variable)
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
);

export const COOKIE_NAME = 'lms_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

/**
 * Create JWT token from user data
 */
async function createToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verify and decode JWT token
 */
 export async function verifyToken(token: string): Promise<TokenPayload | null> {
   try {
     const { payload } = await jwtVerify(token, SECRET_KEY);
     return payload as unknown as TokenPayload;
   } catch (error) {
     return null;
   }
 }

/**
 * Set session cookie with user data
 */
export async function setSession(user: SessionUser): Promise<void> {
  const payload: TokenPayload = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    studentCode: user.studentCode,
    instructorCode: user.instructorCode,
    adminCode: user.adminCode,
  };

  const token = await createToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Get current session from cookie
 */
 export async function getSession(): Promise<SessionUser | null> {
   const cookieStore = await cookies();
   const token = cookieStore.get(COOKIE_NAME);
 
   if (!token) return null;
   return await verifyToken(token.value);
 }

/**
 * Clear session cookie (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Require authentication - throws if not authenticated
 * Use in API routes that require auth
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require specific role - throws if wrong role
 * Use in API routes that require specific role
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }

  return session;
}

/**
 * Require student role with valid student code
 */
export async function requireStudent(): Promise<SessionUser> {
  const session = await requireRole(['Student']);

  if (!session.studentCode) {
    throw new Error('Student profile not found');
  }

  return session;
}

/**
 * Require instructor role with valid instructor code
 */
export async function requireInstructor(): Promise<SessionUser> {
  const session = await requireRole(['Instructor']);

  if (!session.instructorCode) {
    throw new Error('Instructor profile not found');
  }

  return session;
}

/**
 * Require administrator role with valid admin code
 */
export async function requireAdministrator(): Promise<SessionUser> {
  const session = await requireRole(['Administrator']);

  if (!session.adminCode) {
    throw new Error('Administrator profile not found');
  }

  return session;
}

/**
 * Get dashboard path for a given role
 * Centralizes role-to-dashboard mapping logic
 */
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
