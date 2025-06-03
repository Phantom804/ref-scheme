// PriceAutomation.ts
import { Schema, model, models } from 'mongoose';

interface IPriceAutomation {
    productId: Schema.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    startPrice: number;
    targetPercentage: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PriceAutomationSchema = new Schema<IPriceAutomation>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        startPrice: { type: Number, required: true },
        targetPercentage: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const PriceAutomation = models.PriceAutomation || model<IPriceAutomation>('PriceAutomation', PriceAutomationSchema);

export default PriceAutomation;