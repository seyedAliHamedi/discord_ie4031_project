const { v4: uuidv4 } = require("uuid");

class Channel {
  constructor(name, owner) {
    this.id = uuidv4();
    this.name = name;
    this.owner = owner;
    this.users = new Map();
    this.mutedUsers = new Set();
  }

  addUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  removeUser(userId) {
    this.users.delete(userId);
    this.mutedUsers.delete(userId);
  }

  muteUser(userId) {
    this.mutedUsers.add(userId);
  }

  unmuteUser(userId) {
    this.mutedUsers.delete(userId);
  }

  isUserMuted(userId) {
    return this.mutedUsers.has(userId);
  }

  getUsers() {
    return Array.from(this.users.values());
  }
}

module.exports = Channel;
