import { Schema, model, models, Document } from 'mongoose';

export interface IOrder extends Document {
    id: string;
    userId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    productName: string;
    transactionId: string;
    buyer: { type: string };
    commission: { type: string };
    quantity: number;
    referralCode: string;
    price: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    receiptUrl: string;
    deliveryRequested: boolean;
    deliveryStatus: 'Pending' | 'In Transit' | 'Delivered';
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryZipCode: string;
    deliveryContactPhone: string;

    createdAt: Date;
    updatedAt: Date;
}


const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        productName: { type: String, required: true },
        transactionId: { type: String, required: true, index: true },
        buyer: { type: String },
        commission: { type: String },
        quantity: { type: Number, required: true },
        referralCode: { type: String, index: true },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending',
            index: true
        },
        receiptUrl: { type: String },
        // Delivery related fields
        deliveryRequested: { type: Boolean, default: false },
        deliveryStatus: {
            type: String,
            enum: ['Pending', 'In Transit', 'Delivered']
        },
        deliveryAddress: { type: String },
        deliveryCity: { type: String },
        deliveryState: { type: String },
        deliveryZipCode: { type: String },
        deliveryContactPhone: { type: String },
    },
    {
        timestamps: true,
    }
);


// Use existing model or create a new one
export const Order = models.Order || model<IOrder>('Order', OrderSchema);