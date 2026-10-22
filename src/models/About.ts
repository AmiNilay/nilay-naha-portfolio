import mongoose, { Schema, model, models } from "mongoose";

const AboutSchema = new Schema(
  {
    title: { type: String },
    bio: { type: String },
    location: { type: String },
    availability: { type: String },
    skills: { type: [String], default: [] },
    aiWorkflow: { type: String, default: "" }, // Markdown for the /ai "How I use AI" page
    image: { type: String }, // Old image field
    gDriveProfilePic: { type: String }, // ✅ New G-Drive field
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
        relevantCoursework: { type: [String], default: [] },
        cgpa: { type: String },
        percentage: { type: String },
        institutionLinkedin: { type: String, default: "" },
        location: { type: String, default: "" },
        image: { type: String, default: "" }, // College photo (URL or Google Drive link)
      }
    ],
    experience: [
      {
        role: { type: String },
        company: { type: String },
        duration: { type: String },
        description: { type: String },
        companyLogo: { type: String, default: "" },
        companyLinkedin: { type: String, default: "" },
      }
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        date: { type: String },
        url: { type: String },
      }
    ]
  },
  { timestamps: true }
);

const About = models.About || model("About", AboutSchema);
export default About;
