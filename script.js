// KAZANACAM v2 - demo behaviors
const DATA = {
  grades: Array.from({length:12},(_,i)=>({id:i+1,label:(i+1)+'. Sınıf'})),
  lessons: ["Türkçe","Matematik","Fen Bilimleri","Sosyal Bilgiler","İngilizce"],
  topics: {} // will populate below
};

// populate sample topics for multiple grades
for(let g=1; g<=12; g++){
  DATA.lessons.forEach(ls=>{
    const key = `${g}-${ls}`;
    DATA.topics[key] = [
      {id:`${g}-${ls}-1`, title:`${g}. Sınıf ${ls} - Konu 1`, excerpt:"Kısa konu açıklaması", mebSource:"https://www.meb.gov.tr/"},
      {id:`${g}-${ls}-2`, title:`${g}. Sınıf ${ls} - Konu 2`, excerpt:"Uygulama soruları ve çözümler", mebSource:"https://www.meb.gov.tr/"}
    ];
  });
}

// replace specific missing content: ensure 6th grade topics present
if(!DATA.topics["6-Türkçe"] || DATA.topics["6-Türkçe"].length===0){
  DATA.topics["6-Türkçe"] = [
    {id:"6-Türkçe-1", title:"6. Sınıf Türkçe — Okuma Anlama", excerpt:"Paragraf soruları ve cevaplar", mebSource:"https://www.meb.gov.tr/"},
    {id:"6-Türkçe-2", title:"6. Sınıf Türkçe — Dil Bilgisi", excerpt:"Fiiller, cümle türleri", mebSource:"https://www.meb.gov.tr/"}
  ];
}
if(!DATA.topics["6-Matematik"] || DATA.topics["6-Matematik"].length===0){
  DATA.topics["6-Matematik"] = [
    {id:"6-Matematik-1", title:"6. Sınıf Matematik — Tam Sayılar", excerpt:"Toplama, çıkarma, problemler", mebSource:"https://www.meb.gov.tr/"}
  ];
}

// DOM
const gradesEl = document.getElementById('grades');
const lessonsEl = document.getElementById('lessons');
const topicGrid = document.getElementById('topicGrid');
const topicPanel = document.getElementById('topicPanel');
const topicTitle = document.getElementById('topicTitle');
const topicMeta = document.getElementById('topicMeta');
const topicContent = document.getElementById('topicContent');
const motivationEl = document.getElementById('motivation');
const calendarEl = document.getElementById('calendar');
const videoListEl = document.getElementById('videoList');
const videoInput = document.getElementById('videoInput');
const saveVideosBtn = document.getElementById('saveVideos');
const clearVideosBtn = document.getElementById('clearVideos');
const filterEl = document.getElementById('filter');

let state = { grade:6, lesson:'Türkçe', topic:null };

// storage keys
const VIDEOS_KEY = 'kz_videos';
const PROG_KEY = 'kz_progress';

function renderGrades(){
  gradesEl.innerHTML = '';
  DATA.grades.forEach(g=>{
    const d = document.createElement('div'); d.className='grade';
    if(g.id===state.grade) d.classList.add('active');
    d.textContent = g.label;
    d.onclick = ()=> { state.grade=g.id; render(); };
    gradesEl.appendChild(d);
  });
}

function renderLessons(){
  lessonsEl.innerHTML = '';
  DATA.lessons.forEach(ls=>{
    const el = document.createElement('div'); el.className='lesson';
    el.innerHTML = `<div>${ls}</div><div class="tag">${(DATA.topics[`${state.grade}-${ls}`]||[]).length} konu</div>`;
    el.onclick = ()=> { state.lesson=ls; render(); };
    lessonsEl.appendChild(el);
  });
}

function renderTopics(filter=''){
  topicGrid.innerHTML = '';
  const arr = DATA.topics[`${state.grade}-${state.lesson}`] || [];
  const filtered = arr.filter(t=> (t.title+' '+t.excerpt).toLowerCase().includes(filter.toLowerCase()));
  if(filtered.length===0){ topicGrid.innerHTML = '<div class="muted">Bu sınıf/ders için henüz konu yok.</div>'; return; }
  filtered.forEach(t=>{
    const div = document.createElement('div'); div.className='topic';
    div.innerHTML = `<h4>${t.title}</h4><div class="tag">${t.excerpt}</div>`;
    div.onclick = ()=> openTopic(t);
    topicGrid.appendChild(div);
  });
}

function openTopic(t){
  state.topic = t;
  topicPanel.hidden = false;
  topicTitle.textContent = t.title;
  topicMeta.textContent = `${state.grade}. Sınıf • ${state.lesson}`;
  // show demo content
  const sample = `<h4>Örnek soru</h4><p>Bu konu için örnek soru ve adım adım çözümü.</p><h5>Cevap</h5><p>Çözüm adımları...</p>`;
  topicContent.innerHTML = sample;
  saveProgress(`${state.grade}-${state.lesson}-${t.id}`);
}

