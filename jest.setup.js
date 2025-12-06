import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, status = 200) => ({
      status,
      json: () => Promise.resolve(data),
    }),
  },
}));

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireAdministrator: jest.fn().mockResolvedValue({
    user: { role: 'Administrator' },
    adminCode: 'ADMIN123',
  }),
}));

// Mock the database module
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

// Mock handleApiError
jest.mock('@/lib/api-helpers', () => ({
  handleApiError: jest.fn((error, operation) => ({
    error: 'Internal server error',
    message: operation,
    details: error?.message || 'Unknown error',
  })),
}));

// Mock zod schema validation for course creation
jest.mock('@/lib/validations/course', () => ({
  courseCreateSchema: {
    parse: jest.fn((data) => data),
  },
}));