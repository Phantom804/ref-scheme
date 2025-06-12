import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    logoUrl: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
    {

        accountTitle: {
            type: String,
            required: [true, 'Account title is required'],
            index: true
        },
        accountNumber: {
            type: String,
            required: [true, 'Account number is required'],
            index: true
        },
        bankName: {
            type: String,
            required: [true, 'Bank name is required'],
            index: true
        },
        logoUrl: {
            type: String,
            required: [true, 'logo is required'],
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Create or retrieve the model
const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);

export default PaymentMethod;