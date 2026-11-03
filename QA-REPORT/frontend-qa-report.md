# MONTÉRRE — Frontend QA Report

**Auditor:** Frontend QA Specialist  
**Scope:** Desktop-only technical audit (1920×1080, 1440×900, 1280×800)  
**Mode:** AUDIT ONLY — no website source modifications  
**Date:** 2026-11-03  
**Stack:** React 19 + Vite 7 + GSAP ScrollTrigger + Three.js  

---

## 1. Executive summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High | 8 |
| Medium | 9 |
| Low | 6 |
| **Total** | **23** |

Build succeeds with a Vite chunk-size warning. No broken imports; runtime pageerrors were empty in a Playwright smoke pass at 1920×1080. Highest-impact defects: Collection horse clipped inside the pinned gallery viewport, ~88MB of eagerly loaded media (GLB + 4 videos + large PNGs), continuous WebGL RAF + ReadPixels stall on door texture prep, broken `#horse-id` anchors, and mixed `100vw` / `100cqw` scale units that can desync layout and logo morph math when a classic scrollbar is present.

---

## 2. Architecture overview

```
index.html
  └─ src/main.jsx  (StrictMode)
       └─ App.jsx  (<main id="top">)
            ├─ SiteLogo          fixed crest → docks into #contacts-logo
            ├─ Hero              id="membership"
            ├─ Gallery           id="collection"  [ScrollTrigger pin]
            │    └─ Collection   (slide 0; not mounted from App)
            │    └─ 6 horse slides (arabella…isabelle)
            │    └─ fur transition (GSAP yPercent)
            ├─ Philosophy        id="philosophy"
            ├─ Estate            id="estate"  [Three doors + ScrollTrigger scrub]
            │    └─ panels: stables, arena, paddocks, clubhouse
            ├─ Quiet             id="essence"  [ScrollTrigger art path]
            ├─ Passage           id="craft"
            ├─ Heritage          id="heritage"
            └─ Contacts          id="contacts" + #contacts-logo dock
```

**Styles:** Global `src/styles/index.css` + `fonts.css`; per-section `*.css` beside each component.  
**Utils:** `src/utils/jump.js` — instant `scrollTo` with pin-spacer awareness.  
**3D asset:** `3D/Door/saloon_door.glb` imported via `?url` from `Estate.jsx`.

---

## 3. Build / dependency status

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** (vite 7.3.7, ~2.7s) |
| Broken imports | None observed |
| Chunk warning | Yes — single JS bundle **999.23 kB** (gzip 285.63 kB) |
| Largest assets in `dist/` | `saloon_door.glb` **21.99 MB**; videos **~29.5 MB** combined; many 2–3.3 MB PNGs |
| Sum of large dist media | **~88 MB** (`mp4`+`glb`+`png`+`jpg`) |
| `vite.config.js` | No `manualChunks`, no asset budget, no lazy routes |

**Build log (excerpt):**

```
dist/assets/index-HLg0pXLW.js                           999.23 kB │ gzip: 285.63 kB
dist/assets/saloon_door-BYRNu9RP.glb                 21,993.40 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 2.67s
```

Dependencies (`package.json`): `react`/`react-dom` 19.2, `gsap` 3.15, `three` 0.186, `vite` 7.x — all resolve in the production build.

---

## 4. Full issue list

### FQA-001 — Collection artboard clipped inside 100vh gallery slide
- **File / component / selector:** `Gallery.css` `.gallery__slide--collection .collection`; `Collection.css` `.collection__horse`
- **Description:** Collection is authored for aspect `1920/1159` with absolute layers sized to `1159 × --u`. Inside the gallery pin, that aspect is forced to `aspect-ratio: auto; height: 100%` (viewport height) with `overflow: hidden`.
- **Why it is a problem:** At 1920×1080, design height scales to ~1159px while the slide is 1080px tall, so the lower horse is cropped.
- **Potential consequences:** Horse legs/bridle cut off on the primary desktop viewport; “Scroll” cue near `y:948` survives but the composite no longer matches Figma Frame 8.
- **Recommended correction:** Scale Collection to fit both width and height inside the slide (e.g. `--u` from `min(cqw/1920, cqh/1159)`), or letterbox; do not stretch a 1159-tall composition into 1080 and clip.
- **Severity:** High
- **Evidence:** Playwright @ 1920×1080: `collectionH: 1080`, `horseBottomInSection: 1159.08`, `clipped: true`. CSS override in `Gallery.css` lines 72–76 vs `Collection.css` aspect-ratio 1920/1159.
- **Related visual risk:** HORSE panel incomplete at bottom on 16:9 desktops.

