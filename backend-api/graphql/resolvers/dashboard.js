const getDashboardOrdersByType = async () => {
  const orderTypes = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'PICKED', label: 'Picked' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];
  return orderTypes;
};

module.exports = {
  getDashboardOrdersByType
};