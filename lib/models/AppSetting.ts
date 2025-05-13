// App setting schema

import mongoose, { Schema, Document } from 'mongoose';

export interface IAppSetting extends Document {
    referralCommission: Number;
    createdAt: Date;
    updatedAt: Date;
}

const AppSettingSchema = new Schema<IAppSetting>(
    {
        referralCommission: {
            type: Number,
            default: 10,
            required: true
        },

    },
    { timestamps: true }
)

export const AppSetting = mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);