### FQA-002 — Eager ~22 MB GLB + four `preload="auto"` loop videos
- **File / component / selector:** `Estate.jsx` (`doorModelUrl`, four `<video preload="auto" autoPlay>`)
- **Description:** Production build emits `saloon_door.glb` (~22 MB) and four MP4s (~5–9.7 MB each). Videos use `preload="auto"` and `autoPlay` on mount; GLB is imported statically.
- **Why it is a problem:** First visit downloads tens of MB of Estate media even before the user reaches that section; main thread + network contended with gallery PNGs.
- **Potential consequences:** Slow LCP/TTI on desktop networks; jank when Estate mounts; bandwidth waste if users never scroll to Estate.
- **Recommended correction:** Lazy-load GLB when `#estate` approaches viewport; `preload="metadata"` or `none` until near; play/pause via IntersectionObserver.
- **Severity:** High
- **Evidence:** Build asset list; `Estate.jsx` video props `preload="auto"` / `autoPlay`; dist media sum ~88 MB.

### FQA-003 — Continuous WebGL render loop + ReadPixels stall on door texture
- **File / component / selector:** `Estate.jsx` `tick` / `loadDoorTexture`
- **Description:** After mount, `requestAnimationFrame` always calls `renderer.render` regardless of visibility or door motion. `loadDoorTexture` draws the leaf PNG to canvas and walks every pixel (`willReadFrequently`), which triggers GPU ReadPixels stalls.
- **Why it is a problem:** Permanent main-thread/GPU cost for a scrub-driven pose that only changes on scroll; pixel walk blocks while decoding a ~2.8 MB PNG.
- **Potential consequences:** Scroll jank site-wide while Estate is mounted; elevated GPU use; console performance warnings.
- **Recommended correction:** Render on ScrollTrigger/`pose` updates (and resize) only; pre-process cutout offline or with a shader; dispose RAF when off-screen.
- **Severity:** High
- **Evidence:** Playwright console warnings: `GPU stall due to ReadPixels` (repeated). Code: `tick` loop at lines 325–329; `getImageData` path in `loadDoorTexture`.

### FQA-004 — Gallery “VIEW HORSE” links target missing IDs
- **File / component / selector:** `Gallery.jsx` `href={\`#${horse.id}\`}`
- **Description:** CTAs link to `#arabella`, `#eleanor`, `#valentino`, `#adrian`, `#theodore`, `#isabelle`, but horse `<article>` elements never set `id={horse.id}`.
- **Why it is a problem:** Native hash navigation and any future `jumpTo` usage resolve to nothing.
- **Potential consequences:** Dead CTAs; broken deep links; Interaction QA failures on click.
- **Recommended correction:** Add `id={horse.id}` on each article, or point href to a real destination / remove dead links until pages exist.
- **Severity:** High
- **Evidence:** Playwright `missingAnchors`: all six horse ids. Grep shows no `id={horse.id}` in JSX.

