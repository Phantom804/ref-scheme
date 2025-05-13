import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Signed out successfully'
        });

        // Clear the auth cookie
        response.cookies.set({
            name: 'auth_token',
            value: '',
            httpOnly: true,
            expires: new Date(0), // Immediate expiration
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Signout error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
} 