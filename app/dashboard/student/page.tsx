'use client';
import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Plus, Check, X, AlertCircle } from 'lucide-react';

interface Course {
  course_id: number;
  course_code: string;
  title: string;
  credits: number;
  department?: string;
  enrollment_date?: string;
  final_grade?: number;
  completion_status?: string;
}

interface AvailableCourse extends Course {
  description?: string;
  max_capacity?: number;
  enrolled_count?: number;
  prerequisites?: Array<{
    course_code: string;
    title: string;
    min_grade: number;
    completed: boolean;
  }>;
  prereqsMet?: boolean;
  canEnroll?: boolean;
  isFull?: boolean;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch enrolled courses and student info
      const coursesRes = await fetch('/api/student/courses');
      const coursesData = await coursesRes.json();

      if (coursesRes.ok) {
        setEnrolledCourses(coursesData.courses);
        setStudent(coursesData.student);
      }

      // Fetch available courses
      const availableRes = await fetch('/api/student/available-courses');
      const availableData = await availableRes.json();

      if (availableRes.ok) {
        setAvailableCourses(availableData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    setEnrolling(true);
    setMessage(null);

    try {
      const res = await fetch('/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Successfully enrolled in course!' });
        // Refresh data
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to enroll' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <GraduationCap className="w-8 h-8" style={{ color: '#00558d' }} />
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
      </div>

      {/* GPA and Student Info */}
      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">GPA</div>
            <div className="text-3xl font-bold" style={{ color: '#00558d' }}>
              {student.gpa?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Year Level</div>
            <div className="text-3xl font-bold text-gray-900">
              {student.year_level || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Program</div>
            <div className="text-lg font-semibold text-gray-900">
              {student.program || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#00558d' }} />
            My Enrolled Courses
          </h2>
        </div>
        <div className="p-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No enrolled courses yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Course Code
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Credits
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.map((course) => (
                    <tr key={course.course_id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 font-medium" style={{ color: '#00558d' }}>
                        {course.course_code}
                      </td>
                      <td className="py-3">{course.title}</td>
                      <td className="py-3">{course.credits}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            course.completion_status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {course.completion_status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">
                        {course.final_grade ? course.final_grade.toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Course Registration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: '#00558d' }} />
            Course Registration
          </h2>
        </div>
        <div className="p-6">
          {availableCourses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No courses available for registration
            </div>
          ) : (
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <div
                  key={course.course_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: '#00558d' }}>
                          {course.course_code}
                        </h3>
                        <span className="text-gray-600">-</span>
                        <span className="text-gray-900">{course.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{course.credits} credits • {course.department}</p>
                        <p>
                          Capacity: {course.enrolled_count}/{course.max_capacity}
                        </p>
                        {course.description && (
                          <p className="mt-2">{course.description}</p>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Prerequisites:
                          </p>
                          <div className="space-y-1">
                            {course.prerequisites.map((prereq, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                {prereq.completed ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
                                )}
                                <span className={prereq.completed ? 'text-green-700' : 'text-red-700'}>
                                  {prereq.course_code} (min grade: {prereq.min_grade})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {!course.prereqsMet && course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <span>Prerequisites not met</span>
                        </div>
                      )}
                      {course.isFull && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <span>Course is full</span>
                        </div>
                      )}
                    </div>

                    {/* Enroll Button */}
                    <button
                      onClick={() => handleEnroll(course.course_id)}
                      disabled={!course.canEnroll || enrolling}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
                        course.canEnroll && !enrolling
                          ? 'hover:shadow-lg'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        background: course.canEnroll && !enrolling ? '#00558d' : '#9ca3af',
                      }}
                      onMouseEnter={(e) => {
                        if (course.canEnroll && !enrolling) {
                          e.currentTarget.style.background = '#003d66';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (course.canEnroll && !enrolling) {
                          e.currentTarget.style.background = '#00558d';
                        }
                      }}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
