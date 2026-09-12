import mongoose, { Schema, model, models } from "mongoose";

const AboutSchema = new Schema(
  {
    title: { type: String },
    bio: { type: String },
    location: { type: String },
    availability: { type: String },
    skills: { type: [String], default: [] },
    image: { type: String },
    gDriveProfilePic: { type: String },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
        relevantCoursework: { type: [String], default: [] },
        cgpa: { type: String },
        percentage: { type: String },
      },
    ],
    experience: [
      {
        jobTitle: { type: String },
        organization: { type: String },
        companyLogo: { type: String },
        location: { type: String },
        locationType: {
          type: String,
          enum: ["", "On-site", "Remote", "Hybrid"],
          default: "",
        },
        employmentType: {
          type: String,
          enum: [
            "",
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Freelance",
            "Self-employed",
          ],
          default: "",
        },
        currentlyWorking: { type: Boolean, default: false },
        startMonth: { type: String },
        startYear: { type: String },
        endMonth: { type: String },
        endYear: { type: String },
        description: { type: String },
        highlights: { type: [String], default: [] },
        skills: { type: [String], default: [] },
        media: [
          {
            name: { type: String },
            url: { type: String },
          },
        ],
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        date: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const About = models.About || model("About", AboutSchema);
export default About;