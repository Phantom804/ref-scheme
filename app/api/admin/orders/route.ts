import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
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
        const showCancelledOrders = searchParams.get('showCancelledOrders') === 'true';
        const showCompletedOrders = searchParams.get('showCompletedOrders') === 'true'; // Read new filter
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // Default to showing only Pending orders unless specific filters are applied
        if (!showCancelledOrders && !showCompletedOrders) {
            searchQuery.status = 'Pending';
        } else {
            // If either filter is true, build an $in array for status
            const statusesToInclude = [];
            if (showCancelledOrders) {
                statusesToInclude.push('Cancelled');
            }
            if (showCompletedOrders) {
                statusesToInclude.push('Completed');
            }
            // Only include statuses that are explicitly requested
            if (statusesToInclude.length > 0) {
                searchQuery.status = { $in: statusesToInclude };
            } else {

                searchQuery.status = 'Pending';
            }
        }

        // General search
        if (search) {
            searchQuery.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { referralCode: { $regex: search, $options: 'i' } },
                { buyer: { $regex: search, $options: 'i' } },
            ];
        }


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


        if (productName) {
            allOrders = await orderQuery.exec();

            // Filter by product name
            allOrders = allOrders.filter(order =>
                order.productId &&
                order.productName &&
                order.productName.toLowerCase().includes(productName.toLowerCase())
            );

            // Get total count after filtering
            const totalOrders = allOrders.length;

            // Apply pagination manually
            const paginatedOrders = allOrders.slice(skip, skip + limit);

            // Format the response
            const formattedOrders = paginatedOrders.map(order => ({
                id: order._id,
                productName: order.productName,
                buyer: order.buyer,
                transactionId: order.transactionId,
                productID: order.productId,
                quantity: order.quantity,
                referralCode: order.referralCode,
                commission: `PKR ${order.commission}`,
                price: `PKR ${order.price}`,
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
            id: order._id,
            productName: order.productName,
            buyer: order.buyer,
            transactionId: order.transactionId,
            productId: order.productId,
            quantity: order.quantity,
            referralCode: order.referralCode,
            commission: `PKR ${order.commission}`,
            price: `PKR ${order.price}`,
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

        // If status is changed to Completed and there's a referral code, update user's total earnings
        if (status === 'Completed' && order.referralCode) {
            // Find the user with this referral code
            const user = await User.findOne({ referralCode: order.referralCode });

            if (user && order.commission) {
                // Convert commission to number and add to user's total earnings
                const commissionAmount = parseFloat(order.commission);
                if (!isNaN(commissionAmount)) {
                    await User.findByIdAndUpdate(
                        user._id,
                        { $inc: { totalEarning: commissionAmount } }
                    );
                }
            }
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