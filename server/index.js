import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Transaction from './models/Transaction.js';
import Admin from './models/Admin.js';
import PLNCustomer from './models/PLNCustomer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from dist folder (for production)
app.use(express.static(path.join(__dirname, '../dist')));

// ==========================================
// SEED DATA
// ==========================================

// Seed default admin if not exists
const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            await Admin.create({ username: 'admin', password: 'admin123' });
            console.log('✅ Default admin created (admin/admin123)');
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
    }
};

// Run seeds
seedAdmin();

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            admin: { username: admin.username },
        });
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// TRANSACTION ENDPOINTS
// ==========================================

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('[Transactions] Get error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const { customerNumber, customerName, type, amount, status } = req.body;

        if (!customerNumber || !customerName || !type || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Generate ID
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
        console.error('[Transactions] Create error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create transaction' });
    }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findOneAndDelete({ id });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        console.error('[Transactions] Delete error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete transaction' });
    }
});

// ==========================================
// PLN API (Python Scraper - Sepulsa)
// ==========================================

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Check PLN Postpaid bill via Python Scraper
app.post('/api/cek-tagihan-pln', async (req, res) => {
    try {
        const { customer_number } = req.body;

        if (!customer_number) {
            return res.status(400).json({
                status: false,
                message: 'customer_number is required',
            });
        }

        console.log(`[PLN API] Checking bill for: ${customer_number}`);

        const axios = (await import('axios')).default;
        // Remove trailing slash if present
        const baseUrl = PYTHON_API_URL.replace(/\/$/, "");
        const pythonResponse = await axios.post(
            `${baseUrl}/api/pln/postpaid`,
            { customer_number },
            { timeout: 60000 }  // 60 seconds for Playwright
        );

        if (pythonResponse.data.status === 'SUCCESS') {
            console.log(`[PLN API] Success`);
            return res.json(pythonResponse.data);
        } else {
            return res.json({
                status: false,
                message: pythonResponse.data.message || 'ID Pelanggan tidak ditemukan',
            });
        }

    } catch (error) {
        console.error('[PLN API] Error:', error.message);

        let errorMessage = 'Gagal mengecek tagihan PLN.';
        let statusCode = 500;

        if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Scraper Service tidak aktif/tidak bisa dihubungi.';
            statusCode = 503;
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Scraper Service timeout.';
            statusCode = 504;
        }

        if (!PYTHON_API_URL) {
            errorMessage = 'PYTHON_API_URL belum dikonfigurasi di Environment Variables.';
            statusCode = 500;
        }

        res.status(statusCode).json({
            status: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get all PLN customers (admin)
app.get('/api/pln-customers', async (req, res) => {
    try {
        const customers = await PLNCustomer.find().sort({ createdAt: -1 });
        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('[PLN Customers] Get error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch customers' });
    }
});

// Add PLN customer
app.post('/api/pln-customers', async (req, res) => {
    try {
        const { customerNumber, customerName, tariffPower, standMeter, bills, adminFee } = req.body;

        if (!customerNumber || !customerName) {
            return res.status(400).json({ success: false, message: 'customerNumber and customerName required' });
        }

        const customer = await PLNCustomer.create({
            customerNumber,
            customerName,
            tariffPower: tariffPower || 'R1/900VA',
            standMeter: standMeter || '00000000-00000000',
            bills: bills || [],
            adminFee: adminFee || 2500,
        });

        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        console.error('[PLN Customers] Create error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create customer' });
    }
});

// Add bill to customer
app.post('/api/pln-customers/:customerNumber/bills', async (req, res) => {
    try {
        const { customerNumber } = req.params;
        const { period, amount } = req.body;

        const customer = await PLNCustomer.findOne({ customerNumber });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer.bills.push({ period, amount, isPaid: false });
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error('[PLN Bills] Add error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add bill' });
    }
});

// Delete PLN customer
app.delete('/api/pln-customers/:customerNumber', async (req, res) => {
    try {
        const { customerNumber } = req.params;
        const customer = await PLNCustomer.findOneAndDelete({ customerNumber });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error('[PLN Customers] Delete error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete customer' });
    }
});

// Update PLN customer
app.put('/api/pln-customers/:customerNumber', async (req, res) => {
    try {
        const { customerNumber } = req.params;
        const updates = req.body;

        const customer = await PLNCustomer.findOneAndUpdate(
            { customerNumber },
            updates,
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error('[PLN Customers] Update error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update customer' });
    }
});

// Mark bill as paid
app.put('/api/pln-customers/:customerNumber/bills/:billIndex/pay', async (req, res) => {
    try {
        const { customerNumber, billIndex } = req.params;

        const customer = await PLNCustomer.findOne({ customerNumber });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const index = parseInt(billIndex);
        if (customer.bills[index]) {
            customer.bills[index].isPaid = true;
            await customer.save();
            res.json({ success: true, data: customer });
        } else {
            res.status(404).json({ success: false, message: 'Bill not found' });
        }
    } catch (error) {
        console.error('[PLN Bills] Pay error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to mark bill as paid' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing (production)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 API Server running on http://localhost:${PORT}`);
        console.log(`📡 Endpoints:`);
        console.log(`   POST /api/auth/login`);
        console.log(`   GET  /api/transactions`);
        console.log(`   POST /api/transactions`);
        console.log(`   DELETE /api/transactions/:id`);
        console.log(`   POST /api/cek-tagihan-pln`);
        console.log(`   GET  /api/pln-customers`);
        console.log(`   POST /api/pln-customers`);
        console.log(`   POST /api/pln-customers/:id/bills`);
    });
}

export default app;
