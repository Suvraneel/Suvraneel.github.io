# Portfolio — next steps

Working notes, October 2026. Companion to `PORTFOLIO_FIX_SPEC.md` (IDs in brackets refer to it).

---

## 1. Dead project links — in progress [K-1]

Checked 2026-10-15 with a browser user agent, following redirects. Four projects have broken links; every other link returns 200.

| Project | Broken | Why | Still works |
| --- | --- | --- | --- |
| DeStackOverflow | Live demo `https://destackoverflow.on.fleek.co/` → **403** | Fleek no longer serves `*.on.fleek.co`. No Wayback copy. | Repo, YouTube demo |
| CrewS | Live demo on the Valist IPFS gateway → **500** | Valist is gone. Public IPFS gateways rate-limited the check (429), so the CID is probably unpinned. | Repo, YouTube demo |
| Diablo Music App | Live demo `https://suvraneel.github.io/pages/diablo-music.html` → **404** | The old landing page went away when this site was rebuilt. Its only content was a feature list and the same YouTube demo the card already embeds (Wayback has it from 2022-05-01). | Repo, YouTube demo |
| GirlScript SoC 2022 Official Website | Repo `http://github.com/girlscript/gssoc-website-new` → **404**; live link `https://gssoc.girlscript.tech` redirects to the **current** GSSoC site, not the 2022 one | GirlScript deleted or privatised the repo. The 2022 Wayback snapshots render only the footer (client-rendered app). | Your fork `https://github.com/Suvraneel/gssoc-website-new` (200), YouTube demo |

### Fix — `data/projectsDat.ts` only

Setting a link to `"#"` hides its button in the project modal (`components/ProjectModal.tsx:209` and `:221`), so no layout changes are needed. Each card keeps its repo button and demo video.

```diff
 // GirlScript SoC 2022 Official Website
-    github: "http://github.com/girlscript/gssoc-website-new",
-    url: "https://gssoc.girlscript.tech",
+    github: "https://github.com/Suvraneel/gssoc-website-new",
+    url: "#",

 // DeStackOverflow
-    url: "https://destackoverflow.on.fleek.co/",
+    url: "#",

 // CrewS
-    url: "https://bafybeiblkpu3lbde4jgopk36e2y5ggcti6olyzgpdisgcblcem24ls5cku.ipfs.gateway.valist.io/",
+    url: "#",

 // Diablo Music App
-    url: "https://suvraneel.github.io/pages/diablo-music.html",
+    url: "#",
```

### Re-check every link

```sh
grep -oE '(github|url): "[^"#]+"' data/projectsDat.ts \
  | sed -E 's/^(github|url): "(.*)"$/\1 \2/' \
  | while read kind u; do
      echo "$kind $(curl -sL -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' --max-time 20 "$u") $u"
    done
```

Expected after the fix: all 200.

### Later (optional)

- DeStackOverflow and CrewS could get their live demos back by redeploying from their repos (e.g. Vercel). Until then, repo + video is the honest state.
- Already linkless by design (`"#"`): Monoma and SettleX repos, SoLingo and JailBreak live links, Stock Prediction (no links; the modal hides its footer).

---

## 2. About portrait — black-and-white photo (agreed, parked)

Decision: replace the particle portrait on desktop About with the black-and-white studio photo already shown on the phone Home hero.

| Aspect | Now | Planned |
| --- | --- | --- |
| Source | `public/images/Speaker.png`, 2031², **3.2 MB**, sampled into particles by `components/Particle.tsx` | `public/images/Suvraneel_DP.jpeg`, 1456², **81 KB** |
| Where | `app/about/AboutPage.tsx`, right column (`<aside>`, `lg` and up) | Same column |
| Look | Colour cut-out with mic, cyan radial glow, hairline divider | Low-key B&W on pure black, merging into the page |

### Plan

- The photo fills the column height (`object-cover`), anchored to the bottom; its black ground blends into the page black.
- A soft mask fades the left and top edges, so no rectangle edge ever shows.
- Remove the cyan radial glow (it would tint a B&W photo), the `border-l` divider, the particle canvas and its mousemove listener, and `Speaker.png` (used only by `Particle.tsx`).
- Arrival: a slow fade-in matching the site's other reveals; static under reduced motion.
- About gets ~3 MB lighter. Spec items P-1 and Q-3 (particle leak, oversized PNG) become moot.

### Open decision: mirror the photo?

You look toward the frame's right edge. In a right-hand column that points your gaze off the page, away from the text. Mirroring turns it toward the content (a common editorial move); the cost is that the watch and ring switch hands.

### Accept

- At 1024, 1280 and 1440 widths, no visible edge or seam around the photo; the face isn't cropped.
- No requests for `Speaker.png` on any route.
- Phones are unchanged (the column is `lg`-only; the Home hero keeps its photo).

---

## 3. Everything else still open

Every item in `PORTFOLIO_FIX_SPEC.md` was re-checked against the code on 2026-10-15 (its checkboxes are stale). Of 76 items: 15 done, 5 closed by a decision, 2 blocked on D6, **54 still open or partly done**. Grouped by what each needs from you.

