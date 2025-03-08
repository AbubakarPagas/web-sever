import express from "express";
import chatRouter from "./router/chatRouter";
import roomRouter from "./router/roomRouter";
import userRouter from "./router/userRouter";
const num_processes = require("os").cpus().length;
import dns from "node:dns/promises";
import statusRouter from "./router/statusRouter";
import { saveUserLastSeen } from "./controller/lastSeenController";
import config from "config";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { saveUserUnreadCount } from "./controller/unreadCountController";
import mongoose from "mongoose";
// const connectDB = require('./db/')
import connectDB from "./db";
import { isAuthSocket } from "./middleware/auth";

const bodyParser = require('body-parser');

// import path from "path";

//* Express setup -----
const app = express();


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.options('*', cors());
app.set('trust proxy', 1);

const port = 8080;
const server = http.createServer(app);
const io = new Server(server);

// dns.setServers(["127.0.0.0"]);
dns.setServers(["1.1.1.1"]);

//* initialize mongodb
// console.log(dns.getServers());
// [ '127.0.0.53' ]
connectDB();
//* runDB()

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/room", roomRouter);
app.use("/api/status", statusRouter);

app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
  res.send("pong");
});
// io.adapter(io_redis({ host: "localhost", port: 6379 }));

//* Here you might use Socket.IO middleware for authorization etc.
//* on connection, send the socket over to our module with socket stuff
// io.use(isAuthSocket)

// //* use config module to get the privatekey, if no private key set, end the application
if (!config.get("privateKey")) {
  console.error("FATAL ERROR: privateKey is not defined.");
  process.exit(1);
}


//* Socket.io setup -----
// try {
// console.error("FATAL ERROR: privateKey is not defined.");
io.on("connection", (socketConnection: any) => {
  console.log("Socket.io connected");
  //* THIS HANLDE FOR ONLY MAKING CALL FROM
  //* join user to a video call room
  socketConnection.on("JOIN_ROOM", (roomId: string, peerUserId: string) => {
    console.log("JOIN_ROOM ", roomId, peerUserId);
    io.emit("JOIN_ROOM", roomId, peerUserId);
  });
  //* when user ends video call  after joining
  socketConnection.on("DISCONECT-CALL", (roomId: string, peerUserId: string) => {
    // disconnectVideoCall(socket, roomId, peerUserId)
  });
  //* whien user rejects call
  socketConnection.on("REJECT-CALL", (roomId: string, peerUserId: string) => {
    // disconnectVideoCall(socket, roomId, peerUserId)
  });
  //* when user aready making a call
  socketConnection.on("user-on-call", (roomId: string) => {
    // userOnCall(socket, roomId);
  });

  socketConnection.on("CHAT_LIST", (msg: any) => {
    console.log("CHAT_LIST == ", msg);
    io.emit("CHAT_LIST", msg);
  });

  socketConnection.on("CHAT_ROOM", (msg: any) => {
    console.log("CHAT_ROOM == ", msg);
    io.emit("CHAT_ROOM", msg);
  });

  socketConnection.on("SCAN_QR_CODE", (msg: any) => {
    console.log("SCAN_QR_CODE == ", msg);
    io.emit("SCAN_QR_CODE", msg);
  });

  socketConnection.on("LAST_SEEN", (msg: any) => {
    console.log("LAST_SEEN == ", msg);
    // Save User Last seen to Chat Room table
    saveUserLastSeen(msg);
    io.emit("LAST_SEEN", msg);
  });

  socketConnection.on("USER_STATUS", (msg: any) => {
    console.log("USER_STATUS == ", msg);
    io.emit("USER_STATUS", msg);
  });

  socketConnection.broadcast.emit("online", '_id');
  // Handle disconnect event
  socketConnection.on("disconnect", async () => {
    // socketDisconnect(socket, _id, db)
    console.log("Socket.io disconnect");

  });

});
// } catch (error) {
//   console.log("Socket error", error);

// }
// Listen to messages sent from the master. Ignore everything else.
process.on("message", (message, connection) => {
  if (message !== "sticky-session:connection") {
    return;
  }
  // Emulate a connection event on the server by emitting the
  // event with the connection the master sent us.
  server.emit("connection", connection);
  //@ts-ignore
  connection.resume();

});
// mongoose.connection.once('open', () => {
// console.log('Connected to MongoDB');
server.listen(port, () => {
  console.log(`Socket is listening on port ${port}`);
});
// module.exports = server;
// });
// 

