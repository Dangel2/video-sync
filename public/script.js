const socket = io();
const video = document.getElementById("video");

const room = window.location.pathname.split("/")[2] || "amor";

const isHost = window.location.search.includes("clave=nestor123");

if (isHost) {
  document.getElementById("adminPanel").style.display = "block";
}

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

socket.on("video-change", (data) => {

  video.src = data.url;

  video.load();

});

function cambiarVideo() {

  const url = document.getElementById("videoUrl").value;

  if (!url) return;

  video.src = url;

  video.load();

  socket.emit("video-change", {
    room,
    url
  });

}