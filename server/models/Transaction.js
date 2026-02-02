import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    customerNumber: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['PLN', 'PDAM', 'BPJS'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'failed'],
        default: 'success',
    },
    date: {
        type: String,
        default: () => new Date().toLocaleString('id-ID').replace(',', ''),
    },
}, {
    timestamps: true,
});

// Auto-generate ID before saving
transactionSchema.pre('save', async function (next) {
    if (!this.id) {
        const count = await mongoose.model('Transaction').countDocuments();
        this.id = `TRX${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
