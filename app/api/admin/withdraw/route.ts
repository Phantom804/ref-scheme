import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Withdraw from '@/lib/models/Withdraw';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const minAmount = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxAmount = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const showApprovedRequests = searchParams.get('showApprovedRequests') === 'true';
        const showCancelledRequests = searchParams.get('showCancelledRequests') === 'true';
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // By default, only show pending requests unless explicitly requested
        if (!showApprovedRequests && !showCancelledRequests) {
            searchQuery.status = 'Pending';
        } else {
            // If specific statuses are requested
            const statusConditions = [];

            // Always include Pending unless we're only looking for approved/cancelled
            if (!(showApprovedRequests && showCancelledRequests && !searchQuery.status)) {
                statusConditions.push('Pending');
            }

            if (showApprovedRequests) {
                statusConditions.push('Approved');
            }

            if (showCancelledRequests) {
                statusConditions.push('Cancelled');
            }

            if (statusConditions.length > 0) {
                searchQuery.status = { $in: statusConditions };
            }
        }


        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }

        // Amount range filter
        if (minAmount !== undefined || maxAmount !== undefined) {
            searchQuery.amount = {};
            if (minAmount !== undefined) {
                searchQuery.amount.$gte = minAmount;
            }
            if (maxAmount !== undefined) {
                searchQuery.amount.$lte = maxAmount;
            }
        }

        // Count total matching documents for pagination
        const totalWithdrawals = await Withdraw.countDocuments(searchQuery);

        // Fetch withdrawals with pagination
        const withdrawals = await Withdraw.find(searchQuery)
            .sort({ requestedOn: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username email')
            .exec();

        // Format the response
        const formattedWithdrawals = await Promise.all(withdrawals.map(async (withdrawal) => {


            return {
                id: withdrawal._id,
                userId: withdrawal.userId,
                userName: withdrawal?.userName,
                phoneNumber: withdrawal?.phoneNumber,
                accountTitle: withdrawal?.accountTitle,
                accountNumber: withdrawal?.accountNumber,
                bankName: withdrawal?.bankName,
                amount: `PKR ${withdrawal.amount}`,
                status: withdrawal.status,
                requestedOn: withdrawal.requestedOn.toLocaleDateString(),
                completedOn: withdrawal.completedOn ? withdrawal.completedOn.toLocaleDateString() : null,

            };
        }));

        return NextResponse.json({
            withdrawals: formattedWithdrawals,
            totalPages: Math.ceil(totalWithdrawals / limit),
            currentPage: page,
            totalWithdrawals
        });

    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { withdrawalId, status } = await request.json();

        await connectToDatabase();

        const withdrawal = await Withdraw.findById(withdrawalId);


        if (withdrawal?.status !== 'Pending') {
            return NextResponse.json(
                { error: 'You can not change Status Again' },
                { status: 400 }
            );
        }
        if (!withdrawal) {
            return NextResponse.json(
                { error: 'Withdrawal request not found' },
                { status: 404 }
            );
        }

        // Update status
        withdrawal.status = status;

        // If status is Approved or Cancelled, set completedOn date
        if (status === 'Approved' || status === 'Cancelled') {
            withdrawal.completedOn = new Date();

            // If cancelled, refund the amount back to user's total earning
            if (status === 'Cancelled') {
                const user = await User.findById(withdrawal.userId);
                if (user) {
                    user.totalEarning += withdrawal.amount;
                    await user.save();
                }
            }
        } else {
            // If reverting to Pending, remove completedOn date
            withdrawal.completedOn = undefined;
        }

        await withdrawal.save();

        return NextResponse.json({
            message: 'Withdrawal status updated successfully',
            withdrawal
        });

    } catch (error) {
        console.error('Error updating withdrawal status:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}