### FQA-005 — Mixed `100vw` vs `100cqw` scale units across pinned gallery / philosophy / estate
- **File / component / selector:** `.gallery` / `.gallery__slide` / `.philosophy` / `.estate` / `.quiet` / `.passage` / `.site-logo`
- **Description:** Gallery outer `--u` and slide width use `100vw`; slide-internal `--u` uses `100cqw`. Philosophy margin-top uses `100vw` while `.philosophy__frame` uses `100cqw`. Estate/Quiet/Passage use `100vw`; Contacts/Heritage/Collection use `100cqw`. SiteLogo CSS uses `100vw`/`100dvh`.
- **Why it is a problem:** Classic scrollbars make `100vw` larger than the layout width (`clientWidth` / `cqw`), so slide width can exceed the viewport clip box and adjacent section seams (fur hang vs philosophy tuck) can disagree by scrollbar width.
- **Potential consequences:** 1px seams, horizontal overflow inside the pin, fur/philosophy gap (“дырка”), logo vs hero spacer mismatch.
- **Recommended correction:** Standardize desktop Scale on `cqw` (or `100%` of a width container); keep slide width = container width, not `100vw`.
- **Severity:** High
- **Evidence:** `Gallery.css` lines 14, 58–64; `Philosophy.css` lines 14–24; `Estate.css`/`Quiet.css`/`Passage.css` `--u: calc(100vw / 1920)`; `Contacts.css` comment explicitly avoids `100vw` scrollbar drift.

### FQA-006 — SiteLogo morph JS unit ≠ CSS idle `--u`
- **File / component / selector:** `SiteLogo.jsx` `sync()`; `SiteLogo.css` `.site-logo`
- **Description:** Idle CSS: `--u: min(100vw / 1920, 100dvh / 1080)`. Morph math: `contacts.clientWidth / 1920` (no height clamp). Hero spacer uses `min(100cqw/1920, 100cqh/1080)`.
- **Why it is a problem:** When morph begins, `liveBaseTop` / `liveBaseH` can differ from the computed CSS top/height, causing a visible jump before lerp.
- **Potential consequences:** Crest size/position pop near Contacts; misalignment vs hero nav spacer on short/wide viewports.
- **Recommended correction:** Share one unit function (same inputs as CSS) between Hero spacer, SiteLogo CSS, and morph JS.
- **Severity:** High
- **Evidence:** `SiteLogo.jsx` lines 155–162 vs `SiteLogo.css` lines 3–12 vs `Hero.css` `--u` lines 52–53.

### FQA-007 — Monolithic JS chunk (~1 MB) includes Three + GSAP eagerly
- **File / component / selector:** Vite build output `dist/assets/index-*.js`; `Estate.jsx` static `import * as THREE`
- **Description:** No route- or section-level `import()`; Three, GSAP, and app code ship in one 999 kB chunk.
- **Why it is a problem:** Parse/compile cost hits before Hero is interactive; Estate 3D code loads for all visitors.
- **Potential consequences:** Vite warning; slower first interaction on desktop CPUs; harder caching of stable vendor code.
- **Recommended correction:** Dynamic `import()` for Estate/Three (and optionally GSAP sections); `manualChunks` for `three` / `gsap`.
- **Severity:** High
- **Evidence:** Build warning “chunks are larger than 500 kB”; single `index-HLg0pXLW.js` 999.23 kB.

### FQA-008 — Estate panel CTAs say “VIEW HORSE” and hash to self
- **File / component / selector:** `Estate.jsx` `.estate__cta`
- **Description:** Each panel CTA label is `VIEW HORSE` with `href={\`#${panel.id}\`}` (e.g. `#stables`), i.e. the same article.
- **Why it is a problem:** Copy is gallery leftover; link is a no-op self-jump (element already in view when clicked from within the panel).
- **Potential consequences:** Misleading UX; Interaction QA noise; Quiet.css comment even references “VIEW HORSE button” over Estate.
- **Recommended correction:** Replace label with estate-appropriate CTA or remove until destination exists; don’t hash to self.
- **Severity:** High
- **Evidence:** `Estate.jsx` lines 461–466; Quiet.css line 4 comment.

