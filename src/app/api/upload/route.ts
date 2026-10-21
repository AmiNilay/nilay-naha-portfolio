import { NextResponse } from "next/server";
import { uploadToGithub } from "@/lib/githubUpload";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

// Generic image upload for CMS fields (e.g. company logos). Admin-only: POST
// requires the admin cookie via src/middleware.ts. Stores in the assets repo.
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use a PNG, JPG, WebP, SVG, or GIF image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 3 MB" }, { status: 400 });
    }
    const url = await uploadToGithub(file);
    if (!url) return NextResponse.json({ error: "Upload failed" }, { status: 502 });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
