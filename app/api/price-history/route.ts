import { connectToDatabase } from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import PriceHistory from '@/lib/models/PriceHistory';




export async function GET(req: NextRequest) {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const range = searchParams.get('range') || 'yearly';

    if (!productId) {
        return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const now = new Date();
    let startDate = new Date();

    switch (range) {
        case 'yearly':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case '6months':
            startDate.setMonth(now.getMonth() - 6);
            break;
        case 'monthly':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'daily':
            startDate.setDate(now.getDate() - 1);
            break;
    }

    const raw = await PriceHistory.find({
        productId,
        date: { $gte: startDate, $lte: now },
    }).sort({ date: 1 });

    // Format for chart (grouped)
    const formatted = raw.map((entry) => ({
        price: entry.price,
        date: entry.date.toISOString(),
    }));

    return NextResponse.json(formatted);
}




