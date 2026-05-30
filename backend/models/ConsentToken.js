import mongoose from 'mongoose';

const consentTokenSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  allowedFields: [{ type: String }], // Array of MedicalRecord ObjectIds or specific categories
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto expire index
consentTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ConsentToken', consentTokenSchema);
