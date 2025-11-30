"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LogOut,
    User,
    BookOpen,
    Settings,
    TrendingUp,
    Calendar,
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch user data from secure session
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <style jsx global>{`
                @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap");

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(1deg);
                    }
                }

                .animate-slide-in-down {
                    opacity: 0;
                    animation: slideInDown 0.8s
                        cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards;
                }

                .floating-shape {
                    animation: float 6s ease-in-out infinite;
                }

                .hcmut-gradient {
                    background: linear-gradient(
                        135deg,
                        #00558d 0%,
                        #003d66 100%
                    );
                }

                .nav-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 85, 141, 0.1);
                }

                .btn-primary {
                    background: linear-gradient(
                        135deg,
                        #00558d 0%,
                        #003d66 100%
                    );
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .btn-primary::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    transition: left 0.5s;
                }

                .btn-primary:hover::before {
                    left: 100%;
                }

                .btn-primary:hover {
                    transform: scale(1.02);
                    box-shadow: 0 10px 25px rgba(0, 85, 141, 0.2);
                }

                .user-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .user-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 85, 141, 0.1);
                }
            `}</style>

            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/10 to-gray-100"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                {/* Modern Navigation Bar */}
                <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg sticky top-0 z-50 animate-slide-in-down">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            {/* Logo and Brand */}
                            <div className="flex items-center gap-4 user-card">
                                <div className="relative">
                                    <img
                                        src="/01_logobachkhoatoi.png"
                                        alt="HCMUT Logo"
                                        className="w-12 h-12 object-contain"
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h1
                                        className="text-2xl font-bold tracking-tight"
                                        style={{ color: "#00558d" }}
                                    >
                                        Learning Hub
                                    </h1>
                                    <p className="text-sm font-medium text-gray-600">
                                        Ho Chi Minh City University of Technology
                                    </p>
                                </div>
                            </div>

                            {/* User Info and Logout */}
                            {user && (
                                <div className="flex items-center gap-6">
                                    {/* Role-based Navigation Hint */}
                                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                        {user.role === "Student" && (
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                        )}
                                        {user.role === "Instructor" && (
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                        )}
                                        {user.role === "Administrator" && (
                                            <Settings className="w-4 h-4 text-blue-600" />
                                        )}
                                        <span className="text-sm font-semibold text-blue-800">
                                            {user.role} Dashboard
                                        </span>
                                    </div>

                                    {/* User Profile */}
                                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 shadow-md user-card">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs font-medium text-gray-600">
                                                    {user.role}
                                                </p>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="btn-primary flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="hidden sm:inline">
                                            Logout
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content with Spacing */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Decorative Background Elements */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-20 left-20 w-32 h-32 floating-shape opacity-10">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl transform rotate-12"></div>
                        </div>
                        <div
                            className="absolute top-40 right-32 w-24 h-24 floating-shape opacity-8"
                            style={{ animationDelay: "2s" }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-500 rotate-45"></div>
                        </div>
                        <div
                            className="absolute bottom-20 left-1/2 w-16 h-16 floating-shape opacity-6"
                            style={{ animationDelay: "4s" }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full"></div>
                        </div>
                    </div>

                    {children}
                </main>
            </div>
        </>
    );
}
