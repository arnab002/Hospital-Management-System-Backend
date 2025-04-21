const Doctor = require('../models/Doctor');
const Department = require('../models/Department');

//Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('department', 'name');
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//Create a doctor
exports.createDoctor = async (req, res) => {
  const { name, specialty, email, phone, department, availability } = req.body;

  try {
    // Check if department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ error: 'Department not found' });
    }

    const doctor = new Doctor({
      name,
      specialty,
      email,
      phone,
      department,
      availability,
    });

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

//Update a doctor
exports.updateDoctor = async (req, res) => {
  const { name, specialty, email, phone, department, availability } = req.body;

  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if department exists if being updated
    if (department) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(400).json({ error: 'Department not found' });
      }
    }

    doctor.name = name || doctor.name;
    doctor.specialty = specialty || doctor.specialty;
    doctor.email = email || doctor.email;
    doctor.phone = phone || doctor.phone;
    doctor.department = department || doctor.department;
    doctor.availability = availability || doctor.availability;

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

//Delete a doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await Doctor.deleteOne({ _id: req.params.id });
    
    res.json({ 
      message: 'Doctor removed successfully',
      deletedCount: 1
    });
  } catch (err) {
    console.error('Doctor deletion error:', err);
    res.status(500).json({ 
      error: 'Failed to delete doctor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};