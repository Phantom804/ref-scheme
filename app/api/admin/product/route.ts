import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/lib/models/Product';
import PriceHistory from '@/lib/models/PriceHistory';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
async function uploadImageToCloudinary(imageFile: File) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const dataURI = `data:${imageFile.type};base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'products',
    });

    return uploadResult.secure_url;
}



export async function POST(request: NextRequest) {
    try {

        await connectToDatabase();

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const referralLimt = parseInt(formData.get('referralLimt') as string);
        const referralCommission = parseFloat(formData.get('referralCommission') as string);
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File;
        const isLocked = formData.get('isLocked') === 'true';
        const isDeliverable = formData.get('isDeliverable') === 'true';

        // Validate required fields
        if (!name || !price || !category || !description || !imageFile) {
            return NextResponse.json(
                { error: 'Missing required fields And add Image' },
                { status: 400 }
            );
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImageToCloudinary(imageFile);
        }



        // Create product in database
        const product = await Product.create({
            name,
            price,
            category,
            referralLimt,
            referralCommission,
            description,
            imageUrl,
            isLocked,
            isDeliverable,
        });

        // Add price history
        await PriceHistory.create({
            productId: product._id,
            price: product.price,
            date: new Date(),
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const skip = (page - 1) * limit;

        await connectToDatabase();

        const searchQuery: any = {};

        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const category = searchParams.get('category') || '';
        if (category) {
            searchQuery.category = category;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            searchQuery.price = {};
            if (minPrice !== undefined) {
                searchQuery.price.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                searchQuery.price.$lte = maxPrice;
            }
        }

        const totalProducts = await Product.countDocuments(searchQuery);

        const products = await Product.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const formattedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category
        }));

        return NextResponse.json({
            products: formattedProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            totalProducts
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse form data
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const referralLimt = parseInt(formData.get('referralLimt') as string);
        const referralCommission = parseFloat(formData.get('referralCommission') as string);
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File;
        const existingImageUrl = formData.get('imageUrl') as string;
        const isLocked = formData.get('isLocked') === 'true';
        const isDeliverable = formData.get('isDeliverable') === 'true';

        // Validate required fields
        if (!id || !name || !price || !category || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Upload image to Cloudinary if a new image is provided
        let imageUrl = existingProduct.imageUrl;
        if (imageFile) {
            imageUrl = await uploadImageToCloudinary(imageFile);
        } else if (existingImageUrl) {
            // Use the existing image URL passed from the form
            imageUrl = existingImageUrl;
        }

        // Update product in database
        const updatedFields: any = {
            name,
            price,
            referralLimt,
            referralCommission,
            category,
            description,
            imageUrl,
            isLocked,
            isDeliverable,
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true }
        );

        if (!updatedProduct) {
            return NextResponse.json(
                { error: 'Product not found after update' },
                { status: 404 }
            );
        }

        // Check if price changed and add to history
        if (existingProduct.price !== updatedProduct.price) {
            await PriceHistory.create({
                productId: updatedProduct._id,
                price: updatedProduct.price,
                date: new Date(),
            });
        }

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}