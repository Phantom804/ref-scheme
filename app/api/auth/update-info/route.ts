import { NextRequest, NextResponse } from "next/server";
import { generateToken } from '@/lib/auth/authHelper';
import { verifyToken } from '@/lib/auth/authHelper';
import { User } from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongoose';


export async function PATCH(req: NextRequest) {
    try {

        const body = await req.json();
        const { id, name, email, phoneNumber, oldpin, newpin } = body;
        if (!id) {
            return NextResponse.json({ success: false, message: "User ID required." }, { status: 400 });
        }

        if (oldpin && newpin) {
            if (oldpin === newpin) {
                return NextResponse.json({ success: false, message: "New pin and old pin can't be same." }, { status: 400 });
            }
        }


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





        // Update info
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        if (oldpin && newpin) {
            if (oldpin !== user.password) {
                return NextResponse.json({ success: false, message: "Old pin is incorrect." }, { status: 400 });
            }

            user.password = newpin;
        }


        await user.save();


        const jwtpayload = {
            id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            email: user.email,
            referralCode: user.referralCode,
            role: user.role
        }


        const jwtToken = generateToken(jwtpayload);



        const response = NextResponse.json({
            success: true, user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                referralCode: user.referralCode || user.phoneNumber,
                email: user.email,
                role: user.role
            }
        })


        response.cookies.set({
            name: 'auth_token',
            value: jwtToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return response
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}