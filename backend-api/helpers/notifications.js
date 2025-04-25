// const { sendNotificationToCustomerWeb } = require('./firebase-web-notifications');

const sendNotification = async (userId, title, body, data = {}) => {
  try {
    // TODO: Implement actual notification logic here
    // This could involve Firebase Cloud Messaging, WebSockets, etc.
    console.log('Sending notification:', {
      userId,
      title,
      body,
      data
    })
    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

const sendNotificationToRestaurant = async (token, title, body) => {
  // if (!token) return false;

  try {
    console.log('Sending notification to restaurant:', {
      token,
      title,
      body
    });
    
    // const message = {
    //   notification: { title, body },
    //   webpush: {
    //     notification: {
    //       icon: '/restaurant-icon.png',  // Vous pouvez personnaliser l'icône
    //       click_action: `${process.env.CLIENT_URL}/restaurant/orders`  // URL vers la page des commandes du restaurant
    //     }
    //   },
    //   token
    // };

    // await sendNotificationToCustomerWeb(token, title, body);  // Réutilisation de la fonction existante
    return true;
  } catch (error) {
    console.error('Error sending notification to restaurant:', error);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendNotificationToRestaurant
}
