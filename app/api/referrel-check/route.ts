import { NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
    await connectToDatabase();

    const { referralCode } = await req.json();
    const user = await User.findOne({ phoneNumber: referralCode });
    if (!user) {
        return NextResponse.json({ success: false, message: 'Referral Code Not Found' }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
}