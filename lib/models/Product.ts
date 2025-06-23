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
    isDeliverable: boolean;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}



const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, index: true },
        price: { type: Number, required: true },
        category: { type: String, required: true, index: true },
        referralLimt: { type: Number, required: true, index: true },
        referralCommission: { type: Number, required: true },
        isDeliverable: { type: Boolean, default: false, index: true },
        isLocked: { type: Boolean, default: false, index: true },
        description: { type: String, required: true },
        imageUrl: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);



export const Product = models.Product || model<IProduct>('Product', ProductSchema);