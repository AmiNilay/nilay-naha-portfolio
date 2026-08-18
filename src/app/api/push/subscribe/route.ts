import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    // Upsert: If the endpoint already exists, update it. Otherwise, create a new one.
    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
