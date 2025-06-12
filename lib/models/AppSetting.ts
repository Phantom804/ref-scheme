// App setting schema

import mongoose, { Schema, Document } from 'mongoose';

interface ITerm {
    title: string;
    content: string;
    order: number;
    isActive: boolean;
}

export interface IAppSetting extends Document {
    minWithdrawPercent?: Number;
    minWithdrawAmount?: Number;
    terms: ITerm[];
    requireIdCardUpload: boolean;
    email: string;
    whatsappNumber: string;
    messanger: string;
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
        minWithdrawPercent: {
            type: Number,
            default: 0
        },
        minWithdrawAmount: {
            type: Number,
            default: 0
        },
        terms: {
            type: [TermSchema],
            default: []
        },
        requireIdCardUpload: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            default: "example@gmail.com",
            index: true
        },
        whatsappNumber: {
            type: String,
            default: "example@gmail.com",
        },
        messanger: {
            type: String,
            default: "@zack",
        }

    },
    { timestamps: true }
)

export const AppSetting = mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);