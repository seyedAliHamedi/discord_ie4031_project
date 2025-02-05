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

      //USER
      socket.on("create-user", (username) => {
        const user = User(username);
        console.log("New user:", user.id);
        users[user.id] = user;
        socket.emit("user-created");
      });
      socket.on("create-channel", (channelName, userId) => {
        const channel = Channel(channelName, this.users[userId]);
        this.channels[channel.id] - channel;
        this.io.emit("channel-created", {
          id: channel.id,
        });
      });
      socket.on("join-channel", (channelId, userId) => {
        const channel = this.channels.get(channelId);
      });
      socket.on("leave-channel", (channelName, username) => {
        this.io.emit("channel-leave", {
          id: channel.id,
          name: channelName,
        });
      });
      socket.on("disconnect", () => {
        console.log("socket disconnect");
      });
    });
  }
}
module.exports = SocketManager;
