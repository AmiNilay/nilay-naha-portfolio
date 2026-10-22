import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/connectToDB';
import { isAdminRequest } from '@/lib/adminAuth';
import { rateLimit, HOUR } from '@/lib/rateLimit';
import { audit, isObjectId } from '@/lib/audit';

// Define the Contact Schema
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

export async function POST(req: NextRequest) {
    // 1. Rate limit: max 3 messages per IP per hour
    const limited = rateLimit(req, 'contact', 3, HOUR);
    if (limited) return limited;

    try {
        const body = await req.json();
        const { name, email, message, website, startedAt } = body ?? {};

        // 2. Bot traps: honeypot field filled, or submitted impossibly fast. Pretend success.
        const tooFast = typeof startedAt === 'number' && Date.now() - startedAt < MIN_FILL_MS;
        if ((typeof website === 'string' && website.trim()) || tooFast) {
            return NextResponse.json({ success: true, message: 'Message received!' });
        }

        // 3. Validate types and lengths (also blocks NoSQL operator objects)
        if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const clean = { name: name.trim().slice(0, 100), email: email.trim().slice(0, 254), message: message.trim().slice(0, 5000) };
        if (!clean.name || !clean.message || !EMAIL_RE.test(clean.email)) {
            return NextResponse.json({ error: 'Please provide a name, a valid email and a message' }, { status: 400 });
        }

        await connectToDB();
        await Contact.create(clean);

        return NextResponse.json({ success: true, message: 'Message received!' });
    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

// Admin dashboard only: visitor messages are private.
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    try {
        await connectToDB();
        const messages = await Contact.find().sort({ createdAt: -1 });
        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// Admin: mark a message read/unread.
export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    const { id, read } = await req.json().catch(() => ({}));
    if (!isObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await connectToDB();
    await Contact.findByIdAndUpdate(id, { read: Boolean(read) });
    await audit(req, { actor: 'admin', action: 'contact.update', target: id });
    return NextResponse.json({ success: true });
}

// Admin: delete a message.
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!isObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await connectToDB();
    await Contact.findByIdAndDelete(id);
    await audit(req, { actor: 'admin', action: 'contact.delete', target: id });
    return NextResponse.json({ success: true });
}
