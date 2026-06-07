const socket = io();

let room = "default";
let username = "";
let playlist = [];
let player;

// 🔹 JOIN
document.getElementById("joinBtn").onclick = () => {
  username = document.getElementById("usernameInput").value;

  if (!username) return alert("Pon tu nombre");

  socket.emit("join-room", { room, username });

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
};

// 🔹 YOUTUBE PLAYER
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640"
  });
}

// 🔹 AGREGAR VIDEO
document.getElementById("addBtn").onclick = () => {
  const title = document.getElementById("titleInput").value;
  const url = document.getElementById("urlInput").value;

  if (!title || !url) return alert("Completa todo");

  socket.emit("add-video", {
    room,
    video: { title, url }
  });

  document.getElementById("titleInput").value = "";
  document.getElementById("urlInput").value = "";
};

// 🔹 PLAYLIST
socket.on("playlist-update", (data) => {
  playlist = data.playlist;
  renderPlaylist();
});

function renderPlaylist() {
  const el = document.getElementById("playlist");
  el.innerHTML = "";

  playlist.forEach((video, i) => {
    const li = document.createElement("li");

    li.textContent = video.title;
    li.style.cursor = "pointer";

    li.onclick = () => {
      socket.emit("select-video", { room, index: i });
    };

    el.appendChild(li);
  });
}

// 🔹 REPRODUCIR VIDEO
socket.on("video-selected", ({ index }) => {
  const video = playlist[index];
  if (!video) return;

  const id = getYouTubeId(video.url);

  if (!id) {
    console.log("URL inválida");
    return;
  }

  player.loadVideoById(id);
});

// 🔹 FIX YOUTUBE LINKS
function getYouTubeId(url) {
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1];
  }

  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : null;
}

// 🔹 CHAT
document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("chatInput");
  const msg = input.value;

  if (!msg) return;

  socket.emit("chat-message", { room, message: msg });

  input.value = ""; // ✅ LIMPIA
  input.focus();
};

socket.on("chat-message", (data) => {
  const div = document.createElement("div");
  div.textContent = data.username + ": " + data.message;

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
