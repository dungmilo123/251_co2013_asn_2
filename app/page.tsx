'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/lib/utils';
import { type Role } from '@/lib/definitions';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role (session stored in secure httpOnly cookie)
        const role = data.user.role as Role;
        router.push(getDashboardPath(role));
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .geometric-pattern {
          background-image:
            linear-gradient(45deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.03) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.03) 75%);
          background-size: 60px 60px;
          background-position: 0 0, 0 30px, 30px -30px, -30px 0px;
        }

        .diagonal-divider {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          position: relative;
        }

        .diagonal-divider::after {
          content: '';
          position: absolute;
          top: 0;
          right: -1px;
          width: 100px;
          height: 100%;
          background: linear-gradient(to right, #00558d, transparent);
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        .input-focus-effect:focus {
          outline: none;
          border-color: #00558d;
          box-shadow: 0 0 0 3px rgba(0, 85, 141, 0.1);
        }

        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Left Panel - Brand Identity */}
        <div
          className="hidden lg:flex lg:w-1/2 diagonal-divider geometric-pattern relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00558d 0%, #003d66 100%)' }}
        >
          <div className="relative z-10 flex flex-col justify-between p-16 w-full">
            {/* Logo and Title */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <img src="/01_logobachkhoatoi.png" alt="Logo" className="w-14 h-14 object-contain" />
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Learning Hub</h1>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Welcome to the<br />
                Future of Learning
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: '#e6f0f5', maxWidth: '480px' }}>
                Access your courses, assignments, and resources in one unified platform.
                Built for students and educators at Ho Chi Minh City University of Technology.
              </p>
            </div>

            {/* Footer - Empty spacer */}
            <div></div>
          </div>

          {/* Decorative Geometric Shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 floating-shape" style={{ animationDelay: '0s', opacity: 0.1 }}>
            <div className="w-full h-full border-4 border-white transform rotate-45"></div>
          </div>
          <div className="absolute bottom-32 right-40 w-24 h-24 floating-shape" style={{ animationDelay: '2s', opacity: 0.08 }}>
            <div className="w-full h-full bg-white transform rotate-12"></div>
          </div>
          <div className="absolute top-1/3 right-10 w-16 h-16 rounded-full floating-shape" style={{ animationDelay: '4s', background: 'rgba(255, 255, 255, 0.06)' }}></div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md animate-slide-in-right" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <img src="/01_logobachkhoatoi.png" alt="Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-bold" style={{ color: '#00558d' }}>Learning Hub</h1>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Sign In</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 transition-all duration-200 input-focus-effect"
                  style={{ fontSize: '16px', color: '#1a1a1a' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 transition-all duration-200 input-focus-effect"
                  style={{ fontSize: '16px', color: '#1a1a1a' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="px-4 py-3 rounded-lg animate-fade-in"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#dc2626'
                  }}
                >
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#6b7280' : '#00558d',
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = '#003d66';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = '#00558d';
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}