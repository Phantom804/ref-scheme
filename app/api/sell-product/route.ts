import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth/authHelper';

export async function POST(req: NextRequest) {
    await connectToDatabase();

    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    try {
        const { productId, quantity } = await req.json();

        if (!productId || !quantity) {
            return NextResponse.json({ message: 'Product ID and quantity are required' }, { status: 400 });
        }

        const orders = await Order.find({
            userId: decoded.id,
            productId: productId,
            status: 'Completed',
        }).sort({ createdAt: 1 }); // FIFO: oldest orders first

        const totalOwnedQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);

        if (totalOwnedQuantity < quantity) {
            return NextResponse.json({ message: 'You do not have enough quantity to sell.' }, { status: 400 });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        let remainingToSell = quantity;

        for (const order of orders) {
            if (remainingToSell <= 0) break;

            if (order.quantity <= remainingToSell) {
                remainingToSell -= order.quantity;
                await Order.findByIdAndDelete(order._id);
            } else {
                order.quantity -= remainingToSell;
                await order.save();
                remainingToSell = 0;
            }
        }

        const sellPrice = product.price * quantity;

        const user = await User.findById(decoded.id);
        if (user) {
            user.totalEarning = (user.totalEarning || 0) + sellPrice;
            await user.save();
        }

        return NextResponse.json({ message: 'Product sold successfully!', totalEarning: user?.totalEarning }, { status: 200 });

    } catch (error) {
        console.error('Error selling product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
