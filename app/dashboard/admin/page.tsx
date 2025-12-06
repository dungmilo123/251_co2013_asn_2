'use client';
import { Settings, Users as UsersIcon, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }

        .animate-slide-in-up {
          opacity: 0;
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }

        .floating-shape {
          animation: float 8s ease-in-out infinite;
        }

        .hcmut-gradient {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
        }

        .management-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(0, 85, 141, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .management-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, rgba(0, 85, 141, 0.08) 0%, transparent 70%);
          border-radius: 0 0 0 100%;
          transition: all 0.4s ease;
        }

        .management-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 85, 141, 0.15);
          border-color: rgba(0, 85, 141, 0.2);
        }

        .management-card:hover::before {
          width: 200px;
          height: 200px;
        }

        .management-card:hover .card-icon {
          transform: scale(1.1);
        }

        .management-card:hover .card-arrow {
          transform: translateX(6px);
        }

        .card-icon {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-arrow {
          transition: transform 0.3s ease;
        }

        .icon-gradient-blue {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
        }

        .icon-gradient-teal {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        }
      `}</style>

      <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page Header with Geometric Design */}
        <div className="relative overflow-hidden rounded-2xl p-8 hcmut-gradient text-white animate-slide-in-up">
          <div className="absolute top-8 right-8 w-24 h-24 floating-shape opacity-20">
            <div className="w-full h-full border-4 border-white transform rotate-45"></div>
          </div>
          <div className="absolute bottom-8 right-32 w-16 h-16 floating-shape opacity-15" style={{ animationDelay: '2s' }}>
            <div className="w-full h-full bg-white transform rotate-12"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <Settings className="w-12 h-12" />
              <h1 className="text-4xl font-bold tracking-tight">Administrator Dashboard</h1>
            </div>
            <p className="text-lg opacity-90 max-w-2xl">
              Manage courses, users, and monitor system statistics for HCMUT Learning Hub
            </p>
          </div>
        </div>

        {/* Management Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {/* Course Management Card */}
          <Link href="/dashboard/admin/courses" className="block">
            <div className="management-card rounded-2xl p-8 cursor-pointer min-h-[280px] flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="card-icon w-16 h-16 rounded-2xl icon-gradient-blue flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="card-arrow w-6 h-6 text-gray-400" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Management</h2>
                <p className="text-gray-600 leading-relaxed">
                  Create, edit, and manage courses. View course catalogs, handle enrollment settings,
                  and monitor academic curriculum across all departments.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#00558d' }}>
                  <span>Manage Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* User Management Card */}
          <Link href="/dashboard/admin/users" className="block">
            <div className="management-card rounded-2xl p-8 cursor-pointer min-h-[280px] flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="card-icon w-16 h-16 rounded-2xl icon-gradient-teal flex items-center justify-center shadow-lg">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="card-arrow w-6 h-6 text-gray-400" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">User Management</h2>
                <p className="text-gray-600 leading-relaxed">
                  View and manage all system users including students, instructors, and administrators.
                  Handle user roles, permissions, and account statuses.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#0d9488' }}>
                  <span>Manage Users</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}