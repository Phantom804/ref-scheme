import { Schema, model, models, Document } from 'mongoose';

export interface IProduct extends Document {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    referralLimt: number;
    referralCommission: number;
    imageUrl: string | null;
    productCode: string;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose document with _id property
interface ProductDocument extends Document {
    _id: Schema.Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        referralLimt: { type: Number, required: true },
        referralCommission: { type: Number, required: true },
        isLocked: { type: Boolean, default: false },
        description: { type: String, required: true },
        imageUrl: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);



// Use existing model or create a new one (for Next.js hot reloading in development)
export const Product = models.Product || model<IProduct>('Product', ProductSchema);