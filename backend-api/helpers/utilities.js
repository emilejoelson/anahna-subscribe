const { Expo } = require('expo-server-sdk');
const User = require('../models/user'); 

const expo = new Expo();

const sendNotificationMobile = async (messages) => {
  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }
    
    return tickets;
  } catch (error) {
    console.error('Error in sendNotificationMobile:', error);
    throw error;
  }
};

const sendNotification = async (orderId) => {
  try {
    console.log('Sending notification for order:', orderId);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

const checkPhoneAlreadyUsed = async (currentUserId, phone) => {
  const existingUser = await User.findOne({ phone, _id: { $ne: currentUserId } })
  return !!existingUser // true si trouvé, false sinon
}

module.exports = {
  sendNotification,
  calculateDistance,
  sendNotificationMobile,
  checkPhoneAlreadyUsed
};
