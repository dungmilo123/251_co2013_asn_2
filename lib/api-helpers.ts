import { NextResponse } from 'next/server';

/**
 * Centralized error handler for API routes
 * @param error - The error object
 * @param operation - Description of the operation that failed (e.g., 'fetch courses')
 * @returns NextResponse with appropriate error message and status code
 */
export function handleApiError(error: unknown, operation: string): NextResponse {
  // Handle authentication/authorization errors
  if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  // Log the error for debugging
  console.error(`Error in ${operation}:`, error);

  // Return generic 500 error
  return NextResponse.json(
    { error: `Failed to ${operation}` },
    { status: 500 }
  );
}
