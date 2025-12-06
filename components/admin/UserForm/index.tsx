'use client';
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, User as UserIcon, Settings } from 'lucide-react';
import { userFormSchema, UserFormData } from './validation';
import { BasicSection } from './BasicSection';
import { RoleSection } from './RoleSection';
import { ExpandableSection } from '../CourseForm/ExpandableSection';
import { UserWithRoleData } from '@/types/user';

interface UserFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    user?: UserWithRoleData;
    mode?: 'create' | 'edit';
}

export const UserForm: React.FC<UserFormProps> = ({
    onSuccess,
    onCancel,
    user,
    mode = 'create'
}) => {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = mode === 'edit' && !!user;

    const methods = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema) as any,
        defaultValues: isEditMode ? {
            username: user.username,
            email: user.email,
            password: '',
            first_name: user.first_name,
            last_name: user.last_name,
            date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
            department: user.department || '',
            status: user.status || 'Active',
            role: user.role,
            phones: user.phones || [],
            program: user.student?.program || '',
            year_level: user.student?.year_level || undefined,
            address_city: user.student?.address_city || '',
            address_country: user.student?.address_country || '',
            specializations: user.instructor?.specializations || [],
            position: user.administrator?.position || '',
            privileges: user.administrator?.privileges || [],
        } : {
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            date_of_birth: '',
            department: '',
            status: 'Active',
            role: 'Student',
            phones: [],
            program: '',
            year_level: undefined,
            address_city: '',
            address_country: '',
            specializations: [],
            position: '',
            privileges: [],
        }
    });

    const { handleSubmit, reset, formState: { isDirty } } = methods;

    // Reset form when user prop changes
    useEffect(() => {
        if (isEditMode && user) {
            reset({
                username: user.username,
                email: user.email,
                password: '',
                first_name: user.first_name,
                last_name: user.last_name,
                date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                department: user.department || '',
                status: user.status || 'Active',
                role: user.role,
                phones: user.phones || [],
                program: user.student?.program || '',
                year_level: user.student?.year_level || undefined,
                address_city: user.student?.address_city || '',
                address_country: user.student?.address_country || '',
                specializations: user.instructor?.specializations || [],
                position: user.administrator?.position || '',
                privileges: user.administrator?.privileges || [],
            });
        }
    }, [user, isEditMode, reset]);

    const onSubmit = async (data: UserFormData) => {
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            // Prepare submit data, filter out empty values
            const submitData: any = {
                username: data.username,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role,
                status: data.status || 'Active',
            };

            // Only include password if provided
            if (data.password && data.password.length > 0) {
                submitData.password = data.password;
            } else if (!isEditMode) {
                // Password required for create
                throw new Error('Password is required');
            }

            // Include optional fields if provided
            if (data.date_of_birth) submitData.date_of_birth = data.date_of_birth;
            if (data.department) submitData.department = data.department;
            if (data.phones && data.phones.length > 0) submitData.phones = data.phones;

            // Include role-specific fields
            if (data.role === 'Student') {
                if (data.program) submitData.program = data.program;
                if (data.year_level) submitData.year_level = Number(data.year_level);
                if (data.address_city) submitData.address_city = data.address_city;
                if (data.address_country) submitData.address_country = data.address_country;
            } else if (data.role === 'Instructor') {
                if (data.specializations && data.specializations.length > 0) {
                    submitData.specializations = data.specializations;
                }
            } else if (data.role === 'Administrator') {
                if (data.position) submitData.position = data.position;
                if (data.privileges && data.privileges.length > 0) {
                    submitData.privileges = data.privileges;
                }
            }

            const url = isEditMode ? `/api/admin/users/${user.user_id}` : '/api/admin/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
            }

            if (!isEditMode) {
                reset();
            }
            onSuccess?.();
        } catch (error: any) {
            setSubmitError(error.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} the user`);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-red-800 text-sm">{submitError}</p>
                    </div>
                )}

                <BasicSection />

                <ExpandableSection
                    title="Role-Specific Options"
                    icon={<Settings className="w-5 h-5" />}
                    defaultExpanded={true}
                >
                    <RoleSection />
                </ExpandableSection>

                <div className="flex justify-end gap-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || (isEditMode && !isDirty)}
                        className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};
