import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Category } from '@/lib/models/Category';

export async function GET() {
    try {
        await connectToDatabase();
        const categories = await Category.find({}).exec();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}