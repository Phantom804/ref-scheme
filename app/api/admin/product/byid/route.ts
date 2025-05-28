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

export async function GET(request: NextRequest) {
    try {

        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get('productId');
        // Connect to the database
        await connectToDatabase();


        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Find product by ID
        const product = await Product.findById(productId);

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



export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get('productId');
        await connectToDatabase();


        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Find the product first to get the image URL
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        // Delete image from Cloudinary if it exists
        if (product.imageUrl) {
            const publicId = product.imageUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            }
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete associated price history
        await PriceHistory.deleteMany({ productId: deletedProduct._id });

        return NextResponse.json(
            { message: 'Product deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}