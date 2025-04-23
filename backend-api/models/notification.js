class Notification {
    constructor(id, body, title, createdAt) {
      this.id = id || null;
      this.body = body;
      this.title = title;
      this.createdAt = createdAt || new Date();
    }
  }
  
  class WebNotification {
    constructor(_id, body, navigateTo, read, createdAt) {
      this._id = _id || null;
      this.body = body;
      this.navigateTo = navigateTo;
      this.read = read || false;
      this.createdAt = createdAt || new Date();
    }
  }
  
  module.exports = { Notification, WebNotification };