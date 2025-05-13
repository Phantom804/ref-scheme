import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/lib/models/Product';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const productName = searchParams.get('productName') || '';
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const skip = (page - 1) * limit;

        await connectToDatabase();

        // Build search query
        const searchQuery: any = {};

        // General search across name and description
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Product name specific filter
        if (productName) {
            searchQuery.name = { $regex: productName, $options: 'i' };
        }

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            searchQuery.price = {};
            if (minPrice !== undefined) {
                searchQuery.price.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                searchQuery.price.$lte = maxPrice;
            }
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(searchQuery);

        // Fetch products with pagination
        const products = await Product.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        // Format the response
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