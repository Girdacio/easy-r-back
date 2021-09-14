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
});

httpServer.listen(porta, () => {
  console.log(`listening on *:${porta}`);
});