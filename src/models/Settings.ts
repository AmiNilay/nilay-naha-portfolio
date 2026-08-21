import mongoose, { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema(
  {
    // Blog Page
    blogHeader: { type: String, default: "Thoughts & Insights" },
    blogHeaderFont: { type: String, default: "Story Script" },
    blogSubheader: { type: String, default: "Tutorials, tech deep-dives, and updates on my journey in AI & Web Dev." },
    blogSubheaderFont: { type: String, default: "Bitcount Prop Single" },

    // Projects Page
    projectsHeader: { type: String, default: "My Projects" },
    projectsHeaderFont: { type: String, default: "Inter" },
    projectsSubheader: { type: String, default: "A collection of my recent work, ranging from full-stack applications to AI models and developer tools." },
    projectsSubheaderFont: { type: String, default: "Inter" },

    // About Page
    aboutHeader: { type: String, default: "About Me" },
    aboutHeaderFont: { type: String, default: "Inter" },
    aboutSubheader: { type: String, default: "" },
    aboutSubheaderFont: { type: String, default: "Inter" },
    aboutBioFont: { type: String, default: "Inter" },
    aboutLocationFont: { type: String, default: "Inter" },
    aboutAvailabilityFont: { type: String, default: "Inter" },
    aboutSkillsFont: { type: String, default: "Inter" },
    aboutEducationFont: { type: String, default: "Inter" },
    aboutExperienceFont: { type: String, default: "Inter" },
    aboutCertificationFont: { type: String, default: "Inter" },

    // Contact Page
    contactHeader: { type: String, default: "Get in Touch" },
    contactHeaderFont: { type: String, default: "Inter" },
    contactSubheader: { type: String, default: "Have a question or want to work together? Drop me a message!" },
    contactSubheaderFont: { type: String, default: "Inter" },
    contactToastFont: { type: String, default: "Inter" },
    contactLocationFont: { type: String, default: "Inter" },
    contactAvailabilityFont: { type: String, default: "Inter" },
    contactCardsFont: { type: String, default: "Inter" },
    contactFormHeadingFont: { type: String, default: "Inter" },
    contactFormLabelFont: { type: String, default: "Inter" },
    contactFormFieldFont: { type: String, default: "Inter" },
    contactFormStatusFont: { type: String, default: "Inter" },
    contactFormButtonFont: { type: String, default: "Inter" },

    // Home Page
    homeBadgeFont: { type: String, default: "Inter" },
    homeHeadlineFont: { type: String, default: "Inter" },
    homeSubtitleFont: { type: String, default: "Inter" },
    homeActionFont: { type: String, default: "Inter" },
    homeSocialFont: { type: String, default: "Inter" },
    homeStatsValueFont: { type: String, default: "Inter" },
    homeStatsLabelFont: { type: String, default: "Inter" },
    homeLastUpdatedFont: { type: String, default: "Inter" },
    homeTechStackFont: { type: String, default: "Inter" },
  },
  { timestamps: true }
);

const Settings = models.Settings || model("Settings", SettingsSchema);
export default Settings;

