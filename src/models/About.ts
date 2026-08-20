import mongoose, { Schema, model, models } from "mongoose";

const AboutSchema = new Schema(
  {
    title: { type: String },
    bio: { type: String },
    location: { type: String },
    availability: { type: String },
    skills: { type: [String], default: [] },
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
      }
    ],
    experience: [
      {
        role: { type: String },
        company: { type: String },
        duration: { type: String },
        description: { type: String },
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
