# Pomodoro Timer

A versatile timer app for cooking and productivity, built with Vue 3 + Vuetify 3.

**Live:** https://pomodoro.softsolution.pro

## Features

- **Circular Timer** - Visual countdown with clock-face style display
- **Sequence Timer** - Multi-step timers for cooking and productivity
  - Cooking: linear progress bar visualization
  - Productivity: circular clock timer
- **Background Timer** - Continues running when browser is minimized
- **URL Sharing** - Share sequences via link
- **Multi-language** - English and Polish
- **Keep Screen On** - Wake lock to prevent screen timeout
- **PWA** - Installable on devices, works offline
- **Auto-update** - Updates automatically on next app open

## Default Sequences

**Cooking:**
- Soft/Medium/Hard Boiled Eggs
- Dumplings (batch cooking)
- Steak (Medium)

**Productivity:**
- Classic Pomodoro (25min work / 5min break)
- Quick Focus (15min work / 3min break)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

Auto-deploys to CapRover on push to master branch via GitHub webhook.

```bash
# Local Docker build (optional)
docker build -t pomodoro .
docker run -d -p 8080:80 pomodoro
```

## Tech Stack

- Vue 3 (Composition API)
- Vuetify 3
- Pinia (state management)
- Vue Router 4
- Vue I18n
- Vite
- PWA (vite-plugin-pwa)

## License

MIT
