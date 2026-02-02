import connectDB from './lib/mongodb.js';
import Transaction from './lib/Transaction.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await connectDB();

    if (req.method === 'GET') {
        try {
            const transactions = await Transaction.find().sort({ createdAt: -1 });
            res.json({ success: true, data: transactions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const { customerNumber, customerName, type, amount, status } = req.body;

            const count = await Transaction.countDocuments();
            const id = `TRX${String(count + 1).padStart(3, '0')}`;

            const transaction = await Transaction.create({
                id,
                customerNumber,
                customerName,
                type,
                amount,
                status: status || 'success',
            });

            res.status(201).json({ success: true, data: transaction });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            await Transaction.findOneAndDelete({ id });
            res.json({ success: true, message: 'Deleted' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
