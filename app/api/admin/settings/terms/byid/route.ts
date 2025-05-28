import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { AppSetting } from '@/lib/models/AppSetting';

import mongoose from 'mongoose';



// GET a single term by ID
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        await connectToDatabase();
        const appSetting = await AppSetting.findOne();

        if (!appSetting) {
            return NextResponse.json({ error: 'App settings not found' }, { status: 404 });
        }

        const term = appSetting.terms.find((t: { _id: mongoose.Types.ObjectId }) => t._id.toString() === id);

        if (!term) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        return NextResponse.json(term, { status: 200 });
    } catch (error) {
        console.error('Error fetching term:', error);
        return NextResponse.json({ error: 'Failed to fetch term' }, { status: 500 });
    }
}

// PUT update a term by ID
export async function PUT(
    request: NextRequest
) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        await connectToDatabase();
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const appSetting = await AppSetting.findOne();

        if (!appSetting) {
            return NextResponse.json({ error: 'App settings not found' }, { status: 404 });
        }

        // Find the term index in the array
        const termIndex = appSetting.terms.findIndex((t: { _id: mongoose.Types.ObjectId }) => t._id.toString() === id);

        if (termIndex === -1) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        // Update the term in the array
        appSetting.terms[termIndex] = {
            ...appSetting.terms[termIndex].toObject(),
            ...data
        };

        await appSetting.save();

        return NextResponse.json(appSetting.terms[termIndex], { status: 200 });
    } catch (error) {
        console.error('Error updating term:', error);
        return NextResponse.json(
            { error: 'Failed to update term' },
            { status: 500 }
        );
    }
}

// DELETE a term by ID
export async function DELETE(
    request: NextRequest
) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        await connectToDatabase();

        const appSetting = await AppSetting.findOne();

        if (!appSetting) {
            return NextResponse.json({ error: 'App settings not found' }, { status: 404 });
        }

        // Find the term index in the array
        const termIndex = appSetting.terms.findIndex((t: { _id: mongoose.Types.ObjectId }) => t._id.toString() === id);

        if (termIndex === -1) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        // Remove the term from the array
        appSetting.terms.splice(termIndex, 1);
        await appSetting.save();

        return NextResponse.json(
            { message: 'Term deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting term:', error);
        return NextResponse.json(
            { error: 'Failed to delete term' },
            { status: 500 }
        );
    }
}