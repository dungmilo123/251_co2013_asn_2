'use client';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Home } from 'lucide-react';

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-6" style={{ background: '#e6f0f5' }}>
            <ShieldAlert className="w-16 h-16" style={{ color: '#00558d' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg"
          style={{ background: '#00558d' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#003d66';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00558d';
          }}
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
