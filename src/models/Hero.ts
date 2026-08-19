import mongoose, { Schema, model, models } from "mongoose";

const HeroSchema = new Schema(
  {
    badge: String,
    title: String,
    subtitle: String,
    profilePic: String,
    resumeUrl: String,
    gDriveProfilePic: String,
    gDriveResume: String,
    badgeText: String,
    showAvailability: { type: Boolean, default: true },
    line1Bold: String,
    line1Accent: String,
    line2Bold: String,
    line2Accent: String,
    socialGithub: String,
    socialLinkedin: String,
    socialTwitter: String,
    socialEmail: String,
    techStack: String,
    stat1Value: String,
    stat1Label: String,
    stat2Value: String,
    stat2Label: String,
    stat3Value: String,
    stat3Label: String,
    portfolioLastUpdated: String,
  },
  { timestamps: true }
);

const Hero = models.Hero || model("Hero", HeroSchema);
export default Hero;
