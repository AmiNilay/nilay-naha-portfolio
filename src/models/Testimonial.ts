import { Schema, model, models } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    relationship: { type: String, default: "", trim: true }, // e.g. "Managed Nilay at Acme"
    quote: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);

export default Testimonial;
