const { Server } = require("socket.io");
const User = require("./models/user");
const Channel = require("./models/channel");

class SocketManager {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.channels = [];
    this.users = new Map();
    this.initalizeEvents();
  }

  initalizeEvents() {
    this.io.on("connection", (socket) => {
      console.log("New socket:", socket.id);

      socket.on("create-user", (username) => {
        const user = new User(username);
        console.log("New user:", user.id);
        this.users.set(user.id, user);
        socket.emit("user-created", { user, channels: this.channels });
      });

      socket.on("create-channel", (channelName, user) => {
        const channel = new Channel(channelName, user);
        this.channels.push(channel);
        this.io.emit("channel-created", { channels: this.channels });
      });
      socket.on("audio", (data, channelId, userId) => {
        const channel = this.channels.find((c) => c.id === channelId);
        this.io.to(channelId).emit("voice", data, userId);
      });

      socket.on("join-channel", (channelId, user) => {
        const channel = this.channels.find((c) => c.id === channelId);
        const userObj = this.users.get(user.id);

        channel.addUser(user);
        userObj.setChannel(channel);
        socket.join(channelId);

        this.io.to(channelId).emit("user-joined", { channel });
      });

      socket.on("leave-channel", (channelId, userId) => {
        var channel = this.channels.find((c) => c.id === channelId);
        const user = this.users.get(userId);
        channel.removeUser(user);
        user.clearChannel();
        socket.leave(channelId);
        if (user.id == channel.owner.id) {
          this.channels = this.channels.filter((c) => c.id != channelId);
          channel = null;
        }

        this.io.emit("user-left", { user, channel, channels: this.channels });
      });

      socket.on("toggle-mute", (userId) => {
        const user = this.users.get(userId);
        if (user.isMuted) {
          user.unmuteUser();
        } else {
          user.muteUser();
        }

        this.io.to(user.currentChannel.id).emit("mute-toggle", {
          user: user,
        });
      });
      // WebRTC Signaling Events
      socket.on("offer", (data) => {
        socket.to(data.to).emit("offer", {
          offer: data.offer,
          from: socket.id,
        });
      });

      socket.on("answer", (data) => {
        socket.to(data.to).emit("answer", {
          answer: data.answer,
          from: socket.id,
        });
      });

      socket.on("ice-candidate", (data) => {
        socket.to(data.to).emit("ice-candidate", {
          candidate: data.candidate,
          from: socket.id,
        });
      });
    });
  }
}

module.exports = SocketManager;
