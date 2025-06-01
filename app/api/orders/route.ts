import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/authHelper';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';




// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId') || '';

        const referralCode = searchParams.get('referralCode') || '';

        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // Filter by userId if provided
        if (userId) {
            searchQuery.userId = userId;

        }


        // Prepare the query pipeline
        let orderQuery = Order.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate({ path: 'productId', select: 'referralLimt price', strictPopulate: false });



        // We don't need product name filtering for user dashboard
        // Just get the total count and apply pagination
        const totalOrders = await Order.countDocuments(searchQuery);

        // Apply pagination
        const orders = await orderQuery.skip(skip).limit(limit).exec();


        // Already handled pagination and counting above

        // Format the response based on order type
        const formattedOrders = await Promise.all(orders.map(async order => {
            // Base order data
            const baseOrder = {
                id: order._id,
                productName: order.productName,
                transactionId: order.transactionId,
                quantity: order.quantity,
                price: `PKR ${order.productId?.price}`,
                boughtOn: order.createdAt.toLocaleDateString(),
                status: order.status,
                deliveryRequested: order.deliveryRequested || false,
                deliveryStatus: order.deliveryStatus || '',
            };



            let productIdValue = order.productId;
            if (order.productId && typeof order.productId === 'object' && order.productId._id) {
                productIdValue = order.productId._id;
            }



            let referralUsageCount = 0;
            if (order.productId && order.productId._id) {
                referralUsageCount = await Order.countDocuments({
                    referralCode: { $exists: true, $eq: referralCode },
                    productId: productIdValue,
                    status: { $ne: 'Cancelled' }
                });

            }




            return {
                ...baseOrder,
                referralCode: order.referralCode || '',
                productReferralLimit: order.productId?.referralLimt,
                referralUsageCount



            };
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




export async function POST(request: NextRequest) {
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
        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-password').exec();

        if (!user) {

            return NextResponse.json(
                { success: false, message: 'User not found, Login first!' },
                { status: 404 }
            );
        }

        if (user.isBlocked === true) {
            const response = NextResponse.json(
                { success: false, message: 'Your account is blocked my admin.' },
                { status: 403 } // Consider 403 Forbidden instead of 404
            );

            response.cookies.set({
                name: 'auth_token',
                value: '',
                httpOnly: true,
                expires: new Date(0),
                path: '/'
            });

            return response;
        }

        // Parse the form data
        const formData = await request.formData();
        const receipt = formData.get('receipt') as File;
        const productId = formData.get('productId') as string;
        const productName = formData.get('productName') as string;
        const quantity = parseInt(formData.get('quantity') as string);
        const price = parseFloat(formData.get('price') as string);
        const referralCode = formData.get('referralCode') as string;

        const userId = user._id;
        const buyer = user.phoneNumber;


        if (referralCode && referralCode === user.referralCode) {
            return NextResponse.json(
                { success: false, message: 'You cannot use your own referral code.' },
                { status: 400 }
            );
        }

        if (referralCode) {
            const previousOrderWithReferral = await Order.findOne({ userId: user._id, referralCode: referralCode, productId: productId });
            // we need to check here 
            if (previousOrderWithReferral) {
                return NextResponse.json(
                    { success: false, message: "You can only use referral code once, and you've already used it." },
                    { status: 400 }
                );
            }
        }
        let commission;
        productId
        const totalPrice = quantity * price;

        if (referralCode) {
            //only fetch referral comission from app settings
            const refSettings = await Product.findOne({ _id: productId }, 'referralCommission').exec();

            commission = Number((price * (refSettings.referralCommission / 100)).toFixed(2));
        }


        // Validate required fields
        if (!receipt || !productId || !productName || isNaN(quantity) || isNaN(price)) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        const fileType = receipt.type;
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(fileType)) {
            return NextResponse.json(
                { success: false, message: 'Only JPG and PNG formats are supported' },
                { status: 400 }
            );
        }

        // Validate file size (max 1MB)
        if (receipt.size > 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'File size must be less than 1MB' },
                { status: 400 }
            );
        }

        // Convert the file to a buffer
        const arrayBuffer = await receipt.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert buffer to base64 string for Cloudinary
        const base64String = buffer.toString('base64');
        const dataURI = `data:${fileType};base64,${base64String}`;

        // Upload the image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                dataURI,
                {
                    folder: 'digital-marketplace/receipts',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        // Generate a transaction ID
        const transactionId = `ID${Math.floor(100000 + Math.random() * 900000)}`;

        // Create a new order in the database
        const newOrder = await Order.create({
            userId,
            buyer,
            productId,
            productName,
            transactionId,
            quantity,
            ...(commission ? { commission } : {}),
            ...(referralCode ? { referralCode } : {}),
            price: totalPrice,
            status: 'Pending',
            receiptUrl: (uploadResult as any).secure_url,
        });


        return NextResponse.json({
            success: true,
            message: 'Order Placed successfully',
            totalPrice: newOrder.price,
            buyer,
            transactionId,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create order' },
            { status: 500 }
        );
    }
}