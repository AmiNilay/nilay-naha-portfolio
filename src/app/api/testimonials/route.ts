import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import Testimonial from "@/models/Testimonial";

export const dynamic = "force-dynamic";

const EDITABLE_FIELDS = [
  "name", "role", "company", "relationship", "quote",
  "avatarUrl", "linkedinUrl", "published", "order",
] as const;

function pickFields(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === (process.env.ADMIN_SECRET || "fallback_secret");
}

// Public visitors get published entries only; the CMS (admin cookie) gets drafts too.
// GET isn't guarded by middleware, so the draft check lives here.
export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const includeDrafts = req.nextUrl.searchParams.get("all") === "1" && isAdmin(req);
    const filter = includeDrafts ? {} : { published: true };
    const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("GET Testimonials Error:", error);
    return NextResponse.json({ error: "Failed to load testimonials" }, { status: 500 });
  }
}

// POST/PUT/DELETE require the admin cookie via src/middleware.ts.
export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const data = pickFields(await req.json());
    if (!data.name || !data.quote) {
      return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
    }
    const testimonial = await Testimonial.create(data);
    revalidatePublicPages();
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("POST Testimonial Error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const testimonial = await Testimonial.findByIdAndUpdate(body.id, pickFields(body), { new: true });
    if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePublicPages();
    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("PUT Testimonial Error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDB();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await Testimonial.findByIdAndDelete(id);
    revalidatePublicPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Testimonial Error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
