'use client';
import { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Users as UsersIcon, BarChart3, TrendingUp, BookOpen, Shield, Database } from 'lucide-react';

interface Course {
  course_id: number;
  course_code: string;
  title: string;
  credits: number;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  department?: string;
  last_login?: string;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [newCourse, setNewCourse] = useState({ code: '', title: '', credits: 3 });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, [search]);

  const fetchCourses = async () => {
    const res = await fetch(`/api/courses?search=${search}`);
    if (res.ok) {
      setCourses(await res.json());
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    const res = await fetch('/api/stats');
    if (res.ok) {
      setStats(await res.json());
    }
    setLoadingStats(false);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
    });
    if (res.ok) {
      setNewCourse({ code: '', title: '', credits: 3 });
      fetchCourses();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchCourses();
    }
  };

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

        /* Prevent animation flickering by ensuring smooth transitions */
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

        .floating-shape {
          animation: float 8s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 85, 141, 0.1), 0 10px 10px -5px rgba(0, 85, 141, 0.04);
        }

        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(0, 85, 141, 0.1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 85, 141, 0.05) 0%, transparent 70%);
          border-radius: 0 0 0 100%;
        }

        .hcmut-gradient {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
        }

        .btn-primary {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 85, 141, 0.2);
        }

        .course-management-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .course-management-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 85, 141, 0.1);
        }

        .user-row:hover {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          transform: scale(1.01);
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

          {/* Course Management Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-black">
                <Plus className="w-6 h-6" />
                Course Management
              </h2>
              <p className="mt-2 text-black">
                Create new courses and manage the academic curriculum
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="course-management-card rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course Code
                    </label>
                    <input
                      placeholder="e.g., CO2013"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono placeholder:text-gray-600/50 text-black"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="course-management-card rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course Title
                    </label>
                    <input
                      placeholder="Full course title"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600/50 text-black"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="course-management-card rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Credits
                    </label>
                    <input
                      type="number"
                      placeholder="Credit hours"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600/50 text-black"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-3 px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Grid Layout for Course List and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          {/* Course List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6" style={{ color: '#00558d' }} />
                Course Catalog
              </h2>
              <div className="relative">
                <input
                  placeholder="Search courses..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600/50 text-black"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Database className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-8">
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No courses found</p>
                  <p className="text-gray-400 mt-2">Start by adding your first course above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course, index) => (
                    <div
                      key={course.course_id}
                      className="group rounded-xl p-4 border border-gray-200 bg-gradient-to-r from-gray-50 via-white to-blue-50/30 transition-all duration-300 hover:shadow-md hover:border-blue-300"
                      style={{ animationDelay: `${1.0 + index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#00558d', background: '#e6f0f5' }}>
                              {course.course_code}
                            </div>
                            <span className="text-gray-400">•</span>
                            <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(course.course_id)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Statistics */}
          <div className="rounded-2xl shadow-lg overflow-hidden transform-gpu" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1e3a5a 100%)' }}>
            <div className="px-8 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6" />
                    Semester Statistics
                  </h2>
                  <p className="text-blue-200 text-sm">
                    HK251 • Stored Procedure Analytics
                  </p>
                </div>
                <button
                  onClick={fetchStats}
                  disabled={loadingStats}
                  className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingStats ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Load Stats
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-8">
              {stats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white/60" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">No statistics loaded</p>
                  <p className="text-white/60 text-sm mt-2">Click "Load Stats" to view analytics</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-4 bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all duration-300"
                      style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 rounded-lg font-mono font-bold text-white bg-blue-500/20 backdrop-blur">
                              {stat.course_code}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-white/80">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              {stat.total_enrolled} enrolled
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              Avg: {stat.avg_grade || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

              {/* User Management Section */}
          <div className="animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <UsersIcon className="w-6 h-6" style={{ color: '#00558d' }} />
                  User Management
                </h2>
                <p className="mt-2 text-gray-600">
                  View and manage all system users
                </p>
              </div>
              <div className="p-8">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <UsersIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No users found</p>
                    <p className="text-gray-400 mt-2">System may be initializing or database is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {users.filter(u => u.status === 'Active').length}
                        </div>
                        <div className="text-sm text-gray-600">Active</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {users.filter(u => u.status === 'Inactive').length}
                        </div>
                        <div className="text-sm text-gray-600">Inactive</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold" style={{ color: '#00558d' }}>
                          {users.filter(u => u.role === 'Student').length}
                        </div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {users.map((user, index) => (
                        <div
                          key={user.user_id}
                          className="user-row rounded-xl p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border border-gray-200 transition-all duration-300"
                          style={{ animationDelay: `${1.6 + index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                  {user.username}
                                </div>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    user.role === 'Administrator'
                                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                                      : user.role === 'Instructor'
                                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {user.first_name} {user.last_name}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>{user.email}</p>
                                <p>Last login: {
                                  user.last_login
                                    ? new Date(user.last_login).toLocaleDateString()
                                    : 'Never'
                                }</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  user.status === 'Active'
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {user.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );
}
