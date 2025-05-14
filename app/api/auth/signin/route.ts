import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { comparePasswords, generateToken } from '@/lib/auth/authHelper';

export async function POST(req: NextRequest) {
    try {
        const { phoneNumber, password } = await req.json();

        // Validate inputs
        if (!phoneNumber || !password) {
            return NextResponse.json(
                { success: false, message: 'Phone and password are required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find user
        const user = await User.findOne({ phoneNumber }).exec();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is verified
        if (!user.isVerified) {
            return NextResponse.json(
                { success: false, message: 'Please verify your email address before logging in' },
                { status: 403 }
            );
        }



        if (!password === user.password) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const jwtpayload = {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            email: user.email,
            referralCode: user.referralCode,
            role: user.role
        }

        // Generate JWT token 
        const token = generateToken(jwtpayload);

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Signed in successfully',
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role
            }
        });

        // Set HttpOnly cookie with the token
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
} 