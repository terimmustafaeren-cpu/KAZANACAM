// YouTube video listesi (her satır bir link olacak)
function loadVideos() {
  const list = localStorage.getItem("videos");
  const container = document.getElementById("videos");
  container.innerHTML = "";

  if (!list) {
    container.innerHTML = "<p>Henüz video eklenmedi.</p>";
    return;
  }

  const urls = list.split("\n").filter(line => line.trim() !== "");

  urls.forEach(url => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.width = "300";
    iframe.height = "170";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.margin = "10px";
    container.appendChild(iframe);
  });
}

function saveVideos() {
  const textarea = document.getElementById("videoInput");
  localStorage.setItem("videos", textarea.value);
  loadVideos();
}

window.onload = loadVideos;
