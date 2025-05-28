// App setting schema

import mongoose, { Schema, Document } from 'mongoose';

interface ITerm {
    title: string;
    content: string;
    order: number;
    isActive: boolean;
}

export interface IAppSetting extends Document {
    referralCommission?: Number;
    terms: ITerm[];
    createdAt: Date;
    updatedAt: Date;
}

const TermSchema = new Schema<ITerm>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }
);

const AppSettingSchema = new Schema<IAppSetting>(
    {
        referralCommission: {
            type: Number,
            default: 10
        },
        terms: {
            type: [TermSchema],
            default: []
        }
    },
    { timestamps: true }
)

export const AppSetting = mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);