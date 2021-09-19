const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:4200",
  },
});
const porta = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Server is ON!</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');  
  
  setupSession(socket);
  sendUsers(socket);  

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
});

io.use((socket, next) => {
  console.log('middleware');
  const { retroId } = socket.handshake.query;

  if (!retroId) {
    return next(new Error("NO_RETRO"));
  }

  next();
});

httpServer.listen(porta, () => {
  console.log(`listening on *:${porta}`);
});

function setupSession(socket) {
  let { retroId, userId } = socket.handshake.query;
  
  socket.join(retroId);
  
  userId = userId != "undefined" ? userId : socket.id;
  const sessionData = {
    userId: userId
  }

  socket.emit('session', sessionData);
}

function sendUsers(socket) {
  const users = [];

  for (let [id, socket] of io.of("/").sockets) {
    users.push(id);
  }

  socket.emit("users", users);
}