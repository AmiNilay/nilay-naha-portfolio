import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Subscription from "@/models/Subscription";
import webpush from "web-push";

export const dynamic = "force-dynamic";

// Configure web-push with your VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@nilaynaha.com";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

// GET: Fetch total subscriber count for the admin dashboard
export async function GET() {
  try {
    await connectToDB();
    const count = await Subscription.countDocuments();
    return NextResponse.json({ count }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch subscriber count" }, { status: 500 });
  }
}

// POST: Send a broadcast notification to all subscribers
export async function POST(req: Request) {
  try {
    await connectToDB();
    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const subscriptions = await Subscription.find();
    if (subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscribers found." }, { status: 200 });
    }

    const payload = JSON.stringify({ 
      title, 
      body, 
      url: url || "/" 
    });

    let successCount = 0;
    let failCount = 0;

    // Send to all subscribers in parallel
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        successCount++;
      } catch (error: any) {
        // If the subscription is expired or no longer valid (404 or 410), remove it from DB
        if (error.statusCode === 404 || error.statusCode === 410) {
          await Subscription.findByIdAndDelete(sub._id);
        }
        failCount++;
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ 
      message: `Broadcast complete! Sent: ${successCount}, Failed/Removed: ${failCount}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Broadcast Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
