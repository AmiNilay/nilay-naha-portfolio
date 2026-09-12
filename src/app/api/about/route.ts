import { NextResponse } from "next/server";
import mongoose from "mongoose";
import About from "@/models/About";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI || "");
}

export async function GET() {
  try {
    await connectDB();
    const about = await About.findOne({}).lean();
    return NextResponse.json(about || {});
  } catch (error) {
    console.error("GET About Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch about data" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Use $set to only update provided fields, preserving existing ones
    const updated = await About.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT About Error:", error);
    return NextResponse.json(
      { error: "Failed to update about data" },
      { status: 500 }
    );
  }
}