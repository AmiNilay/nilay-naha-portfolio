import mongoose, { Schema, model, models } from "mongoose";

const AboutSchema = new Schema(
  {
    title: { type: String },
    bio: { type: String },
    skills: { type: [String], default: [] },
    image: { type: String },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
        relevantCoursework: { type: [String], default: [] },
        cgpa: { type: String },
        percentage: { type: String },
      }
    ]
  },
  { timestamps: true }
);

const About = models.About || model("About", AboutSchema);
export default About;