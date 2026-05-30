import MedicalRecord from '../models/MedicalRecord.js';

// @desc    Get all medical records for logged in patient
// @route   GET /api/records
export const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed some fake records (For demo purposes)
// @route   POST /api/records/seed
export const seedRecords = async (req, res) => {
  try {
    await MedicalRecord.deleteMany({ patientId: req.user._id });

    const records = [
      {
        patientId: req.user._id,
        resourceType: 'Report',
        title: 'Complete Blood Count (CBC)',
        provider: 'City General Hospital',
        details: { hb: '14 g/dL', wbc: '6.5 k/uL', platelets: '250 k/uL' }
      },
      {
        patientId: req.user._id,
        resourceType: 'Prescription',
        title: 'Antibiotics for Strep Throat',
        provider: 'Dr. Smith',
        details: { medication: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily for 7 days' }
      },
      {
        patientId: req.user._id,
        resourceType: 'Allergy',
        title: 'Peanut Allergy',
        provider: 'Allergy Clinic',
        details: { severity: 'High', reaction: 'Anaphylaxis' }
      }
    ];

    const createdRecords = await MedicalRecord.insertMany(records);
    res.status(201).json(createdRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
