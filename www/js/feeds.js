// Loading news (RSS) and YouTube videos.
//
// Browsers block reading other websites directly (CORS), so during development
// requests go through the small proxy in server.js. Inside the Android app
// (Capacitor) the native HTTP layer does not have that limit, so we fetch directly.

const Feeds = (() => {
  const isNativeApp = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  async function fetchText(url) {
    const target = isNativeApp() ? url : `/proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(target);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  }

  function parseXml(text) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("Invalid feed");
    return doc;
  }

  // Finds the first child element by local name, ignoring XML namespaces.
  function child(el, name) {
    for (const c of el.children) if (c.localName === name) return c;
    return null;
  }
  function deep(el, name) {
    return el.getElementsByTagNameNS("*", name)[0] || null;
  }
  function textOf(el) {
    return el ? el.textContent.trim() : "";
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.replace(/\s+/g, " ").trim();
  }

  function rssImage(item) {
    const media = deep(item, "content") || deep(item, "thumbnail");
    if (media && media.getAttribute("url")) return media.getAttribute("url");
    const enclosure = child(item, "enclosure");
    if (enclosure && /^image\//.test(enclosure.getAttribute("type") || "")) return enclosure.getAttribute("url");
    const match = /<img[^>]+src="([^"]+)"/i.exec(textOf(child(item, "description")));
    return match ? match[1] : "";
  }

  async function loadNews(source) {
    const doc = parseXml(await fetchText(source.url));
    return [...doc.getElementsByTagName("item")].slice(0, 25).map((item) => {
      // Google News puts the outlet name at the end of the title: "Headline - Outlet"
      let title = textOf(child(item, "title"));
      let outlet = textOf(child(item, "source")) || source.name;
      const suffix = ` - ${outlet}`;
      if (title.endsWith(suffix)) title = title.slice(0, -suffix.length);
      const summary = stripHtml(textOf(child(item, "description")));
      return {
        title,
        outlet,
        link: textOf(child(item, "link")),
        date: new Date(textOf(child(item, "pubDate")) || Date.now()),
        image: rssImage(item),
        summary: summary.startsWith(title) ? "" : summary,
      };
    });
  }

  async function loadChannel(channel) {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
    const doc = parseXml(await fetchText(url));
    return [...doc.getElementsByTagNameNS("*", "entry")].map((entry) => {
      const videoId = textOf(deep(entry, "videoId"));
      return {
        videoId,
        title: textOf(child(entry, "title")),
        channel: channel.name,
        date: new Date(textOf(child(entry, "published"))),
        thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    });
  }

  async function loadVideos(channels, favorites) {
    const results = await Promise.allSettled(channels.map(loadChannel));
    const latest = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => b.date - a.date)
      .slice(0, 30);
    const favs = favorites.map((f) => ({
      videoId: f.videoId,
      title: f.title,
      channel: "★",
      thumb: `https://i.ytimg.com/vi/${f.videoId}/hqdefault.jpg`,
    }));
    const failed = channels.length > 0 && results.every((r) => r.status === "rejected");
    return { videos: [...favs, ...latest], failed };
  }

  // Remember the last good result so the app still shows something offline.
  function cache(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return null;
    }
  }

  return { loadNews, loadVideos, cache, isNativeApp };
})();
