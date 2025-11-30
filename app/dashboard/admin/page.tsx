'use client';
import { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Users as UsersIcon, BarChart3 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8" style={{ color: '#00558d' }} />
        <h1 className="text-3xl font-bold text-gray-900">Administrator Dashboard</h1>
      </div>

      {/* Course Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: '#00558d' }} />
            Add New Course
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              placeholder="Course Code (e.g., CO2013)"
              className="border border-gray-300 p-3 rounded-lg flex-shrink-0 w-48 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              required
            />
            <input
              placeholder="Course Title"
              className="border border-gray-300 p-3 rounded-lg flex-grow focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Credits"
              className="border border-gray-300 p-3 rounded-lg w-24 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={newCourse.credits}
              onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg"
              style={{ background: '#00558d' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#003d66';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#00558d';
              }}
            >
              Add Course
            </button>
          </form>
        </div>
      </div>

      {/* Grid Layout for Course List and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course List</h2>
              <input
                placeholder="Filter by title..."
                className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 font-semibold text-gray-700">Code</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Title</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.course_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium" style={{ color: '#00558d' }}>
                        {c.course_code}
                      </td>
                      <td className="py-3">{c.title}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(c.course_id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="bg-white rounded-lg shadow" style={{ background: '#1e293b' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Semester Stats (HK251)
              </h2>
              <button
                onClick={fetchStats}
                disabled={loadingStats}
                className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loadingStats ? 'Loading...' : 'Load Stats'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">
              Fetching from Stored Procedure: <code>get_course_stats</code>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <th className="text-left pb-2 font-semibold text-gray-300">Course</th>
                    <th className="text-left pb-2 font-semibold text-gray-300">Enrolled</th>
                    <th className="text-left pb-2 font-semibold text-gray-300">Avg Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center italic text-gray-500">
                        Click Load to view stats
                      </td>
                    </tr>
                  ) : (
                    stats.map((s, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <td className="py-2 text-white">{s.course_code}</td>
                        <td className="py-2 text-white">{s.total_enrolled}</td>
                        <td className="py-2 text-white">{s.avg_grade || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UsersIcon className="w-5 h-5" style={{ color: '#00558d' }} />
            User Management
          </h2>
        </div>
        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 font-semibold text-gray-700">Username</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Role</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left pb-3 font-semibold text-gray-700">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium" style={{ color: '#00558d' }}>
                        {user.username}
                      </td>
                      <td className="py-3">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            user.role === 'Administrator'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'Instructor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
