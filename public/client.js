socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  state = {
    currentUser: null,
    currentChannel: null,
    isVoiceActive: false,
  };
  
  const userCreation = document.getElementById("user-creation");
  const channelCreation = document.getElementById("channel-creation");
  const currentChannel = document.getElementById("current-channel");
  const usernameInput = document.getElementById("username");
  const channelNameInput = document.getElementById("channel-name");
  const channelsList = document.getElementById("channels-list");
  const channelTitle = document.getElementById("channel-title");
  const channelUsers = document.getElementById("channel-users");
  const voiceToggle = document.getElementById("voice-toggle");
  const leaveChannel = document.getElementById("leave-channel");
  
  userCreation.addEventListener("click", () => {
    const username = this.elements.usernameInput.value.trim();
    if (username) this.socket.emit("create-user", username);
  });
  
  channelCreation.addEventListener("click", () => {
    const channelName = this.elements.channelNameInput.value.trim();
    if (channelName) this.socket.emit("create-channel", channelName);
  });
  
  leaveChannel.addEventListener("click", () => {
    this.socket.emit("leave-channel");
    stopVoice();
  });
  
  voiceToggle.addEventListener("click", () => {
    this.socket.emit("leave-channel");
    //   stopVoice();
  });
  
  function setupSocketEventHandlers() {
    socket.on("user-created", handleUserCreated());
    socket.on("channel-created", handleChannelCreated());
    socket.on("user-joined", handleUserJoined());
    socket.on("user-left", handleUserLeft());
  }
  
  // socket handlers
  function handleUserCreated(user, channels) {
    this.state.currentUser = user;
  
    userCreation.style.display = "none";
    channelCreation.style.display = "block";
  
    this.elements.channelsList.innerHTML = "";
    channels.forEach((channel) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${channel.name}</span>
        <small>Owner: ${channel.owner.name}</small>
      `;
      li.addEventListener("click", () => socket.emit("join-channel", channel.id));
      channelsList.appendChild(li);
    });
  }
  function handleChannelCreated(channel) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span>${channel.name}</span>
        <small>Owner: ${channel.owner.name}</small>
      `;
    li.addEventListener("click", () => socket.emit("join-channel", channel.id));
    channelsList.appendChild(li);
  }
  function handleUserJoined(channel) {
    state.currentChannel = channel;
    elements.channelCreation.style.display = "none";
    elements.currentChannel.style.display = "block";
    elements.channelTitle.textContent = channel.name;
    channelUsers.innerHTML = "";
    if (channel?.users) {
      channel.users.forEach((user) => {
        const li = document.createElement("li");
        li.setAttribute("data-user-id", user.id);
        li.innerHTML = `
        <span class="${user.isSpeaking ? "speaking" : ""} ${
          user.isMuted ? "muted" : ""
        }">
          ${user.name}
        </span>
      `;
  
        this.addMuteButtonIfOwner(li, user);
        this.elements.channelUsers.appendChild(li);
      });
    }
  }
  function handleUserLeft() {
    this.elements.currentChannel.style.display = "none";
    this.elements.channelCreation.style.display = "block";
  }