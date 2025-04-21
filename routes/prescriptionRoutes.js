const express = require("express");
const Prescription = require("../models/Prescription");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Get all prescriptions for a patient (Doctor & Patient only)
router.get("/:patientId", authMiddleware, async (req, res) => {
  if (req.user.role === "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId }).populate("doctor");
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new prescription (Doctor only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ message: "Access denied" });

  try {
    const newPrescription = new Prescription(req.body);
    await newPrescription.save();
    res.status(201).json(newPrescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
