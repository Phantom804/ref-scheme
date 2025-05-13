import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import PaymentMethod from '@/lib/models/PaymentMethod';
import { verifyToken } from '@/lib/auth/authHelper';


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



// Add new payment method
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { accountTitle, accountNumber, bankName, logoUrl } = await req.json();
        if (!accountTitle || !accountNumber || !bankName) {
            return NextResponse.json(
                { success: false, message: 'Account title, number and bank name are required' },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const paymentMethod = await PaymentMethod.create({
            accountTitle,
            accountNumber,
            bankName,
            logoUrl
        });

        return NextResponse.json({
            success: true,
            message: 'Payment method added successfully',
            paymentMethod
        }, { status: 201 });
    } catch (error) {
        console.error('Add payment method error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}


// Update payment method
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { id, accountTitle, accountNumber, bankName, logoUrl } = await req.json();
        if (!id || !accountTitle || !accountNumber || !bankName) {
            return NextResponse.json(
                { success: false, message: 'ID, account title, number and bank name are required' },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const updatedPaymentMethod = await PaymentMethod.findOneAndUpdate(
            { _id: id },
            { accountTitle, accountNumber, bankName, logoUrl },
            { new: true }
        );

        if (!updatedPaymentMethod) {
            return NextResponse.json(
                { success: false, message: 'Payment method not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment method updated successfully',
            paymentMethod: updatedPaymentMethod
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// Delete payment method
export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedPaymentMethod = await PaymentMethod.findOneAndDelete({ _id: id, userId: decoded.id });

        if (!deletedPaymentMethod) {
            return NextResponse.json(
                { success: false, message: 'Payment method not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment method error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}