"use client";
import { useEffect, useState, use } from "react";
import { Course } from "@/lib/definitions";
import Link from "next/link";
import {
    BookOpen,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Download,
    Calendar,
    Award
} from "lucide-react";

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<number | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch course");
                }
                const data = await res.json();
                setCourse(data);
                // Open first section by default if exists
                if (data.sections && data.sections.length > 0) {
                    setActiveSection(data.sections[0].section_id);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to fetch course");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-600">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-semibold">{error || "Course not found"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans animate-fade-in">
             <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                .floating-shape {
                    animation: float 8s ease-in-out infinite;
                }
                .hcmut-gradient {
                    background: linear-gradient(135deg, #00558d 0%, #003d66 100%);
                }
             `}</style>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="hcmut-gradient p-8 text-white relative overflow-hidden">
                     <div className="absolute top-8 right-8 w-24 h-24 floating-shape opacity-20">
                        <div className="w-full h-full border-4 border-white transform rotate-45"></div>
                     </div>
                     <div className="absolute bottom-8 right-32 w-16 h-16 floating-shape opacity-15" style={{ animationDelay: "2s" }}>
                        <div className="w-full h-full bg-white transform rotate-12"></div>
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 text-blue-200 mb-2 font-mono">
                            <span className="bg-blue-800/50 px-3 py-1 rounded-lg border border-blue-500/30">{course.course_code}</span>
                            <span>{course.department}</span>
                            <span>•</span>
                            <span>{course.credits} Credits</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 tracking-tight">{course.title}</h1>
                        <p className="text-blue-100 max-w-3xl leading-relaxed">{course.description}</p>
                        
                        <div className="flex gap-6 mt-6 text-sm font-medium text-blue-200">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>Level: {course.academic_level}</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Sections */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            Course Content
                        </h2>
                        
                        <div className="space-y-4">
                            {course.sections.length === 0 ? (
                                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    No sections available yet.
                                </div>
                            ) : (
                                course.sections.map((section) => (
                                    <div key={section.section_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                                                                                                                                    <button 
                                                                                                                                                                        onClick={() => setActiveSection(activeSection === section.section_id ? null : section.section_id)}
                                                                                                                                                                        className="w-full flex items-center justify-between p-5 bg-linear-to-l from-blue-100/50 to-white hover:from-blue-200 hover:to-white transition-all text-left"
                                                                                                                                                                    >                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeSection === section.section_id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                    {section.order_num}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{section.title}</h3>
                                                    {section.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{section.description}</p>}
                                                </div>
                                            </div>
                                            {activeSection === section.section_id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                        </button>
                                        
                                        {activeSection === section.section_id && (
                                            <div className="p-5 border-t border-gray-200 bg-white animate-fade-in">
                                                {section.description && <div className="mb-4 text-gray-600 text-sm">{section.description}</div>}
                                                
                                                <div className="space-y-3">
                                                    {section.materials.length === 0 ? (
                                                        <p className="text-sm text-gray-400 italic pl-2">No materials in this section.</p>
                                                    ) : (
                                                        section.materials.map((material) => (
                                                            <div key={material.material_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 group border border-transparent hover:border-blue-100 transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                                                                        <FileText className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-800 group-hover:text-blue-700">{material.title}</p>
                                                                        <p className="text-xs text-gray-500 uppercase">{material.type}</p>
                                                                    </div>
                                                                </div>
                                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Download">
                                                                    <Download className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Assignments & Quizzes */}
                <div className="space-y-8">
                    {/* Assignments */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Assignments
                        </h2>
                        <div className="space-y-3">
                            {course.assignments.length === 0 ? (
                                <p className="text-gray-500 text-sm">No assignments due.</p>
                            ) : (
                                course.assignments.map((assign) => (
                                    <Link 
                                        href={`/dashboard/student/courses/${id}/assignments/${assign.assignment_id}`}
                                        key={assign.assignment_id} 
                                        className="block p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-green-200 hover:bg-green-50/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800">{assign.title}</h4>
                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                                {assign.weight}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                            <Clock className="w-3 h-3" />
                                            <span>Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quizzes */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Quizzes
                        </h2>
                        <div className="space-y-3">
                            {course.quizzes.length === 0 ? (
                                <p className="text-gray-500 text-sm">No active quizzes.</p>
                            ) : (
                                course.quizzes.map((quiz) => (
                                    <div key={quiz.quiz_id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                                        <h4 className="font-bold text-gray-800 mb-2">{quiz.title}</h4>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{quiz.time_limit_minutes} mins</span>
                                            <span>{new Date(quiz.close_time).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
