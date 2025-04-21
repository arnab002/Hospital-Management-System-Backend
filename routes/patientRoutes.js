const express = require('express');
const {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(protect, getPatients)
  .post(protect, authorize('admin'), createPatient);

router.route('/:id')
  .put(protect, authorize('admin'), updatePatient)
  .delete(protect, authorize('admin'), deletePatient);

module.exports = router;