// Vercel Serverless Function for PLN Bill Check API

const PLN_API_URL = 'https://api.pitucode.com/cek-tagihan-pln';
const PLN_API_KEY = '7C0dE361cb0';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        });
    }

    try {
        const { customer_number } = req.body;

        if (!customer_number) {
            return res.status(400).json({
                success: false,
                message: 'customer_number is required',
            });
        }

        console.log(`[PLN API] Checking bill for customer: ${customer_number}`);

        const response = await fetch(PLN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': PLN_API_KEY,
            },
            body: JSON.stringify({ customer_number }),
        });

        const data = await response.json();

        console.log(`[PLN API] Response status: ${response.status}`);

        return res.status(response.status).json(data);
    } catch (error) {
        console.error('[PLN API] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch PLN bill data',
            error: error.message,
        });
    }
}
