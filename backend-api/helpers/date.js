exports.dateToString = date => {
  return new Date(date).toISOString();
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
