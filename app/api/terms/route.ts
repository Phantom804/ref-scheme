import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { AppSetting } from '@/lib/models/AppSetting';

export async function GET() {
    try {
        await connectToDatabase();
        const appSetting = await AppSetting.findOne();

        if (!appSetting) {
            return NextResponse.json({ terms: [] }, { status: 200 });
        }

        return NextResponse.json({ terms: appSetting.terms }, { status: 200 });
    } catch (error) {
        console.error('Error fetching terms:', error);
        return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 });
    }
}

