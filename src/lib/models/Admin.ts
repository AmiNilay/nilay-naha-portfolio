import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed in a real scenario
}, { timestamps: true });

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);