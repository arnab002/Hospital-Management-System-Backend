const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: [true, 'Prescription must belong to a patient']
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: [true, 'Prescription must have a prescribing doctor']
  },
  medication: {
    type: String,
    required: [true, 'Please specify medication name'],
    trim: true,
    maxlength: [100, 'Medication name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Topical', 'Other'],
    required: [true, 'Please specify medication type']
  },
  dosage: {
    type: String,
    required: [true, 'Please specify dosage'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Please specify frequency'],
    enum: [
      'Once daily', 
      'Twice daily', 
      'Three times daily', 
      'Four times daily',
      'As needed',
      'Other'
    ]
  },
  duration: {
    type: String,
    required: [true, 'Please specify duration'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date'],
    default: Date.now,
    validate: {
      validator: function(value) {
        return value >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isRefill: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Virtual population
PrescriptionSchema.virtual('patientName', {
  ref: 'Patient',
  localField: 'patient',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

PrescriptionSchema.virtual('doctorName', {
  ref: 'Doctor',
  localField: 'doctor',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

// Indexes for better query performance
PrescriptionSchema.index({ patient: 1 });
PrescriptionSchema.index({ doctor: 1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ startDate: 1 });
PrescriptionSchema.index({ endDate: 1 });

// Pre-save hook to calculate endDate if duration is provided
PrescriptionSchema.pre('save', function(next) {
  if (this.duration && this.startDate && !this.endDate) {
    const durationParts = this.duration.match(/(\d+)\s*(day|week|month|year)/i);
    if (durationParts) {
      const amount = parseInt(durationParts[1]);
      const unit = durationParts[2].toLowerCase();
      const endDate = new Date(this.startDate);
      
      switch(unit) {
        case 'day':
          endDate.setDate(endDate.getDate() + amount);
          break;
        case 'week':
          endDate.setDate(endDate.getDate() + (amount * 7));
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + amount);
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + amount);
          break;
      }
      
      this.endDate = endDate;
    }
  }
  next();
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);