### 3.0 Ship first

- Shipped: the recent work is live on `main`, GA included [K-6]. `develop` is behind `main`; fast-forward it (`git switch develop && git merge --ff-only main`) to go back to the PR flow, which CI now gates [K-7].

### 3.1 Bugs — fixed 2026-10-15 (uncommitted)

All eleven fixed, each checked in the browser by an independent reviewer; tsc, eslint and `next build` pass. Viewports at least 1024px wide and 600px tall are unchanged.

| ID | Problem | What changed |
| --- | --- | --- |
| H-4 | Load Home at ≤550px, then widen or rotate: no scene, no text. | The scene loads when the viewport crosses 550px. Until it's ready, the HTML hero stays on screen, but only for a visitor who started at phone width or when the scene failed. Arriving from another page keeps the old backdrop. |
| N-5 | Short windows clipped the rail's Skills/Contact links. | Hamburger instead of the rail at `max-height: 520px` too; Work's plant offset follows the same rule. |
| H-9 | Blocked site storage crashed Home's preloader. | Guarded; counts as a first visit. |
| F-2 | A failed heading texture made every H1 invisible; the drift ignored reduced motion. | Accent colour under the texture (shows only if it fails); drift stops under reduced motion. |
| N-2 | Home swallowed wheel/keys when the flip couldn't start. | Input is only taken when the flip starts. About's wheel handler also leaves an open drawer alone. |
| L-3 | About's content under the rail at 769–1023px. | Rail offset at those widths. |
| L-2 | Work at 768–1000px: H1 clipped, timeline squeezed. | The plant stays. The H1 steps down fluidly from 768 to ~897px, and at 768–881px entries use the stacked phone layout (no spine or dots). From 882px up, unchanged. |
| Q-4 | Invisible plant canvas created at 551–767px. | The plant mounts only when its column shows, and syncs to the scroll when it does. |
| P-8 | Modal close lost keyboard focus; videos autoplayed under reduced motion. | Focus returns to the tile; no autoplay or hover play under reduced motion. |
| P-10 | No send timeout; Calendly lost focus; success not announced. | 15s timeout to the error state; focus back on "Book a conversation"; persistent live region. A re-render no longer pulls focus inside the open scheduler. |
| K-5 | No spam protection. | Hidden `_gotcha` honeypot (a name no autofill fills) and length limits (100 / 254 / 5000). |

Still yours: restrict allowed origins in the EmailJS dashboard (the public key ships in the bundle).

### 3.2 Accessibility and performance — fixed 2026-10-15 (uncommitted)

All twelve fixed and independently reviewed; eslint and `next build` pass, and the sounds were also checked in the production build.

| ID | What changed |
| --- | --- |
| A-2 | Keyboard focus opens the rail like hover does, so the GitHub/LinkedIn/Twitter icons are reachable; outlines sit inside the rail. A mouse click no longer leaves focus on rail controls (it reopened the rail on the next scroll key). |
| A-3 | Reduced motion: the drawer fades instead of sliding; the Home scene holds still once ready (flip and links still work). |
| A-4 | Work's scroller takes keyboard focus (Tab, then arrows/Page keys scroll it); no ring on mouse or wheel arrivals. |
| A-5 | Project tiles: one clean screen-reader name each; no visual change. |
| A-6 | Contact underlines meet 3:1 contrast (slightly brighter); focus moves to the success message after sending. |
| A-7 | Nothing behind the first-visit preloader can be focused. |
| N-6 | Drawer: current page marked (accent colour + `aria-current`); fixed the border class that never rendered; the page behind no longer scrolls while it's open. |
| N-8 | Rail opens with the site's ease; no animation under reduced motion. |
| Q-1 | Projects no longer downloads the 7 tile videos (5–16 MB each) on load: each loads on first hover, never on phones or under reduced motion. Each tile shows its first frame as a ~13–68 KB poster (`*.poster.webp`), so it looks as before. |
| Q-2 | Sounds load on the first interaction, not with the page; one shared player per sound (`hooks/useSfx.ts`); AAC `.m4a` files about a tenth of the WAVs, which stay as fallback. The 4.5 MB music file loads only on Play. `use-sound` replaced by `howler`. |
| Q-6 | Monoma thumbnail 2 MB → 474 KB and the Web3Conf logo shrunk, same paths, same look. |

When committing, add the new files: `hooks/useSfx.ts`, `public/sounds/*.m4a` and `public/images/project-assets/*.poster.webp`. Without the `.m4a` files every sound goes silent.

Possible follow-up (needs your OK): Spline runtime 2.0.75 redraws the Home scene every frame even when idle. The reduced-motion fix contains a patch that stops this; applying it for all visitors would cut idle GPU work.

### 3.3 Your tasks

