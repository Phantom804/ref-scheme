import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { connectToDatabase } from '@/lib/mongoose';

export async function GET(request: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();


        const searchParams = request.nextUrl.searchParams;
        const referralCode = searchParams.get('referralCode');

        if (!referralCode) {
            return NextResponse.json(
                { success: false, message: 'Referral code is required' },
                { status: 400 }
            );
        }

        // Find all users whose referralCode matches the provided referralCode
        const referredUsers = await Order.find({ referralCode: referralCode })
            .select('userId buyer referralCode')
            .lean();

        const formatedUsers = referredUsers.map((user) => ({
            userId: user.userId,
            buyer: user.buyer,
            referralCode: user.buyer,
        }))

        return NextResponse.json({
            success: true,
            users: formatedUsers,
        });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch referrals' },
            { status: 500 }
        );
    }
}