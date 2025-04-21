const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

//Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name")
      .populate("doctor", "name");
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//Create an appointment
exports.createAppointment = async (req, res) => {
  const { patient, doctor, date, time, status } = req.body;

  try {
    // Check if patient exists
    const pat = await Patient.findById(patient);
    if (!pat) {
      return res.status(400).json({ error: "Patient not found" });
    }

    // Check if doctor exists
    const doc = await Doctor.findById(doctor);
    if (!doc) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      date,
      time,
      status,
    });

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//Update an appointment
exports.updateAppointment = async (req, res) => {
  const { patient, doctor, date, time, status } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if new patient exists if being updated
    if (patient) {
      const pat = await Patient.findById(patient);
      if (!pat) {
        return res.status(400).json({ error: "Patient not found" });
      }
    }

    // Check if new doctor exists if being updated
    if (doctor) {
      const doc = await Doctor.findById(doctor);
      if (!doc) {
        return res.status(400).json({ error: "Doctor not found" });
      }
    }

    appointment.patient = patient || appointment.patient;
    appointment.doctor = doctor || appointment.doctor;
    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    appointment.status = status || appointment.status;

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Use deleteOne() instead of remove()
    await Appointment.deleteOne({ _id: req.params.id });

    res.json({
      message: "Appointment deleted successfully",
      deletedCount: 1,
    });
  } catch (err) {
    console.error("Appointment deletion error:", err);
    res.status(500).json({
      error: "Failed to delete appointment",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
