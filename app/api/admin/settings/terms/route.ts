import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { AppSetting } from '@/lib/models/AppSetting';
import mongoose from 'mongoose';

// GET all terms
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

// POST create a new term
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Find or create app settings document
        let appSetting = await AppSetting.findOne();
        if (!appSetting) {
            appSetting = await AppSetting.create({
                terms: []
            });
        }

        // Add new term to terms array
        const newTerm = {
            ...data,
            _id: new mongoose.Types.ObjectId()
        };

        appSetting.terms.push(newTerm);
        await appSetting.save();

        return NextResponse.json(newTerm, { status: 201 });
    } catch (error) {
        console.error('Error creating term:', error);
        return NextResponse.json({ error: 'Failed to create term' }, { status: 500 });
    }
}

