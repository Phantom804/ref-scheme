import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';

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
        const showCancelledOrders = searchParams.get('showCancelledOrders') === 'true';
        const showCompletedOrders = searchParams.get('showCompletedOrders') === 'true'; // Read new filter
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

// Default to showing only Pending orders or those with deliveryStatus 'Pending' or 'In Transition'
if (!showCancelledOrders && !showCompletedOrders) {
  searchQuery.$or = [
    { status: 'Pending' },
    { deliveryStatus: { $in: ['Pending', 'In Transition'] } }
  ];
} else {
  const statusesToInclude: string[] = [];

  if (showCancelledOrders) {
    statusesToInclude.push('Cancelled');
  }

  if (showCompletedOrders) {
    statusesToInclude.push('Completed');
  }

  // Only include statuses that are explicitly requested
  if (statusesToInclude.length > 0) {
    searchQuery.status = { $in: statusesToInclude };
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
        let orderQuery = Order.find(searchQuery).sort({ createdAt: -1 });

        // Add product name filter to the database query instead of filtering in memory
        if (productName) {
            orderQuery = orderQuery.find({
                productName: { $regex: productName, $options: 'i' }
            });
        }

        // Get total count for pagination
        const totalOrders = await Order.countDocuments(orderQuery.getFilter());

        // Apply pagination at the database level
        const orders = await orderQuery
            .skip(skip)
            .limit(limit)
            .populate('_id', 'name productCode')
            .exec();

        // Format the response
        const formattedOrders = orders.map(order => ({
            id: order._id,
            productName: order.productName,
            buyer: order.buyer,
            transactionId: order.transactionId,
            productId: order.productId,
            quantity: order.quantity,
            referralCode: order.referralCode || "-",
            commission: order.commission ? `PKR ${order.commission}` : "-",
            price: `PKR ${order.price}`,
            boughtOn: order.createdAt.toLocaleDateString(),
            status: order.status,
            receiptUrl: order.receiptUrl,
            deliveryRequested: order.deliveryRequested,
            deliveryStatus: order.deliveryStatus,
            deliveryDate: order.createdAt.toLocaleDateString(),
            deliveryAddress: order.deliveryAddress,
            deliveryContactPhone: order.deliveryContactPhone
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
        const { orderId, status, deliveryStatus } = await request.json();

        await connectToDatabase();

        // Prepare update object based on what fields are provided
        const updateData: any = {};

        if (status) {
            updateData.status = status;
        }

        if (deliveryStatus) {
            updateData.deliveryStatus = deliveryStatus;
        }

        const order = await Order.findById(orderId);

        if (order?.status !== 'Pending') {
            return NextResponse.json(
                { error: 'You can not change Status Again' },
                { status: 400 }
            );
        }

        if (order?.deliveryStatus !== 'Pending') {
            return NextResponse.json(
                { error: 'You can not change Status Again' },
                { status: 400 }
            );
        }


        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        order?.set(updateData);
        await order?.save();

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
            message: status ? 'Order status updated successfully' : 'Delivery status updated successfully',
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
