# Portfolio fix spec — October 2026

Source: design critique (2026-10-11) plus an adversarially verified audit. Seven verifier agents checked each critique claim against the code and the live dev server; six specialist auditors covered a11y, responsive, correctness, copy, visual and perf. Raw evidence (file:line, measurements, screenshots) sits in the session scratchpad. This file is the working checklist.

**Rules for every task**
- Brand commitments in `PRODUCT.md` win: keep the animated Space Boards display heading, the restrained black ground and the Daccord scene. Keep the signature interactions (dashboard flip, edge-to-next-page) but make them safe.
- Copy: never invent metrics, outcomes, titles or dates. Tasks marked **[D#]** wait for an owner decision below. Until then, use the stated default or leave the copy untouched.
- Done means: `npx tsc --noEmit`, `npx eslint .` and `npx next build` pass, and the acceptance checks are verified in a browser at 390, 1280 and 1440 widths.

Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked on decision

## Current state (2026-10-11, after rollback)

An automated pass over-reached: it restyled buttons (dropping the liquid-metal CTA on Contact), removed the Skills tabs and rewrote copy without approval. All site code was restored to `HEAD`. Only these owner-approved, non-visual fixes were re-applied:

| ID | Fix | Files |
|---|---|---|
| K1 | GitHub Pages: static export, bun-based workflow, stale lockfiles + CNAME removed | next.config.js, .github/workflows/NextJS-ghPages.yml, package.json |
| K2 | Heading texture served from `/images/seed-46867.png` (same image, no i.ibb.co) | styles/globals.css |
| K3 | Resume glitch shows "Download resume" instead of "ALTERNATE TEXT" (effect kept) | styles/globals.css, app/about/AboutPage.tsx |
| K4 | No route change from wheel/swipe while a `<dialog>` modal is open | components/PageSequenceScroll.tsx |
| K5 | About scrolls its own content, then continues to /work (continuous scroll kept) | app/about/AboutPage.tsx |
| K6 | Space/arrows not hijacked on focused controls or with modifiers | app/HomePage.tsx, app/about/AboutPage.tsx |
| K7 | No sound on keyboard focus (hover sounds kept) | Navbar, Socials, ProjectsPage |
| K8 | `sessionStorage` crash guard | components/AsciiArt.tsx |
| K9 | Particle portrait: rAF + mousemove cleanup on unmount | components/Particle.tsx |
| K10 | Spline error boundary; no raw "Loading..." text | SplineObject, DashboardScene |
| K11 | Work: removed the per-scroll setState (the rotation never worked) | app/work/WorkPage.tsx, SplineObject |
| K12 | Mobile drawer: Escape closes and returns focus; Tab stays inside | components/Hamburger.tsx |
| K13 | confirm.wav 560 KB → 60 KB | public/sounds |
| K14 | next / eslint-config-next 16.3.5 → 16.3.8 (critical next/og RCE + 4 advisories) | package.json, bun.lock |
| K15 | Relative `./sounds`, `./images`, `./spline` URLs → absolute | AboutPage, Particle, WorkPage |
| K18 | "Meterologyly" → "Meteorologyly" | data/projectsDat.ts, .agents/product-marketing.md |

Verified: tsc, eslint and `next build` (static export to `out/`, incl. robots/sitemap) are clean. In the browser: About at 1280×720 scrolls 241px of content before handing off to /work; wheel inside an open project modal stays on /projects; no console errors.

**K16 closed (owner):** keep the current Helvetica Bold headings. The fonts do load; H1s use Space Boards and the classed paragraphs use TASA. Unclassed headings/buttons intentionally render in the system sans.

**K17 done (owner-approved "Cadence"):** lg rows 7/5 · 8/4 · 4/8 · 5/7 · 4/5/3 · 5/3/4 with heights 24 → 21 → 19 → 17.5 → 16 → 12.5rem; md keeps 2-up zigzag pairs (7 rows, 24 → 13rem); mobile unchanged. Tile/modal styling untouched (app/projects/ProjectsPage.tsx).

**K19 done:** removed react-bottom-scroll-listener, video.js, @fontsource/playfair-display, @fontsource/raleway, @fortawesome/free-brands-svg-icons, @fortawesome/free-regular-svg-icons. Kept gsap (owner plans animations). Removed countapi-js too (service offline; owner prefers analytics over a public counter).

**To discuss next:** K17-followup (hover brief on narrow 3-col cards),  (Projects bento step-down: agent version saved in the scratchpad), K19 (unused deps).

**Every other task below is ON HOLD.** Visual, layout, copy and component changes need explicit owner approval per item before implementation.

---

## Decisions needed from owner

| ID | Question | Default until answered | Blocks |
|---|---|---|---|
| D1 | ✅ **Answered: hybrid full-stack** (backend, frontend, AI). Proposed line: "Full-stack software engineer at Accenture. I build dependable backend systems, the interfaces on top of them, and agentic AI workflows." Title descriptor: "Full-Stack Software Engineer". Update PRODUCT.md + product-marketing.md to match. | — | C-3, C-4 |
| D2 | ✅ **Answered: keep as is.** Accenture stays the only professional role; Monoma/SettleX stay projects. | — | P-5, C-6 closed |
| D3 | ✅ **Answered: fix GitHub Pages** at suvraneel.github.io, deployed from `main`; drop CNAME. | — | X-1 to X-3 |
| D4 | ✅ **Answered: no.** Scene stays the only visual on desktop. | — | H-5 closed |
| D5 | ✅ **Answered: keep sounds on.** Fix a11y only (never on keyboard focus). | — | N-7 |
| D6 | ⏸ **Deferred by owner.** No metric reuse; titles/figures unchanged for now. | — | C-5, S-2 |
| D7 | ✅ **Answered: keep all 14 tiles in the current format.** Make the bento cards step down in size so the last 4 are smallest. Don't change the tile/modal visual design without asking. | — | P-6 |
| D8 | ✅ **Answered: only remove unused deps.** Keep all assets, the transcript and the scales components. | — | Z-2 (Z-3 closed) |
| D11 | ✅ **Owner intent: scroll-to-change-page is deliberate.** The site should feel like one continuous long-scroll page. Keep wheel/touch/keyboard edge navigation and the dashboard flip; let a continuous scroll flow through pages (no "fresh gesture" arming). Keep only the safety guards: no route change while a modal/drawer is open, no hijacking keys on focused controls, and each page's own content must scroll fully before handing off to the next. | — | N-1..N-3 (scope narrowed) |
| D12 | ✅ **Owner intent: the 2s preloader hold is deliberate.** Keep `READY_HOLD_MS = 2000` after the scene is ready. Error-boundary and failure fallbacks stay. | — | H-2 (reverted) |
| D9 | Root font-size is 18px (every rem ×1.125). Intentional? | Keep 18px | — |
| D10 | Spline scene text (grammar error, Web3/gaming copy, hackathon count) needs a re-export in the Spline editor; code can't fix it | Owner task | — |

---

## WS-F Foundations (fonts, tokens, CSS)

- [ ] **F-1 P0 Font cascade.** `tasaOrbiter` is only applied via `.className`, so `--font-TASAOrb` is never defined. `html` computes to Times; body asks for unloaded "Montserrat"; Tailwind `sans` is `["serif",…]`; `.rail-label` asks for unhashed "Tasa Orbiter".
  - Steps: put `${spaceBoards.variable} ${tasaOrbiter.variable}` on `<html>` (app/layout.tsx); add `display:'swap'` and a fallback to both fonts (styles/fonts.ts); set html font to `var(--font-TASAOrb, ui-sans-serif), ui-sans-serif, system-ui, sans-serif` and delete the Montserrat/Raleway stacks and body `font-weight:300` (globals.css); set Tailwind `sans` to the TASA var and add `display` for Space Boards; set `.rail-label` to `inherit`.
  - Accept: computed `font-family` of body, h2, h3, `.rail-label` and the drawer links starts with the TASA hashed family on every route; no element computes to Times/Montserrat.
- [ ] **F-2 P0 Self-host the heading texture.** `.animated-heading` paints only through hot-linked `i.ibb.co` with `color: transparent`, so if the host is blocked every H1 disappears. `public/images/seed-46867.png` is byte-identical.
  - Steps: reference `/images/seed-46867.png` (or a WebP ≤150 KB); add a solid `#83d3dd` colour fallback via `@supports (background-clip:text)`; rename `@keyframes move` → `heading-texture-drift`; stop the animation under reduced motion.
  - Accept: zero requests to i.ibb.co; with the texture route blocked, H1s stay visible in the accent colour; treatment otherwise unchanged.
- [ ] **F-3 P1 Design tokens.** At least 13 cyan variants, 6 surface blacks, 7 radii.
  - Steps: add CSS vars + Tailwind colours: `accent` (#83d3dd), `accent-strong` (#d8fbff text-on-hover), `muted` (#9bb7c0), `bg` (#000), `surface` (#0b0f14), `line` (white/10–20). Radius rule: interactive = pill, surfaces = 1rem, inputs = underline. Delete `primary #B338FF` / `accent #06FFC8`.
  - Accept: new code uses tokens; no `#B338FF`, `#06FFC8`, `#9200ba` left in source.
- [ ] **F-4 P1 Kill the 2022 era.** The `.resume-button` glitch flashes the literal string "ALTERNATE TEXT"; per-brand social hover colours (#802bfc etc.).
  - Steps: delete `.resume-button` + `@keyframes glitch`; Socials hover to the accent.
  - Accept: hovering "Download resume" shows no "ALTERNATE TEXT"; no purple anywhere in the UI.
- [ ] **F-5 P3 Dead CSS.** About 46% of globals.css is dead (swirl ×2, login-box, jello, form-bg, text-glow, iframe-container, #bar1, equalizer). Delete it; keep the `a` reset but drop `color:#0070f3`.
- [ ] **F-6 P3 Z-index scale + rail var.** Add `--rail-w: 50px` and a documented z scale (base 0, rail 50, scene-overlay 200, preloader 500, drawer 2000–2003, modal 5000) as Tailwind `zIndex` keys; replace magic numbers.
- [ ] **F-7 P2 Shared primitives.** `components/ui/Button.tsx`: primary (accent pill, dark text, arrow in its own circle), secondary (outline pill), tertiary (text link + arrow); renders `Link`/`a`/`button`. `components/PageShell.tsx`: rail offset (`nav-gap`), gutter `px-5 sm:px-10 xl:px-20`, top padding `pt-20 sm:pt-24`, plus `PageHeader` (H1 `animated-heading` with one size/tracking, optional lede).

## WS-N Navigation and input safety

- [ ] **N-1 P0 About traps the reader.** Any 80px of downward wheel routes to /work, and Space/ArrowDown at scrollY 0 route away, so content below the fold (incl. the resume CTA at 1280×720) is unreachable.
  - Steps: move forward-edge handling to the bottom edge only, with the same intent rules as PageSequenceScroll (520px, ≥3 events, armed after a ≥250ms gap); keyboard routes only at the edge; keep the upward flip-back at the top edge.
  - Accept: at 1280×720 a wheel scroll moves About normally to its last line; a continued scroll at the bottom routes to /work; Space scrolls the page.
- [ ] **N-2 P1 Home hijack guards.** Wheel/keys hijacked even when the flip can't run (≤550px, scene not ready, dialog open); Space on a focused rail button flips.
  - Steps: new `lib/navigationGuards.ts` (`isInteractiveTarget`, `hasModifier`, `isDialogOpen`, `createWheelArm`); `preventDefault` only when a flip will actually run; ignore repeat/modifier/interactive targets; log the gtag start event only after the guards.
- [ ] **N-3 P1 Momentum misfires.** PageSequenceScroll counts the momentum tail of a fling that arrived at the edge. Require a fresh gesture (≥250ms gap) after reaching the edge; cooldown absorbs only the carried stream.
- [ ] **N-4 P0 Modal guard never matches.** The guard looks for `[role='dialog'][aria-modal='true']`, but ProjectModal is a native `<dialog>`, so wheel/swipe inside an open modal changes route. Use `isDialogOpen()` = `dialog[open], [aria-modal='true']`, also checked in touchend; ignore events whose target is inside `dialog[open]`.
- [ ] **N-5 P0 Short viewports lose nav.** Landscape phones and short windows clip the Skills/Contact rail links with no hamburger fallback. Show the hamburger and hide the rail for `(max-width:768px), (max-height:520px)`; let `.rail-divider` shrink.
- [ ] **N-6 P2 Mobile drawer a11y.** Escape doesn't close it, focus escapes, double tab stops per item, no current-page marker, `border-white/8` isn't a class (renders bright grey). Fix: Escape closes and returns focus to the toggle; trap focus; one tab stop per item; `aria-current` + accent style; `border-white/10`; lock background scroll.
- [ ] **N-7 P2 Sounds.** No sound on keyboard focus anywhere (Navbar, Socials, Projects tiles, About/Contact). Fix relative `./sounds/...` paths → `/sounds/...`. Re-encode `confirm.wav` (560 KB) → ≤60 KB (keep the same file name if the encoder isn't available; skip). [D5] for default-off.
- [ ] **N-8 P3 Rail width transition.** Animates `width`. Keep it (fixed, tiny subtree), but give it the custom ease and honour reduced motion. Optional: transform-based reveal.
- [ ] **N-9 P2 Flip timers.** Cancel the rAF/timeouts of the flip animations on unmount so they can't force-redirect after the user navigates away.

## WS-H Home and the 3D scene

- [ ] **H-1 P0 Spline failure crashes the app.** react-spline rethrows load errors in render and there's no boundary. Add `SceneErrorBoundary` in SplineObject; on error → `setSceneError(true)` + end the preloader.
- [ ] **H-2 P1 Artificial 2s hold.** `READY_HOLD_MS=2000` keeps the preloader up ~3.5s after the scene is ready. Replace it with a frame-stability check (≤ ~300ms) and a hard cap.
- [ ] **H-3 P1 About gated on an unrelated scene.** A direct /about visit waits behind the full-screen "Hello" preloader for the Home scene. Gate the preloader on `pathname === "/"`; warm the scene at idle on /about.
- [ ] **H-4 P0 The 550px seam.** Crossing 550px upward (rotate to landscape, widen the window) shows no content: the fetch effect never re-runs. Make the fetch/initial-load effects depend on `isSplineViewport`; keep the HTML hero visible until the scene `isReady`; DashboardFallback shows name + role + View work.
- [x] ~~**H-5 Desktop caption.**~~ Closed by D4: scene only.
- [ ] **H-6 P1 Invisible tab stops.** On desktop the sr-only mobile hero's two links are the first Tab stops. Hide the CTA row with `min-[551px]:hidden`; keep h1/text sr-only.
- [ ] **H-7 P2 Raw "Loading..." fallback.** Visible on /work. Use a styled, aria-hidden placeholder.
- [ ] **H-8 P2 Mobile hero polish.** H1 gets `animated-heading`; CTAs become **View work** → /work and **Get in touch** → /contact (approved labels in product-marketing.md); portrait alt text matches the image; fix the missing `mt-3`.
- [ ] **H-9 P1 Storage crash.** AsciiArt reads `sessionStorage` unguarded, so every route crashes when site storage is blocked. Wrap in try/catch.

## WS-L Layout system

- [ ] **L-1 P1 One page shell.** H1 x/y, gutter, top padding and background differ on every route. Apply PageShell/PageHeader to About, Work, Projects, Skills, Contact; one background (`bg`); remove `bg-[#07090d]`.
- [ ] **L-2 P1 Work responsive.** At 768–1000px headings clip and the timeline squeezes beside the plant. Plant column only from `lg` (`clamp(15rem,22vw,20rem)`), starts after the rail; ChronoCard inner grid moves to `lg` or a container query; h1 steps sizes; `h-screen`→`dvh`.
- [ ] **L-3 P1 About under the rail.** 769–1023px. Fix via the shell offset.
- [ ] **L-4 P1 Button system.** Four unrelated CTA styles → Button variants. About: Download resume = primary, Get in touch = secondary. Contact: Send message = primary (LiquidMetal kept as the primary surface on Home mobile only, if kept at all), Book a conversation = secondary.

## WS-P Pages

**About**
- [ ] **P-1 P1 Particle canvas.** Leaks a rAF loop + mousemove listener on every mount (fps collapses after a few visits), runs while hidden on mobile, and crops the face at 1024–1440. Mount only at ≥1024px and without reduced motion; clean up; size from the container (ResizeObserver); pause when hidden; downscale `Speaker.png` (3.1 MB).
- [ ] **P-2 P3 Copy (no new claims).** Drop the "Profile" eyebrow; second "I like…" → "I turn ambiguous requirements into clear, maintainable systems and work closely with the people who rely on them." Add a `<main>` landmark.

**Work**
- [ ] **P-3 P2 Scroll re-renders.** setState per scroll event (124 events → 127 commits) and the rotation never works. Remove the state/effect and the dead rotation prop; plant stays static.
- [ ] **P-4 P3 Neon glow.** Remove the ChronoCard dot glow; keep the dot in the accent.
- [x] ~~**P-5 Monoma under Professional experience.**~~ Closed by D2: keep as is.

**Projects**
- [ ] **P-6 P1 Tile defects.** "Open case notes ↗" uses an external-link glyph on a dialog trigger → icon-in-circle, no ↗; hover panel repeats the name; DeStackOverflow title clips at 768–880; the hard-coded 14-entry `cardLayout` becomes a rule-based span pattern; letterboxed thumbnails → `object-cover` with a focal point. [D7] for the cut-to-six and curated stills.
- [ ] **P-7 P2 Typos.** "Meterologyly" → "Meteorologyly" (repo/URL spelling); U+2011 → "-"; fromm, an wallet, eg/ie, centre spellings; final full stops. Data only.
- [ ] **P-8 P2 Modal.** Long Space Boards titles overflow; Space Boards has no digits ("2022" falls back and collides) → modal titles in TASA (Option A); hide the footer when there are no links; YouTube facade (thumbnail + click to load, nocookie); autoplay webm only without reduced motion and with a poster; restore focus to the trigger tile on close; hide the "Esc" chip on touch.

**Skills**
- [ ] **P-9 P1 Show everything.** The tabs hide 3 of 4 areas, including the strongest proof (18+ MCP tools). Static list of all four areas, Backend → Agentic → Product → Web3, proof line promoted; drop the duplicate 01–04 numbering and the Selected/View labels; remove the tab ARIA.
- [-] **S-2 [D6] Backend proof line** "my forte" → evidence from workData.

**Contact**
- [ ] **P-10 P2 Contact.** Remove the duplicate "Replies by email"; FontAwesome → the lucide set (one icon family); mailto uses a mail icon, not external-link; Calendly modal returns focus on close; form submit timeout; success live region mounted before its text.

## WS-C Copy and SEO

- [x] **C-1 P1 Name in titles.** The Home `<title>` omits the name; og:title/twitter:title are bare words. `createPageMetadata`: Home `{absolute: "Suvraneel Bhuin | …"}`, others `${title} | Suvraneel Bhuin` for OG/Twitter.
- [x] **C-2 P2 OG image.** Done: static JPEG card at `/opengraph-image/card.jpg` (Satori over a baked desktop-Home backdrop, re-encoded with sharp to stay under WhatsApp's ~300 KB). Was: none emitted. Add `app/opengraph-image.tsx` (static, ImageResponse: name + role in the brand style) and `summary_large_image`; wire into `createPageMetadata` (page openGraph objects replace the layout's).
- [-] **C-3 [D1] Positioning sweep.** siteDescription, layout title, Home h2/body, page descriptions, llms.txt, JSON-LD.
- [-] **C-4 [D1] "senior software engineer" wording** in the Home meta description vs the official title.
- [-] **C-5 [D6] Titles/figures** consistency (GSSoC figures, GEOGO name, résumé PDF re-export).
- [-] **C-6 [D2] Monoma/SettleX** role/date context lines.
- [ ] **C-7 P3 SEO hygiene.** Non-standard `Host:` in robots; the 404 inherits the home canonical + conflicting robots; sitemap `lastModified`; em dash in the JSON-LD name.

## WS-X Deploy (D3: GitHub Pages)

- [x] **X-1 P0** Pages workflow has 0 successful runs; the live site is a Nov-2024 Pages Router build. Done: `output:"export"` + `images.unoptimized` in next.config.js; the workflow is rewritten (checkout@v4, setup-bun@v2, `bun install --frozen-lockfile`, `bun run build`, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v4) and triggers on push to `main`. Removed the dead `export` script. Pending: verify robots/sitemap prerender into `out/` in the build gate.
  - **Owner action:** Settings → Pages → Source = **GitHub Actions**, and keep the custom domain field **empty**. Then merge `develop` → `main`.
- [x] **X-2** One lockfile: `bun.lock` is the only one that matches package.json, so the stale `yarn.lock` and `package-lock.json` were removed.
- [x] **X-3** CNAME removed (suvraneel.me has no DNS).

## WS-Z Cleanup

- [ ] **Z-1 P3 Orphan components.** Equalizer, Backdrop, ScrollToExplore, FontAwesomeObj, HamsterLoader, stateLogger (verify), unused animate-ui icons.
- [ ] **Z-2 P3 Unused deps.** gsap, countapi-js, react-bottom-scroll-listener, video.js, @fontsource/*, @fortawesome/* (after P-10). Do this together with X-2 so the lockfile story is decided once.
- [-] **Z-3 [D8] Orphan public assets.** ~17 MB: ROG/COLORSTREAM/CONTACT/old DACCORD scenes, loading gifs, duplicate google html, seed-60253.png, Avatar/Logo art, transcript PDF.
- [ ] **Z-4 P2 Spline runtime** older than the exported scene (console warning). Bump `@splinetool/runtime` / `react-spline` if compatible.

## WS-Perf

- [ ] **Q-1 P1 Tile videos buffer on load.** 7 demo WebMs (5–16 MB each) download on /projects despite `preload="metadata"`; phones never play them. Fix: `preload="none"` and load on hover/focus intent. Keep the tile look; a poster frame needs owner approval (D7).
- [ ] **Q-2 P1 Sounds load eagerly.** 659 KB of WAV per page, re-requested on every hover. Fix: lazy-load SFX on first pointer interaction, reuse one Audio/Howl per sound, compressed format.
- [ ] **Q-3 P1 Portrait source.** 3.1 MB 2031px `Speaker.png` used only as a particle sample, also fetched on phones. Covered by P-1 (downscale + desktop-only mount).
- [ ] **Q-4 P2 Hidden Spline renders.** Work creates a WebGPU context for a 0×0 canvas at 551–767px; the Home dashboard keeps rendering under /about. Mount only when visible; pause the render loop when hidden.
- [ ] **Q-5 P2 LiquidMetal shader** runs a WebGL2 loop at 60fps forever. Pause when offscreen (IntersectionObserver) and when the tab is hidden.
- [ ] **Q-6 P2 Oversized rasters.** 2 MB Monoma thumbnail; 715 KB logo shown at 56px; with `images.unoptimized` everything ships at source size. Re-export at display size (WebP), keep the same look.
- [ ] **Q-7 P2 Capture wheel listeners** (`passive:false`) on every route force wheel scrolling through the main thread. Register them only on routes that navigate on wheel.

## WS-A Accessibility (late audit)

- [ ] **A-1 P1 Contrast.** Low-alpha whites at small sizes fail WCAG 1.4.3 (white/40–/55 on black, `#9bb7c0` micro-labels). Raise them to ≥4.5:1 (white/60+ for small text) via tokens.
- [ ] **A-2 P1 Rail keyboard access.** Social links are unreachable by keyboard (shown only on `:hover`); focused labels and outlines are clipped. Expand on `:focus-within` too, and keep outlines inside the rail.
- [ ] **A-3 P1 Reduced-motion gaps.** Spline idle animation, page transitions, the drawer spring and LiquidMetal ignore `prefers-reduced-motion`.
- [ ] **A-4 P2 Work scroller.** Work scrolls inside `<main>`, which keyboard users can't scroll without tabbing into it. Make it focusable (`tabIndex=0` + label) or move to window scroll.
- [ ] **A-5 P2 Tile semantics.** Project tiles nest h2+h3 and hidden overlay content inside `<button>`. Keep the visuals; fix the semantics (one accessible name, `aria-hidden` on the overlay duplicate).
- [ ] **A-6 P2 Contact form.** Input underline boundary fails non-text contrast (3:1); focus is lost after submit; success message may not be announced.
- [ ] **A-7 P2 Preloader.** Hides keyboard focus while the page underneath stays tabbable. Make the background `inert` while it shows.

## WS-K Critic findings

- [ ] **K-1 P1 Dead project links.** "Visit project" for DeStackOverflow, CrewS, Diablo Music and the GSSoC website demo are dead. **Owner:** current URLs, or approve hiding dead links.
- [ ] **K-2 P1 Next.js security advisory (confirmed by `bun audit`).** next@16.3.5: critical `next/og` RCE (GHSA-vcvr-r3jv-pc5j, fixed 16.3.6), high Image Optimization SSRF plus 3 moderate (fixed 16.3.8). Upgrade `next` and `eslint-config-next` to ≥16.3.8. Also high: braces ≤3.0.3 (transitive), @modelcontextprotocol/sdk via shadcn (dev only).
- [ ] **K-3 P1 Recruiter path.** Résumé linked only on /about; Work/Projects/Skills end with no next step. **Owner:** approve a Résumé entry in the rail/drawer and a closing "Get in touch / Download résumé" band on inner pages.
- [ ] **K-4 P1 Résumé PDF.** Stale: different title, a fourth domain (suvraneel.tech), a different LinkedIn slug, and a public personal phone number. **Owner:** re-export.
- [ ] **K-5 P2 Contact abuse.** No honeypot, no length limits. Add a honeypot field and `maxLength`; the EmailJS allowed-origins setting is an owner task.
- [ ] **K-6 P2 Analytics is dead in production** (no GA ID set). **Owner:** provide the ID as a repo variable, or remove the gtag code.
- [ ] **K-7 P2 CI gates.** No lint/typecheck check; Mergify auto-merges owner PRs with no checks. Add a `ci.yml` (bun install, tsc, eslint, build) as a required check.
- [ ] **K-8 P2 Regression tests.** Commit the Playwright acceptance checks (fonts, scroll guards, modal guard, drawer) as `e2e/` specs.
- [ ] **K-9 P2 Error UI.** No `app/error.tsx` / `app/not-found.tsx`; a client crash wipes the shell.
- [ ] **K-10 P3 TypeScript strict** is off; turning it on costs about 6 errors.

---

## Execution order

1. Wave 1, parallel and file-disjoint: F-1..F-7, N-2..N-7 shell parts, H-1..H-4/H-7/H-9.
2. Wave 2, per page: Home (N-2, H-6, H-8), About (N-1, P-1, P-2, L-3, L-4), Work (L-2, P-3, P-4), Projects (P-6..P-8), Skills (P-9), Contact (P-10), SEO (C-1, C-2, C-7).
3. Gate: tsc + eslint + build; then adversarial review plus a visual QA pass at 390/768/1280/1440. Fix and repeat until clean.
4. Decision-blocked items as answers arrive; then Z, X.
