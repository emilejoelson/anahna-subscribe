// models/subcategory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 15
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  parentCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubCategory', subCategorySchema);