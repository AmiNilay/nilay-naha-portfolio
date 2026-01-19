import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
    // Uses the helper from @/lib/auth to validate the "x-admin-secret" header
    const isAuth = await isAuthenticated(req);
    
    if (isAuth) {
        return NextResponse.json({ authenticated: true });
    }
    
    return NextResponse.json({ authenticated: false }, { status: 401 });
}