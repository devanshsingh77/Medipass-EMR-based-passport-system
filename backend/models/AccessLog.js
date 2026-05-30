import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Doctor
  tokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsentToken' },
  accessedData: [{ type: String }], // What was viewed
  ipAddress: { type: String },
}, { timestamps: true });

export default mongoose.model('AccessLog', accessLogSchema);
