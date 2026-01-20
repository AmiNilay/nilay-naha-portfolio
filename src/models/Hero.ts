import mongoose, { Schema, model, models } from "mongoose";

const HeroSchema = new Schema(
  {
    badge: String,          // Top Badge (e.g., Software Developer)
    title: String,          // Main Headline
    subtitle: String,       // Description
    profilePic: String,     // GitHub Image URL
    resumeUrl: String,      // GitHub PDF URL
    socialGithub: String,   // GitHub Profile Link
    socialLinkedin: String, // LinkedIn Profile Link
  },
  { timestamps: true }
);

const Hero = models.Hero || model("Hero", HeroSchema);
export default Hero;