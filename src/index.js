const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom,
} = require("./utils/users");
const { generateMsg, generateLocationMsg } = require("./utils/messages");
const app = express();

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");
//Create srver with http
const server = http.createServer(app);
//call socketio to configure
const io = socketio(server);
app.use(express.static(publicPath));
app.get("", (req, res) => {
  res.sendFile(path.join(publicPath, "chatIndex.html"));
});
//connecton method on io socket
//ssocket argument contains the info about the connection
io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    //To send msgs to a specific room use io.to.emit
    //Join a specifc room
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      generateMsg(
        "Admin",
        `Hello ${username} ! Welcome to the chat application`
      )
    );
    //Broadcast sends msg to every other user on the server expect than the current socket user
    //Brodcast.to(room) sends msg to a specific room
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMsg("Admin", `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersinRoom(user.room),
    });
    callback();
  });

  //After recievingmsg and sending to all users we need the callback the function
  socket.on("userMsg", (userMsg, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMsg(user.username, userMsg));
    callback();
  });
  socket.on("userLocation", (latitude, longitude, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationEvent",
      generateLocationMsg(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });
  //Disconnect is a built in event
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    //We use ioemit instead of broadcast bcz the user has already lefted
    //So the disconnected msg will not send to the user
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMsg("Admin", user.username + " has left the chat")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersinRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server listenig on  the port " + PORT);
});
