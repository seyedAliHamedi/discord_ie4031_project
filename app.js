const express = require("express");
const http = require("http");
const path = require("path");
const SocketManager = require("./socket");

const app = express();
const server = http.createServer(app);

new SocketManager(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
