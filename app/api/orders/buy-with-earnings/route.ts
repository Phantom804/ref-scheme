import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth/authHelper';
import { customAlphabet } from 'nanoid';
import { User } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { Order } from '@/lib/models/Order';

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
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findById(decoded.id);
        const product = await Product.findById(productId);

        if (!user || !product) {
            return NextResponse.json({ message: 'User or product not found' }, { status: 404 });
        }

        const totalPrice = product.price * quantity;

        if (user.totalEarning < totalPrice) {
            return NextResponse.json({ message: 'Insufficient earnings' }, { status: 400 });
        }

        user.totalEarning -= totalPrice;
        await user.save();

        const nanoid = customAlphabet('ABCDMNZ0123456789', 6);
        const transactionId = `${nanoid()}`;

        const order = new Order({
            userId: user._id,
            productId: product._id,
            quantity: quantity,
            totalPrice: totalPrice,
            status: 'Completed',
            paymentMethod: 'earnings',
            productName: product.name,
            price: product.price,
            transactionId: transactionId
        });

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully with earnings!',
            order,
            user
        }, { status: 201 });

    } catch (error) {
        console.error('Error buying with earnings:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}