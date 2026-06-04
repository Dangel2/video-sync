const socket = io();
const video = document.getElementById("video");

const room = window.location.pathname.split("/")[2] || "amor";

socket.emit("join-room", room);

let syncing = false;

function send(action) {
  if (syncing) return;

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

  syncing = true;

  if (data.action === "play") {
    video.currentTime = data.time;

    video.play().catch(() => {});
  }

  if (data.action === "pause") {
    video.currentTime = data.time;

    video.pause();
  }

  if (data.action === "seek") {
    video.currentTime = data.time;
  }

  setTimeout(() => {
    syncing = false;
  }, 500);
});