function pickMotivation(){
  const list = [
    "Her gün küçük bir adım, büyük başarıya götürür.",
    "Denenmeden kazanılacak zafer yok — denemeye devam et!",
    "Öğrenmek eğlencelidir; merakını kaybetme."
  ];
  motivationEl.textContent = list[Math.floor(Math.random()*list.length)];
}

function buildCalendar(){
  calendarEl.innerHTML = '';
  ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].forEach(d=>{
    const el = document.createElement('div'); el.className='day'; el.textContent = d;
    calendarEl.appendChild(el);
  });
}

function loadVideos(){
  const raw = localStorage.getItem(VIDEOS_KEY) || '';
  videoInput.value = raw;
  renderVideoList();
}

function saveVideos(){
  const text = videoInput.value.trim();
  localStorage.setItem(VIDEOS_KEY, text);
  renderVideoList();
  alert('Videolar kaydedildi. Ana sayfada gösteriliyor.');
}

function clearVideos(){
  if(confirm('Tüm videolar silinsin mi?')){ localStorage.removeItem(VIDEOS_KEY); videoInput.value=''; renderVideoList(); }
}

function extractVideoId(url){
  try{
    const u = new URL(url);
    if(u.hostname.includes('youtu.be')){
      return u.pathname.slice(1);
    }
    if(u.hostname.includes('youtube.com')){
      if(u.searchParams.get('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/');
      return parts.pop() || parts.pop();
    }
  }catch(e){ return null; }
  return null;
}

function renderVideoList(){
  videoListEl.innerHTML = '';
  const text = localStorage.getItem(VIDEOS_KEY) || '';
  if(!text.trim()){ videoListEl.innerHTML = '<div class="muted">Henüz video yok. Yöneticiler sağ taraftan video linkleri ekleyebilir.</div>'; return; }
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  lines.forEach(line=>{
    const id = extractVideoId(line) || null;
    const item = document.createElement('div'); item.className='video-item';
    if(id){
      item.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe><div><div class="muted">Video ID: ${id}</div><div style="margin-top:6px"><a href="https://youtu.be/${id}" target="_blank" class="btn ghost">Aç</a></div></div>`;
    } else {
      item.innerHTML = `<div class="muted">Geçersiz URL: ${line}</div>`;
    }
    videoListEl.appendChild(item);
  });
}

function saveProgress(key){
  const raw = JSON.parse(localStorage.getItem(PROG_KEY) || '{}');
  raw[key] = {done:true, ts:Date.now()};
  localStorage.setItem(PROG_KEY, JSON.stringify(raw));
  updateProgressUI();
}

function updateProgressUI(){
  const raw = JSON.parse(localStorage.getItem(PROG_KEY) || '{}');
  const keys = Object.keys(raw);
  const el = document.getElementById('progressList');
  if(keys.length===0) el.innerHTML = 'Henüz tamamlanan konu yok.';
  else el.innerHTML = keys.slice(-6).map(k=>`<div><small>${k} — ${new Date(raw[k].ts).toLocaleString()}</small></div>`).join('');
}

document.getElementById('saveVideos').addEventListener('click', saveVideos);
document.getElementById('clearVideos').addEventListener('click', clearVideos);
document.getElementById('syncBtn').addEventListener('click', ()=> {
  alert('YouTube videolarını eklemek için sağ taraftaki kutuya video bağlantılarını yapıştır; her satıra bir link.');
});

document.getElementById('filter').addEventListener('input',(e)=> renderTopics(e.target.value));
document.getElementById('search').addEventListener('input',(e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){ renderTopics(); return; }
  const results = [];
  Object.keys(DATA.topics).forEach(k=>{
    DATA.topics[k].forEach(t=>{
      if((t.title+' '+t.excerpt).toLowerCase().includes(q)) results.push({key:k,topic:t});
    });
  });
  topicGrid.innerHTML = '';
  if(results.length===0){ topicGrid.innerHTML = '<div class="muted">Aradığınız içerik bulunamadı.</div>'; return; }
  results.forEach(r=>{
    const div = document.createElement('div'); div.className='topic';
    div.innerHTML = `<h4>${r.topic.title}</h4><div class="tag">${r.topic.excerpt}</div>`;
    div.onclick = ()=> openTopic(r.topic);
    topicGrid.appendChild(div);
  });
});

function init(){
  renderGrades();
  renderLessons();
  renderTopics();
  pickMotivation();
  buildCalendar();
  loadVideos();
  updateProgressUI();
  document.getElementById('year').textContent = new Date().getFullYear();
}
init();
