import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    type: { type: String, enum: ['PLN', 'PDAM', 'BPJS'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
    date: { type: String, default: () => new Date().toLocaleString('id-ID').replace(',', '') },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
