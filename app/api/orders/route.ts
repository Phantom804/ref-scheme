import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/authHelper';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { customAlphabet } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import { ObjectId } from 'mongodb';



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

        if (userId) {
            searchQuery.userId = userId;

        }

        let orderQuery = Order.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate({ path: 'productId', select: 'referralLimt price isDeliverable', strictPopulate: false });


        const totalOrders = await Order.countDocuments(searchQuery);

        const orders = await orderQuery.skip(skip).limit(limit).exec();



        const formattedOrders = await Promise.all(orders.map(async order => {
            // Base order data
            const baseOrder = {
                id: order._id,
                productName: order.productName,
                transactionId: order.transactionId,
                quantity: order.quantity,
                price: `PKR ${order.productId?.price}`,
                isDeliverable: order.productId?.isDeliverable,
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


        await connectToDatabase();

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
                { status: 403 }
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

        const formData = await request.formData();
        const receipt = formData.get('receipt') as File;
        const productId = formData.get('productId') as string;
        const productName = formData.get('productName') as string;
        const quantity = parseInt(formData.get('quantity') as string);
        const price = parseFloat(formData.get('price') as string);
        const referralCode = formData.get('referralCode') as string;

        const userId = user._id;
        const buyer = user.phoneNumber;



        let commission;
        productId
        const totalPrice = quantity * price;

        if (referralCode) {
            const aggregationResult = await User.aggregate([
                { $match: { referralCode: referralCode } },
                { $limit: 1 },
                {
                    $lookup: {
                        from: 'orders',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userId', '$$userId'] },
                                            { $eq: ['$productId', new ObjectId(productId)] },
                                            { $eq: ['$status', 'Completed'] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'userProductOrders'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        let: { productId: new ObjectId(productId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$productId']
                                    }
                                }
                            }
                        ],
                        as: 'productInfo'
                    }
                },
                { $unwind: '$productInfo' },
                {
                    $lookup: {
                        from: 'orders',
                        let: { referralCode: referralCode, productId: new ObjectId(productId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$referralCode', '$$referralCode'] },
                                            { $eq: ['$productId', '$$productId'] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'referralOrdersCount'
                    }
                },
                {
                    $lookup: {
                        from: 'orders',
                        let: { currentUserId: new ObjectId(decoded.id), referralCode: referralCode, productId: new ObjectId(productId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userId', '$$currentUserId'] },
                                            { $eq: ['$productId', '$$productId'] },
                                            { $eq: ['$referralCode', '$$referralCode'] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'currentUserReferralOrders'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        referralCode: 1,
                        productReferralLimit: '$productInfo.referralLimt',
                        hasUserBoughtProduct: { $gt: [{ $size: '$userProductOrders' }, 0] },
                        referralUsageCount: { $size: '$referralOrdersCount' },
                        hasCurrentUserUsedReferral: { $gt: [{ $size: '$currentUserReferralOrders' }, 0] },
                        referralCommission: '$productInfo.referralCommission'
                    }
                }
            ]);

            const referralUser = aggregationResult[0];

            if (!referralUser) {
                return NextResponse.json({ success: false, message: 'Referral Code Does Not Exist' }, { status: 404 });
            }

            if (!referralUser.productReferralLimit && referralUser.productReferralLimit !== 0) {
                return NextResponse.json({ success: false, message: 'Product not found or invalid productId.' }, { status: 404 });
            }

            // Check if the user is using their own referral code
            if (decoded.id === referralUser._id.toString()) {
                return NextResponse.json(
                    { success: false, message: 'You cannot use your own referral code.' },
                    { status: 400 }
                );
            }

            // Check if the user who owns the referral code has bought this product
            if (!referralUser.hasUserBoughtProduct) {
                return NextResponse.json({ success: false, message: 'The owner of this referral should have purchased it first.' }, { status: 400 });
            }

            // Check if the referral limit for the product has been reached
            if (referralUser.productReferralLimit !== undefined && referralUser.referralUsageCount >= referralUser.productReferralLimit) {
                return NextResponse.json({ success: false, message: 'Referral limit for this product has been reached.' }, { status: 400 });
            }

            // Check if the current user has already used a referral code for a product
            if (referralUser.hasCurrentUserUsedReferral) {
                return NextResponse.json(
                    { success: false, message: "You can only use a referral code once for a product." },
                    { status: 400 }
                );
            }

            commission = Number((price * (referralUser.referralCommission / 100)).toFixed(2));
        }


        if (!receipt || !productId || !productName || isNaN(quantity) || isNaN(price)) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const fileType = receipt.type;
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(fileType)) {
            return NextResponse.json(
                { success: false, message: 'Only JPG and PNG formats are supported' },
                { status: 400 }
            );
        }

        if (receipt.size > 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'File size must be less than 1MB' },
                { status: 400 }
            );
        }

        const arrayBuffer = await receipt.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const base64String = buffer.toString('base64');
        const dataURI = `data:${fileType};base64,${base64String}`;

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


        const nanoid = customAlphabet('ABCDMNZ0123456789', 6);
        const transactionId = `${nanoid()}`;


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