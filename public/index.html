const socket = io();
const video = document.getElementById("video");

const room = window.location.pathname.split("/")[2] || "amor";
const isHost = window.location.search.includes("clave=nestor123");

const VIDEO_URL = "REEMPLAZA_AQUI_TU_LINK_MP4_DIRECTO";

video.src = VIDEO_URL;
video.load();

socket.emit("join-room", room);

let syncing = false;

function send(action) {
  if (!isHost) return;
  if (syncing) return;

  socket.emit("video-sync", {
    room,
    action,
    time: video.currentTime
  });
}

if (isHost) {
  video.addEventListener("play", () => send("play"));
  video.addEventListener("pause", () => send("pause"));
  video.addEventListener("seeked", () => send("seek"));
}

if (!isHost) {
  video.removeAttribute("controls");
}

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
