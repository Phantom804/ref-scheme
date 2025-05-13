import { NextRequest, NextResponse } from 'next/server';
import { AppSetting, IAppSetting } from '@/lib/models/AppSetting';
import { connectToDatabase } from '@/lib/mongoose';

// Helper function to get or create AppSetting
async function getOrCreateAppSettings(): Promise<IAppSetting> {
    await connectToDatabase();
    let appSettings = await AppSetting.findOne({});
    if (!appSettings) {
        appSettings = new AppSetting({
            referralCommission: 10 // Default value, can be adjusted
        });
        await appSettings.save();
    }
    return appSettings;
}

export async function GET(req: NextRequest) {
    try {
        const appSettings = await getOrCreateAppSettings();
        return NextResponse.json(appSettings, { status: 200 });
    } catch (error) {
        console.error('Error fetching app settings:', error);
        return NextResponse.json({ message: 'Failed to fetch app settings', error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { referralCommission } = body;

        if (typeof referralCommission !== 'number' || referralCommission < 0) {
            return NextResponse.json({ message: 'Invalid referral comission value' }, { status: 400 });
        }

        let appSettings = await AppSetting.findOne({});
        if (!appSettings) {
            appSettings = new AppSetting({ referralCommission });
        } else {
            appSettings.referralCommission = referralCommission;
        }

        await appSettings.save();
        return NextResponse.json(appSettings, { status: 200 });
    } catch (error) {
        console.error('Error updating app settings:', error);
        return NextResponse.json({ message: 'Failed to update app settings', error: (error as Error).message }, { status: 500 });
    }
}