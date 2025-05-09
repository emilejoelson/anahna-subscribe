const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlotSchema = new Schema({
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }    
}, { _id: false });

const WorkDaySchema = new Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  enabled: { type: Boolean, default: false },
  slots: [SlotSchema]
}, { _id: false });

const RiderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    assigned: {
      type: Boolean,
      default: false,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    bussinessDetails: {
      bankName: {
        type: String,
      },
      accountName: {
        type: String,
      },
      accountCode: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      bussinessRegNo: {
        type: String,
      },
      companyRegNo: {
        type: String,
      },
      taxRate: {
        type: Number,
      },
    },
    licenseDetails: {
      number: {
        type: String,
      },
      expiryDate: {
        type: Date,
      },
      image: {
        type: String,
      },
    },
    vehicleDetails: {
      number: {
        type: String,
      },
      image: {
        type: String,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0.0, 0.0]
      }
    },
    currentWalletAmount: {
      type: Number,
      default: 0
    },
    totalWalletAmount: {
      type: Number,
      default: 0
    },
    withdrawnWalletAmount: {
      type: Number,
      default: 0
    },
    accountNumber: String,
    email: String,
    image: String,
    isActive: Boolean,
    timeZone: String,
    workSchedule: [WorkDaySchema]
  },
  {
    timestamps: true,
  }
);

RiderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Rider', RiderSchema);