### FQA-009 — Philosophy scroll cue stacking vs Estate fur (`z-index: 3` on `.estate`)
- **File / component / selector:** `Philosophy.css` `.philosophy` / `.philosophy__scroll`; `Estate.css` `.estate` / `.estate__fur`
- **Description:** Comment claims omitting `z-index` on `.philosophy` avoids trapping the scroll arrow under Estate fur. `.estate` still has `z-index: 3`, so the entire Estate stacking context paints above Philosophy (auto).
- **Why it is a problem:** Documented intent contradicts stacking rules; lower Philosophy chrome under fur may be accidental or undocumented.
- **Potential consequences:** Scroll cue partially/fully covered in the overlap band; future z-index edits easy to get wrong.
- **Recommended correction:** Decide intentional cover vs visible cue; set explicit stacking (e.g. raise only the scroll cue via a portal/sibling above fur, or accept cover and fix the comment).
- **Severity:** Medium
- **Evidence:** `Philosophy.css` lines 12–13 comment; `Estate.css` `.estate { z-index: 3 }` and `.estate__fur { top: calc(-416.768 * var(--u)) }`.

### FQA-010 — Door GLTF assumes `HingePivot` always exists
- **File / component / selector:** `Estate.jsx` `gltf.scene.getObjectByName("HingePivot")`
- **Description:** No null check or `onError` on `GLTFLoader.load`. If the named node is missing, `source.position.set` throws.
- **Why it is a problem:** Latent hard crash path on asset rename/corrupt fetch.
- **Potential consequences:** Blank doors + uncaught exception tearing down the effect; possible stuck ScrollTrigger if throw escapes oddly (currently inside loader callback).
- **Recommended correction:** Guard null; log; `onError` handler; don’t call `prepareLeaf` without a pivot.
- **Severity:** Medium
- **Evidence:** `Estate.jsx` lines 282–289 — direct use of `source` without optional chaining.

### FQA-011 — Texture `onload` can mutate after `photo.dispose()` (StrictMode / fast unmount)
- **File / component / selector:** `Estate.jsx` `loadDoorTexture` + effect cleanup
- **Description:** Cleanup sets `alive = false` and `photo.dispose()`, but the `Image` `onload` closure does not check `alive` before writing `photo.image` / `needsUpdate`.
- **Why it is a problem:** React StrictMode remounts effects; a late onload can touch a disposed Texture.
- **Potential consequences:** Console errors, leaked canvas memory, rare WebGL warnings.
- **Recommended correction:** Check `alive` (or an `AbortFlag`) inside `onload`; revoke/remove image handlers on cleanup.
- **Severity:** Medium
- **Evidence:** `alive` checked only in GLTF callback (line 283), not in `image.onload` (lines 113–164); cleanup disposes `photo` at line 339.

### FQA-012 — Duplicate Inter Tight `@font-face` sources (variable + static Medium/SemiBold)
- **File / component / selector:** `src/styles/fonts.css`
- **Description:** Inter Tight is declared as variable TTFs (100–900) and again as static Medium (500) and SemiBold (600) files. Build emits all four (~580+593+309+308 kB).
- **Why it is a problem:** Overlapping family/weight matching can download redundant files (FOUT cost).
- **Potential consequences:** Extra ~600 kB font bytes; inconsistent glyph metrics if faces disagree.
- **Recommended correction:** Keep variable faces only, or static subset only — not both for the same weights.
- **Severity:** Medium
- **Evidence:** `fonts.css` lines 17–47; dist font assets listed in build output.

### FQA-013 — Large PNGs without responsive `srcset` / modern formats
- **File / component / selector:** Hero, Collection, Gallery horse images, Passage horse body, etc.
- **Description:** Multiple 2–3.3 MB PNGs are imported as single URLs. Gallery sets `sizes` but no `srcset`. No AVIF/WebP pipeline in Vite config.
- **Why it is a problem:** Desktop still downloads full masters even at 1280×800; PNG for photographic content is heavy vs JPEG/WebP.
- **Potential consequences:** Multi-second image waterfalls; memory pressure with six gallery slides + collection layers.
- **Recommended correction:** Compress, emit width variants + `srcset`, prefer WebP/AVIF for photos; keep PNG only where alpha required.
- **Severity:** Medium
- **Evidence:** Build sizes e.g. `hero-photo` 3.28 MB, `collection-bg` 3.36 MB, horse PNGs ~2.2–2.9 MB; `Gallery.jsx` `sizes` without `srcset`.

