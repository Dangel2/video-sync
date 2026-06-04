const socket = io();
const video = document.getElementById("video");

// nombre de sala desde el link
const room = window.location.pathname.split("/")[2] || "amor";

socket.emit("join-room", room);

function send(action) {
  socket.emit("video-sync", {
    room,
    action,
    time: video.currentTime
  });
}

video.addEventListener("play", () => send("play"));
video.addEventListener("pause", () => send("pause"));
video.addEventListener("seeked", () => send("seek"));

socket.on("video-sync", (data) => {
  if (data.action === "play") {
    video.currentTime = data.time;
    video.play();
  }

  if (data.action === "pause") {
    video.currentTime = data.time;
    video.pause();
  }

  if (data.action === "seek") {
    video.currentTime = data.time;
  }
});