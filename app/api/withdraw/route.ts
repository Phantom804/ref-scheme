import Withdraw from '@/lib/models/Withdraw';
import { verifyToken } from '@/lib/auth/authHelper';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { AppSetting } from '@/lib/models/AppSetting';
import { rateLimiter } from '@/lib/rateLimiter';


export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;


    const totalWithdrawals = await Withdraw.countDocuments({ userId: decoded.id });


    const withdrawals = await Withdraw.find({ userId: decoded.id })
        .sort({ requestedOn: -1 })
        .skip(skip)
        .limit(limit);

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
        id: (withdrawal._id as any).toString(),
        amount: `PKR ${withdrawal.amount}`,
        status: withdrawal.status,
        requestedOn: withdrawal.requestedOn.toLocaleDateString(),
        completedOn: withdrawal.completedOn ? withdrawal.completedOn.toLocaleDateString() : null
    }));

    return NextResponse.json({
        withdrawals: formattedWithdrawals,
        totalPages: Math.ceil(totalWithdrawals / limit),
        currentPage: page,
        totalWithdrawals
    });
}



export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }


    const rateLimit = await rateLimiter(request, 'withdraw', { windowSec: 600, max: 10, });

    if (!rateLimit.success) {
        const headers = new Headers({
            'Retry-After': rateLimit.retryAfter.toString(),
        });

        const retryAfterMin = Math.ceil(rateLimit.retryAfter / 60)

        return NextResponse.json(
            { success: false, message: `Suspicious activity detected. Try again after ${retryAfterMin} min.` },
            { status: 429, headers }
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
    try {
        const { amount, accountTitle, accountNumber, bankName } = await request.json();

        if (!amount || !accountTitle || !accountNumber || !bankName) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        const withdrawSettings = await AppSetting.findOne({}, 'minWithdrawPercent minWithdrawAmount').exec();
        const minWithdrawAmount = withdrawSettings?.minWithdrawAmount;
        if (minWithdrawAmount > amount) {
            return NextResponse.json(
                { success: false, message: `Withdraw amount should be at least ${minWithdrawAmount} and ${withdrawSettings?.minWithdrawPercent}% of your total earnings.` },
                { status: 400 }
            );

        }

        // Find user and check if they have sufficient balance
        const user = await User.findById(decoded.id);
        if (!user || user.totalEarning < amount) {
            return NextResponse.json(
                { success: false, message: 'Insufficient balance' },
                { status: 400 }
            );
        }


        const minWithdrawPercent = (withdrawSettings.minWithdrawPercent / 100) * user.totalEarning;

        if (amount < minWithdrawPercent) {
            return NextResponse.json(
                { success: false, message: `You can only withdraw up to ${withdrawSettings.minWithdrawPercent}% of your total earnings` },
                { status: 400 }
            );
        }

        // Create withdrawal request
        const withdrawal = new Withdraw({
            userId: decoded.id,
            amount,
            userName: decoded.name,
            phoneNumber: decoded.phoneNumber,
            accountTitle,
            accountNumber,
            bankName,
            status: 'Pending',
            requestedOn: new Date().toISOString()
        });

        // Deduct amount from user's total earning
        user.totalEarning -= amount;


        await Promise.all([
            withdrawal.save(),
            user.save()
        ]);

        const formattedWithdrawal = {
            id: (withdrawal._id as any).toString(),
            amount: `PKR ${withdrawal.amount}`,
            status: withdrawal.status,
            requestedOn: withdrawal.requestedOn.toLocaleDateString(),
            completedOn: withdrawal.completedOn ? withdrawal.completedOn.toLocaleDateString() : null
        };

        return NextResponse.json({
            success: true,
            withdrawal: formattedWithdrawal,
            updatedBalance: user.totalEarning
        });
    } catch (error) {
        console.error('Withdrawal request error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}