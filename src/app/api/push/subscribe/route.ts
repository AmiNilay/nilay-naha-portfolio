import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Subscription from "@/models/Subscription";
import Settings from "@/models/Settings";
import webpush from "web-push";

export const dynamic = "force-dynamic";

// Configure web-push with VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@nilaynaha.com";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Upsert the subscription
    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );

    // Send a welcome notification using customizable text from Settings
    try {
      const settings = await Settings.findOne({});

      const welcomeTitle =
        settings?.pushWelcomeTitle || "Welcome! You are now subscribed.";
      const welcomeBody =
        settings?.pushWelcomeBody ||
        "You will receive notifications when new projects or blog posts are published.";
      const welcomeUrl = settings?.pushWelcomeUrl || "/";

      const payload = JSON.stringify({
        title: welcomeTitle,
        body: welcomeBody,
        url: welcomeUrl,
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload
      );
    } catch (notifyError: any) {
      // Don't fail the subscription if the welcome notification fails
      console.warn("Welcome notification failed:", notifyError.message);
    }

    return NextResponse.json(
      { message: "Subscribed successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}