'use client';
import React from 'react';
import { Users, FileText, Target } from 'lucide-react';
import { FormField } from './FormField';

export const DetailsSection: React.FC = () => {
  const academicLevels = [
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Graduate', label: 'Graduate' },
    { value: 'Postgraduate', label: 'Postgraduate' },
    { value: 'Doctorate', label: 'Doctorate' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Academic Level"
          name="academic_level"
          type="select"
          placeholder="Select academic level"
          icon={<Target className="w-5 h-5" />}
          options={academicLevels}
        />
        <FormField
          label="Maximum Capacity"
          name="max_capacity"
          type="number"
          placeholder="Maximum students"
          icon={<Users className="w-5 h-5" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          label="Course Description"
          name="description"
          type="textarea"
          placeholder="Detailed description of the course content, objectives, and learning outcomes"
          icon={<FileText className="w-5 h-5" />}
          className="col-span-1"
        />
      </div>
    </div>
  );
};