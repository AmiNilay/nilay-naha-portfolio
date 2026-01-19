import { NextRequest } from "next/server";

export async function isAuthenticated(req: NextRequest) {
    // Verifies the custom header sent by the Admin frontend
    const authHeader = req.headers.get("x-admin-secret");
    
    // In production, consider verifying a secure JWT or HttpOnly cookie.
    // For this portfolio, we check the secret token.
    return authHeader === process.env.ADMIN_SECRET;
}