### FQA-014 — Gallery track / fur `will-change` left on permanently
- **File / component / selector:** `Gallery.css` `.gallery__track`, `.gallery__nav`, `.gallery__fur`
- **Description:** `will-change: transform` (and opacity on nav) is unconditional for the life of the section.
- **Why it is a problem:** Promotes large layers for the entire pin duration (long scroll distance).
- **Potential consequences:** Extra GPU memory on 1920+ displays; compounding with full-bleed images.
- **Recommended correction:** Apply `will-change` only while scrubbing/pin active, then remove.
- **Severity:** Medium
- **Evidence:** `Gallery.css` lines 52, 328, 419.

### FQA-015 — Quiet art motion uses `window.innerWidth / 1920` vs CSS `100vw` `--u`
- **File / component / selector:** `Quiet.jsx` `apply()`; `Quiet.css` `.quiet`
- **Description:** JS positions “The art / is in the / process” with `innerWidth/1920` while section layout uses `100vw/1920`.
- **Why it is a problem:** Another vw/layout split; on some browsers `innerWidth` ≠ `100vw` behavior with scrollbars.
- **Potential consequences:** Path endpoints drift vs Time/discipline/trust marks (CSS-positioned) at 1440/1280 with classic scrollbar.
- **Recommended correction:** Drive both from the same measured section width (`range.parentElement.clientWidth`).
- **Severity:** Medium
- **Evidence:** `Quiet.jsx` line 71; `Quiet.css` line 10.

### FQA-016 — `jumpTo` for in-gallery horse ids cannot work (no elements)
- **File / component / selector:** `utils/jump.js` + Gallery CTAs
- **Description:** Related to FQA-004: even footer/explore patterns that might later target horses would no-op because `getElementById` returns null.
- **Why it is a problem:** Anchor contract is incomplete for Collection horses.
- **Potential consequences:** Future nav items silently fail.
- **Recommended correction:** Same as FQA-004; optionally map horse jumps to Gallery ScrollTrigger progress (like `goTo`).
- **Severity:** Medium
- **Evidence:** Playwright missing anchors; `jump.js` lines 7–8 early return when missing.

### FQA-017 — Estate canvases extend `120 * --u` below doors stage
- **File / component / selector:** `Estate.css` `.estate__doors-canvas`
- **Description:** Canvas height is `100% + 120 * var(--u)` while stage is `inset: 0` of doors block; overflow visible on doors.
- **Why it is a problem:** Open-door rendering intentionally overlaps, but hit-testing/overflow into the first video panel depends on z-index (`canvas` pointer-events none — OK) and paint order.
- **Potential consequences:** Visual overlap onto “01 STABLES” if pose/layout metrics drift (code comments acknowledge the risk).
- **Recommended correction:** Keep as designed but add a regression assert for free-edge vs kicker Y after layout.
- **Severity:** Medium
- **Evidence:** `Estate.css` lines 54–62; `Estate.jsx` layout comments lines 266–270.

### FQA-018 — Hero dual decode of full photo (bg + mask layer)
- **File / component / selector:** `Hero.jsx` `.hero__photo` + `.hero__photo-fg`
- **Description:** Same `hero-photo.png` (~3.3 MB) is used twice for mask stacking.
- **Why it is a problem:** One network fetch (cached) but two image decodes / two GPU textures likely.
- **Potential consequences:** Extra memory on first viewport; minor decode cost.
- **Recommended correction:** Accept for art direction, or composite mask in a single canvas/CSS once.
- **Severity:** Low
- **Evidence:** `Hero.jsx` lines 18–26 and 117–128; build asset `hero-photo-*.png` 3.28 MB.

### FQA-019 — Heritage “Our story” is non-interactive `<p>`
- **File / component / selector:** `Heritage.jsx` `.heritage__link`
- **Description:** Styled as a text+arrow control but rendered as `<p>`, no `href`/`button`.
- **Why it is a problem:** Affordance without behavior.
- **Potential consequences:** User expects navigation; keyboard users get nothing.
- **Recommended correction:** Make a real link/button or restyle as static caption.
- **Severity:** Low
- **Evidence:** `Heritage.jsx` lines 73–82.

