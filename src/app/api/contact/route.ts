import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

// Define a simple schema inline (or move to models folder if preferred)
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    read: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent overwrite error if compiling multiple times
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await Contact.create({ name, email, message });

        return NextResponse.json({ success: true, message: 'Message received!' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}