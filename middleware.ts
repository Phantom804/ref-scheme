import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';


export async function middleware(request: NextRequest) {

    if (request.nextUrl.pathname.startsWith('/api/admin') || request.nextUrl.pathname.startsWith('/admin')) {

        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.redirect(`${request.nextUrl.origin}/not-found`);

        }

        try {

            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            const userRole = payload.role as string;


            if (userRole !== 'admin' && userRole !== 'superAdmin') {

                if (request.nextUrl.pathname.startsWith('/admin')) {
                    return NextResponse.redirect(`${request.nextUrl.origin}/not-found`);
                }
                return NextResponse.json(
                    { message: 'Not Found' },
                    { status: 404 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { message: 'Internal Error' },
                { status: 500 }
            );
        }
    }


    return NextResponse.next();
}


export const config = {
    matcher: ['/api/admin/:path*', '/admin/:path*']
};