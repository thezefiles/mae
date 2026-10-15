// Main app: screens, navigation, clock and weather.

const C = window.APP_CONFIG;
const T = C.text;
const view = document.getElementById("view");
const homeBtn = document.getElementById("homeBtn");

// ---------- helpers ----------

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function timeAgo(date) {
  const d = new Date(date);
  if (isNaN(d)) return "";
  const rtf = new Intl.RelativeTimeFormat(C.locale, { numeric: "auto" });
  const mins = Math.round((d - Date.now()) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

function openExternal(url) {
  window.open(url, "_blank", "noopener");
}

function tile({ label, emoji, color, href, url }) {
  const attrs = href ? `href="${esc(href)}"` : `href="${esc(url)}" data-external`;
  return `<a class="tile" ${attrs} style="--tile:${esc(color)}">
    <span class="tile-emoji" aria-hidden="true">${emoji}</span>
    <span class="tile-label">${esc(label)}</span>
  </a>`;
}

// Fill in translated text in index.html
document.querySelectorAll("[data-text]").forEach((el) => (el.textContent = T[el.dataset.text] ?? el.textContent));
document.documentElement.lang = C.locale.split("-")[0];

// ---------- screens ----------

const screens = {
  home() {
    const h = new Date().getHours();
    const greet = h < 12 ? T.goodMorning : h < 18 ? T.goodAfternoon : T.goodEvening;
    view.innerHTML = `
      <h1 class="greeting">${esc(greet)}, ${esc(C.name)}!</h1>
      <div class="grid home-grid">
        ${tile({ label: T.news, emoji: "📰", color: "#2563eb", href: "#news" })}
        ${tile({ label: T.videos, emoji: "▶️", color: "#dc2626", href: "#videos" })}
        ${tile({ label: T.movies, emoji: "🍿", color: "#7c3aed", href: "#movies" })}
        ${tile({ label: T.more, emoji: "⭐", color: "#059669", href: "#more" })}
      </div>`;
  },

  async news(params) {
    const index = Math.min(Number(params.get("s")) || 0, C.news.length - 1);
    const source = C.news[index];
    const tabs = C.news.length > 1
      ? `<nav class="tabs">${C.news.map((s, i) =>
          `<a class="tab ${i === index ? "active" : ""}" href="#news?s=${i}">${esc(s.name)}</a>`).join("")}</nav>`
      : "";
    view.innerHTML = `<h1 class="screen-title">📰 ${esc(T.news)}</h1>${tabs}<div id="list" class="news-list"><p class="status">${esc(T.loading)}</p></div>`;

    const key = `news:${source.url}`;
    let items, notice = "";
    try {
      items = await Feeds.loadNews(source);
      Feeds.cache(key, items);
    } catch (err) {
      console.warn(err);
      items = Feeds.cache(key) || SAMPLE_NEWS;
      notice = `<p class="notice">${esc(T.offline)}</p>`;
    }
    if (!isCurrent("news")) return;

    document.getElementById("list").innerHTML = notice + items.map((n) => `
      <a class="news-card" href="${esc(n.link)}" data-external>
        ${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        <div class="news-body">
          <h2>${esc(n.title)}</h2>
          ${n.summary ? `<p>${esc(n.summary.slice(0, 180))}</p>` : ""}
          <div class="meta">${esc(n.outlet)} · ${esc(timeAgo(n.date))}</div>
        </div>
      </a>`).join("");
  },

  async videos() {
    view.innerHTML = `<h1 class="screen-title">▶️ ${esc(T.videos)}</h1><div id="list" class="grid video-grid"><p class="status">${esc(T.loading)}</p></div>`;

    let { videos, failed } = await Feeds.loadVideos(C.youtubeChannels, C.favoriteVideos);
    let notice = "";
    if (failed) {
      videos = Feeds.cache("videos") || SAMPLE_VIDEOS;
      notice = `<p class="notice">${esc(T.offline)}</p>`;
    } else if (videos.length) {
      Feeds.cache("videos", videos);
    } else {
      videos = SAMPLE_VIDEOS;
      notice = `<p class="notice">${esc(T.noVideos)}</p>`;
    }
    if (!isCurrent("videos")) return;

    document.getElementById("list").outerHTML = notice + `<div class="grid video-grid">${videos.map((v) => `
      <button class="video-card" data-video="${esc(v.videoId)}">
        <img src="${esc(v.thumb)}" alt="" loading="lazy">
        <span class="video-title">${esc(v.title)}</span>
        <span class="meta">${esc(v.channel)}${v.date ? " · " + esc(timeAgo(v.date)) : ""}</span>
      </button>`).join("")}</div>`;
  },

  movies() {
    view.innerHTML = `<h1 class="screen-title">🍿 ${esc(T.movies)}</h1>
      <div class="grid">${C.movies.map((m) => tile({ label: m.name, emoji: m.emoji, color: m.color, url: m.url })).join("")}</div>`;
  },

  more() {
    view.innerHTML = `<h1 class="screen-title">⭐ ${esc(T.more)}</h1>
      <div class="grid">${C.shortcuts.map((s) => tile({ label: s.name, emoji: s.emoji, color: s.color, url: s.url })).join("")}</div>`;
  },
};

// ---------- navigation ----------

let currentScreen = "";
const isCurrent = (name) => currentScreen === name;

function route() {
  const [name, query] = location.hash.slice(1).split("?");
  currentScreen = screens[name] ? name : "home";
  homeBtn.hidden = currentScreen === "home";
  window.scrollTo(0, 0);
  screens[currentScreen](new URLSearchParams(query));
}

window.addEventListener("hashchange", route);
homeBtn.addEventListener("click", () => (location.hash = ""));

// Links to other websites/apps open outside this app.
document.addEventListener("click", (e) => {
  const ext = e.target.closest("[data-external]");
  if (ext) {
    e.preventDefault();
    openExternal(ext.getAttribute("href"));
    return;
  }
  const video = e.target.closest("[data-video]");
  if (video) playVideo(video.dataset.video);
});

// ---------- video player ----------

const player = document.getElementById("player");
const playerFrame = document.getElementById("playerFrame");
let playingId = "";

function playVideo(id) {
  playingId = id;
  playerFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  player.hidden = false;
}

function closePlayer() {
  playerFrame.innerHTML = ""; // removing the iframe stops playback
  player.hidden = true;
}

document.getElementById("closePlayerBtn").addEventListener("click", closePlayer);
document.getElementById("openYouTubeBtn").addEventListener("click", () => {
  openExternal(`https://www.youtube.com/watch?v=${playingId}`);
  closePlayer();
});

// ---------- clock & weather ----------

function updateClock() {
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString(C.locale, { hour: "numeric", minute: "2-digit" });
  document.getElementById("date").textContent = now.toLocaleDateString(C.locale, { weekday: "long", day: "numeric", month: "long" });
}

const WEATHER_ICONS = [
  [0, "☀️"], [2, "⛅"], [3, "☁️"], [48, "🌫️"], [57, "🌦️"], [67, "🌧️"], [77, "❄️"], [82, "🌧️"], [86, "🌨️"], [99, "⛈️"],
];

async function updateWeather() {
  const w = C.weather;
  if (!w.enabled) return;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${w.latitude}&longitude=${w.longitude}` +
      `&current=temperature_2m,weather_code&temperature_unit=${w.unit}`;
    const data = await (await fetch(url)).json();
    const { temperature_2m: temp, weather_code: code } = data.current;
    const icon = (WEATHER_ICONS.find(([max]) => code <= max) || [, "🌡️"])[1];
    document.getElementById("weather").textContent = `${icon} ${Math.round(temp)}°`;
  } catch (err) {
    console.warn("Weather unavailable", err);
  }
}

// ---------- sample content (shown when offline / not configured) ----------

const SAMPLE_NEWS = [
  { title: "Welcome! News will appear here when the tablet is online.", outlet: "Mae", link: "https://news.google.com", date: Date.now(), summary: "Tap any story to read it." },
];
const SAMPLE_VIDEOS = [
  { videoId: "jNQXAC9IVRw", title: "Me at the zoo (sample video)", channel: "Sample", thumb: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg" },
];

// ---------- start ----------

updateClock();
setInterval(updateClock, 15000);
updateWeather();
setInterval(updateWeather, 30 * 60000);
route();
