# S.U.Y.O.G – Smart User Yielding Organized Growth

A minimalist yet culturally rich expense splitter themed around Indian art forms, built with React + Tailwind CSS + Framer Motion — no build step, GitHub Pages–ready from the repository root.

## Live-ready flat structure
- `index.html` — entry point, loads React/Tailwind/Framer Motion via CDN and Babel for JSX
- `style.css` — theme tokens, ornate styles (mandala, temple arch, feather progress, lotus button)
- `script.js` — full React app (Add Expense, Summary, History, Karma, UPI mock, Voice input)
- `assets/` — optional for images/fonts (not required; all visuals are CSS/SVG)
- `README.md`

All CSS/JS paths are relative (`./style.css`, `./script.js`). No nested web framework or build folder. Works on any static host including GitHub Pages.

## Run locally
Just open `index.html` in a modern browser. No install required. For best results, serve via a tiny HTTP server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy to GitHub Pages
1. Push these files to the `main` branch of your repository.
2. In Repository Settings → Pages, set Source: `Deploy from a branch`, Branch: `main` (root).
3. Visit your Pages URL once published.

## Features
- Add expenses with Equal / Percentage / Custom split, validations
- Mandala Expense Cards with smooth animations and tooltips
- Scroll-Painting Timeline with subtle parallax
- Karma Chakra Leaderboard with floating lotus petals and peacock feathers
- UPI "Pay Now" mock modal in a temple-arch style with peacock feather progress bar
- Lotus Voice Input using Web Speech API (falls back to a mock phrase)
- Share Summary (copies neat text to clipboard)
- Light/Dark theme toggle, responsive, mobile-first

## Philosophy and theming
S.U.Y.O.G is Smart, User-focused, Yielding Organized Growth. The app uses soft ivory backgrounds, saffron and peacock highlights, terracotta cards, jade accents, and gold shimmers to evoke Indian artistry while keeping the interface minimalist and modern.

## Notes
- Voice input uses the browser SpeechRecognition API. If unavailable, it falls back to a mock example.
- Framer Motion and Tailwind CSS are loaded via CDN for a zero-build setup.
- Data persists in `localStorage` under `suyog.*` keys.
