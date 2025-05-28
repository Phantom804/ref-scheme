import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const phoneNumbers = await User.find({}).select('phoneNumber -_id');

        const formattedPhoneNumbers = phoneNumbers.map(user => user.phoneNumber);

        return NextResponse.json({
            success: true,
            phoneNumbers: formattedPhoneNumbers,
        });
    } catch (error) {
        console.error('Error fetching phone numbers:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch phone numbers' },
            { status: 500 }
        );
    }
}