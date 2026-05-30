import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { type: String, required: true, enum: ['Report', 'Prescription', 'Allergy', 'Observation'] },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  provider: { type: String }, // Doctor or hospital name
  details: { type: mongoose.Schema.Types.Mixed }, // Flexible JSON mimicking FHIR payload
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
