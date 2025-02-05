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
        const user = User(username);
        console.log("New user:", user.id);
        this.users.set(user.id, user);
        socket.emit("user-created"),
          {
            id: user.id,
          };
      });
      socket.on("create-channel", (channelName, userId) => {
        const channel = Channel(channelName, this.users[userId]);
        this.channels.set(channel.id, channel);
        this.io.emit("channel-created", {
          id: channel.id,
        });
      });
      socket.on("join-channel", (channelId, userId) => {
        const channel = this.channels.get(channelId);
        const user = this.users.get(userId);
        channel.addUser(user);
        user.setChannel(channel);
        socket.join(channelId);

        this.io.to(channelId).emit("user-joined", {
          userId: user.id,
          username: user.name,
          channelId: channel.id,
          participants: channel.getUsers(),
        });
      });

      socket.on("leave-channel", (channelName, username) => {
        channel.removeUser(user.id);
        user.clearChannel();
        socket.leave(channelId);

        this.io.to(channelId).emit("user-left", {
          userId: user.id,
          channelId: channel.id,
          participants: channel.getUsers(),
        });
      });

      socket.on("toggle-mute", (userId) => {
        const user = this.users.get(userId);
        if (user.isMuted()) {
          user.unmuteUser();
        } else {
          user.muteUser();
        }

        this.io.to(user.currentChannel.id).emit("mute-toggle", {
          userId: user.id,
          isMuted: user.isMuted(),
        });
      });

      socket.on("start-speaking", (userId) => {
        const user = this.users.get(userId);
        user.setSpeaking(true);

        this.io.to(user.currentChannel.id).emit("speaking-started", {
          userId: user.id,
          username: user.name,
        });
      });

      socket.on("stop-speaking", (userId) => {
        const user = this.users.get(userId);
        user.setSpeaking(false);

        this.io.to(user.currentChannel.id).emit("speaking-stopped", {
          userId: user.id,
          username: user.name,
        });
      });
    });
  }
}
module.exports = SocketManager;
