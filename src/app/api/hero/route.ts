import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";
import { uploadToGithub, deleteFromGithub } from "@/lib/githubUpload";

export async function GET() {
  try {
    await connectToDB();
    // Simply get the first document found. No IDs needed.
    const hero = await Hero.findOne();
    return NextResponse.json(hero || {});
  } catch (error) {
    console.error("GET Hero Error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // Prepare update data
    const updateData: any = {};

    if (formData.has("tagline")) updateData.tagline = formData.get("tagline");
    if (formData.has("headline")) updateData.headline = formData.get("headline");
    if (formData.has("description")) updateData.description = formData.get("description");
    
    // Handle Image Upload
    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.name !== "undefined") {
      // 1. Get existing data to find old image URL
      const currentHero = await Hero.findOne();
      
      // 2. If old image exists on GitHub, delete it
      if (currentHero?.image && currentHero.image.includes("githubusercontent")) {
        await deleteFromGithub(currentHero.image);
      }

      // 3. Upload NEW image
      const newUrl = await uploadToGithub(imageFile);
      if (newUrl) updateData.image = newUrl;
    }

    // Update the FIRST document found. If none exists, create one (upsert: true).
    const updatedHero = await Hero.findOneAndUpdate(
      {}, // Empty filter = match any document
      { $set: updateData },
      { new: true, upsert: true } // Create if doesn't exist
    );

    return NextResponse.json(updatedHero);
  } catch (error) {
    console.error("Hero Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}