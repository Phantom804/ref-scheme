import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Order } from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/authHelper';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { AppSetting } from '@/lib/models/AppSetting';

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
        const orderType = searchParams.get('orderType') || '';
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // Filter by userId if provided
        if (userId) {
            // For direct orders, filter by the user who made the purchase
            if (orderType === 'bought') {
                searchQuery.userId = userId;
            }
            // For reference orders, filter by the referral code matching the user's code
            else if (orderType === 'reference') {
                searchQuery.referralCode = referralCode;
            }
        }


        // Prepare the query pipeline
        let orderQuery = Order.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate('_id', 'name productCode');

        // Execute the query for counting with product name filter
        let allOrders = [];

        // We don't need product name filtering for user dashboard
        // Just get the total count and apply pagination
        const totalOrders = await Order.countDocuments(searchQuery);

        // Apply pagination
        const orders = await orderQuery.skip(skip).limit(limit).exec();

        // Already handled pagination and counting above

        // Format the response based on order type
        const formattedOrders = orders.map(order => {
            // Base order data
            const baseOrder = {
                id: order.id,
                name: order.productId.name,
                transactionId: order.transactionId,
                quantity: order.quantity,
                price: `$${order.price.toFixed(2)}`,
                boughtOn: order.createdAt.toLocaleDateString(),
                status: order.status,
                boughtBy: order.buyer || 'Unknown'
            };

            // For reference orders, include additional fields
            if (orderType === 'reference') {
                return {
                    ...baseOrder,
                    commission: order.commission ? `$${order.commission.toFixed(2)}` : '$0.00'
                };
            }

            // For direct orders
            return {
                ...baseOrder,
                productCode: order.productId.productCode,
                referralCode: order.referralCode || '-',
                receiptUrl: order.receiptUrl
            };
        });

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

        const userId = user.id;
        const buyer = user.name;


        const totalPrice = quantity * price;

        //only fetch referral comission from app settings
        const commissionPercentage = await AppSetting.findOne({}, 'referralCommission').exec();



        const commission = price - (price * commissionPercentage);



        // Validate required fields
        if (!receipt || !productId || !productName || isNaN(quantity) || isNaN(price)) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        const fileType = receipt.type;
        if (!['image/jpeg', 'image/png'].includes(fileType)) {
            return NextResponse.json(
                { success: false, message: 'Only JPEG and PNG formats are supported' },
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
            commission,
            ...(referralCode ? { referralCode } : {}),
            price: totalPrice,
            status: 'Pending',
            receiptUrl: (uploadResult as any).secure_url,
        });

        return NextResponse.json({
            success: true,
            message: 'Order Placed successfully',
            totalPrice: newOrder.price,
            buyer: user.name,
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