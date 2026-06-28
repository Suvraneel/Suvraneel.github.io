# Premium 3D Portfolio

An immersive single-page portfolio built with Next.js App Router, React, and Three.js.

## Stack

- `next` + App Router for page composition and metadata
- `react` for modular section architecture
- `three`, `@react-three/fiber`, and `@react-three/drei` for the hero scene
- Tailwind CSS v4 for visual styling and responsive utilities

## Experience Design

- Dark cinematic visual base with neon atmospheric glow
- 3D hero centerpiece reacting to cursor and scroll
- Scroll reveal cadence and parallax background layers
- Glassmorphism cards with interactive 3D hover depth
- Accessible section landmarks, skip-link, and reduced-motion support

## Project Structure

- `app/page.tsx`: entry route rendering the portfolio shell
- `components/portfolio/portfolio-shell.tsx`: top-level client orchestrator for sections and scroll state
- `components/portfolio/hero-scene.tsx`: isolated Three.js canvas scene
- `components/portfolio/*.tsx`: section modules and reusable UI
- `components/portfolio/data.ts`: structured content model for projects, skills, and timeline

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Check

```bash
npm run lint
```
