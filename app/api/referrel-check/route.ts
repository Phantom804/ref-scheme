import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
import { verifyToken } from '@/lib/auth/authHelper';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    await connectToDatabase();

    const token = req.cookies.get('auth_token')?.value;

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

    const { referralCode, productId: rawProductId } = await req.json();
    const productId = new ObjectId(rawProductId);

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
                hasCurrentUserUsedReferral: { $gt: [{ $size: '$currentUserReferralOrders' }, 0] }
            }
        }
    ]);



    const user = aggregationResult[0];



    if (!user) {
        return NextResponse.json({ success: false, message: 'Referral Code Does Not Exists' }, { status: 404 });
    }

    if (!user.productReferralLimit && user.productReferralLimit !== 0) {
        return NextResponse.json({ success: false, message: 'Product not found or invalid productId.' }, { status: 404 });
    }

    // Check if the user is using their own referral code
    if (decoded.id === user._id.toString()) {
        return NextResponse.json(
            { success: false, message: 'You cannot use your own referral code.' },
            { status: 400 }
        );
    }

    // Check if the user who owns the referral code has bought this product
    if (!user.hasUserBoughtProduct) {
        return NextResponse.json({ success: false, message: 'The owner of this referral should should purchased it first.' }, { status: 400 });
    }

    // Check if the referral limit for the product has been reached
    if (user.productReferralLimit !== undefined && user.referralUsageCount >= user.productReferralLimit) {
        return NextResponse.json({ success: false, message: 'Referral limit for this product has been reached.' }, { status: 400 });
    }

    // Check if the current user has already used a referral code for a product
    if (user.hasCurrentUserUsedReferral) {
        return NextResponse.json(
            { success: false, message: "You can only use a referral code once for a product." },
            { status: 400 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
}