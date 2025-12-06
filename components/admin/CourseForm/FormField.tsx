'use client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { FormFieldProps } from '@/types/course';

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  icon,
  error,
  className = '',
  options = [],
  step,
  min,
  max
}) => {
  const { register, formState: { errors } } = useFormContext();

  const fieldError = error || (errors[name]?.message as string | undefined);

  return (
    <div className={`course-management-card rounded-xl p-4 border ${fieldError ? 'border-red-300' : 'border-gray-200'} ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3.5 text-gray-400">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            {...register(name)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-lg border ${fieldError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600/50 text-black resize-none ${icon ? 'pl-10' : ''}`}
            rows={4}
          />
        ) : type === 'select' ? (
          <select
            {...register(name)}
            className={`w-full px-4 py-3 rounded-lg border ${fieldError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-black ${icon ? 'pl-10' : ''}`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            {...register(name, {
              valueAsNumber: type === 'number'
            })}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            className={`w-full px-4 py-3 rounded-lg border ${fieldError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-600/50 text-black ${icon ? 'pl-10' : ''}`}
          />
        )}
      </div>
      {fieldError && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {fieldError}
        </p>
      )}
    </div>
  );
};