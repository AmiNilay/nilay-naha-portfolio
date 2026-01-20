import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB"; // Keeping your import path
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

    // FIX: Parse as JSON because the frontend sends "Content-Type: application/json"
    const body = await req.json();
    
    // Destructure the fields directly. 
    // Since we sent arrays from the frontend, we don't need to JSON.parse() them here.
    const { bio, skills, education } = body;

    // Update the FIRST document found (or create if missing)
    const updatedAbout = await About.findOneAndUpdate(
      {}, 
      { 
        $set: { 
          bio, 
          skills,      // Saved directly as an array
          education    // Saved directly as an array of objects
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