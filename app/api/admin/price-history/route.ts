import { connectToDatabase } from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import PriceHistory from '@/lib/models/PriceHistory';

// Create a new price history entry
export async function POST(req: NextRequest) {
    await connectToDatabase();
    const { productId, price, date } = await req.json();


    const formattedDate = new Date(date).toISOString().split('T')[0];


    if (!productId || price === undefined || !date) {
        return NextResponse.json({ error: 'productId, price, and date are required' }, { status: 400 });
    }

    const entry = await PriceHistory.create({ productId, price, date: formattedDate });
    return NextResponse.json(entry);
}

// Get price history for a product
export async function GET(req: NextRequest) {
    await connectToDatabase();
    const productId = req.nextUrl.searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
        const priceHistory = await PriceHistory.find({ productId })
            .sort({ date: -1 })
            .lean();
        return NextResponse.json(priceHistory);
    } catch (error) {
        console.error('Error fetching price history:', error);
        return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
    }
}

// Update an existing price history entry
export async function PATCH(req: NextRequest) {
    await connectToDatabase();
    const { id, price, date } = await req.json();

    if (!id || price === undefined || !date) {
        return NextResponse.json({ error: 'id, price, and date are required' }, { status: 400 });
    }
    const formattedDate = new Date(date).toISOString().split('T')[0];

    const updated = await PriceHistory.findByIdAndUpdate(id, { price, date: formattedDate }, { new: true });

    if (!updated) {
        return NextResponse.json({ error: 'Price history not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
}

// Delete a price history entry
export async function DELETE(req: NextRequest) {
    await connectToDatabase();
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleted = await PriceHistory.findByIdAndDelete(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
