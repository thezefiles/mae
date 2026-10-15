// Tiny development server — no dependencies needed.
//   npm start   → open http://localhost:8080
//
// Serves the www/ folder and provides /proxy?url=... so the browser can read
// news and YouTube feeds (browsers block this directly; the Android app doesn't need it).

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, "www");
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
};

async function proxy(req, res) {
  const target = new URL(req.url, "http://localhost").searchParams.get("url");
  if (!target || !/^https:\/\//.test(target)) {
    res.writeHead(400).end("Missing or invalid url");
    return;
  }
  try {
    const upstream = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0 (Mae dev server)" } });
    res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "text/xml" });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.writeHead(502).end(`Could not fetch feed: ${err.message}`);
  }
}

function serveFile(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

http
  .createServer((req, res) => (req.url.startsWith("/proxy") ? proxy(req, res) : serveFile(req, res)))
  .listen(PORT, () => console.log(`Mae is running at http://localhost:${PORT}`));
