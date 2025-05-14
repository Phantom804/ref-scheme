import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
    try {
        const { name, phoneNumber, referredByCode, password } = await req.json();

        // Validate inputs
        if (!name || !phoneNumber || !password) {
            return NextResponse.json(
                { success: false, message: 'Please fill All Required Fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber }).exec();

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this phone already exists' },
                { status: 409 }
            );
        }



        // Create new user
        const user = await User.create({
            name,
            referredByCode,
            referredCode: phoneNumber,
            phoneNumber,
            password: password,
            isVerified: true
        });



        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Login Now',
                userId: user.id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
} 