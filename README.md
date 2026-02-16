# Ramadan Timetable Web App

A static, city-based Ramadan timetable app with daily Sehri/Iftar times, live countdowns, duas, and motivational quotes.

## Features

- City dropdown powered by `data/citys.csv`
- Per-city Ramadan timetable from CSV files in `data/`
- Live countdown to next Sehri/Iftar
- Daily motivation quotes
- Dua modal and full timetable modal
- Light/dark theme toggle
- City request help modal (`akramfaiz84@gmail.com`)

## Tech Stack

- HTML (`index.html`)
- CSS (`style.css`)
- JavaScript (`script.js`, `quotes.js`)
- CSV data files (`data/*.csv`)

## Project Structure

```text
.
├── index.html
├── style.css
├── script.js
├── quotes.js
├── data/
│   ├── citys.csv
│   └── ramadan_<city>.csv
└── assets/
    ├── cities/
    └── icons/
```

## Run Locally

Because CSV files are loaded with `fetch`, run via HTTP server (not `file://`).

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Data Format

### 1. City Registry (`data/citys.csv`)

Required columns:

- `city`
- `country`
- `file`

Optional column:

- `bg`

Example:

```csv
city,country,file,bg
Wollongong,Australia,ramadan_wollongong.csv,assets/cities/wollongong.jpg
```

### 2. City Timetable (`data/ramadan_<city>.csv`)

Required columns:

- `Day`
- `Date` (`YYYY-MM-DD`)
- `Sehri` (`HH:mm` 24-hour)
- `Iftar` (`HH:mm` 24-hour)

Example:

```csv
Day,Date,Sehri,Iftar
1,2026-02-19,05:05,19:46
2,2026-02-20,05:04,19:47
```

## Add a New City

1. Create timetable file: `data/ramadan_<city>.csv`
2. Add city row to `data/citys.csv`
3. Optional: add background image in `assets/cities/`
4. Run locally and verify dropdown + timings
5. Commit and open PR

### Contributor Checklist

- [ ] CSV dates are `YYYY-MM-DD`
- [ ] Sehri/Iftar are `HH:mm` (24-hour)
- [ ] Day sequence is complete and ordered
- [ ] `file` value in `citys.csv` matches timetable filename
- [ ] City appears in dropdown
- [ ] App loads without console errors

## Accessibility and Performance Notes

Implemented in the app:

- Keyboard support for city dropdown (Arrow keys, Home/End, Escape)
- Focus management for modals (focus on open, trap tab, restore focus on close)
- `defer` script loading
- Reduced motion fallback for users with `prefers-reduced-motion`

## Branch and Deployment Flow

- `dev`: local development and QA
- `main`: staging validation
- `production`: public live branch

Current environments:

- Local (dev): `http://localhost:8080`
- Staging (`main`): `https://fascinating-pavlova-aee901.netlify.app`
- Live (`production`): `https://effortless-cheesecake-02e555.netlify.app`

## Deployment Checklist

### Pre-merge (Dev -> Main)

- [ ] Pull latest `dev`
- [ ] Run local smoke test (city switch, modals, countdown, theme toggle)
- [ ] Confirm no broken assets or missing CSV files
- [ ] Merge `dev` into `main`

### Staging Validation (Main)

- [ ] Verify staging URL loads
- [ ] Check at least 3 cities on staging
- [ ] Check mobile + desktop layout
- [ ] Check dark/light theme toggle
- [ ] Check keyboard navigation for dropdown and modals

### Release (Main -> Production)

- [ ] Merge `main` into `production`
- [ ] Confirm live URL deploy succeeds
- [ ] Re-check one full user flow on live
- [ ] Announce release notes (if applicable)

## Basic QA Smoke Test

1. Open app and confirm default city data loads
2. Change city and verify times + background update
3. Open and close all modals
4. Toggle theme and refresh (theme persists)
5. Leave tab hidden for ~30 seconds, return, confirm countdown remains accurate

## Contact

City requests and suggestions: `akramfaiz84@gmail.com`
