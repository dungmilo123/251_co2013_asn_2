'use client';
import React from 'react';
import { BookOpen, Code, FileText, Award, Building } from 'lucide-react';
import { FormField } from './FormField';

export const BasicSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5" style={{ color: '#00558d' }} />
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField
          label="Course Code"
          name="course_code"
          placeholder="e.g., CO2013"
          required
          icon={<Code className="w-5 h-5" />}
        />
        <FormField
          label="Course Title"
          name="title"
          placeholder="Full course title"
          required
          icon={<FileText className="w-5 h-5" />}
        />
        <FormField
          label="Credits"
          name="credits"
          type="number"
          placeholder="Credit hours"
          required
          icon={<Award className="w-5 h-5" />}
        />
        <FormField
          label="Department"
          name="department"
          placeholder="e.g., Computer Science"
          icon={<Building className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};