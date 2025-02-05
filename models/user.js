const { v4: uuidv4 } = require("uuid");

class User {
  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.currentChannel = null;
    this.isSpeaking = false;
    this.isMuted = false;
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
  isMuted() {
    return this.isMuted;
  }
  muteUser() {
    this.isMuted = true;
  }
  unmuteUser() {
    this.isMuted = false;
  }
}

module.exports = User;