### FQA-020 — Contacts legal link hashes to `#contacts` (self)
- **File / component / selector:** `Contacts.jsx` `.contacts__legal`
- **Description:** “Privacy policy · Terms” points at `#contacts`.
- **Why it is a problem:** Placeholder destination.
- **Potential consequences:** Click appears broken; accessibility name implies legal pages.
- **Recommended correction:** Real URLs or `aria-disabled` placeholder until pages exist.
- **Severity:** Low
- **Evidence:** `Contacts.jsx` lines 178–179.

### FQA-021 — Dead mobile media-query selectors in Hero
- **File / component / selector:** `Hero.css` `@media (max-width: 768px)` `.hero__nav-link--stables`
- **Description:** Selector references a class not present in `Hero.jsx` (desktop audit notes only — not a redesign ask).
- **Why it is a problem:** Dead CSS; signals drift from older nav IA.
- **Potential consequences:** None at desktop targets; maintainability noise.
- **Recommended correction:** Remove dead selector when next touching Hero CSS.
- **Severity:** Low
- **Evidence:** `Hero.css` lines 391–394 vs nav classes in `Hero.jsx`.

### FQA-022 — Unused / duplicate source assets outside the module graph
- **File / component / selector:** `src/assets/images/estate-*.png`, `doors-leaf-right.png`, `doors-saloon.png`, `hero-photo-wide.jpg`, root `src/*.svg`, `Images/` design exports
- **Description:** Many large files are not imported by components (Estate uses videos; right leaf is mirrored in Three from left texture).
- **Why it is a problem:** Repo weight and confusion; risk of accidentally re-importing duplicates into the bundle.
- **Potential consequences:** No runtime cost today; future import could double Estate weight.
- **Recommended correction:** Keep design refs outside `src/` or document as non-bundled; avoid importing unused masters.
- **Severity:** Low
- **Evidence:** Grep of imports vs `du` listing; Estate only imports `doors-leaf-left.png`.

### FQA-023 — Gallery ScrollTrigger pin distance is very long (main-thread scrub)
- **File / component / selector:** `Gallery.jsx` `SCROLL_*` constants + `pin: true`
- **Description:** Pin end ≈ `SCROLL_TOTAL_W * innerHeight * 1.7` with holds/moves/fur segments; `onUpdate` runs nav motion every scrub tick.
- **Why it is a problem:** Long pinned region keeps gallery layers and ST callbacks active; compounded by FQA-003 when Estate later mounts (Estate stays mounted from first paint).
- **Potential consequences:** Prolonged jank window on trackpads; harder scroll-linked debugging.
- **Recommended correction:** Profile scrub cost; throttle nav updates; ensure Estate RAF is idle until visible (see FQA-003).
- **Severity:** Low
- **Evidence:** `Gallery.jsx` constants lines 31–40, pin config 321–337; cleanup kills ST correctly (lines 360–364).

---

## 5. Cross-cutting themes

### Units (`--u` / `cqw` / `vw`)
Desktop Scale is inconsistently implemented: **cqw** in Collection/Contacts/Heritage/slide interiors; **vw** in Gallery shell, Philosophy tuck, Estate, Quiet, Passage, SiteLogo. Comments in Contacts correctly identify scrollbar drift — other sections have not adopted that fix (FQA-005, FQA-006, FQA-015).

### GSAP / ScrollTrigger
Gallery and Estate timelines kill `scrollTrigger` + timeline on unmount; Quiet kills its trigger and removes resize listener. No missing `removeEventListener` found on audited effects. StrictMode double-mount is mitigated for ST; texture onload race remains (FQA-011). `ScrollTrigger.refresh()` called after setup in Gallery/Estate/Quiet.

