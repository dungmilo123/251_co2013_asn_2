'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }

        .animate-slide-in-up {
          opacity: 0;
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }

        /* Prevent animation flickering by ensuring smooth transitions */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .floating-shape {
          animation: float 8s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 85, 141, 0.1), 0 10px 10px -5px rgba(0, 85, 141, 0.04);
        }

        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(0, 85, 141, 0.1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 85, 141, 0.05) 0%, transparent 70%);
          border-radius: 0 0 0 100%;
        }

        .hcmut-gradient {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
        }

        .course-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }

        .course-card:hover {
          border-left-color: #00558d;
          transform: translateX(8px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 85, 141, 0.2);
        }

        .roster-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .roster-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px rgba(0, 85, 141, 0.1);
        }
      `}</style>

      <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page Header with Geometric Design */}
        <div className="relative overflow-hidden rounded-2xl p-8 hcmut-gradient text-white animate-slide-in-up">
          <div className="absolute top-8 right-8 w-24 h-24 floating-shape opacity-20">
            <div className="w-full h-full border-4 border-white transform rotate-45"></div>
          </div>
          <div className="absolute bottom-8 right-32 w-16 h-16 floating-shape opacity-15" style={{ animationDelay: '2s' }}>
            <div className="w-full h-full bg-white transform rotate-12"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <GraduationCap className="w-12 h-12" />
              <h1 className="text-4xl font-bold tracking-tight">Instructor Dashboard</h1>
            </div>
            <p className="text-lg opacity-90 max-w-2xl">
              Manage your teaching schedule, review class rosters, and track student progress
            </p>
          </div>
        </div>

            {/* Teaching Schedule */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
            <div className="hcmut-gradient text-white px-8 py-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Teaching Schedule
              </h2>
              <p className="mt-2 opacity-90">
                View and manage your current teaching assignments
              </p>
            </div>
            <div className="p-8">
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No courses assigned yet</p>
                  <p className="text-gray-400 mt-2">Check with your department for upcoming assignments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-3 font-semibold text-gray-700">Course Code</th>
                        <th className="text-left pb-3 font-semibold text-gray-700">Title</th>
                        <th className="text-left pb-3 font-semibold text-gray-700">Semester</th>
                        <th className="text-left pb-3 font-semibold text-gray-700">Credits</th>
                        <th className="text-left pb-3 font-semibold text-gray-700">Enrolled</th>
                        <th className="text-left pb-3 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr
                          key={course.course_id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                          style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                        >
                          <td className="py-4">
                            <div className="px-3 py-1 rounded-lg font-mono font-bold inline-block" style={{ color: '#00558d', background: '#e6f0f5' }}>
                              {course.course_code}
                            </div>
                          </td>
                          <td className="py-4">
                            <Link href={`/dashboard/courses/${course.course_id}`} className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                                {course.title}
                            </Link>
                            {course.semester && (
                              <div className="text-sm text-gray-600 mt-1">{course.semester}</div>
                            )}
                          </td>
                          <td className="py-4 text-gray-900">{course.semester || '-'}</td>
                          <td className="py-4 text-gray-900">{course.credits}</td>
                          <td className="py-4 text-gray-900">{course.enrolled_count || 0}</td>
                          <td className="py-4">
                            <button
                              onClick={() => fetchRoster(course.course_id)}
                              className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-md ${
                                selectedCourse === course.course_id
                                  ? 'ring-2 ring-blue-500 ring-offset-2'
                                  : 'hover:scale-105'
                              }`}
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
                              {selectedCourse === course.course_id ? 'Viewing Roster' : 'View Roster'}
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
        </div>

            {/* Class Roster */}
        {selectedCourse && (
          <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu">
              <div className="hcmut-gradient text-white px-8 py-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  Class Roster
                </h2>
                {courseInfo && (
                  <p className="mt-2 opacity-90">
                    {courseInfo.course_code}: {courseInfo.title} • {roster.length} students enrolled
                  </p>
                )}
              </div>
              <div className="p-8">
                {loadingRoster ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">Loading roster...</p>
                  </div>
                ) : roster.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No students enrolled yet</p>
                    <p className="text-gray-400 mt-2">Registration period may be ongoing</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold" style={{ color: '#00558d' }}>
                          {roster.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Students</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {roster.filter(s => s.completion_status === 'Completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {roster.filter(s => s.completion_status === 'In Progress').length}
                        </div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="stat-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold" style={{ color: '#00558d' }}>
                          {roster.filter(s => s.gpa).length > 0
                            ? (roster.reduce((sum, s) => sum + (s.gpa || 0), 0) / roster.filter(s => s.gpa).length).toFixed(2)
                            : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-600">Average GPA</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {roster.map((student, index) => (
                        <div
                          key={student.enrollment_id}
                          className="roster-card rounded-xl p-6 bg-linear-to-br from-gray-50 via-white to-blue-50/30 border border-gray-200"
                          style={{ animationDelay: `${1.4 + index * 0.1}s` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 rounded-lg font-mono font-bold" style={{ color: '#00558d', background: '#e6f0f5' }}>
                                  {student.student_code}
                                </div>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    student.completion_status === 'Completed'
                                      ? 'bg-linear-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                      : 'bg-linear-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {student.completion_status}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {student.first_name} {student.last_name}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>{student.email}</p>
                                {student.program && (
                                  <p>Program: {student.program}</p>
                                )}
                                {student.year_level && (
                                  <p>Year: {student.year_level}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Current GPA</div>
                                <div className="text-xl font-bold text-gray-900">
                                  {student.gpa ? student.gpa.toFixed(2) : '-'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Course Grade</div>
                                <div className="text-xl font-bold" style={{ color: '#00558d' }}>
                                  {student.final_grade ? student.final_grade.toFixed(1) : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
