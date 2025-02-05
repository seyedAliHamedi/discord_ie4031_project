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
const usernamePlaceholder = document.getElementById("username-placeholder");

document.getElementById("create-user").addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) socket.emit("create-user", username);
});

document.getElementById("create-channel").addEventListener("click", () => {
  const channelName = channelNameInput.value.trim();
  if (channelName)
    socket.emit("create-channel", channelName, state.currentUser);
});

leaveChannel.addEventListener("click", () => {
  socket.emit("leave-channel", state.currentChannel.id, state.currentUser.id);
});

voiceToggle.addEventListener("click", () => {});

socket.on("user-created", handleUserCreated);
socket.on("channel-created", handleChannelCreated);
socket.on("user-joined", handleUserJoined);
socket.on("user-left", handleUserLeft);

// socket handlers
function handleUserCreated(data) {
  const { user, channels } = data;
  state.currentUser = user;
  userCreation.style.display = "none";
  channelCreation.style.display = "block";
  usernamePlaceholder.innerHTML = "Welcome: " + user.name;

  channelsList.innerHTML = "";
  console.log("1", channels);
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
function handleChannelCreated(data) {
  const { channels } = data;
  channelsList.innerHTML = "";
  console.log(channels);
  channels.forEach((channel) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${channel.name}</span>
      <small>Owner: ${channel.owner.name}</small>
    `;
    li.addEventListener("click", () =>
      socket.emit("join-channel", channel.id, state.currentUser)
    );
    channelsList.appendChild(li);
  });
}
function handleUserJoined(data) {
  const { channel } = data;
  state.currentChannel = channel;
  channelCreation.style.display = "none";
  currentChannel.style.display = "block";
  channelTitle.textContent = channel.name;
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
      if (
        channel.owner.id == state.currentUser.id &&
        user.id != state.currentUser.id
      ) {
        const muteButton = document.createElement("button");
        muteButton.textContent = "Mute";
        muteButton.onclick = () => console.log("User muted");
        li.appendChild(muteButton);
      }
      channelUsers.appendChild(li);
    });
  }
}
function handleUserLeft(data) {
  const { user, channel } = data;
  if (user.id == state.currentUser.id) {
    currentChannel.style.display = "none";
    channelCreation.style.display = "block";
  }
  channel.users.forEach((user) => {
    channelTitle.textContent = channel.name;
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
        if (
          channel.owner.id == state.currentUser.id &&
          user.id != state.currentUser.id
        ) {
          const muteButton = document.createElement("button");
          muteButton.textContent = "Mute";
          muteButton.onclick = () => console.log("User muted");
          li.appendChild(muteButton);
        }
        channelUsers.appendChild(li);
      });
    }
  });
}
