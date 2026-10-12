# Voice Profile Analyzer

A professional vocal analysis web application that uses real-time pitch detection to classify your voice type, provide tailored training exercises, and track your vocal progress over time.

## Overview

Voice Profile Analyzer listens to your singing and speaking through your microphone, analyzes the frequencies you produce, and classifies your voice into one of nine classical voice types (Soprano, Mezzo-Soprano, Alto, Contralto, Countertenor, Tenor, Baritone, Bass-Baritone, or Bass). It then generates exercises suited to your specific range, lets you join or manage choirs, and visualizes your progress with analytics dashboards.

## Features

### Pitch Monitor
Real-time pitch detection using the YIN autocorrelation algorithm. Displays the current note, octave, frequency in Hertz, pitch accuracy, and a scrolling waveform graph of your recent pitch history. Each note is color-coded for quick visual recognition.

### Voice Calibration Wizard
A 6-step guided process that captures your full vocal profile:

1. **Lowest Note** — Sing and hold the lowest note you can sustain comfortably
2. **Highest Note** — Sing and hold the highest note you can sustain comfortably
3. **Speaking Range** — Speak naturally to capture your conversational pitch range
4. **Singing Comfort Zone** — Sing in the range that feels most effortless
5. **Review & Calculate** — Verify the collected data before classification
6. **Your Results** — See your classified voice type, confidence score, tessitura, and choir section

The classifier uses range overlap, tessitura midpoint, speaking pitch average, and pitch stability to score each voice type and assign a primary and secondary classification with a confidence percentage.

### Vocal Training
Generates three tailored exercises based on your classified voice type. Each exercise includes a name, description, and recommended note range. Practice sessions track duration, notes hit vs. missed, accuracy percentage, and average pitch stability. Results are saved to your history.

### Choir Mode
Create and manage choir groups. Add singers by email, assign them to SATB sections (Soprano, Alto, Tenor, Bass), and record their voice type and confidence score. View a section-by-section headcount breakdown for quick ensemble balancing.

### Analytics Dashboard
Visualizes your vocal progress with:

- **Summary cards** — Voice type, latest confidence score, average practice accuracy, total practice time
- **Vocal Range History** — Area chart showing how your range (in Hz) has changed across assessments
- **Practice Accuracy Trends** — Bar chart of accuracy across recent practice sessions
- **Assessment History** — Chronological list of past classifications with confidence scores

### Profile Management
Edit your display name, view your current voice profile summary (type, confidence, range, total practice time), and sign out.

### Offline Support
When your device loses internet connection, assessments and practice sessions are queued locally and automatically synced to the database when connectivity returns.

### Dark / Light Theme
Full theme toggle with persistent preference. The entire UI adapts its color palette between a dark mode (deep grays with blue accents) and a light mode (clean whites with subtle borders).

## Voice Types

The app recognizes nine classical voice types, each with defined frequency ranges and SATB choir section assignments:

| Voice Type | Frequency Range | Choir Section |
|---|---|---|
| Soprano | C4 – C6 (261.63 – 1046.50 Hz) | Soprano |
| Mezzo-Soprano | A3 – A5 (220.00 – 880.00 Hz) | Alto |
| Alto | G3 – F5 (196.00 – 698.46 Hz) | Alto |
| Contralto | F3 – D5 (174.61 – 587.33 Hz) | Alto |
| Countertenor | C4 – G5 (261.63 – 783.99 Hz) | Alto |
| Tenor | C3 – B4 (130.81 – 493.88 Hz) | Tenor |
| Baritone | A2 – G4 (110.00 – 392.00 Hz) | Bass |
| Bass-Baritone | G2 – F4 (98.00 – 349.23 Hz) | Bass |
| Bass | E2 – D4 (82.41 – 293.66 Hz) | Bass |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS 4 with custom theme tokens (primary blue ramp, Playfair Display + Inter fonts)
- **State Management:** Zustand with localStorage persistence
- **Routing:** React Router 7
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Audio Processing:** Web Audio API + custom YIN pitch detection algorithm
- **Charts:** Recharts (area and bar charts for analytics)
- **Icons:** Lucide React
- **Date Formatting:** date-fns
- **Testing:** Vitest, Testing Library, jsdom

## Audio Pipeline

The app uses the YIN (Iterative Difference Function) algorithm for fundamental frequency detection:

1. **Capture** — `getUserMedia` requests microphone access with echo cancellation, noise suppression, and auto gain control disabled for raw vocal input
2. **Analyze** — An `AnalyserNode` with FFT size 4096 provides time-domain audio data via `requestAnimationFrame`
3. **Detect** — The YIN algorithm computes a difference function, applies cumulative mean normalization, finds the first dip below a threshold (0.15), and refines with parabolic interpolation
4. **Classify** — Detected frequencies are converted to musical notes (C, C#, D, ... B with octave numbers) and scored against reference voice type ranges

Pitch stability is computed over a rolling window of 10 readings using the coefficient of variation, producing a 0–100 stability score.

## Database Schema

The app uses five Supabase tables:

- **profiles** — User accounts (id, email, display_name, avatar_url, timestamps)
- **voice_assessments** — Calibration results (frequencies, note names, voice type, confidence)
- **practice_sessions** — Training session records (exercise type, duration, notes hit/missed, accuracy, stability)
- **choir_groups** — Choir ensembles (name, admin user)
- **choir_members** — Singer memberships (choir, user, SATB section, voice type, confidence)

All tables use Row Level Security scoped to the authenticated user via `auth.uid()`.

## Project Structure

```
src/
├── audio/
│   ├── pitchDetector.ts      # YIN algorithm + AudioProcessor class
│   └── classifier.ts         # Voice type classification + exercise definitions
├── components/
│   ├── analytics/             # Analytics dashboard with charts
│   ├── auth/                  # Sign in / sign up page
│   ├── calibration/           # 6-step voice calibration wizard
│   ├── choir/                 # Choir creation and singer management
│   ├── layout/                # App shell with header + bottom nav
│   ├── pitch/                 # Real-time pitch monitor + canvas graph
│   ├── profile/               # User profile and voice summary
│   └── training/              # Voice-type-specific practice exercises
├── hooks/
│   └── useAuth.ts             # Supabase auth integration
├── lib/
│   ├── api.ts                 # Supabase CRUD operations
│   ├── offlineSync.ts         # Offline queue + auto-sync on reconnect
│   └── supabase.ts            # Supabase client initialization
├── store/
│   └── useStore.ts            # Zustand global state with persistence
├── types/
│   └── index.ts               # Type definitions + voice type reference data
└── test/
    └── setup.ts               # Vitest environment mocks (AudioContext, etc.)
```

## Testing

The project includes unit and integration tests covering:

- Pitch detection accuracy (sine wave detection, silence handling, frequency-to-note conversion)
- Voice classification logic (all voice types, confidence bounds, choir section mapping)
- Store state management (assessments, practice sessions, pitch history, offline queue)
- Offline sync queue behavior (online vs. offline, queue clearing)
- App layout rendering (navigation, theme toggle, routing)

Run tests with:

```bash
npm test
```

## Building

```bash
npm run build
```

This runs TypeScript type-checking followed by the Vite production build. Output is written to `dist/`.
