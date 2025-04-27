const { sendNotificationToCustomerWeb } = require('./firebase-web-notifications');
const User = require('../models/user');
const Rider = require('../models/rider');

const sendNotification = async (userId, orderData, message = '', type = 'order') => {
  try {
    console.log('Sending notification:', {
      userId,
      orderData,
      message,
      type
    });
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

const sendNotificationToUser = async (userId, orderData) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.notificationToken) return false;

    const title = `Order ${orderData.orderId}`;
    const body = `Your order status has been updated to: ${orderData.orderStatus}`;

    await sendNotificationToCustomerWeb(user.notificationToken, title, body);
    return true;
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return false;
  }
};

const sendNotificationToRider = async (riderId, orderData) => {
  try {
    const rider = await Rider.findById(riderId);
    if (!rider || !rider.notificationToken) return false;

    const title = `Order ${orderData.orderId}`;
    const body = `Order status updated to: ${orderData.orderStatus}`;

    await sendNotificationToCustomerWeb(rider.notificationToken, title, body);
    return true;
  } catch (error) {
    console.error('Error sending notification to rider:', error);
    return false;
  }
};

const sendNotificationToZoneRiders = async (zoneId, orderData) => {
  try {
    const riders = await Rider.find({ zone: zoneId, available: true });
    const notifications = riders.map(rider => {
      if (!rider.notificationToken) return null;
      
      const title = `New Order Available`;
      const body = `Order ${orderData.orderId} is available for pickup`;
      
      return sendNotificationToCustomerWeb(rider.notificationToken, title, body);
    });

    await Promise.all(notifications.filter(Boolean));
    return true;
  } catch (error) {
    console.error('Error sending notifications to zone riders:', error);
    return false;
  }
};

const sendNotificationToRestaurant = async (token, title, body) => {
  if (!token) return false;

  try {
    await sendNotificationToCustomerWeb(token, title, body);
    return true;
  } catch (error) {
    console.error('Error sending notification to restaurant:', error);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendNotificationToUser,
  sendNotificationToRider,
  sendNotificationToZoneRiders,
  sendNotificationToRestaurant
};
