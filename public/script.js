
const socket=io(); let room="default",username="",playlist=[],player,currentProvider=null,myId=null;
const isHost=new URLSearchParams(location.search).get("clave")==="nestor123";
socket.on("connect",()=>myId=socket.id);

function detect(url){
 if(/youtu\.?be/.test(url)) return {type:"youtube"};
 if(url.includes("dropbox.com")) return {type:"html5",url:url.replace("dl=0","raw=1")};
 if(url.includes("drive.google.com")){let m=url.match(/\/d\/([^/]+)/); return {type:"iframe",url:`https://drive.google.com/file/d/${m?.[1]}/preview`};}
 if(/\.(mp4|webm)(\?|$)/i.test(url)||url.includes("raw=1")) return {type:"html5",url};
 return {type:"iframe",url};
}
document.getElementById("joinBtn").onclick=()=>{username=usernameInput.value;if(!username)return;socket.emit("join-room",{room,username,isHost});login.style.display="none";app.style.display="block";if(isHost)controls.style.display="block";}
function onYouTubeIframeAPIReady(){}
addBtn.onclick=()=>{if(!isHost)return;socket.emit("add-video",{room,video:{title:titleInput.value,url:urlInput.value}})}
socket.on("playlist-update",d=>{playlist=d.playlist; render();})
function render(){playlistEl=playlist=document.getElementById("playlist"); playlistEl.innerHTML=""; window.playlistData=playlist;
 (socketPlaylist=arguments);}
function render(){
 const el=document.getElementById("playlist"); el.innerHTML="";
 playlist.forEach((v,i)=>{
   let li=document.createElement("li");
   li.textContent=v.title+" ";
   if(isHost){
      let del=document.createElement("button");
      del.textContent="Eliminar";
      del.onclick=(e)=>{e.stopPropagation();socket.emit("remove-video",{room,index:i});};
      li.appendChild(del);
   }
   li.onclick=()=>isHost&&socket.emit("select-video",{room,index:i});
   el.append(li);
 });
}
socket.on("video-selected",({index})=>loadVideo(playlist[index]));
function loadVideo(v){
 if(!v)return; let p=detect(v.url); currentProvider=p.type;
 player=document.getElementById("player");
 if(p.type==="youtube"){
  let id=(v.url.match(/(?:v=|be\/|shorts\/)([^&?/]+)/)||[])[1];
  player.innerHTML=`<iframe src="https://www.youtube.com/embed/${id}?enablejsapi=1" allowfullscreen></iframe>`;
  status.textContent="Si YouTube restringe la reproducción embebida, el video no podrá reproducirse aquí.";
 }else if(p.type==="html5"){
  player.innerHTML=`<video id="v" controls playsinline src="${p.url}"></video>`;
  const vid=document.getElementById('v');
  if(isHost){
   ["play","pause","seeked"].forEach(ev=>vid.addEventListener(ev,()=>socket.emit("sync-state",{room,state:{playing:!vid.paused,time:vid.currentTime}})));
  }
 }else{
  player.innerHTML=`<iframe src="${p.url}" allowfullscreen></iframe>`;
 }
}
socket.on("sync-state",s=>{
 let v=document.getElementById('v'); if(!v||isHost)return;
 if(Math.abs(v.currentTime-s.time)>2) v.currentTime=s.time;
 s.playing?v.play():v.pause();
});
sendBtn.onclick=()=>{if(chatInput.value)socket.emit("chat-message",{room,message:chatInput.value}); chatInput.value="";}
socket.on("chat-message",d=>{
 let m=document.createElement("div"); m.className="msg "+(d.senderId===myId?"right":"left");
 m.innerHTML=`<div class=name>${d.username}</div>${d.message}`; messages.append(m); messages.scrollTop=messages.scrollHeight;
});
