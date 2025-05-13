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
        // Connect to the database
        await connectToDatabase();

        // Parse form data
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File;

        // Validate required fields
        if (!name || !price || !category || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImageToCloudinary(imageFile);
        }

        // Generate a unique 5-digit product code
        async function generateUniqueProductCode() {
            while (true) {
                const code = Math.floor(10000 + Math.random() * 90000).toString();
                const existingProduct = await Product.findOne({ productCode: code });
                if (!existingProduct) return code;
            }
        }

        const productCode = await generateUniqueProductCode();

        // Create product in database
        const product = await Product.create({
            name,
            price,
            category,
            description,
            imageUrl,
            productCode,
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
        // Connect to the database
        await connectToDatabase();

        // Get product ID from query params
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Find product by ID
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
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
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File;
        const existingImageUrl = formData.get('imageUrl') as string;

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
            category,
            description,
            imageUrl,
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
                date: new Date(), // Or use updatedProduct.updatedAt if preferred
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