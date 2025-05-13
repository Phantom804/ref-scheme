import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    // Check if the request path starts with /api/admin
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        // Get token from cookie
        const token = request.cookies.get('auth_token')?.value;

        // If no token exists, deny access
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        try {
            // Verify the token using jose
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
            const { payload } = await jwtVerify(token, secret);

            // Get user role from the payload
            const userRole = payload.role as string;

            // Check if user has admin role
            if (userRole !== 'admin' && userRole !== 'superAdmin') {
                return NextResponse.json(
                    { success: false, message: 'Access denied: Admin privileges required' },
                    { status: 403 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { success: false, message: 'Invalid authentication' },
                { status: 401 }
            );
        }
    }

    // Continue to the requested route if authorized or not an admin route
    return NextResponse.next();
}

// Configure the middleware to run only for admin API routes
export const config = {
    matcher: ['/api/admin/:path*']
}; 