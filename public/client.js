socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

state = {
  currentUser: null,
  currentChannel: null,
  isVoiceActive: false,
  audioContext: null,
  mediaStreamSource: null,
  scriptNode: null,
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

voiceToggle.addEventListener("click", () => {
  if (state.currentUser.isMuted) return;
  state.isVoiceActive = !state.isVoiceActive;

  if (state.isVoiceActive) {
    startStreaming();
    voiceToggle.textContent = "Stop Voice";
    voiceToggle.classList.add("active");
  } else {
    stopStreaming();
    voiceToggle.textContent = "Start Voice";
    voiceToggle.classList.remove("active");
  }
});

socket.on("user-created", handleUserCreated);
socket.on("channel-created", handleChannelCreated);
socket.on("user-joined", handleUserJoined);
socket.on("user-left", handleUserLeft);
socket.on("mute-toggle", handleMuteToggle);
function handleMuteToggle(data) {
  const { user } = data;
  if (state.currentUser.id == user.id) {
    state.currentUser.isMuted = user.isMuted;
  }
}
socket.on("voice", (data, userId) => {
  const elements = document.getElementsByClassName("user-tile");

  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove("speaking");
  }
  document.getElementById(userId).classList.add("speaking");
  if (state.currentUser.id == userId) {
    return;
  }
  var audioContext1 = new (window.AudioContext || window.webkitAudioContext)();

  const typedArray = new Float32Array(data);

  const audioBuffer = audioContext1.createBuffer(
    1,
    typedArray.length,
    audioContext1.sampleRate
  );

  const channelData = audioBuffer.getChannelData(0);

  channelData.set(typedArray);

  const audioBufferSource = audioContext1.createBufferSource();
  audioBufferSource.buffer = audioBuffer;
  audioBufferSource.connect(audioContext1.destination);

  audioBufferSource.start();
  document.getElementById(userId).classList.remove("speaking");
});

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
    li.addEventListener("click", () =>
      socket.emit("join-channel", channel.id, state.currentUser)
    );
    channelsList.appendChild(li);
  });
}
function handleChannelCreated(data) {
  const { channels } = data;
  channelsList.innerHTML = "";
  channels.forEach((channel) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${channel.name}</span>
      <small>Owner: ${channel.owner.name}</small>
    `;

    li.addEventListener("click", () => {
      socket.emit("join-channel", channel.id, state.currentUser);
    });
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
      <span id ="${user.id}" class="user-tile ${user.isMuted ? "muted" : ""}">
        ${user.name}
      </span>
    `;
      if (
        channel.owner.id == state.currentUser.id &&
        user.id != state.currentUser.id
      ) {
        const muteButton = document.createElement("button");
        muteButton.textContent = "mute";
        muteButton.addEventListener("click", (e) => muteUser(e, user));
        li.appendChild(muteButton);
      }
      channelUsers.appendChild(li);
    });
    state.isVoiceActive = false;
    voiceToggle.textContent = "Start Voice";
    voiceToggle.classList.remove("active");
  }
}
function muteUser(event, user) {
  if (event.target.innerHTML === "mute") {
    event.target.innerHTML = "un-mute";
  } else {
    event.target.innerHTML = "mute";
  }
  socket.emit("toggle-mute", user.id);
}
function handleUserLeft(data) {
  const { user, channel, channels } = data;
  if (!channel) {
    currentChannel.style.display = "none";
    channelCreation.style.display = "block";
    channelsList.innerHTML = "";
    console.log(channels);
    channels.forEach((channel) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <span>${channel.name}</span>
      <small>Owner: ${channel.owner.name}</small>
    `;

      li.addEventListener("click", () => {
        socket.emit("join-channel", channel.id, state.currentUser);
      });
      channelsList.appendChild(li);
    });
    return;
  } else if (user.id == state.currentUser.id) {
    currentChannel.style.display = "none";
    channelCreation.style.display = "block";
    state.currentChannel = null;
  } else {
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
}

async function setupAudioStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    state.audioContext.latencyHint = "interactive";
    state.mediaStreamSource =
      state.audioContext.createMediaStreamSource(stream);
  } catch (error) {
    console.error("Error accessing microphone:", error);
    state.isVoiceActive = false;
    voiceToggle.disabled = true;
  }
}

function startStreaming() {
  if (!state.mediaStreamSource) return;

  const bufferSize = 4096;
  state.scriptNode = state.audioContext.createScriptProcessor(bufferSize, 1, 1);

  state.scriptNode.onaudioprocess = function (audioProcessingEvent) {
    if (!state.isVoiceActive || state.currentUser.isMuted) return;

    const inputBuffer = audioProcessingEvent.inputBuffer;
    const audioData = inputBuffer.getChannelData(0);
    socket.emit(
      "audio",
      audioData,
      state.currentChannel.id,
      state.currentUser.id
    );
  };

  state.mediaStreamSource.connect(state.scriptNode);
  state.scriptNode.connect(state.audioContext.destination);
}

function stopStreaming() {
  if (state.scriptNode) {
    state.scriptNode.disconnect();
    state.mediaStreamSource.disconnect();
    state.scriptNode = null;
  }
}

window.onload = function () {
  setupAudioStream();
};
