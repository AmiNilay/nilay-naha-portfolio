import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

// Reports whether the caller holds a valid signed admin session cookie.
export async function GET(req: NextRequest) {
    if (await isAdminRequest(req)) {
        return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
}
