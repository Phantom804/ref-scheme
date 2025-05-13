import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const referralCode = searchParams.get('referralCode') || '';
        const productName = searchParams.get('productName') || '';
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const orderType = searchParams.get('orderType') || '';
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // General search
        if (search) {
            searchQuery.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { referralCode: { $regex: search, $options: 'i' } },
            ];
        }

        // Specific filters
        if (referralCode) {
            searchQuery.referralCode = { $regex: referralCode, $options: 'i' };
        }

        // Filter by order type (direct or reference)
        if (orderType === 'direct') {
            // Direct orders don't have referral codes
            searchQuery.referralCode = { $exists: false };
        } else if (orderType === 'reference') {
            // Reference orders have referral codes
            searchQuery.referralCode = { $exists: true };
        }

        // We'll handle product name filter during the query with populate

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            searchQuery.price = {};
            if (minPrice !== undefined) {
                searchQuery.price.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                searchQuery.price.$lte = maxPrice;
            }
        }

        // Prepare the query pipeline
        let orderQuery = Order.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate('_id', 'name productCode');

        // Execute the query for counting with product name filter
        let allOrders = [];

        // If product name filter is applied, we need to get all matching orders first
        if (productName) {
            allOrders = await orderQuery.exec();

            // Filter by product name
            allOrders = allOrders.filter(order =>
                order.productId &&
                order.productId.name &&
                order.productId.name.toLowerCase().includes(productName.toLowerCase())
            );

            // Get total count after filtering
            const totalOrders = allOrders.length;

            // Apply pagination manually
            const paginatedOrders = allOrders.slice(skip, skip + limit);

            // Format the response
            const formattedOrders = paginatedOrders.map(order => ({
                id: order.id,
                name: order.productId.name,
                transactionId: order.transactionId,
                productCode: order.productId.productCode,
                quantity: order.quantity,
                referralCode: order.referralCode,
                price: `$${order.price.toFixed(2)}`,
                boughtOn: order.createdAt.toLocaleDateString(),
                status: order.status,
                receiptUrl: order.receiptUrl
            }));

            return NextResponse.json({
                orders: formattedOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                totalOrders
            });
        }

        // If no product name filter, use standard pagination
        const totalOrders = await Order.countDocuments(searchQuery);

        // Apply pagination
        const orders = await orderQuery.skip(skip).limit(limit).exec();

        // Format the response
        const formattedOrders = orders.map(order => ({
            id: order.id,
            name: order.productId.name,
            transactionId: order.transactionId,
            productCode: order.productId.productCode,
            quantity: order.quantity,
            referralCode: order.referralCode,
            price: `$${order.price.toFixed(2)}`,
            boughtOn: order.createdAt.toLocaleDateString(),
            status: order.status,
            receiptUrl: order.receiptUrl
        }));

        return NextResponse.json({
            orders: formattedOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            totalOrders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { orderId, status } = await request.json();

        await connectToDatabase();

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}