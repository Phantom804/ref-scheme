import { NextRequest, NextResponse } from 'next/server';
import { AppSetting } from '@/lib/models/AppSetting';
import { connectToDatabase } from '@/lib/mongoose';


export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        let appSettings = await AppSetting.findOne({});
        return NextResponse.json(appSettings, { status: 200 });
    } catch (error) {
        console.error('Error fetching app settings:', error);
        return NextResponse.json({ message: 'Failed to fetch app settings', error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { minWithdrawPercent, minWithdrawAmount, requireIdCardUpload, email, whatsappNumber } = body;


        let UpdateData: any = {};

        if (minWithdrawPercent !== undefined) {
            UpdateData.minWithdrawPercent = minWithdrawPercent;
        }

        if (minWithdrawAmount !== undefined) {
            UpdateData.minWithdrawAmount = minWithdrawAmount;
        }

        if (requireIdCardUpload !== undefined) {
            UpdateData.requireIdCardUpload = requireIdCardUpload;
        }

        if (email !== undefined) {
            UpdateData.email = email;
        }

        if (whatsappNumber !== undefined) {
            UpdateData.whatsappNumber = whatsappNumber;
        }

        const appSettings = await AppSetting.findOneAndUpdate(
            {},
            {
                $set: {
                    ...UpdateData
                }
            },
        );

        return NextResponse.json(appSettings, { status: 200 });
    } catch (error) {
        console.error('Error updating app settings:', error);
        return NextResponse.json({ message: 'Failed to update app settings', error: (error as Error).message }, { status: 500 });
    }
}