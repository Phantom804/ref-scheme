import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/authHelper';
import { connectToDatabase } from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function PATCH(request: NextRequest) {
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

        // Parse the request body
        const { orderId, deliveryDetails } = await request.json();

        // Validate required fields
        if (!orderId || !deliveryDetails) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the order and verify ownership
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify that the user owns this order
        if (order.userId.toString() !== decoded.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access to this order' },
                { status: 403 }
            );
        }



        // Update the order with delivery information
        order.deliveryRequested = true;
        order.deliveryStatus = 'Pending';
        order.deliveryAddress = deliveryDetails.address;
        order.deliveryCity = deliveryDetails.city;
        order.deliveryState = deliveryDetails.state || '';
        order.deliveryZipCode = deliveryDetails.zipCode || '';
        order.deliveryContactPhone = deliveryDetails.contactPhone;

        await order.save();


        return NextResponse.json({
            success: true,
            message: 'Delivery request submitted successfully',
            deliveryStatus: order.deliveryStatus
        });
    } catch (error) {
        console.error('Error processing delivery request:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process delivery request' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
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

        const searchParams = request.nextUrl.searchParams;
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Find the order and verify ownership
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify that the user owns this order
        if (order.userId.toString() !== decoded.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access to this order' },
                { status: 403 }
            );
        }

        // Return delivery information
        return NextResponse.json({
            success: true,
            deliveryInfo: {
                deliveryRequested: order.deliveryRequested,
                deliveryStatus: order.deliveryStatus,
                deliveryAddress: order.deliveryAddress,
                deliveryCity: order.deliveryCity,
                deliveryState: order.deliveryState,
                deliveryZipCode: order.deliveryZipCode,
                deliveryContactPhone: order.deliveryContactPhone
            }
        });
    } catch (error) {
        console.error('Error fetching delivery information:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch delivery information' },
            { status: 500 }
        );
    }
}