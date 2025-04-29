const admin = require('firebase-admin');

const initializeFirebase = (config) => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

const sendNotificationToCustomerWeb = async (token, title, body) => {
  if (!token) return false;
  
  try {
    const message = {
      notification: { title, body },
      webpush: {
        notification: {
          icon: '/icon.png',
          click_action: `${process.env.CLIENT_URL}/orders`
        }
      },
      token
    };

    await admin.messaging().send(message);
    return true;
  } catch (error) {
    console.error('Error sending web notification:', error);
    return false;
  }
};

module.exports = {
  initializeFirebase,
  sendNotificationToCustomerWeb
};
