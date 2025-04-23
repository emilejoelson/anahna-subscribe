const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    plainPassword: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    userType: {
      type: String,
      default: 'Staff',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Staff', StaffSchema);