import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Category } from '@/lib/models/Category';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const categories = await Category.find().sort({ createdAt: -1 });

        return NextResponse.json({
            categories,
            totalCategories: categories.length
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;
        const description = body.description || undefined;



        await connectToDatabase();

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 400 }
            );
        }

        const category = await Category.create({
            name,
            ...(description ? { description } : {})
        });

        return NextResponse.json({
            message: 'Category created successfully',
            category
        });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, name, description } = await request.json();

        await connectToDatabase();

        const existingCategory = await Category.findOne({
            name,
            _id: { $ne: id }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Category updated successfully',
            category
        });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}