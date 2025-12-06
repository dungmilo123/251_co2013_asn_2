'use client';
import React from 'react';
import { Calendar, Clock, Trophy, CheckCircle } from 'lucide-react';
import { FormField } from './FormField';

export const ScheduleSection: React.FC = () => {
  const statusOptions = [
    { value: 'Planned', label: 'Planned' },
    { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          label="Start Date"
          name="start_date"
          type="date"
          placeholder="Course start date"
          required
          icon={<Calendar className="w-5 h-5" />}
        />
        <FormField
          label="End Date"
          name="end_date"
          type="date"
          placeholder="Course end date"
          required
          icon={<Calendar className="w-5 h-5" />}
        />
        <FormField
          label="Status"
          name="status"
          type="select"
          placeholder="Select status"
          icon={<CheckCircle className="w-5 h-5" />}
          options={statusOptions}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          label="Enrollment Start"
          name="enrollment_start_date"
          type="datetime-local"
          placeholder="When enrollment opens"
          icon={<Clock className="w-5 h-5" />}
        />
        <FormField
          label="Enrollment End"
          name="enrollment_end_date"
          type="datetime-local"
          placeholder="When enrollment closes"
          icon={<Clock className="w-5 h-5" />}
        />
        <FormField
          label="Passing Score"
          name="passing_score"
          type="number"
          placeholder="Minimum passing score"
          step="0.01"
          min="0"
          max="10"
          icon={<Trophy className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};