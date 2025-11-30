'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

interface Course {
  course_id: number;
  course_code: string;
  title: string;
  credits: number;
  department?: string;
  semester?: string;
  teaching_role?: string;
  enrolled_count?: number;
}

interface Student {
  enrollment_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  program?: string;
  year_level?: number;
  gpa?: number;
  enrollment_date?: string;
  final_grade?: number;
  completion_status?: string;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [roster, setRoster] = useState<Student[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/instructor/courses');
      const data = await res.json();

      if (res.ok) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (courseId: number) => {
    setLoadingRoster(true);
    setSelectedCourse(courseId);

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/roster`);
      const data = await res.json();

      if (res.ok) {
        setRoster(data.students);
        setCourseInfo(data.course);
      } else {
        console.error('Error fetching roster:', data.error);
      }
    } catch (error) {
      console.error('Error fetching roster:', error);
    } finally {
      setLoadingRoster(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
      </div>

      {/* Teaching Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#00558d' }} />
            My Teaching Schedule
          </h2>
        </div>
        <div className="p-6">
          {courses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No courses assigned yet
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
                      Semester
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Credits
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Enrolled
                    </th>
                    <th className="text-left pb-3 font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.course_id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 font-medium" style={{ color: '#00558d' }}>
                        {course.course_code}
                      </td>
                      <td className="py-3">{course.title}</td>
                      <td className="py-3">{course.semester}</td>
                      <td className="py-3">{course.credits}</td>
                      <td className="py-3">{course.enrolled_count || 0}</td>
                      <td className="py-3">
                        <button
                          onClick={() => fetchRoster(course.course_id)}
                          className="px-3 py-1 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-md"
                          style={{
                            background: selectedCourse === course.course_id ? '#003d66' : '#00558d',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#003d66';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedCourse !== course.course_id) {
                              e.currentTarget.style.background = '#00558d';
                            }
                          }}
                        >
                          View Roster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Class Roster */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#00558d' }} />
              Class Roster
              {courseInfo && (
                <span className="text-sm font-normal text-gray-600">
                  - {courseInfo.course_code}: {courseInfo.title}
                </span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {loadingRoster ? (
              <div className="text-center text-gray-500 py-8">
                Loading roster...
              </div>
            ) : roster.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No students enrolled yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Student Code
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Program
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Year
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        GPA
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Grade
                      </th>
                      <th className="text-left pb-3 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr
                        key={student.enrollment_id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 font-medium" style={{ color: '#00558d' }}>
                          {student.student_code}
                        </td>
                        <td className="py-3">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="py-3">{student.program || '-'}</td>
                        <td className="py-3">{student.year_level || '-'}</td>
                        <td className="py-3 font-semibold">
                          {student.gpa ? student.gpa.toFixed(2) : '-'}
                        </td>
                        <td className="py-3 font-semibold">
                          {student.final_grade ? student.final_grade.toFixed(1) : '-'}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${
                              student.completion_status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {student.completion_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
