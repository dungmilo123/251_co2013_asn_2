'use client';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { GraduationCap, Briefcase, Shield, MapPin, Award, Star } from 'lucide-react';
import { FormField } from './FormField';

export const RoleSection: React.FC = () => {
    const { control } = useFormContext();
    const role = useWatch({ control, name: 'role' });

    if (role === 'Student') {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" style={{ color: '#0d9488' }} />
                    Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                        label="Program"
                        name="program"
                        placeholder="e.g., Computer Science"
                        icon={<GraduationCap className="w-5 h-5" />}
                    />
                    <FormField
                        label="Year Level"
                        name="year_level"
                        type="number"
                        placeholder="1-10"
                        min="1"
                        max="10"
                        icon={<Award className="w-5 h-5" />}
                    />
                    <FormField
                        label="City"
                        name="address_city"
                        placeholder="City"
                        icon={<MapPin className="w-5 h-5" />}
                    />
                    <FormField
                        label="Country"
                        name="address_country"
                        placeholder="Country"
                        icon={<MapPin className="w-5 h-5" />}
                    />
                </div>
            </div>
        );
    }

    if (role === 'Instructor') {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" style={{ color: '#0d9488' }} />
                    Instructor Information
                </h3>
                <p className="text-sm text-gray-600">
                    Instructor code will be auto-generated. Specializations can be added after creation.
                </p>
            </div>
        );
    }

    if (role === 'Administrator') {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: '#0d9488' }} />
                    Administrator Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Position"
                        name="position"
                        placeholder="e.g., Dean, Department Head"
                        icon={<Star className="w-5 h-5" />}
                    />
                </div>
                <p className="text-sm text-gray-600">
                    Admin code will be auto-generated. Privileges can be added after creation.
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-8 text-gray-500">
            <p>Select a role to see role-specific options</p>
        </div>
    );
};
