import { NextRequest, NextResponse } from 'next/server';
import { AppSetting } from '@/lib/models/AppSetting';
import { connectToDatabase } from '@/lib/mongoose';




export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        // only fetch selected fields

        let appSettings = await AppSetting.findOne({}, 'requireIdCardUpload email whatsappNumber');
        return NextResponse.json(appSettings, { status: 200 });
    } catch (error) {
        console.error('Error fetching app settings:', error);
        return NextResponse.json({ message: 'Failed to fetch app settings', error: (error as Error).message }, { status: 500 });
    }
}