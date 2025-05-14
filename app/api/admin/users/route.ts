import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { verifyToken } from '@/lib/auth/authHelper';

// Get all users with pagination and search
export async function GET(request: NextRequest) {
    try {

        await connectToDatabase();

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
                { success: false, message: 'Invalid token, Authentication failed' },
                { status: 401 }
            );
        }

        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-password').exec();


        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery: any = {};

        // General search
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Role filter based on requesting user's role
        if (user.role === 'admin') {
            searchQuery.role = 'user';
        }

        // Verification status filter
        const isVerified = searchParams.get('isVerified');
        if (isVerified) {
            searchQuery.isVerified = isVerified === 'true';
        }

        // Block status filter
        const isBlocked = searchParams.get('isBlocked');
        if (isBlocked) {
            searchQuery.isBlock = isBlocked === 'true';
        }

        // Prepare the query pipeline
        let userQuery = User.find(searchQuery)
            .sort({ createdAt: -1 });

        // Use standard pagination
        const totalUsers = await User.countDocuments(searchQuery);

        // Apply pagination
        const users = await userQuery.skip(skip).limit(limit).exec();

        return NextResponse.json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// Update user
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();
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
        // Find requesting user
        const requestingUser = await User.findById(decoded.id).exec();
        if (!requestingUser) {
            return NextResponse.json(
                { success: false, message: 'Requesting user not found' },
                { status: 404 }
            );
        }
        const data = await request.json();
        const { id, password, role, ...updateData } = data;
        // If role is being changed, only superAdmin can do it

        const _id = id;
        if (role !== undefined) {
            if (requestingUser.role !== 'superAdmin') {
                return NextResponse.json(
                    { success: false, message: 'Only superAdmin can change user roles' },
                    { status: 403 }
                );
            }

            if (role === 'superAdmin') {
                return NextResponse.json(
                    { success: false, message: 'There can only be one superAdmin' },
                    { status: 400 }
                );
            }
        }
        const user = await User.findByIdAndUpdate(
            _id,
            { ...updateData, ...(role !== undefined ? { role } : {}), updatedAt: new Date() },
            { new: true }
        );
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// Delete user
export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();
        const id = request.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}