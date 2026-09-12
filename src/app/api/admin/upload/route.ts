import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import {
  uploadToGitHub,
  buildUploadPath,
  slugify,
  type UploadCategory,
  UPLOAD_CATEGORIES,
} from "@/lib/github-upload";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
];

export async function POST(req: Request) {
  try {
    // Auth check
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    const subfolder = formData.get("subfolder") as string | null;
    const filename = formData.get("filename") as string | null;

    if (!file || !category || !filename) {
      return NextResponse.json(
        { error: "File, category, and filename are required." },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = UPLOAD_CATEGORIES.map((c) => c.value);
    if (!validCategories.includes(category as UploadCategory)) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 }
      );
    }

    // Validate subfolder requirement
    const catConfig = UPLOAD_CATEGORIES.find((c) => c.value === category);
    if (catConfig?.hasSubfolder && (!subfolder || !subfolder.trim())) {
      return NextResponse.json(
        { error: `Subfolder is required for ${catConfig.label}.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed: JPG, PNG, WebP, GIF, SVG, AVIF, PDF.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract extension from original file
    const ext = file.name.split(".").pop() || "webp";

    // Build the upload path with folder structure
    const path = buildUploadPath(
      category as UploadCategory,
      filename,
      ext,
      subfolder || undefined
    );

    // Upload to GitHub
    const url = await uploadToGitHub(
      buffer,
      path,
      `Upload: ${path}`
    );

    return NextResponse.json({ url, path });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}