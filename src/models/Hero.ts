import mongoose, { Schema, model, models } from "mongoose";

const HeroSchema = new Schema(
  {
    tagline: String,     // The Green Text
    headline: String,    // The Main Big Text (supports HTML)
    description: String, // The Paragraph
    image: String,       // GitHub Image URL
  },
  { timestamps: true }
);

const Hero = models.Hero || model("Hero", HeroSchema);
export default Hero;