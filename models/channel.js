const { v4: uuidv4 } = require("uuid");

class Channel {
  constructor(name, owner) {
    this.id = uuidv4();
    this.name = name;
    this.owner = owner;
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
    return user;
  }

  removeUser(user) {
    this.users.splice(this.users.indexOf(user), 1);
  }

  getUsers() {
    return Array.from(this.users.values());
  }
}

module.exports = Channel;
