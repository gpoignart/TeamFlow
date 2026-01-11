class Message {
  constructor({ id, content, senderId, recipientIds = [], teamId, reactions = {}, isPinned = false, mentions = [] }) {
    this.id = id;
    this.content = content;
    this.senderId = senderId;
    this.recipientIds = recipientIds;
    this.teamId = teamId || null;
    this.reactions = reactions; // { userId: emoji }
    this.isPinned = isPinned;
    this.mentions = mentions; // array of userIds mentioned
    this.createdAt = new Date().toLocaleString(); // Actual date
  }
}

module.exports = Message;
