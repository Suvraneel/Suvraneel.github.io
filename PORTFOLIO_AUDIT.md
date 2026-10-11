# Portfolio audit — September 2026

## Review rubric

Use this rubric for future portfolio reviews so scores remain comparable. Assess the experience on the routes and device sizes actually reviewed; record scope, browser/device, and any material limitations. Ratings describe observed usability, not personal visual preference.

### Heuristics

Rate each applicable heuristic from 1 to 4:

| Score | Meaning |
| ---: | --- |
| 1 | Major breakdown: users cannot reliably understand status or complete an important action. |
| 2 | Significant friction: the experience works, but a notable obstacle or missing state undermines it. |
| 3 | Effective: the heuristic is generally satisfied, with limited issues that do not derail the main task. |
| 4 | Strong: the experience supports the heuristic clearly and consistently across reviewed states. |

Evaluate these ten Nielsen usability heuristics in the portfolio context:

1. Visibility of system status
2. Match between the system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, and recover from errors
10. Help and documentation

Mark an item N/A only when it does not apply to the reviewed experience, and briefly state why. Exclude N/A items from both the earned points and maximum. Calculate the percentage as `earned points / (4 × applicable heuristics) × 100`, rounded to the nearest whole percent.

### Overall bands

| Percentage | Label |
| ---: | --- |
| 85–100% | Strong |
| 70–84% | Good |
| 50–69% | Acceptable |
| Below 50% | Needs attention |

For example, 19 points across 8 applicable heuristics is 19/32 = 59%, or Acceptable. The band is a summary, not a substitute for findings: report high-priority blockers separately and explain the evidence behind each rating.

Automated detector results are supporting evidence only. State what the detector scanned and its limits; a zero-finding result does not establish that content, visual hierarchy, task flow, media states, or responsive behavior are effective.

## Executive read

The portfolio is unusually memorable. It communicates curiosity, visual craft, and the willingness to build beyond a standard developer site. Its strongest impression is currently **creative Web3 builder / visual technologist**, rather than the equally valid professional story: **Advanced Application Engineering Senior Analyst who builds dependable systems**.

The opportunity is not to make it less expressive. It is to make the proof of engineering judgment as convincing as the visual experience.

| Dimension | Current assessment |
| --- | ---: |
| Memorability | 8.5/10 |
| Visual craft | 7.5/10 |
| Professional clarity | 6.5/10 |
| Recruiter confidence in engineering depth | 6/10 |
| Portfolio proof / case-study strength | 5.5/10 |

## What is working

- The Home dashboard is distinctive and immediately separates the site from a generic portfolio template.
- About establishes title, scope, working style, and personality quickly.
- Work is correctly ordered: professional experience, community and leadership, then education.
- Contact now feels like a deliberate product surface, with a real form and scheduling path.
- The dark base, display typography, cyan details, and page transitions create a recognizable voice.

## Key findings

### 1. The visual system is not fully unified

Home is a colorful 3D Web3 dashboard; About is editorial and portrait-led; Work is a plant-led timeline; Projects is a legacy product gallery; Contact is quiet technical glass. Each direction works independently, but together they can read as excellent experiments from different eras rather than one tightly controlled portfolio system.

**Direction:** keep the distinct page archetypes, but standardize the shared grammar: navigation state, CTA construction, icon weight, surface treatment, and restrained use of the display typeface.

### 2. Projects is the present credibility bottleneck

The current gallery contains browser chrome, `Press F11`, legacy product UI, and inconsistent capture quality. This makes technically meaningful work look older than the rest of the portfolio. Home promises Monoma and SettleX as featured work, but the Projects page cannot yet substantiate that promise.

**Direction:** introduce a top-level featured-work section for Monoma and SettleX when ready. Each needs a clean cover, role, problem, constraint, system decisions, measurable outcome, and links. Keep earlier work as an archive below it rather than letting it carry the main proof.

### 3. Navigation is beautiful but low-discoverability

The left icon rail is recognisable, but first-time visitors must infer its meaning. The active destination is not prominent enough, and the music control competes with more important navigation and proof.

**Direction:** preserve the rail, but make active state unmistakable and improve persistent labels or progressive disclosure for desktop and keyboard users.

### 4. The display heading needs stricter constraints

Spaceboards gives the site personality, but it is visually dominant and can appear fragmented or clipped at some widths. It works best as a display accent, not as the primary carrier of every hierarchy.

**Direction:** enforce per-page responsive width and size limits; use the readable body type for supporting hierarchy and actions.

### 5. About makes a trade-off worth being conscious about

The portrait gives About warmth and personality, but its very large crop and pixel treatment may read more creative-profile than senior-engineering portfolio.

**Direction:** retain it if the desired brand is creative technical leadership. Otherwise, reduce its dominance or use a cleaner, more intentional professional portrait treatment.

### 6. Home has a production-risk issue

Browser inspection produced repeated WebGPU errors:

```text
THREE.WebGPURenderer: Uncaptured WebGPU GPUValidationError:
Destroyed texture [Texture "ShadowDepthTexture"] used in a submit.
```

The dashboard rendered locally during review, but a 3D failure, stutter, or blank canvas is a high-risk first impression.

**Direction:** diagnose the scene/runtime lifecycle and add a lightweight static or CSS fallback for unsupported or failing GPU paths.

## Priority backlog

1. Fix Home/Spline WebGPU errors and establish a graceful fallback.
2. Build featured case studies for Monoma and SettleX.
3. Reframe the rest of Projects as a project archive with clean, intentional media.
4. Standardize navigation, CTA language, iconography, and display-type usage across routes.
5. Refactor Skills around demonstrated capability and systems ownership rather than a list or visual novelty.

## Desired recruiter conclusion

> Suvraneel is not only creative; he can own serious systems work.
