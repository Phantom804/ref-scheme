import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongoose';

export async function GET(request: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Get the referral code from the query parameters
        const searchParams = request.nextUrl.searchParams;
        const referralCode = searchParams.get('referralCode');

        if (!referralCode) {
            return NextResponse.json(
                { success: false, message: 'Referral code is required' },
                { status: 400 }
            );
        }

        // Find all users whose referredByCode matches the provided referralCode
        const referredUsers = await User.find({ referredByCode: referralCode })
            .select('id name phoneNumber referralCode')
            .lean();

        return NextResponse.json({
            success: true,
            users: referredUsers,
        });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch referrals' },
            { status: 500 }
        );
    }
}