import ConsentToken from '../models/ConsentToken.js';
import MedicalRecord from '../models/MedicalRecord.js';
import AccessLog from '../models/AccessLog.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Generate a consent token (and QR data)
// @route   POST /api/consent/generate
export const generateToken = async (req, res) => {
  const { allowedFields, expiresInMinutes } = req.body;

  try {
    const tokenStr = uuidv4();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const consentToken = await ConsentToken.create({
      patientId: req.user._id,
      token: tokenStr,
      allowedFields,
      expiresAt,
    });

    res.status(201).json({
      token: consentToken.token,
      expiresAt: consentToken.expiresAt,
      allowedFields: consentToken.allowedFields
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Doctor scans QR / enters token to get data
// @route   POST /api/consent/scan
export const scanToken = async (req, res) => {
  const { token } = req.body;

  try {
    const consentToken = await ConsentToken.findOne({ token, isActive: true }).populate('patientId', 'name email phone');

    if (!consentToken) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    if (consentToken.expiresAt < Date.now()) {
      consentToken.isActive = false;
      await consentToken.save();
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Fetch the allowed records
    let records = [];
    if (consentToken.allowedFields.includes('All')) {
      records = await MedicalRecord.find({ patientId: consentToken.patientId._id });
    } else {
      records = await MedicalRecord.find({
        patientId: consentToken.patientId._id,
        _id: { $in: consentToken.allowedFields }
      });
    }

    // Log the access
    await AccessLog.create({
      patientId: consentToken.patientId._id,
      accessedBy: req.user._id,
      tokenId: consentToken._id,
      accessedData: records.map(r => r.title),
      ipAddress: req.ip
    });

    // Create a notification for the patient
    await Notification.create({
      userId: consentToken.patientId._id,
      title: 'Records Accessed',
      message: `Dr. ${req.user.name} just accessed your medical records via Smart Consent QR.`,
      type: 'alert'
    });

    res.json({
      patient: {
        name: consentToken.patientId.name,
        email: consentToken.patientId.email,
        phone: consentToken.patientId.phone,
      },
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke all active tokens for a patient
// @route   POST /api/consent/revoke
export const revokeAllTokens = async (req, res) => {
  try {
    await ConsentToken.updateMany(
      { patientId: req.user._id, isActive: true },
      { isActive: false }
    );
    
    await Notification.create({
      userId: req.user._id,
      title: 'Tokens Revoked',
      message: 'You have successfully revoked all active Smart Consent tokens.',
      type: 'info'
    });

    res.json({ message: 'All active tokens revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get access logs for a patient
// @route   GET /api/consent/logs
export const getAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ patientId: req.user._id })
      .populate('accessedBy', 'name email')
      .sort({ accessedAt: -1 })
      .limit(5);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

