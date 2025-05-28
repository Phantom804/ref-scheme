import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';

import mongoose from 'mongoose';
import { Product } from '@/lib/models/Product';


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');


        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }
        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json({ error: 'Invalid Product ID' }, { status: 400 });
        }

        await connectToDatabase();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }


        const productData = product.toObject();
        productData.id = productData._id.toString();
        delete productData._id;

        return NextResponse.json(productData);
    }

    catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

    }
}