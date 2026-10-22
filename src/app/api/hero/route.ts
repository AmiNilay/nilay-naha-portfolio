import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import Hero from "@/models/Hero";
import { uploadToGithub, deleteFromGithub } from "@/lib/githubUpload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to extract clean G-Drive URL
const formatGDriveUrl = (url: string | null) => {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
};

export async function GET( ) {
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

    let currentHero = await Hero.findOne();
    if (!currentHero) currentHero = new Hero({});

    const updateData: any = {};
    
    const textFields = [
      "badge", "title", "subtitle", 
      "siteTitle", "siteSubtitle",
      "badgeText", "showAvailability", 
      "line1Bold", "line1Accent", "line2Bold", "line2Accent",
      "socialGithub", "socialLinkedin", "socialTwitter", "socialInstagram", "socialEmail",
      "techStack", "techMarqueeSpeed",
      "stat1Value", "stat1Label", 
      "stat2Value", "stat2Label", 
      "stat3Value", "stat3Label",
      "portfolioLastUpdated"
    ];
    
    textFields.forEach((field) => {
      if (formData.has(field)) {
        if (field === "showAvailability") {
          updateData[field] = formData.get(field) === "true";
        } else if (field === "techMarqueeSpeed") {
          const secs = Number(formData.get(field));
          if (Number.isFinite(secs)) updateData[field] = Math.min(240, Math.max(5, secs));
        } else {
          updateData[field] = formData.get(field);
        }
      }
    });

    const gDriveProfilePic = formData.get("gDriveProfilePic") as string;
    if (gDriveProfilePic !== null) {
      // Stored as pasted (incl. #gif / #video hints); the client converts Drive
      // links via @/lib/driveMedia so GIFs stay animated and videos play.
      updateData.gDriveProfilePic = gDriveProfilePic.trim();
    }

    const gDriveResume = formData.get("gDriveResume" ) as string;
    if (gDriveResume !== null) updateData.gDriveResume = formatGDriveUrl(gDriveResume);

    // Handle Image Removal
    if (formData.get("removeImage") === "true") {
      if (currentHero.profilePic) await deleteFromGithub(currentHero.profilePic);
      updateData.profilePic = "";
    }

    // ✅ NEW: Handle Resume Removal
    if (formData.get("removeResume") === "true") {
      if (currentHero.resumeUrl) await deleteFromGithub(currentHero.resumeUrl);
      updateData.resumeUrl = "";
    }

    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const newUrl = await uploadToGithub(imageFile);
      if (newUrl) {
        updateData.profilePic = newUrl;
        if (currentHero.profilePic) await deleteFromGithub(currentHero.profilePic);
      }
    }

    const resumeFile = formData.get("resume") as File;
    if (resumeFile && resumeFile.size > 0) {
      const newUrl = await uploadToGithub(resumeFile);
      if (newUrl) {
        updateData.resumeUrl = newUrl;
        if (currentHero.resumeUrl) await deleteFromGithub(currentHero.resumeUrl);
      }
    }

    const updatedHero = await Hero.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true }
    );

    revalidatePublicPages();
    return NextResponse.json(updatedHero);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
