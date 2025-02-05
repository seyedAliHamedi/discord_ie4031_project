const { Server } = require("socket.io");
const User = require("./models/user");
const Channel = require("./models/channel");

class SocketManager {
  constructor(httpServer) {
    this.io = Server(httpServer, {
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
        socket.emit("user-created", { user });
      });

      socket.on("create-channel", (channelName, userId) => {
        const user = this.users.get(userId);
        const channel = new Channel(channelName, user);
        this.channels.push(channel);
        socket.emit("channel-created", { channel });
      });

      socket.on("join-channel", (channelId, userId) => {
        const channel = this.channels.find((c) => c.id === channelId);
        const user = this.users.get(userId);
        channel.addUser(user);
        user.setChannel(channel);
        socket.join(channelId);

        this.io.to(channelId).emit("user-joined", { user, channel });
      });

      socket.on("leave-channel", (channelId, userId) => {
        const channel = this.channels.find((c) => c.id === channelId);
        const user = this.users.get(userId);
        channel.removeUser(userId);
        user.clearChannel();
        socket.leave(channelId);

        this.io.to(channelId).emit("user-left", { user, channel });
      });

      // --- WebRTC Signaling Events ---

      socket.on("send-offer", (offer, targetUserId) => {
        const targetUser = this.users.get(targetUserId);
        if (
          targetUser &&
          targetUser.currentChannel === this.users.get(socket.id).currentChannel
        ) {
          socket.to(targetUserId).emit("receive-offer", offer, socket.id);
        }
      });

      socket.on("send-answer", (answer, targetUserId) => {
        const targetUser = this.users.get(targetUserId);
        if (
          targetUser &&
          targetUser.currentChannel === this.users.get(socket.id).currentChannel
        ) {
          socket.to(targetUserId).emit("receive-answer", answer);
        }
      });

      socket.on("send-ice-candidate", (candidate, targetUserId) => {
        const targetUser = this.users.get(targetUserId);
        if (
          targetUser &&
          targetUser.currentChannel === this.users.get(socket.id).currentChannel
        ) {
          socket.to(targetUserId).emit("receive-ice-candidate", candidate);
        }
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

      socket.on("start-speaking", (userId) => {
        const user = this.users.get(userId);
        user.setSpeaking(true);

        this.io.to(user.currentChannel.id).emit("speaking-started", {
          user: user,
        });
      });

      socket.on("stop-speaking", (userId) => {
        const user = this.users.get(userId);
        user.setSpeaking(false);

        this.io.to(user.currentChannel.id).emit("speaking-stopped", {
          user: user,
        });
      });
    });
  }
}

module.exports = SocketManager;
