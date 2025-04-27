const BANNER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}

const WITHDRAW_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  TRANSFERRED: 'TRANSFERRED'
}

const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  ASSIGNED: 'ASSIGNED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

const SHOP_TYPE = {
  RESTAURANT: 'RESTAURANT',
  GROCERY: 'GROCERY',
  PHARMACY: 'PHARMACY'
};

const BANNER_ACTIONS = {
  CUISINE: 'CUISINE',
  RESTAURANT: 'RESTAURANT',
  LINK: 'LINK',
  NONE: 'NONE'
};

const RIDER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  ON_DELIVERY: 'ON_DELIVERY'
};

const order_status = [
  'PENDING',
  'ACCEPTED',
  'ASSIGNED',
  'PICKED',
  'DELIVERED',
  'CANCELLED',
  'COMPLETED'
];

const payment_status = [
  'PENDING',
  'PAID',
  'FAILED'
];

const months = [
  'January', 
  'February', 
  'March', 
  'April', 
  'May', 
  'June', 
  'July', 
  'August', 
  'September', 
  'October', 
  'November', 
  'December'
];

module.exports = {
  BANNER_STATUS,
  WITHDRAW_REQUEST_STATUS,
  ORDER_STATUS,
  SHOP_TYPE,
  BANNER_ACTIONS,
  RIDER_STATUS,
  order_status,
  payment_status,
  months
}
