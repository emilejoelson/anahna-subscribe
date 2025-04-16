const mongoose = require('mongoose');
const { BANNER_STATUS, BANNER_ACTIONS } = require('../helpers/enum');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: Object.values(BANNER_ACTIONS),
    default: BANNER_ACTIONS.NONE
  },
  actionId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'actionModel'
  },
  actionModel: {
    type: String,
    enum: ['Restaurant', 'Cuisine'],
    required: function() {
      return this.action !== BANNER_ACTIONS.NONE && this.action !== BANNER_ACTIONS.LINK;
    }
  },
  link: {
    type: String,
    required: function() {
      return this.action === BANNER_ACTIONS.LINK;
    }
  },
  status: {
    type: String,
    enum: Object.values(BANNER_STATUS),
    default: BANNER_STATUS.ACTIVE
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
