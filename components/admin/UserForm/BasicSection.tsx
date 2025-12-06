'use client';
import React from 'react';
import { User, Mail, Lock, Calendar, Building } from 'lucide-react';
import { FormField } from './FormField';

export const BasicSection: React.FC = () => {
    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
        { value: 'Pending', label: 'Pending' },
    ];

    const roleOptions = [
        { value: 'Student', label: 'Student' },
        { value: 'Instructor', label: 'Instructor' },
        { value: 'Administrator', label: 'Administrator' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#0d9488' }} />
                Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                    label="Username"
                    name="username"
                    placeholder="e.g., john_doe"
                    required
                    icon={<User className="w-5 h-5" />}
                />
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    icon={<Mail className="w-5 h-5" />}
                />
                <FormField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    icon={<Lock className="w-5 h-5" />}
                />
                <FormField
                    label="First Name"
                    name="first_name"
                    placeholder="John"
                    required
                    icon={<User className="w-5 h-5" />}
                />
                <FormField
                    label="Last Name"
                    name="last_name"
                    placeholder="Doe"
                    required
                    icon={<User className="w-5 h-5" />}
                />
                <FormField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    icon={<Calendar className="w-5 h-5" />}
                />
                <FormField
                    label="Department"
                    name="department"
                    placeholder="e.g., Computer Science"
                    icon={<Building className="w-5 h-5" />}
                />
                <FormField
                    label="Status"
                    name="status"
                    type="select"
                    options={statusOptions}
                />
                <FormField
                    label="Role"
                    name="role"
                    type="select"
                    options={roleOptions}
                    required
                />
            </div>
        </div>
    );
};
