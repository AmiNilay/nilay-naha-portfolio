import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Subscription from "@/models/Subscription";
import { rateLimit, HOUR } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimit(req, "push-subscribe", 10, HOUR);
  if (limited) return limited;
  try {
    const raw = await req.json();
    const endpoint = raw?.endpoint;
    const p256dh = raw?.keys?.p256dh;
    const auth = raw?.keys?.auth;

    // Only accept a well-formed https push endpoint with string keys (no operator objects).
    if (
      typeof endpoint !== "string" || !/^https:\/\//.test(endpoint) || endpoint.length > 1000 ||
      typeof p256dh !== "string" || p256dh.length > 200 || typeof auth !== "string" || auth.length > 100
    ) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }
    const subscription = { endpoint, keys: { p256dh, auth } };

    await connectToDB();
    // Upsert: If the endpoint already exists, update it. Otherwise, create a new one.
    await Subscription.findOneAndUpdate(
      { endpoint },
      subscription,
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
