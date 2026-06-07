const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {

  socket.on('join-room', ({ room, username, isHost }) => {
    socket.join(room);
    socket.username = username;
    socket.isHost = isHost;

    if (!rooms[room]) {
      rooms[room] = { playlist: [], currentIndex: 0 };
    }

    io.to(room).emit('playlist-update', rooms[room]);
  });

  socket.on('chat-message', ({ room, message }) => {
    io.to(room).emit('chat-message', {
      username: socket.username,
      message
    });
  });

  socket.on('add-video', ({ room, video }) => {
    if (!socket.isHost) return;
    rooms[room].playlist.push(video);
    io.to(room).emit('playlist-update', rooms[room]);
  });

  socket.on('select-video', ({ room, index }) => {
    if (!socket.isHost) return;
    rooms[room].currentIndex = index;
    io.to(room).emit('video-selected', { index });
  });

  socket.on('remove-video', ({ room, index }) => {
    if (!socket.isHost) return;

    rooms[room].playlist.splice(index, 1);

    if (rooms[room].currentIndex >= index) {
      rooms[room].currentIndex = Math.max(0, rooms[room].currentIndex - 1);
    }

    io.to(room).emit('playlist-update', rooms[room]);
  });

});

server.listen(3000, () => console.log("Server running"));
