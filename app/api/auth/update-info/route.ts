import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from '@/lib/auth/authHelper';
import { User } from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongoose';


export async function PATCH(req: NextRequest) {
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

        await connectToDatabase();
        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isBlocked === true) {
            const response = NextResponse.json(
                { success: false, message: 'You have been block by admin' },
                { status: 404 }
            )

            response.cookies.set({
                name: 'auth_token',
                value: '',
                httpOnly: true,
                expires: new Date(0),
                path: '/'
            });
            return response;
        }

        const body = await req.json();
        const { id, name, email, phoneNumber, oldpass, newpass } = body;
        if (!id) {
            return NextResponse.json({ success: false, message: "User ID required." }, { status: 400 });
        }

        // Update info
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Password change
        if (oldpass && newpass) {
            const match = oldpass === user.password;
            if (!match) {
                return NextResponse.json({ success: false, message: "Old password is incorrect." }, { status: 400 });
            }
        }

        // Save changes to database
        await user.save();

        // Return user without password
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}