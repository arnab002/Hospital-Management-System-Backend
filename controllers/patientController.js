const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

//Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("doctor", "name");
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//Create a patient
exports.createPatient = async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    contactInfo,
    email,
    address,
    bloodGroup,
    medicalHistory,
    allergies,
    doctor,
  } = req.body;

  try {
    // Validate required fields
    if (!name || !dateOfBirth || !gender) {
      return res
        .status(400)
        .json({ error: "Name, date of birth, and gender are required" });
    }

    // Check if doctor exists if provided
    if (doctor) {
      const doc = await Doctor.findById(doctor);
      if (!doc) {
        return res.status(400).json({ error: "Doctor not found" });
      }
    }

    // Create patient with all fields
    const patient = new Patient({
      name,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      contactInfo,
      email,
      address,
      bloodGroup,
      medicalHistory,
      allergies,
      doctor,
    });

    await patient.save();

    // If doctor is assigned, add patient to doctor's list
    if (doctor) {
      await Doctor.findByIdAndUpdate(doctor, {
        $addToSet: { patients: patient._id },
      });
    }

    res.status(201).json(patient);
  } catch (err) {
    console.error("Error creating patient:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ error: messages });
    }

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Patient with this email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

//Update a patient
exports.updatePatient = async (req, res) => {
  const { name, dateOfBirth, contactInfo, email, medicalHistory, doctor } =
    req.body;

  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if new doctor exists if being updated
    if (doctor) {
      const doc = await Doctor.findById(doctor);
      if (!doc) {
        return res.status(400).json({ error: "Doctor not found" });
      }
    }

    // Remove patient from old doctor's list if changing doctors
    if (doctor && patient.doctor && patient.doctor.toString() !== doctor) {
      await Doctor.findByIdAndUpdate(patient.doctor, {
        $pull: { patients: patient._id },
      });
    }

    patient.name = name || patient.name;
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    patient.contactInfo = contactInfo || patient.contactInfo;
    patient.email = email || patient.email;
    patient.medicalHistory = medicalHistory || patient.medicalHistory;
    patient.doctor = doctor || patient.doctor;

    await patient.save();

    // Add patient to new doctor's list if doctor was changed
    if (doctor && (!patient.doctor || patient.doctor.toString() !== doctor)) {
      await Doctor.findByIdAndUpdate(doctor, {
        $addToSet: { patients: patient._id },
      });
    }

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Patient already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

//Delete a patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Remove patient from doctor's list if assigned
    if (patient.doctor) {
      await Doctor.findByIdAndUpdate(patient.doctor, {
        $pull: { patients: patient._id },
      });
    }

    // Use deleteOne() instead of remove()
    await Patient.deleteOne({ _id: req.params.id });

    res.json({
      message: "Patient deleted successfully",
      deletedCount: 1,
    });
  } catch (err) {
    console.error("Patient deletion error:", err);
    res.status(500).json({
      error: "Failed to delete patient",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
