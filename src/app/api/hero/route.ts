import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";
// ✅ CORRECT IMPORT (Points to your existing file)
import { uploadToGithub, deleteFromGithub } from "@/lib/githubUpload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await connectToDB();
  const hero = await Hero.findOne();
  return NextResponse.json(hero || {}, {
    headers: { "Cache-Control": "no-store, no-cache" }
  });
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // 1. Fetch CURRENT data (needed to find old files to delete)
    let currentHero = await Hero.findOne();
    if (!currentHero) currentHero = new Hero({});

    const updateData: any = {};
    const textFields = ["badge", "title", "subtitle", "socialGithub", "socialLinkedin"];
    
    textFields.forEach((field) => {
      if (formData.has(field)) updateData[field] = formData.get(field);
    });

    // 2. IMAGE UPLOAD logic
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      console.log(">> Uploading Image...");
      const newUrl = await uploadToGithub(imageFile);
      
      if (newUrl) {
        updateData.profilePic = newUrl;
        // Delete old ONLY if new upload worked
        if (currentHero.profilePic) await deleteFromGithub(currentHero.profilePic);
      }
    }

    // 3. RESUME UPLOAD logic
    const resumeFile = formData.get("resume") as File;
    if (resumeFile && resumeFile.size > 0) {
      console.log(">> Uploading Resume...");
      const newUrl = await uploadToGithub(resumeFile);
      
      if (newUrl) {
        updateData.resumeUrl = newUrl;
        // Delete old ONLY if new upload worked
        if (currentHero.resumeUrl) await deleteFromGithub(currentHero.resumeUrl);
      }
    }

    // 4. Update MongoDB
    const updatedHero = await Hero.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedHero);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}