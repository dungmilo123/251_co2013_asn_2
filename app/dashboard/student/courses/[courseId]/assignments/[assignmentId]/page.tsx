"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Upload,
  Check,
  AlertCircle,
  File as FileIcon,
  Award
} from "lucide-react";
import { Assignment, Submission } from "@/lib/definitions";

export default function AssignmentPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
  const { courseId, assignmentId } = use(params);
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [courseId, assignmentId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}`);
      if (!res.ok) {
          if (res.status === 403) setError("Not enrolled in this course.");
          else if (res.status === 404) setError("Assignment not found.");
          else setError("Failed to load assignment.");
          setLoading(false);
          return;
      }
      const data = await res.json();
      setAssignment(data.assignment);
      setSubmission(data.submission);
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const res = await fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}/submit`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        
        if (res.ok) {
            setSuccess("Assignment submitted successfully!");
            setSelectedFile(null);
            fetchData(); // Refresh status
        } else {
            setError(data.error || "Submission failed.");
        }
    } catch (err) {
        setError("Submission failed due to network error.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!assignment) return <div className="p-8 text-center text-red-600">{error || "Assignment not found"}</div>;

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = !isOverdue || assignment.late_submission_allowed;

  return (
      <div className="max-w-4xl mx-auto p-6 font-sans">
         <Link 
            href={`/dashboard/courses/${courseId}`} 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-gray-600 hover:text-[#00558d] hover:bg-gray-50 border border-gray-200 shadow-sm mb-6 transition-all"
         >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
         </Link>

         {/* Header */}
         <div className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden mb-8">
            <div className="bg-[#00558d] text-white p-8">
                <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
                <div className="flex flex-wrap gap-6 text-blue-100 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{assignment.max_score} Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4" />
                         <span>Weight: {assignment.weight}%</span>
                    </div>
                </div>
            </div>
            <div className="p-8">
                <h3 className="font-bold text-gray-900 mb-4">Instructions</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {assignment.instruction || "No instructions provided."}
                </div>
            </div>
         </div>

         {/* Submission Status & Form */}
         <div className="grid md:grid-cols-3 gap-8">
             {/* Status Card */}
             <div className="md:col-span-1">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                     <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Submission Status</h3>
                     
                     <div className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Status</div>
                            {submission ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <Check className="w-3.5 h-3.5" /> Submitted
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    Not Submitted
                                </span>
                            )}
                        </div>

                        {submission && (
                            <>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Submission Date</div>
                                    <div className="font-medium text-gray-900">
                                        {new Date(submission.date).toLocaleString()}
                                    </div>
                                </div>
                                {submission.is_late && (
                                    <div className="text-red-600 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> Late Submission
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Grade</div>
                                    <div className="font-bold text-lg text-[#00558d]">
                                        {submission.score !== null ? `${submission.score} / ${assignment.max_score}` : "Not Graded"}
                                    </div>
                                </div>
                                {submission.file_name && (
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">File</div>
                                        <a 
                                            href={`/api/files/submissions/${submission.submission_id}`} 
                                            className="text-blue-600 hover:underline text-sm flex items-center gap-1 break-all"
                                            download
                                        >
                                            <FileIcon className="w-3.5 h-3.5 shrink-0" />
                                            {submission.file_name}
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                     </div>
                 </div>
             </div>

             {/* Submission Form */}
             <div className="md:col-span-2">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#00558d]" />
                        {submission ? "Update Submission" : "Submit Assignment"}
                    </h3>
                    
                    {success && (
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <Check className="w-5 h-5" /> {success}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    {canSubmit ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                             <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#00558d] flex items-center justify-center mb-2">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-gray-900">
                                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        PDF, Word, Zip (Max 10MB)
                                    </p>
                                </div>
                             </div>
                             
                             <div className="flex justify-end">
                                 <button 
                                    type="submit" 
                                    disabled={submitting || !selectedFile}
                                    className="px-6 py-2.5 bg-[#00558d] text-white rounded-lg font-semibold hover:bg-[#004471] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                 >
                                     {submitting ? "Uploading..." : (submission ? "Update Submission" : "Submit Assignment")}
                                 </button>
                             </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500">
                            Assignment is closed for submissions.
                        </div>
                    )}
                 </div>
             </div>
         </div>
      </div>
  );
}
