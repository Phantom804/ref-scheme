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
            {
                $group: {
                    _id: '$productId',
                    name: { $first: '$productName' },
                    sales: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {

                $project: {
                    _id: 0,
                    name: 1,
                    sales: 1,
                    price: { $concat: [{ $literal: "$" }, { $toString: "$revenue" }] },
                    category: { $arrayElemAt: ['$productDetails.category', 0] }
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
            { $sort: { sales: -1 } }
        ]);

        // Calculate percentage changes (mock data for now)
        // In a real app, you would compare with previous period
        const revenueChange = '+12.5%';
        const usersChange = '+8.2%';
        const productsChange = '+24.5%';
        const ordersChange = '-3.8%';

        return NextResponse.json({
            stats: [
                {
                    title: "Total Revenue",
                    value: `$${totalRevenue.toFixed(2)}`,
                    change: revenueChange,
                    trend: revenueChange.startsWith('+') ? 'up' : 'down',
                },
                {
                    title: "Total Users",
                    value: totalUsers.toString(),
                    change: usersChange,
                    trend: usersChange.startsWith('+') ? 'up' : 'down',
                },
                {
                    title: "Total Products",
                    value: totalProducts.toString(),
                    change: productsChange,
                    trend: productsChange.startsWith('+') ? 'up' : 'down',
                },
                {
                    title: "Total Orders",
                    value: totalOrders.toString(),
                    change: ordersChange,
                    trend: ordersChange.startsWith('+') ? 'up' : 'down',
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