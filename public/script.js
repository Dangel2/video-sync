const socket = io();

let room="default", username="", playlist=[], player;

// detectar host por clave
const params = new URLSearchParams(window.location.search);
const isHost = params.get("clave") === "nestor123";

document.getElementById("joinBtn").onclick=()=>{
 username=document.getElementById("usernameInput").value;
 if(!username) return alert("Pon nombre");

 socket.emit("join-room",{room,username,isHost});

 document.getElementById("login").style.display="none";
 document.getElementById("app").style.display="block";

 if(isHost){
   document.getElementById("controls").style.display="block";
 }
};

function onYouTubeIframeAPIReady(){
 player=new YT.Player("player",{height:"360",width:"640"});
}

document.getElementById("addBtn").onclick=()=>{
 const title=document.getElementById("titleInput").value;
 const url=document.getElementById("urlInput").value;

 if(!title||!url) return;

 socket.emit("add-video",{room,video:{title,url}});

 document.getElementById("titleInput").value="";
 document.getElementById("urlInput").value="";
};

socket.on("playlist-update",(data)=>{
 playlist=data.playlist;
 renderPlaylist();
});

function renderPlaylist(){
 const el=document.getElementById("playlist");
 el.innerHTML="";

 playlist.forEach((v,i)=>{
  const li=document.createElement("li");

  const span=document.createElement("span");
  span.textContent=v.title;

  if(isHost){
    span.onclick=()=>socket.emit("select-video",{room,index:i});
  }

  const btn=document.createElement("button");
  btn.textContent="X";

  if(isHost){
    btn.onclick=(e)=>{
      e.stopPropagation();
      socket.emit("remove-video",{room,index:i});
    };
  } else {
    btn.style.display="none";
  }

  li.appendChild(span);
  li.appendChild(btn);
  el.appendChild(li);
 });
}

socket.on("video-selected",({index})=>{
 const video=playlist[index];
 if(!video) return;
 const id=getYouTubeId(video.url);
 if(id) player.loadVideoById(id);
});

function getYouTubeId(url){
 if(url.includes("youtu.be/")) return url.split("youtu.be/")[1];
 const m=url.match(/v=([^&]+)/);
 return m?m[1]:null;
}

document.getElementById("sendBtn").onclick=()=>{
 const input=document.getElementById("chatInput");
 const msg=input.value;
 if(!msg) return;

 socket.emit("chat-message",{room,message:msg});
 input.value="";
};

socket.on("chat-message",(data)=>{
 const div=document.createElement("div");
 div.textContent=data.username+": "+data.message;
 const messages=document.getElementById("messages");
 messages.appendChild(div);
 messages.scrollTop=messages.scrollHeight;
});
