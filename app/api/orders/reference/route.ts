import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId') || '';
        const referralCode = searchParams.get('referralCode') || '';
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query for reference orders
        const searchQuery: any = {};
        searchQuery.referralCode = referralCode;


        // Prepare the query pipeline
        let orderQuery = Order.find(searchQuery)
            .sort({ createdAt: -1 })


        const totalOrders = await Order.countDocuments(searchQuery);
        const orders = await orderQuery.skip(skip).limit(limit).exec();

        const formattedOrders = orders.map(order => ({
            id: order.id,
            productName: order.productName,
            transactionId: order.transactionId,
            quantity: order.quantity,
            price: `PKR ${order.price}`,
            boughtOn: order.createdAt.toLocaleDateString(),
            status: order.status,
            boughtBy: order.buyer || 'Unknown',
            commission: order.commission ? `PKR ${Number(order.commission)}` : 'PKR 0'
        }));

        return NextResponse.json({
            orders: formattedOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            totalOrders
        });

    } catch (error) {
        console.error('Error fetching reference orders:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}