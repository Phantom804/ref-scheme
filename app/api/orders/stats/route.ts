import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth/authHelper';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';

export async function GET(
    request: NextRequest,
) {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Connect to the database
        await connectToDatabase();
        // Calculate total commission for reference orders

        let pendingCommission = 0;

        // Fetch user's total earnings
        const user = await User.findById(decoded.id).select('totalEarning').exec();
        const totalEarning = user ? Number(user.totalEarning || 0) : 0;

        // Fetch pending orders for commission
        const pendingOrders = await Order.find({
            referralCode: decoded.referralCode,
            status: 'Pending'
        }).select('commission').exec();
        pendingCommission = pendingOrders.reduce((sum, order) => sum + Number(order.commission || 0), 0);

        // Count user's purchased products and calculate total price
        const purchasedProductsStats = await Order.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decoded.id),
                    status: 'Completed'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalPrice: { $sum: { $multiply: ['$product.price', '$quantity'] } }
                }
            }
        ]);

        const purchasedProductsCount = purchasedProductsStats.length > 0 ? purchasedProductsStats[0].count : 0;
        const totalInvestment = purchasedProductsStats.length > 0 ? purchasedProductsStats[0].totalPrice : 0;



        return NextResponse.json({
            success: true,
            totalEarning: `PKR ${Number(totalEarning).toFixed(2)}`,
            pendingCommission: `PKR ${Number(pendingCommission).toFixed(2)}`,
            purchasedProductsCount,
            totalInvestment
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}