const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tippingSchema = new Schema(
  {
    tipVariations: {
      type: [Number],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tipping", tippingSchema);
