const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rider', RiderSchema);