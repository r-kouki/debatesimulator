# DebateAI

AI-powered debate simulator and media intelligence dashboard built with React, TypeScript, Vite, Tailwind CSS, and a lightweight local storage data layer. The app combines structured debates against configurable AI personas with topic analysis, performance tracking, and social features like leaderboards.

## Features
- **Authentication & Profiles**: Email-based sign-in/registration persisted to browser storage with profile records, avatars, and rank metadata.
- **Media Intelligence Dashboard**: Topic analyzer with sentiment scoring, pros/cons breakdown, engagement trend mock data, and recommended guest personas per query.
- **Debate Simulator**: Real-time chat experience with configurable AI personas, scoring, timers, mock speech-to-text and text-to-speech toggles, and automated opponent responses.
- **Leaderboard**: Global ranking of debaters ordered by total score with medal callouts, win rate, and status badges.
- **Player Profile**: Summary of personal statistics, recent debates, achievements, and performance insights.
- **Settings Hub**: Controls for language preferences, appearance, notifications, and privacy actions (UI only).

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **Persistence**: Browser `localStorage` via a custom data service (no external backend required).
- **State & Context**: React Context for auth state and shared data helpers.

## Project Structure
```
project/
├─ src/
│  ├─ components/       # Shared UI components (navigation)
│  ├─ contexts/         # Authentication context backed by local storage
│  ├─ lib/              # Local data service and typed interfaces
│  └─ pages/            # Route-like page components (auth, media, debate, etc.)
├─ index.html
├─ package.json
└─ vite.config.ts
```

## Getting Started
1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Run the dev server**
   ```sh
   npm run dev
   ```
3. Open the printed local URL (default `http://localhost:5173`) in your browser.

## Local Data Model
- All user accounts, profiles, debates, messages, and media analyses are stored in `window.localStorage` under `debateai_*` keys.
- Signing up in the UI creates a new local account immediately—no backend provisioning or environment variables are needed.
- Clear the simulator state by running `localStorage.clear()` in DevTools or deleting the relevant keys.

## Available Scripts
- `npm run dev`: Start Vite in dev mode.
- `npm run build`: Production build.
- `npm run preview`: Serve the build output locally.
- `npm run lint`: Run ESLint across the project.
- `npm run typecheck`: TypeScript project validation.

## Development Notes
- Voice input and TTS toggles currently simulate behavior; integrate real services (Web Speech API, third-party TTS) as needed.
- Mock analysis data in `MediaDashboard` is generated client-side and saved to local storage for demo purposes.
- Replace the local storage data service with a real API when moving beyond prototyping.
