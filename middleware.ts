import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getDashboardPath } from "@/lib/utils";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(COOKIE_NAME)?.value;
    // Get session
    const session = token ? await verifyToken(token) : null;

    // If user is authenticated and tries to access login page, redirect to their dashboard
    if (pathname === "/" && session) {
        const dashboardPath = getDashboardPath(session.role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
        // If not authenticated, redirect to login
        if (!session) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Check role-specific access
        if (
            pathname.startsWith("/dashboard/student") &&
            session.role !== "Student"
        ) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (
            pathname.startsWith("/dashboard/instructor") &&
            session.role !== "Instructor"
        ) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (
            pathname.startsWith("/dashboard/admin") &&
            session.role !== "Administrator"
        ) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (handled separately)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
    ],
};