| ID | Task |
| --- | --- |
| K-4 | Re-export the résumé PDF: current title, github.io domain only, no personal phone number. |
| S-2, C-5 | D6 is still deferred: the Skills "my forte" proof line and the titles/figures consistency wait on it. |
| Z-4 | `scene-plantNEW` logs "file is more recent than the library" on runtime 2.0.75 (latest is 2.0.82). If bumped, the plant scrub (`lib/splineScroll.ts`) must be re-checked; it uses runtime internals. |

### 3.4 Needs your design or copy approval

| ID | Proposal |
| --- | --- |
| K-3 | Recruiter path: a Résumé entry in the rail/drawer and a closing "Get in touch / Download résumé" band on Work, Projects, Skills (after K-4). |
| P-9 | Skills: show all four areas instead of tabs (the strongest proof, 18+ MCP tools, is hidden behind one). |
| L-1, F-7 | One page shell: same top padding, gutter and H1 size/tracking on tablet and desktop (phones are done). |
| P-6 | Project tiles: DeStackOverflow/EthCommerce/Meteorologyly titles clip; hover panel repeats the name. |
| C-3, C-4 | Apply the approved D1 full-stack positioning line across meta, Home, llms.txt and the product docs. |
| K-9 | Branded error page (a client crash currently wipes the whole shell); the 404 is done. |
| H-8 | Phone Home hero: textured heading, CTA labels, alt text that matches the photo. |
| P-2 | About copy: drop the "Profile" eyebrow, reword the second "I like…", add a `<main>` landmark. |
| A-1 | Raise small low-alpha text to ≥ white/60 for contrast. |
| F-4 | Socials hover: accent instead of per-brand colours (removes the last purple). |
| P-4 | Remove the neon glow on the Work timeline dots. |
| F-3 | Colour/radius tokens: ~11 hard-coded surface blacks and 2 stray cyans onto shared tokens. |

### 3.5 Engineering hygiene

| ID | What's left |
| --- | --- |
| K-8 | Commit Playwright e2e specs for the scroll/modal/drawer guards and the Spline link guard. |
| K-2 | Left after next 16.4.2 and the source-map-js override: the shadcn CLI's MCP SDK chain (MCP SDK, hono, ip-address; dev-only, gone if the CLI is run with `bunx shadcn@latest` instead of kept as a devDependency), braces (no fix released) and tailwind's postcss-selector-parser 6 (build-time). |
| F-1 | Font variables never reach `<html>` (`--font-TASAOrb` undefined); Tailwind `sans` is `serif`; rail labels ask for an unhashed font name. |
| F-5 | ~180 lines of dead CSS in globals.css (swirl, jello, iframe-container, equalizer, `hr`), plus two unused CSS modules. |
| F-6 | `--rail-w` variable and a named z-index scale instead of literals. |
| Z-1 | Remove `stateLogger`: ProjectModal logs mount/unmount to the console in production. (HamsterLoader is deleted.) |
| P-7 | Project data typos (U+2011 hyphens, "fromm", "an wallet", e.g./i.e., full stops). |
| — | Stray empty directory named `*` at the repo root (untracked). |

Not listed: done or closed items (N-1, N-3, N-4, N-7, N-9, H-1, H-2, H-3, H-6, H-7, L-4, P-3, Q-5, Q-7, X-1–X-3, Z-2, Z-3, C-6), and the portrait items (P-1, Q-3), which section 2 replaces.

---

### 3.6 Apple design audit (2026-10-22): still open

Fixed so far: dropped-click confirm sound, wheel cooldown, sound loading/queueing/touch, plant render-on-demand, About `<main>`, touch-pull hysteresis/axis/re-grab, edge keys, reduced-motion edge bounce, fling momentum at an edge. In review: typography (leading, faux bold, Work hierarchy, contrast), lift/flip ease, rail label font, Skills panel direction, rubber-band pull, pill fill, drawer swipe-to-close, Calendly motion.

| Item | Note |
| --- | --- |
| Touch throw at finger speed | The page always leaves at ~5,500 px/s; a quick flick never commits (no momentum projection). |
| Reversible transitions | Phase 0: queue clicks made in flight. 1: Back reverses in place. 2: reverse wheel/pull/click. 3: velocity-continuous reversal. |
| Root font size (item 9) | `112.5%` / `calc(15rem/18)` respects the browser's text size but needs heading caps and a rem rail first (overflow at 125%+). |
| No-GPU desktop Home | The static fallback shows the phone hero, sparse at desktop width. Needs a design. |
| Smaller | Pointer-down feedback on rail/tabs; rail shows two current items mid-lift; modal origin barely moves; heading drift repaints forever and jumps at its loop seam; no reduced-transparency/contrast handling; reduced-motion hover cuts; rail opens by animating width; pre-tilt velocity dropped at the flip; wheel edge hint doesn't move the page; About→Work takes one notch vs 520 px back; hover sounds have no mute; phone "Contact me" leaves the site without saying so. |

## Decided / dropped

- Duotone/tritone grade for the portrait and project thumbnails: dropped (looked bad).
- Hairline-style covers and illustrations: dropped.
- Plant ground glow in WebGL-only browsers (3-stop gradient layer): dropped by owner.
- Cyan pull-pill fill: replaced by a faint white fill.
