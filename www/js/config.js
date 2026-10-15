// ============================================================
//  PERSONALIZE THE APP HERE
//  This is the only file you need to edit to change what Mom sees.
// ============================================================

window.APP_CONFIG = {
  // Shown at the top of the home screen: "Good morning, <name>!"
  name: "Mom",

  // Language for dates and times (e.g. "en-US", "pt-BR", "es-ES").
  locale: "en-US",

  // Where Mom lives, for the weather. Find coordinates at https://www.latlong.net
  weather: {
    enabled: true,
    latitude: 40.7128,
    longitude: -74.006,
    unit: "fahrenheit", // or "celsius"
  },

  // News sources (any RSS feed works).
  // Google News in another language/country:
  //   https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419
  news: [
    { name: "Top Stories", url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en" },
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  ],

  // Mom's favorite YouTube channels. The app shows their newest videos.
  // How to find a channel ID: open the channel on youtube.com, tap
  // "More about this channel" > "Share channel" > "Copy channel ID".
  // It looks like "UCxxxxxxxxxxxxxxxxxxxxxx".
  youtubeChannels: [
    // { name: "Cooking Show", channelId: "UCxxxxxxxxxxxxxxxxxxxxxx" },
  ],

  // Single videos she likes to rewatch (the ID is the part after "v=" in the link).
  favoriteVideos: [
    // { title: "Grandkids at the beach", videoId: "xxxxxxxxxxx" },
  ],

  // Movie and TV apps. Tapping opens the app if it is installed on the tablet,
  // otherwise the website.
  movies: [
    { name: "Netflix", url: "https://www.netflix.com", color: "#e50914", emoji: "🎬" },
    { name: "Prime Video", url: "https://www.primevideo.com", color: "#00a8e1", emoji: "📺" },
    { name: "Disney+", url: "https://www.disneyplus.com", color: "#113ccf", emoji: "✨" },
    { name: "YouTube", url: "https://www.youtube.com", color: "#ff0000", emoji: "▶️" },
  ],

  // Other things she does on the tablet. Add as many as you like.
  shortcuts: [
    { name: "WhatsApp", url: "https://web.whatsapp.com", color: "#25d366", emoji: "💬" },
    { name: "Facebook", url: "https://www.facebook.com", color: "#1877f2", emoji: "👥" },
    { name: "Recipes", url: "https://www.allrecipes.com", color: "#f59e0b", emoji: "🍲" },
    { name: "Google", url: "https://www.google.com", color: "#4285f4", emoji: "🔎" },
  ],

  // All the words shown in the app, so you can translate it.
  text: {
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    news: "News",
    videos: "Videos",
    movies: "Movies & TV",
    more: "More",
    home: "Home",
    close: "Close",
    loading: "Loading…",
    openInYouTube: "Open in YouTube",
    readArticle: "Read the full story",
    offline: "Could not load new content. Showing saved examples.",
    noVideos: "No videos yet. Add channels in config.js.",
  },
};
