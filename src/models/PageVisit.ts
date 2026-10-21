import mongoose, { Schema, model, models } from "mongoose";

const PageVisitSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    path: { type: String, required: true },
    // Previous page visited in the same browser session; null marks an entry page.
    referrerPath: { type: String, default: null },
  },
  { timestamps: true }
);

PageVisitSchema.index({ sessionId: 1, createdAt: 1 });
PageVisitSchema.index({ createdAt: 1 });

const PageVisit = models.PageVisit || model("PageVisit", PageVisitSchema);

export default PageVisit;
