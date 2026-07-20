import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import About from "@/models/About";

export async function GET() {
  try {
    await connectToDB();
    const about = await About.findOne();
    return NextResponse.json(about || {});
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();
    const { bio, skills, education } = body;

    const updatedAbout = await About.findOneAndUpdate(
      {},
      {
        $set: {
          bio,
          skills,
          education
        }
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedAbout);

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}