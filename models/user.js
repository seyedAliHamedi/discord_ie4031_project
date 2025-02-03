const { v4: uuidv4 } = require("uuid");

class User {
  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.currentChannel = null;
    this.isSpeaking = false;
  }

  setChannel(channel) {
    this.currentChannel = channel;
  }

  clearChannel() {
    this.currentChannel = null;
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
  }
}

module.exports = User;
const { v4: uuidv4 } = require("uuid");

class User {
  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.currentChannel = null;
    this.isSpeaking = false;
  }

  setChannel(channel) {
    this.currentChannel = channel;
  }

  clearChannel() {
    this.currentChannel = null;
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
  }
}

module.exports = User;
