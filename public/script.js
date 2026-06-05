const socket = io();
const video = document.getElementById("video");

// nombre de sala desde el link
const room = window.location.pathname.split("/")[2] || "amor";

const isHost = window.location.search.includes("clave=nestor123");

if (isHost) {
  document.getElementById("adminPanel").style.display = "block";
}

socket.emit("join-room", room);

function send(action) {
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
     video.src = data.url;
     video.load();

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

function cambiarVideo() {

  const url =
    document.getElementById("videoUrl").value;

  video.src = url;

  video.load();

  socket.emit("video-change", {
    room,
    url
  });

}