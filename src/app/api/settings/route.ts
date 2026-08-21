import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Settings from "@/models/Settings";

// Bulletproof DB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne({});
    
    // If no settings exist yet, create default ones
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { $set: body }, 
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("PUT Settings Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
