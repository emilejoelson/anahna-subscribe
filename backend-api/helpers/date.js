exports.dateToString = date => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch (err) {
    console.error('Error formatting date:', err);
    return null;
  }
};

exports.addHours = (date, hours) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

exports.addMinutes = (date, minutes) => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

exports.isDateValid = date => {
  return date instanceof Date && !isNaN(date);
};

exports.formatDate = date => {
  return new Date(date).toLocaleDateString();
};

exports.formatOrderDate = order => {
  if (!order) return null;
  
  const dateFields = [
    'createdAt',
    'updatedAt',
    'acceptedAt',
    'pickedAt',
    'deliveredAt',
    'cancelledAt',
    'completionTime'
  ];

  dateFields.forEach(field => {
    if (order[field]) {
      order[field] = exports.dateToString(order[field]);
    }
  });

  return order;
};
