import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/connectToDB'; // Adjust this import if your db file is named differently (e.g., '@/lib/db')

// --- RATE LIMITER SETUP ---
// In-memory store to track IP addresses and request counts
const rateLimitMap = new Map<string, { count: number; startTime: number }>();
const MAX_REQUESTS = 3; // Max 3 messages
const WINDOW_MS = 60 * 60 * 1000; // 1 Hour in milliseconds

// Define the Contact Schema
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export async function POST(req: NextRequest) {
    try {
        // 1. RATE LIMITING LOGIC
        // Get the user's IP address (works locally and on Vercel)
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown_ip';
        const now = Date.now();
        const windowStart = now - WINDOW_MS;

        // Get existing record for this IP, or create a new one
        const record = rateLimitMap.get(ip) || { count: 0, startTime: now };

        // If the time window has passed, reset their count
        if (record.startTime < windowStart) {
            record.count = 1;
            record.startTime = now;
        } else {
            record.count += 1;
        }

        // Save the updated record
        rateLimitMap.set(ip, record);

        // Block the request if they exceeded the limit
        if (record.count > MAX_REQUESTS) {
            console.warn(`[RATE LIMIT] Blocked spam attempt from IP: ${ip}`);
            return NextResponse.json(
                { error: 'You have sent too many messages. Please try again in an hour.' }, 
                { status: 429 }
            );
        }

        // 2. PROCESS THE MESSAGE
        await connectToDB();
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Save to MongoDB
        await Contact.create({ name, email, message });

        return NextResponse.json({ success: true, message: 'Message received!' });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

// Optional: Add a GET handler so your Admin Dashboard can fetch the messages!
export async function GET() {
    try {
        await connectToDB();
        const messages = await Contact.find().sort({ createdAt: -1 });
        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
