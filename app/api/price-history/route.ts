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

now.setUTCHours(23, 59, 59, 999);
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
    const formatted = raw.map((entry) => {
        const date = new Date(entry.date);
        let name = '';

        // Format the name based on the range
        if (range === 'yearly') {
            // For yearly view, show month abbreviation (Jan, Feb, etc.)
            name = date.toLocaleDateString('en-US', { month: 'short' });
        } else if (range === '6months') {
            // For 6 months view, show month abbreviation
            name = date.toLocaleDateString('en-US', { month: 'short' });
        } else if (range === 'monthly') {
            // For monthly view, show day and month
            name = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        } else if (range === 'daily') {
            // For daily view, show time
            name = date.toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        return {
            price: entry.price,
            date: entry.date.toISOString(),
            name: name
        };
    });

    return NextResponse.json(formatted);
}




