class Message {
  constructor({ id, content, senderId, recipientIds = [], teamId }) {
    this.id = id;
    this.content = content;
    this.senderId = senderId;
    this.recipientIds = recipientIds;
    this.teamId = teamId || null;
    this.createdAt = new Date().toLocaleString(); // Actual date
  }
}

module.exports = Message;
