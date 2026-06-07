const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', ({ room, username }) => {
    socket.join(room);
    socket.username = username;

    if (!rooms[room]) {
      rooms[room] = {
        playlist: [],
        currentIndex: 0
      };
    }

    io.to(room).emit('playlist-update', rooms[room]);
  });

  socket.on('chat-message', ({ room, message }) => {
    socket.to(room).emit('chat-message', {
      username: socket.username,
      message
    });
  });

  socket.on('add-video', ({ room, video }) => {
    rooms[room].playlist.push(video);
    io.to(room).emit('playlist-update', rooms[room]);
  });

  socket.on('select-video', ({ room, index }) => {
    rooms[room].currentIndex = index;
    io.to(room).emit('video-selected', { index });
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
