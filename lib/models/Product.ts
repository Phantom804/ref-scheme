import { Schema, model, models, Document } from 'mongoose';

export interface IProduct extends Document {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    imageUrl: string | null;
    productCode: string;
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
        description: { type: String, required: true },
        imageUrl: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Virtual for id
ProductSchema.virtual('id').get(function (this: ProductDocument) {
    return this._id.toString();
});

// Ensure virtual fields are serialized
ProductSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

// Use existing model or create a new one (for Next.js hot reloading in development)
export const Product = models.Product || model<IProduct>('Product', ProductSchema);