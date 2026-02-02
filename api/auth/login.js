import connectDB from './lib/mongodb.js';
import Admin from './lib/Admin.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { username, password } = req.body;

        // Seed default admin if not exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            await Admin.create({ username: 'admin', password: 'admin123' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, admin: { username: admin.username } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
