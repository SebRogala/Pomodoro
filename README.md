# Pomodoro Timer

A versatile timer app for cooking and productivity, built with Vue 3 + Vuetify 3.

**Live:** https://pomodoro.softsolution.pro

## Features

- **Circular Timer** - Visual time representation like a clock face
- **Sequence Timer** - Multi-step timers for cooking and productivity
  - Cooking: linear progress bar
  - Productivity: circular clock timer
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

## Docker

```bash
# Build image
docker build -t pomodoro .

# Run container
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
