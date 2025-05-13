import { Schema, model, models, Document, Types } from 'mongoose';

export interface IVerificationToken extends Document {
    id: string;
    token: string;
    expires: Date;
    userId: Types.ObjectId;
    createdAt: Date;
}

// Document type with _id
interface TokenDocument extends Document {
    _id: Types.ObjectId;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
    {
        token: { type: String, required: true, unique: true },
        expires: { type: Date, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

// Virtual for id
VerificationTokenSchema.virtual('id').get(function (this: TokenDocument) {
    return this._id.toString();
});

// Ensure virtual fields are serialized
VerificationTokenSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

// Create indexes

VerificationTokenSchema.index({ userId: 1 }, { unique: true });

// Use existing model or create a new one (for Next.js hot reloading in development)
export const VerificationToken = models.VerificationToken || model<IVerificationToken>('VerificationToken', VerificationTokenSchema); 