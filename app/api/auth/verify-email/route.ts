import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth/authHelper';

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const verified = await verifyEmail(token);

        if (!verified) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
} 