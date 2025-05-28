import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { Order } from '@/lib/models/Order';
import { connectToDatabase } from '@/lib/mongoose';

export async function GET() {
    try {
        await connectToDatabase();

        // Calculate total revenue from orders
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // Get total users (excluding superAdmin)
        const totalUsers = await User.countDocuments({ role: { $ne: 'superAdmin' } });

        // Get total products
        const totalProducts = await Product.countDocuments();

        // Get total orders
        const totalOrders = await Order.countDocuments();

        // Get top products by sales
        const topProducts = await Order.aggregate([
            { $match: { status: 'Completed' } },

            // Join with products to ensure the product still exists
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

            // Flatten the joined array
            { $unwind: '$productDetails' },

            // Now safely group, since we know the product exists
            {
                $group: {
                    _id: '$productId',
                    name: { $first: '$productName' },
                    sales: { $sum: 1 },
                    revenue: { $sum: '$price' },
                    category: { $first: '$productDetails.category' }
                }
            },

            // Sort by most sales
            { $sort: { sales: -1 } },

            // Limit to top 5
            { $limit: 5 },

            // Format the final output
            {
                $project: {
                    _id: 0,
                    name: 1,
                    sales: 1,
                    price: { $concat: [{ $literal: 'PKR ' }, { $toString: '$revenue' }] },
                    category: 1
                }
            }
        ]);


        // Get top categories by sales
        const topCategories = await Order.aggregate([
            { $match: { status: 'Completed' } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    sales: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    sales: 1
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 5 }
        ]);

        return NextResponse.json({
            stats: [
                {
                    title: "Total Revenue",
                    value: `PKR ${totalRevenue.toFixed(2)}`,
                },
                {
                    title: "Total Users",
                    value: totalUsers.toString(),


                },
                {
                    title: "Total Products",
                    value: totalProducts.toString(),

                },
                {
                    title: "Total Orders",
                    value: totalOrders.toString(),

                },
            ],
            topProducts,
            categoryData: topCategories
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}