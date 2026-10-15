# Mae 💛

A simple, big-button home screen for Mom's tablet: news, YouTube videos, movies & TV apps,
and her other favorite things, all one tap away. There's a big **🏠 Home** button on every screen.

Written in plain HTML/CSS/JavaScript (no frameworks, no build step), then packaged as an
Android APK with [Capacitor](https://capacitorjs.com).

## Run it on your computer

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm start
```

Open http://localhost:8080. Edit a file, refresh the browser, see the change.

To try it on the real tablet before building the APK, open `http://<your-computer-ip>:8080`
in the tablet's browser (same Wi‑Fi).

## Personalize it

Everything Mom sees is in **`www/js/config.js`**:

| Setting | What it does |
|---|---|
| `name` | "Good morning, **Mom**!" |
| `locale` | Date/time language, e.g. `pt-BR` |
| `weather` | Her city's coordinates |
| `news` | Any RSS feeds (Google News works for every country/language) |
| `youtubeChannels` | Her favorite channels — the app shows their newest videos |
| `favoriteVideos` | Specific videos she rewatches |
| `movies` / `shortcuts` | Big buttons that open Netflix, WhatsApp, etc. |
| `text` | Every word on screen, so you can translate the app |

To make everything bigger, raise `font-size` at the top of `www/css/style.css`.

## Project layout

```
www/                 ← the app itself (this is what goes into the APK)
  index.html
  css/style.css
  js/config.js       ← edit this to personalize
  js/feeds.js        ← loads news (RSS) and YouTube feeds
  js/app.js          ← screens, navigation, clock, weather, video player
server.js            ← dev server + feed proxy (browser only)
capacitor.config.json
```

## Build the Android APK

One-time setup: install [Android Studio](https://developer.android.com/studio).

```bash
npm install
npm run android:add     # creates the android/ project (first time only)
npm run android:sync    # copies www/ into the Android project — run after every change
npm run android:open    # opens Android Studio
```

In Android Studio: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
Copy the APK to the tablet (or plug it in and press ▶ Run).

### Tips for the tablet
- **Make it her home screen:** use a simple launcher or Android's "Screen pinning" so she can't get lost.
- Some YouTube videos block playing inside other apps — the **Open in YouTube** button is the fallback.
- No API keys are needed: news uses RSS, videos use YouTube's public channel feeds, weather uses [Open‑Meteo](https://open-meteo.com).

## Ideas for next steps
- Photo slideshow of family pictures
- One-tap video call buttons for each family member
- A "Settings" screen protected by a PIN so you can change things on the tablet
- Read-aloud button for news articles
