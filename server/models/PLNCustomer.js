import mongoose from 'mongoose';

const plnCustomerSchema = new mongoose.Schema({
    customerNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    tariffPower: {
        type: String,
        default: 'R1/900VA',
    },
    standMeter: {
        type: String,
        default: '00012345-00012567',
    },
    bills: [{
        period: String,
        amount: Number,
        isPaid: {
            type: Boolean,
            default: false,
        },
    }],
    adminFee: {
        type: Number,
        default: 2500,
    },
}, {
    timestamps: true,
});

const PLNCustomer = mongoose.models.PLNCustomer || mongoose.model('PLNCustomer', plnCustomerSchema);

export default PLNCustomer;
