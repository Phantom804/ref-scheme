import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import PaymentMethod from '@/lib/models/PaymentMethod';




// Get all payment methods
export async function GET(req: NextRequest) {
    try {

        await connectToDatabase();
        const paymentMethods = await PaymentMethod.find({});
        if (!paymentMethods) {
            return NextResponse.json(
                { success: false, message: 'Payment methods not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            paymentMethods
        }, { status: 200 });
    } catch (error) {
        console.error('Get payment methods error:', error);
        return NextResponse.json(
            { success: false, message: `'Something went wrong' error` },
            { status: 500 }
        );
    }
}
