const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let currentVideo = "";

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("join-room", (room) => {

    socket.join(room);

    if (currentVideo) {
      socket.emit("video-change", {
        url: currentVideo
      });
    }

  });

  socket.on("video-sync", (data) => {

    socket.to(data.room).emit("video-sync", data);

  });

  socket.on("video-change", (data) => {

    currentVideo = data.url;

    socket.to(data.room).emit("video-change", data);

  });

});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Servidor listo");
});