### Logo pin / settle
SiteLogo: IntersectionObserver fade, scroll-linked morph, DOM reparent into `#contacts` as `position: absolute` — cleanup reparents and clears inline styles. Unit mismatch with CSS/Hero is the main technical risk (FQA-006), not missing teardown.

### Assets / fonts
Build is dominated by GLB + MP4 + PNG masters. Font stack ships overlapping Inter Tight faces. Photographic PNGs lack responsive variants.

### Overflow / mask / z-index
Hero mask geometry is coherent (shared `--s` scene). Gallery fur uses clip-path + dual mask gradients + soil/cap seals (intentional complexity). Estate `z-index: 3` and Quiet `z-index: 4` create deliberate overlap stacking into Philosophy/Passage; philosophy scroll vs fur needs an explicit decision (FQA-009).

---

## 6. NOT TESTED / UNVERIFIED

| Item | Status |
|------|--------|
| Full Visual QA pixel diffs vs Figma at 1920 / 1440 / 1280 | **NOT TESTED** (out of Frontend QA scope) |
| Interaction QA (keyboard, focus traps, reduced-motion full pass) | **NOT TESTED** beyond Quiet’s `prefers-reduced-motion` early path existing in code |
| Lighthouse / Web Vitals on production preview | **NOT TESTED** |
| Network waterfall ordering on cold cache (only build sizes + smoke scroll) | **NOT TESTED** in depth |
| GLB contents / `HingePivot` integrity beyond successful load assumption | **UNVERIFIED** (no crash in smoke; null path unexercised) |
| Exact scrollbar-pixel seam magnitude per browser (Chrome vs Firefox vs Safari) | **UNVERIFIED** — defect class confirmed in CSS, magnitude browser-dependent |
| Whether Estate door free edge overlaps “01 STABLES” after open at all three desktop sizes | **NOT TESTED** numerically |
| Service worker / CDN caching behavior | **NOT TESTED** (none configured) |
| Console beyond Playwright Chromium smoke (WebGL ReadPixels seen) | Partial — **NOT TESTED** on Safari/Firefox |
| `npm run build` on CI matrix / Node versions | **NOT TESTED** (local pass only) |

---

## 7. Suggested fix order (advisory)

1. **FQA-001** — Stop clipping Collection in the pin (highest visible desktop defect).  
2. **FQA-004 / FQA-016 / FQA-008** — Fix or remove dead CTAs (horses + Estate copy).  
3. **FQA-005 / FQA-006 / FQA-015** — Unify Scale units (`cqw` / measured width) across CSS + logo JS + Quiet JS.  
4. **FQA-002 / FQA-003 / FQA-007** — Lazy-load Estate media/Three; render-on-change; split chunks.  
5. **FQA-012 / FQA-013** — Font face dedupe + image compression/`srcset`.  
6. **FQA-009 / FQA-010 / FQA-011** — Stacking clarity + loader/texture safety.  
7. **FQA-014 / FQA-017 / FQA-018–023** — Lower-priority hardening as touched.

---

## Appendix A — Component tree (entry map)

| Order | Component | DOM id | Motion / special |
|------:|-----------|--------|------------------|
| 0 | `SiteLogo` | (none; docks `#contacts-logo`) | scroll morph + IO |
| 1 | `Hero` | `membership` | CSS only |
| 2 | `Gallery` → `Collection` + horses | `collection` | GSAP pin + fur |
| 3 | `Philosophy` | `philosophy` | static |
| 4 | `Estate` | `estate` (+ panel ids) | Three + ST scrub |
| 5 | `Quiet` | `essence` | ST path scrub |
| 6 | `Passage` | `craft` | static overlap |
| 7 | `Heritage` | `heritage` | static |
| 8 | `Contacts` | `contacts` | logo dock target |

## Appendix B — Playwright smoke (2026-11-03)

- Viewport: 1920×1080, Chromium, `http://127.0.0.1:5173/`
- `pageerror`: none
- Console warnings: WebGL ReadPixels GPU stall (Estate texture path)
- Collection clip: confirmed
- Missing hash targets: `arabella` … `isabelle`
