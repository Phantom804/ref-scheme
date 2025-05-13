// PriceHistory.ts
import { Schema, model } from 'mongoose';

const PriceHistorySchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    date: { type: Date, required: true },
});

const PriceHistory = model('PriceHistory', PriceHistorySchema);

export default PriceHistory;
