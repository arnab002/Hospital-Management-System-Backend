const Department = require('../models/Department');
const Doctor = require('../models/Doctor')

//Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//Create a department
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const department = new Department({
      name,
      description,
    });

    await department.save();
    res.json(department);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Department already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

//Update a department
exports.updateDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    department.name = name || department.name;
    department.description = description || department.description;

    await department.save();
    res.json(department);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Department already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

//Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    await Doctor.updateMany(
      { department: req.params.id },
      { $set: { department: null } }
    );

    // Then delete the department
    const result = await Department.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      message: 'Department deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to delete department',
      details: err.message
    });
  }
};
