const { collection, addDoc, getDocs, doc, updateDoc } = require("firebase/firestore");
const { getDb } = require("../config/firebase");

const getNotificationCollection = () => collection(getDb(), "notifications");
const getWebNotificationCollection = () => collection(getDb(), "webNotifications");

module.exports = {
  Query: {
    notifications: async () => {
      const snapshot = await getDocs(getNotificationCollection());
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtDate = data.createdAt ? data.createdAt.toDate() : null;
        const formattedCreatedAt = createdAtDate ? createdAtDate.toLocaleDateString('en-GB') : null;
        return {
          id: doc.id,
          ...data,
          createdAt: formattedCreatedAt,
        };
      });
    },
    webNotifications: async () => {
      const snapshot = await getDocs(getWebNotificationCollection());
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        };
      });
    },
  },
  Mutation: {
    sendNotificationUser: async (
      _,
      { notificationTitle, notificationBody }
    ) => {
      try {
        await addDoc(getNotificationCollection(), {
          title: notificationTitle,
          body: notificationBody,
          createdAt: new Date()
        });
        return true;
      } catch (error) {
        console.error("Error sending notification:", error);
        return false;
      }
    },
    markWebNotificationsAsRead: async () => {
      const snapshot = await getDocs(getWebNotificationCollection());
      const updatedNotifications = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const docRef = doc(getDb(), "webNotifications", docSnap.id);
        const updatedData = { ...data, read: true };
        if (!data.read) {
          await updateDoc(docRef, { read: true });
        }
        updatedNotifications.push({
          _id: docSnap.id,
          ...updatedData,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        });
      }
      return updatedNotifications;
    },
  },
};