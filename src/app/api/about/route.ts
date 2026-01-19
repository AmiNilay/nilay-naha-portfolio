import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import About from "@/models/About";
// We don't need githubUpload here unless you are actively uploading new images in this step

export async function GET() {
  try {
    await connectToDB();
    // Simply get the first document found. No IDs needed.
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
    const formData = await req.formData();
    const updateData: any = {};

    // 1. Extract Data
    if (formData.has("bio")) updateData.bio = formData.get("bio");
    
    // 2. Handle Skills
    if (formData.has("skills")) {
      const skillsString = formData.get("skills") as string;
      updateData.skills = skillsString ? skillsString.split(",").filter(s => s.trim() !== "") : [];
    }

    // 3. Handle Education
    if (formData.has("education")) {
      try {
        const eduString = formData.get("education") as string;
        updateData.education = JSON.parse(eduString);
      } catch (e) {
        console.error("JSON Error:", e);
        updateData.education = [];
      }
    }

    // 4. Update the FIRST document found. If none exists, create one (upsert: true).
    const updatedAbout = await About.findOneAndUpdate(
      {}, // Empty filter = match any document
      { $set: updateData },
      { new: true, upsert: true } // Create if doesn't exist
    );

    return NextResponse.json(updatedAbout);

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}