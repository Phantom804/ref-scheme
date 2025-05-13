import { Schema, model, models, Document, HydratedDocument } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email?: string;
    password: string;
    phoneNumber: String;
    isVerified: boolean;
    role: string;
    referralCode: string;
    referredByCode: String;
    isBlock: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose document with _id property
interface UserDocument extends Document {
    _id: Schema.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, unique: true },
        phoneNumber: { type: String, required: true },
        password: { type: String, required: true },
        referralCode: { type: String },
        referredByCode: { type: String },
        isBlock: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        role: { type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user' },
    },
    {
        timestamps: true,
    }
);




// Use existing model or create a new one (for Next.js hot reloading in development)
export const User = models.User || model<IUser>('User', UserSchema); 