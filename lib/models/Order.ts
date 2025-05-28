import { Schema, model, models, Document } from 'mongoose';
import { IProduct } from './Product';

export interface IOrder extends Document {
    id: string;
    userId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    productName: string;
    transactionId: string;
    buyer: { type: String };
    commission: { type: String };
    quantity: number;
    referralCode: string;
    price: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    receiptUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

interface OrderDocument extends Document {
    _id: Schema.Types.ObjectId;
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        transactionId: { type: String, required: true },
        buyer: { type: String },
        commission: { type: String },
        quantity: { type: Number, required: true },
        referralCode: { type: String },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        receiptUrl: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);


// Use existing model or create a new one
export const Order = models.Order || model<IOrder>('Order', OrderSchema);