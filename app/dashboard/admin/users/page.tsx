'use client';
import { useEffect, useState, useCallback } from 'react';
import { Users as UsersIcon, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

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

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = useCallback(async () => {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            setUsers(await res.json());
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        inactive: users.filter(u => u.status === 'Inactive').length,
        students: users.filter(u => u.role === 'Student').length,
        instructors: users.filter(u => u.role === 'Instructor').length,
        admins: users.filter(u => u.role === 'Administrator').length,
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

        .animate-slide-in-up {
          opacity: 0;
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }

        .teal-gradient {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        }

        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(13, 148, 136, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(13, 148, 136, 0.1);
        }

        .user-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }
      `}</style>

            <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl p-8 teal-gradient text-white animate-slide-in-up">
                    <div className="relative z-10">
                        <Link
                            href="/dashboard/admin"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <UsersIcon className="w-10 h-10" />
                            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        </div>
                        <p className="mt-2 text-white/80">
                            View and manage all system users
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                        <div className="text-sm text-gray-600">Inactive</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
                        <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{stats.instructors}</div>
                        <div className="text-sm text-gray-600">Instructors</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-teal-600">{stats.admins}</div>
                        <div className="text-sm text-gray-600">Admins</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="relative flex-1 max-w-md">
                        <input
                            placeholder="Search users..."
                            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-500 text-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-gray-700"
                    >
                        <option value="all">All Roles</option>
                        <option value="Student">Students</option>
                        <option value="Instructor">Instructors</option>
                        <option value="Administrator">Administrators</option>
                    </select>
                </div>

                {/* User List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            Users ({filteredUsers.length})
                        </h2>
                    </div>
                    <div className="p-8">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <UsersIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No users found</p>
                                <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="user-card rounded-xl p-6 bg-gradient-to-br from-gray-50 via-white to-teal-50/30 border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#0d9488', background: '#ccfbf1' }}>
                                                        {user.username}
                                                    </div>
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Administrator'
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            : user.role === 'Instructor'
                                                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
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
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.status === 'Active'
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
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
