'use client';
import { useEffect, useState, useCallback } from 'react';
import { Users as UsersIcon, ArrowLeft, Search, Plus, Eye, Pencil, Trash2, X, GraduationCap, Briefcase, Shield, Phone, Calendar, Building, Mail } from 'lucide-react';
import Link from 'next/link';
import { UserForm } from '@/components/admin/UserForm';
import { UserWithRoleData } from '@/types/user';

interface User {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'Student' | 'Instructor' | 'Administrator';
    status: string;
    department?: string;
    last_login?: string;
    date_of_birth?: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRoleData | null>(null);
    const [viewingUser, setViewingUser] = useState<UserWithRoleData | null>(null);
    const [loadingUser, setLoadingUser] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            setUsers(await res.json());
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchUsers();
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to delete user');
        }
    };

    const handleEdit = async (user: User) => {
        setLoadingUser(user.user_id);
        try {
            const res = await fetch(`/api/admin/users/${user.user_id}`);
            if (res.ok) {
                const fullUser = await res.json();
                setEditingUser(fullUser);
                setShowForm(false);
                setViewingUser(null);
            }
        } finally {
            setLoadingUser(null);
        }
    };

    const handleView = async (user: User) => {
        setLoadingUser(user.user_id);
        try {
            const res = await fetch(`/api/admin/users/${user.user_id}`);
            if (res.ok) {
                const fullUser = await res.json();
                setViewingUser(fullUser);
                setEditingUser(null);
                setShowForm(false);
            }
        } finally {
            setLoadingUser(null);
        }
    };

    const handleFormSuccess = () => {
        fetchUsers();
        setShowForm(false);
        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleCloseView = () => {
        setViewingUser(null);
    };

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

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Student': return <GraduationCap className="w-4 h-4" />;
            case 'Instructor': return <Briefcase className="w-4 h-4" />;
            case 'Administrator': return <Shield className="w-4 h-4" />;
            default: return <UsersIcon className="w-4 h-4" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Administrator': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Instructor': return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'Student': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Inactive': return 'bg-red-100 text-red-800';
            case 'Suspended': return 'bg-orange-100 text-orange-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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

        .btn-primary-teal {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary-teal:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(13, 148, 136, 0.2);
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
                            Create, view, edit, and manage all system users
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

                {/* Filters and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
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
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingUser(null);
                            setViewingUser(null);
                        }}
                        className="btn-primary-teal text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {showForm ? 'Hide Form' : 'Add User'}
                    </button>
                </div>

                {/* Create User Form */}
                {showForm && !editingUser && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                        </div>
                        <div className="p-8">
                            <UserForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
                        </div>
                    </div>
                )}

                {/* Edit User Form */}
                {editingUser && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit User: {editingUser.username}
                            </h2>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            <UserForm
                                onSuccess={handleFormSuccess}
                                onCancel={handleCancelEdit}
                                user={editingUser}
                                mode="edit"
                            />
                        </div>
                    </div>
                )}

                {/* View User Modal */}
                {viewingUser && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#0d9488', background: '#ccfbf1' }}>
                                    {viewingUser.username}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {viewingUser.first_name} {viewingUser.last_name}
                                </h2>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeClass(viewingUser.role)}`}>
                                    {getRoleIcon(viewingUser.role)}
                                    {viewingUser.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(viewingUser.status)}`}>
                                    {viewingUser.status}
                                </span>
                            </div>
                            <button
                                onClick={handleCloseView}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <UsersIcon className="w-5 h-5 text-teal-500" />
                                        Basic Info
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" />Email</span>
                                            <span className="font-medium text-gray-900">{viewingUser.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" />DOB</span>
                                            <span className="font-medium text-gray-900">{formatDate(viewingUser.date_of_birth)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 flex items-center gap-2"><Building className="w-4 h-4" />Dept</span>
                                            <span className="font-medium text-gray-900">{viewingUser.department || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Last Login</span>
                                            <span className="font-medium text-gray-900">{viewingUser.last_login ? formatDate(viewingUser.last_login) : 'Never'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Numbers */}
                                {viewingUser.phones && viewingUser.phones.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-teal-500" />
                                            Phone Numbers
                                        </h3>
                                        <div className="space-y-2">
                                            {viewingUser.phones.map((phone, idx) => (
                                                <div key={idx} className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                                                    {phone}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Role-Specific Info */}
                                {viewingUser.role === 'Student' && viewingUser.student && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-500" />
                                            Student Info
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Student Code</span>
                                                <span className="font-mono font-medium text-gray-900">{viewingUser.student.student_code}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Program</span>
                                                <span className="font-medium text-gray-900">{viewingUser.student.program || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Year Level</span>
                                                <span className="font-medium text-gray-900">{viewingUser.student.year_level || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">GPA</span>
                                                <span className="font-medium text-gray-900">{viewingUser.student.gpa ?? '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Location</span>
                                                <span className="font-medium text-gray-900">
                                                    {[viewingUser.student.address_city, viewingUser.student.address_country].filter(Boolean).join(', ') || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {viewingUser.role === 'Instructor' && viewingUser.instructor && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-indigo-500" />
                                            Instructor Info
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Instructor Code</span>
                                                <span className="font-mono font-medium text-gray-900">{viewingUser.instructor.instructor_code}</span>
                                            </div>
                                        </div>
                                        {viewingUser.instructor.specializations && viewingUser.instructor.specializations.length > 0 && (
                                            <div>
                                                <span className="text-gray-500 text-sm">Specializations</span>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {viewingUser.instructor.specializations.map((spec, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewingUser.role === 'Administrator' && viewingUser.administrator && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-purple-500" />
                                            Administrator Info
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Admin Code</span>
                                                <span className="font-mono font-medium text-gray-900">{viewingUser.administrator.admin_code}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Position</span>
                                                <span className="font-medium text-gray-900">{viewingUser.administrator.position || '—'}</span>
                                            </div>
                                        </div>
                                        {viewingUser.administrator.privileges && viewingUser.administrator.privileges.length > 0 && (
                                            <div>
                                                <span className="text-gray-500 text-sm">Privileges</span>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {viewingUser.administrator.privileges.map((priv, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                                                            {priv}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button
                                    onClick={handleCloseView}
                                    className="px-6 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleEdit(viewingUser)}
                                    className="btn-primary-teal px-6 py-2 rounded-xl font-medium text-white flex items-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                <p className="text-gray-400 mt-2">
                                    {search || roleFilter !== 'all' ? 'Try adjusting your search or filter' : 'Click "Add User" to create your first user'}
                                </p>
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
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                    {user.first_name} {user.last_name}
                                                </h3>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>{user.email}</p>
                                                    <p>Last login: {user.last_login ? formatDate(user.last_login) : 'Never'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-1 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleView(user)}
                                                disabled={loadingUser === user.user_id}
                                                className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                disabled={loadingUser === user.user_id}
                                                className="p-2 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
