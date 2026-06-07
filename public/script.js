const socket = io();
let room = "default";
let username = "";
let playlist = [];
let player;

document.getElementById("joinBtn").onclick = () => {
  username = document.getElementById("usernameInput").value;
  if (!username) return alert("Pon nombre");

  socket.emit("join-room", { room, username });
  document.getElementById("app").style.display = "block";
};

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640"
  });
}

document.getElementById("addBtn").onclick = () => {
  const title = document.getElementById("titleInput").value;
  const url = document.getElementById("urlInput").value;

  socket.emit("add-video", {
    room,
    video: { title, url }
  });
};

socket.on("playlist-update", (data) => {
  playlist = data.playlist;
  renderPlaylist();
});

function renderPlaylist() {
  const el = document.getElementById("playlist");
  el.innerHTML = "";

  playlist.forEach((v, i) => {
    const li = document.createElement("li");
    li.textContent = v.title;
    li.onclick = () => {
      socket.emit("select-video", { room, index: i });
    };
    el.appendChild(li);
  });
}

socket.on("video-selected", ({ index }) => {
  const id = getYouTubeId(playlist[index].url);
  if (id) player.loadVideoById(id);
});

function getYouTubeId(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : null;
}

document.getElementById("sendBtn").onclick = () => {
  const msg = document.getElementById("chatInput").value;
  socket.emit("chat-message", { room, message: msg });
};

socket.on("chat-message", (data) => {
  const div = document.createElement("div");
  div.textContent = data.username + ": " + data.message;
  document.getElementById("messages").appendChild(div);
});
