import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { AppSetting } from '@/lib/models/AppSetting';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        // Parse the form data
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const country = formData.get('country') as string;
        const idCardFront = formData.get('idCardFront') as File;
        const idCardBack = formData.get('idCardBack') as File;

        // Validate inputs
        if (!name || !phoneNumber || !password) {
            return NextResponse.json(
                { success: false, message: 'Please fill All Required Fields' },
                { status: 400 }
            );
        }


        const appSettings = await AppSetting.findOne();
        const requireIdCardUpload = appSettings?.requireIdCardUpload || false;

        if (requireIdCardUpload && (!idCardFront || !idCardBack)) {
            return NextResponse.json({ message: "ID card front and back images are required." }, { status: 400 });
        }


        // Only validate ID card files if upload is required
        let idCardFrontUrl = "";
        let idCardBackUrl = "";


        const frontFileType = idCardFront?.type;
        const backFileType = idCardBack?.type;
        if (requireIdCardUpload) {
            // Validate ID card file types


            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(frontFileType) ||
                !['image/jpeg', 'image/png', 'image/jpg'].includes(backFileType)) {
                return NextResponse.json(
                    { success: false, message: 'Only JPG and PNG formats are supported for ID cards' },
                    { status: 400 }
                );
            }

            // Validate file sizes (max 1MB each)
            if (idCardFront.size > 1024 * 1024 || idCardBack.size > 1024 * 1024) {
                return NextResponse.json(
                    { success: false, message: 'ID card image size must be less than 1MB' },
                    { status: 400 }
                );
            }
        }

        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber }).exec();

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this Number already exists' },
                { status: 409 }
            );
        }

        // Only upload ID card images if required
        if (requireIdCardUpload) {
            // Upload ID card front image to Cloudinary
            const frontArrayBuffer = await idCardFront.arrayBuffer();
            const frontBuffer = Buffer.from(frontArrayBuffer);
            const frontBase64String = frontBuffer.toString('base64');
            const frontDataURI = `data:${frontFileType};base64,${frontBase64String}`;

            const frontUploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    frontDataURI,
                    {
                        folder: 'digital-marketplace/id-cards',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            idCardFrontUrl = (frontUploadResult as any).secure_url;

            // Upload ID card back image to Cloudinary
            const backArrayBuffer = await idCardBack.arrayBuffer();
            const backBuffer = Buffer.from(backArrayBuffer);
            const backBase64String = backBuffer.toString('base64');
            const backDataURI = `data:${backFileType};base64,${backBase64String}`;

            const backUploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    backDataURI,
                    {
                        folder: 'digital-marketplace/id-cards',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            idCardBackUrl = (backUploadResult as any).secure_url;
        }

        // Create new user with ID card image URLs if available
        const userData = {
            name,
            referralCode: phoneNumber,
            phoneNumber,
            ...(email && { email }),
            password: password,
            country: country,
            isVerified: true
        };

        // Only add ID card URLs if they were uploaded
        if (requireIdCardUpload) {
            Object.assign(userData, {
                idCardFrontUrl,
                idCardBackUrl
            });
        }

        const user = await User.create(userData);

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Login Now',
                userId: user._id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}