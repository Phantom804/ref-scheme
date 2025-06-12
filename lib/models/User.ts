import { Schema, model, models, Document, HydratedDocument } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email?: string;
    password: string;
    phoneNumber: String;
    isVerified: boolean;
    role: string;
    referralCode: string;
    referredByCode: string;
    country: string;
    totalEarning: number;
    isBlock: boolean;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}



const UserSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, index: true },
        phoneNumber: { type: String, required: true, index: true },
        password: { type: String, required: true },
        referralCode: { type: String, index: true },
        country: { type: String },
        totalEarning: { type: Number, default: 0 },
        isBlock: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        idCardFrontUrl: { type: String },
        idCardBackUrl: { type: String },
        role: { type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user', index: true },
    },
    {
        timestamps: true,
    }
);




// Use existing model or create a new one (for Next.js hot reloading in development)
export const User = models.User || model<IUser>('User', UserSchema);