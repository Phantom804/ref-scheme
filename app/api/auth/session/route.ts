import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
    try {
        // Get token from cookie
        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: decoded.id,
                name: decoded.name,
                phoneNumber: decoded.phoneNumber,
                referralCode: decoded.referralCode || decoded.phoneNumber,
                email: decoded.email,
                role: decoded.role
            }
        });
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
} 