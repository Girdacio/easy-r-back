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

const mensagens = new Map();

app.get('/', (req, res) => {
  res.send('<h1>Server is ON!</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');  
  
  setupSession(socket);
  setupRoom(socket);
  sendAllCards(socket);
  newItemEvent(socket);

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

function setupRoom(socket) {
  let { retroId } = socket.handshake.query;
  if (!mensagens.has(retroId)) {
    mensagens.set(retroId, []);
  }
}

function sendAllCards(socket) {
  let { retroId } = socket.handshake.query;
  console.log(mensagens.get(retroId));
  socket.emit("allItens", mensagens.get(retroId));
}

function newItemEvent(socket) {
  socket.on("newItem", (item) => {
    mensagens.get(item.retroId).push(item);
    io.to(item.retroId).emit("newItem", item);
    console.log(mensagens.get(item.retroId));
  });
}