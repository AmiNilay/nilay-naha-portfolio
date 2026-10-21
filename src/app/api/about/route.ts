import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import About from "@/models/About";

export async function GET() {
  try {
    await connectToDB();
    const about = await About.findOne({});
    return NextResponse.json(about || {});
  } catch (error) {
    console.error("GET About Error:", error);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const updated = await About.findOneAndUpdate({}, body, { new: true, upsert: true });
    revalidatePublicPages();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT About Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}
