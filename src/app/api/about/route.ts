import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import About from "@/models/About";

export async function GET() {
  await connectToDB();
  const about = await About.findOne();
  return NextResponse.json(about || {});
}

export async function PUT(req: Request) {
  await connectToDB();
  const body = await req.json();
  const updatedAbout = await About.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json(updatedAbout);
}