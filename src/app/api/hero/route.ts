import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB"; // Ensure you have this utility
import Hero from "@/models/Hero";

export async function GET() {
  await connectToDB();
  const hero = await Hero.findOne(); // Get the single Hero document
  return NextResponse.json(hero || {});
}

export async function PUT(req: Request) {
  await connectToDB();
  const body = await req.json();
  // Update the first document, or create it if it doesn't exist (upsert)
  const updatedHero = await Hero.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json(updatedHero);
}