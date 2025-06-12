import { Schema, model, Document } from 'mongoose';

interface IWithdraw extends Document {
    userId: Schema.Types.ObjectId;
    userName: string;
    phoneNumber: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Cancelled';
    requestedOn: Date;
    completedOn?: Date;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
}

const WithdrawSchema = new Schema<IWithdraw>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    accountTitle: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String, required: true, enum: ['Pending', 'Approved', 'Cancelled'],
        default: 'Pending',
        index: true
    },
    requestedOn: { type: Date, default: Date.now, index: true },
    completedOn: { type: Date }
});

export default model<IWithdraw>('Withdraw', WithdrawSchema);