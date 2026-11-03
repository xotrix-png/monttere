# MONTÉRRE Visual QA Report

**Date:** 2026-11-03  
**Auditor:** Visual QA Specialist (audit-only)  
**Live site:** `http://127.0.0.1:5173/`  
**Figma:** [Horse / monterre](https://www.figma.com/design/CO0yT5ll32AvgonliVkn5x/Horse?node-id=6-126) — fileKey `CO0yT5ll32AvgonliVkn5x`, primary frame `6:126` (1920×24302)  
**Scope:** Desktop only — 1920×1080, 1440×900, 1280×800  

---

## 1. Executive summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High | 6 |
| Medium | 7 |
| Low | 3 |
| **Total findings** | **16** |

At **1920×1080**, Collection, horse cards, Philosophy type lockup, Quiet headline, and Contacts wordmark track Figma closely. Material gaps: Contacts location/legal bar, Estate door typography vertical shift, and hero/nav ~18px offsets. At **1440** and **1280**, hero uses `100vh` instead of width-scaled 1080 artboard height, producing 50–90px composition drift.

---

## 2. Method

| Tool | Status |
|------|--------|
| Figma MCP `create_session` | OK — session `cf06ac76-a6f0-4bf5-8a4a-4ef9d0e702d8` |
| Figma `get_metadata` on `6:126` | OK — full section tree |
| Figma `get_screenshot` | OK — Hero `374:2`, Collection `235:10`, Philosophy `277:128`, Estate `352:191` / doors `352:186`, Quiet `353:193`, Arabella `65:680`, Contacts word `342:59` |
| Playwright Chromium | OK — screenshots + `getBoundingClientRect` / computed styles |
| Fallback repo PNGs (`screenshots/`, `Images/`) | Available; used only as secondary context |

**Evidence root:** `QA-REPORT/evidence/visual/`  
**Primary comparison artboard:** Figma node `374:2` (Hero at y=0) and section frames listed below — not invented measurements.

---

## 3. Section map (live ↔ Figma)

| # | Live (DOM) | Figma node(s) | 1920 live Y / H |
|---|------------|---------------|-----------------|
| 0 | `SiteLogo` `.site-logo` (fixed → absolute in Contacts) | `374:21` / `342:71` | fixed top |
| 1 | Hero `#membership` `.hero` | `374:2` хиро | 0 / 1080 |
| 2 | Gallery pin (Collection + 6 horses) `.pin-spacer` / `.gallery` | `277:127` 2 блок — `235:10` THE COLLECTION + horse groups | 1080 / 20910 |
| 3 | Philosophy `#philosophy` | `277:128` content (~1920×1555 within larger fur frame) | 21805 / 1555 |
| 4 | Estate `#estate` (doors, stables, arena, paddocks, clubhouse) | `352:191` 04 the estate | 23360 / 5152 |
| 5 | Quiet `#essence` `.quiet` | `353:193` 05 | 28512 / 2332 |
| 6 | Passage `#craft` `.passage` | horse-art / craft region `360:14`, label `374:24` | 30844 / 2611 |
| 7 | Heritage `#heritage` | GENERATIONS / story / photo grid (~`362:*`) | 33455 / 2294 |
| 8 | Contacts `#contacts` | `342:59` montÉrre + footer `374:*` | 35749 / 1514 |

Live document height @1920: **37264px** (Figma frame **24302px** — different pin/scroll expansion; not a flat 1:1 page height).

---

## 4. Section-by-section notes (1920 primary)

### Hero
Composition, mask layering, CTA size/position, and logo box largely match `374:2`. Brand stack (eyebrow, MONTÉRRE, equestrian SVG, Est. script) sits **~+18px** lower than Figma. Right nav cluster (ESSENCE/CRAFT) **~+19px** vs Figma; left nav aligns. Logo opacity often **0.82** (Figma reads solid white).

### Collection
Excellent match: HOR/SE vectors, label `02` / `THE COLLECTION`, heritage line, scroll cue — within ~1px of Figma locals.

### Horse gallery
Arabella–Isabelle left content columns, CTA sizes (255.3 / Isabelle 188.7), and right `gallery__nav` 01–06 present and aligned (~x 1682). Panels are viewport-pinned at **1080** tall; Figma panel heights vary (e.g. Valentino **978.6**) — crop risk UNVERIFIED beyond layout chrome.

### Philosophy
`THE ART OF` / `HORSEMANSHIP`, aside, bond, indices match Figma-derived coordinates closely.

### Estate
Doors atmosphere and labels present. **SPACE / WITH / PURPOSE** share a **~−79px** vertical bias vs Figma offsets inside the doors group. Stables→Clubhouse panels present with VIEW HORSE CTAs.

### Quiet / Passage / Heritage
Quiet headline lockup matches. Passage path + “The art / is in the / process” and Heritage GENERATIONS block read on-brief; no ≥20px type-box contradictions measured on primary lines at 1920 (photo grade UNVERIFIED).

### Contacts + SiteLogo
Large `Montérre` wordmark **1643×512 @ x=138** matches Figma `342:59`. Logo settles into Contacts (opacity 1, absolute). **Location copy**, **legal bar size**, and **privacy x** diverge from Figma.

---

## 5. Full issue list

### VQA-001 — Hero brand stack shifted +18px down
- **Section / element:** Hero — MONTÉRRE title, equestrian mark, Est. script, club eyebrow
- **Description:** Entire mid-hero type cluster sits lower than Figma `374:2` by a consistent ~18px.
- **Expected:** MONTÉRRE text y≈500.81, equestrian y≈550.23, Est. y≈747.81, eyebrow block y≈413.81 (Figma `374:2`)
- **Actual:** MONTÉRRE y=518.8, equestrian y=568.2, Est. y=765.8, eyebrow y=431.8
- **Discrepancy:** ≈ **+18px** Y on all four
- **Severity:** Medium
- **Evidence:** `evidence/visual/1920x1080/00-hero.png`, `evidence/visual/figma/hero-374-2.png`, DOM vs `374:2`
- **File / selector:** `.hero` title / equestrian / Est. / subhead
- **Viewports affected:** 1920 (measured); amplified at 1440/1280 (see VQA-002)

### VQA-002 — Hero height is 100vh at 1440/1280 (not scaled 1080 artboard)
- **Section / element:** Hero section height / vertical composition
- **Description:** At narrower desktop widths, hero height equals viewport (900 / 800) instead of `1080 × (vw/1920)` (810 / 720). Brand/CTA positions diverge 50–90px from width-scaled Figma.
- **Expected:** Proportional scale of 1920×1080 hero (or explicit Figma desktop variants — none provided)
- **Actual:** 1440: heroH=900; CTA Δy≈+89 vs scaled Figma. 1280: heroH=800; CTA Δy≈+75, title Δy≈+51
- **Discrepancy:** **50–90px** class vertical errors
- **Severity:** High
- **Evidence:** `evidence/visual/1440x900/00-hero.png`, `evidence/visual/1280x800/00-hero.png`, `evidence/visual/compare-deltas.json`
- **File / selector:** `.hero` height / min-height
- **Viewports affected:** 1440 / 1280

### VQA-003 — Right nav ESSENCE/CRAFT shifted ~18–20px right
- **Section / element:** Hero nav
- **Description:** Left items match Figma; ESSENCE and CRAFT sit right of Figma anchors (Figma label “essense” at x=1382.38).
- **Expected:** essense x≈1382.38, craft x≈1538.65 (`374:94`, `374:93`)
- **Actual:** ESSENCE x=1401, CRAFT x=1559
- **Discrepancy:** ≈ **+18.6px** / **+20.3px**
- **Severity:** Medium
- **Evidence:** DOM nav metrics @1920; Figma `374:2`
- **File / selector:** `.hero` nav links
- **Viewports affected:** 1920; larger relative error at 1440/1280

### VQA-004 — Hero nav font-weight split (left 500 / right 400)
- **Section / element:** Hero nav links
- **Description:** COLLECTION/PHILOSOPHY/ESTATE compute `font-weight: 500`; ESSENCE/CRAFT/CONTACT compute `400`.
- **Expected:** Uniform weight in Figma hero nav (weight token not exported in metadata — treated as single style)
- **Actual:** Asymmetric weights left vs right
- **Discrepancy:** Weight mismatch (visual hierarchy)
- **Severity:** Medium
- **Evidence:** Playwright computed styles @1920
- **File / selector:** `.hero a` / nav items
- **Viewports affected:** 1920 / 1440 / 1280

### VQA-005 — SiteLogo opacity ~0.82 on hero (not solid)
- **Section / element:** Fixed `SiteLogo`
- **Description:** Crest renders at opacity ≈0.82 (and animates 0.55–0.82 with `mix-blend-mode: difference` while scrolling). Figma hero crest reads as solid white.
- **Expected:** Solid crest per `374:21` / screenshot `hero-374-2.png`
- **Actual:** opacity 0.82 at settled hero scroll positions
- **Discrepancy:** ~18% opacity / blend difference
- **Severity:** Medium
- **Evidence:** `evidence/visual/1920x1080/logo-at-rest-crop.png`, DOM opacity log
- **File / selector:** `.site-logo`
- **Viewports affected:** 1920 / 1440 / 1280

### VQA-006 — Estate door headlines ~79px high vs Figma
- **Section / element:** Estate doors — SPACE / WITH / PURPOSE
- **Description:** Relative to `#estate` top, all three words sit ~79px higher than Figma offsets inside `352:186` / Group 73.
- **Expected (offsets from doors group y=10315.28):** SPACE +483.2, WITH +889.2, PURPOSE +1123.2
- **Actual (offsets from estate y=23360):** SPACE +404, WITH +810, PURPOSE +1044
- **Discrepancy:** ≈ **−79px** Y (systemic)
- **Severity:** High
- **Evidence:** `evidence/visual/1920x1080/cmp-estate-doors.png`, Figma `352:186`, DOM
- **File / selector:** `#estate` door typography
- **Viewports affected:** 1920 (spot-checked pattern at 1440/1280 via scaled section)

### VQA-007 — Estate section shorter than Figma frame
- **Section / element:** `#estate` overall height
- **Description:** Live estate block is 5152px vs Figma `352:191` height 5699px.
- **Expected:** ~5699 at 1920 (Figma)
- **Actual:** 5152.1
- **Discrepancy:** ≈ **−547px** section height (may omit transition/overhang; still a layout length mismatch)
- **Severity:** Medium
- **Evidence:** metrics.json; Figma metadata `352:191`
- **File / selector:** `#estate` / `.estate`
- **Viewports affected:** 1920 (scales with width)

### VQA-008 — Contacts location copy ≠ Figma — ACCEPTED (London)
- **Section / element:** Contacts — location line
- **Description:** Figma still shows “Gomel, Belarus”; live site shows “London, United Kingdom”.
- **Expected (product):** **London, United Kingdom** — confirmed by stakeholder 2026-11-03; do **not** revert to Gomel.
- **Figma (stale):** Gomel, Belarus (`374:59`)
- **Actual:** London, United Kingdom
- **Discrepancy:** Figma text outdated vs product copy — **not a site defect**
- **Severity:** ~~High~~ → **Accepted / Won’t fix (site)** — update Figma when convenient
- **Evidence:** `evidence/visual/1920x1080/cmp-contacts.png`; product decision
- **File / selector:** `#contacts` contact column
- **Viewports affected:** 1920 / 1440 / 1280

### VQA-009 — Contacts legal bar: 14px type vs ~24px Figma
- **Section / element:** Footer copyright + privacy
- **Description:** Legal line uses 14px Inter Tight; Figma nodes are h≈29 (≈24px body). Visually undersized vs design.
- **Expected:** © / PRIVACY text size consistent with h=29 nodes `374:83`, `374:85`
- **Actual:** font-size 14px, h=20
- **Discrepancy:** ≈ **−10px** font-size (≥10px design contradiction)
- **Severity:** High
- **Evidence:** `evidence/visual/1920x1080/contacts-legal-crop.png`, DOM
- **File / selector:** `#contacts` legal row
- **Viewports affected:** 1920; scales smaller at 1440 (10.5px) / 1280 (9.3px)

### VQA-010 — Privacy link ~120px right of Figma
- **Section / element:** Contacts — PRIVACY POLICY · TERMS
- **Description:** Privacy cluster left edge far right of Figma anchor (also affects balance with arrow `374:86`).
- **Expected:** x≈1399.34, w≈276 (`374:85`)
- **Actual:** x=1518.9, w=265.1
- **Discrepancy:** ≈ **+119.5px** X
- **Severity:** High
- **Evidence:** DOM; `contacts-legal-crop.png`; Figma `374:85`
- **File / selector:** `#contacts` privacy control
- **Viewports affected:** 1920 / 1440 / 1280

### VQA-011 — Contacts quote box shifted/wider than Figma
- **Section / element:** Contacts script quote
- **Description:** “Behind every great horse…” block is left and wider than Figma.
- **Expected:** x≈1490.32, w≈294.31, h=168 (`374:80`)
- **Actual:** x=1444.6, w=340, h=168, font-size 56px
- **Discrepancy:** ≈ **−46px** X, **+46px** width
- **Severity:** Medium
- **Evidence:** DOM; `evidence/visual/1920x1080/contacts-quote-crop.png`
- **File / selector:** `#contacts` quote
- **Viewports affected:** 1920

### VQA-012 — Valentino (and variable) Figma panel height vs 1080 pin
- **Section / element:** Gallery horse panels
- **Description:** Figma Valentino group height ≈978.6; live pinned slides are 1080. Other horses also vary (1110–1190). Risk of different vertical crop/framing vs artboards.
- **Expected:** Panel-specific heights per Figma groups `65:640` etc.
- **Actual:** Uniform ~1080 viewport panels
- **Discrepancy:** up to ≈ **100–200px** frame height difference (crop UNVERIFIED)
- **Severity:** Medium
- **Evidence:** Figma metadata; `slide-valentino.png` / gallery metrics
- **File / selector:** `.gallery__slide`
- **Viewports affected:** 1920; related at 1440/1280

### VQA-013 — SiteLogo horizontal drift during mid-scroll states
- **Section / element:** SiteLogo while scrolling mid-page
- **Description:** At some scroll positions logo `x` measures ≈936.5 vs Figma/center ≈915.3 (**~21px**), with opacity ~0.55. Settled hero and Contacts positions match ~915.
- **Expected:** Centered ~915.5 (`374:21`)
- **Actual:** Transient x≈936.5 mid-scroll
- **Discrepancy:** ≈ **+21px** X (transient)
- **Severity:** Medium
- **Evidence:** Playwright logo opacity/position log
- **File / selector:** `.site-logo`
- **Viewports affected:** 1920 (observed)

### VQA-014 — Collection horse media oversized vs Figma image box
- **Section / element:** Collection `.collection__horse`
- **Description:** Figma horse image `25:296` ≈1780×1070 at x≈0,y≈89; live media box measured ≈2000×1070 at x≈−220 (letterform masks still match).
- **Expected:** ≈1780.1×1069.7 @ x≈0.02 (local)
- **Actual:** w≈2000, x≈−219.8
- **Discrepancy:** ≈ **+220px** width / **−220px** x (masked; visual may still be OK)
- **Severity:** Low
- **Evidence:** collection DOM metrics; Figma `25:296`
- **File / selector:** `.collection__horse`
- **Viewports affected:** 1920

### VQA-015 — Figma nav spelling “essense” vs live “ESSENCE”
- **Section / element:** Hero nav
- **Description:** Live corrects Figma typo. Not a visual defect; noted for design-source hygiene.
- **Expected:** Figma text `374:94` “essense”
- **Actual:** “ESSENCE”
- **Discrepancy:** Spelling (site preferred)
- **Severity:** Low
- **Evidence:** Figma metadata; live nav
- **File / selector:** Hero nav
- **Viewports affected:** all

### VQA-016 — Sub-10px hero CTA / logo residuals
- **Section / element:** Hero CTA + logo
- **Description:** CTA and logo within ≤2px of Figma at 1920 — inside tolerance; logged for completeness.
- **Expected:** CTA `374:16` 806.57,909.14,307.24×59.08; logo 915.53,24.66
- **Actual:** CTA 806.4,907.9; logo 915.3,23.7
- **Discrepancy:** ≤ **2px**
- **Severity:** Low
- **Evidence:** DOM deltas
- **File / selector:** `.hero` CTA, `.site-logo`
- **Viewports affected:** 1920

---

## 6. Coverage matrix

| Section | 1920×1080 | 1440×900 | 1280×800 |
|---------|-----------|----------|----------|
| Hero | Compared vs Figma | Spot-check (issues) | Spot-check (issues) |
| Collection | Compared vs Figma | Spot-check screenshots | Spot-check screenshots |
| Horse cards (×6) | Compared (Arabella deep; others measured) | Spot-check | Spot-check |
| Philosophy | Compared vs Figma | Spot-check | Spot-check |
| Estate doors | Compared vs Figma | Spot-check | Spot-check |
| Estate stables/arena/paddocks/clubhouse | Layout/DOM + screenshots | Spot-check | Spot-check |
| Quiet | Compared headline/DOM | Spot-check | Spot-check |
| Passage / Craft | Screenshots + DOM | Spot-check | Spot-check |
| Heritage | Screenshots + DOM | Spot-check | Spot-check |
| Contacts + SiteLogo settle | Compared vs Figma | Spot-check | Spot-check |
| Fixed chrome (SiteLogo) | Compared | Spot-check | Spot-check |

---

## 7. NOT TESTED / UNVERIFIED

| Item | Reason |
|------|--------|
| Pixel-perfect hero mask path vs Figma vector `374:12` | No path export; visual layering only |
| Frame-by-frame GSAP scrub / pin velocity parity | Audit used discrete scroll samples |
| Fur seam / smoke masks pixel diff during Philosophy↔Estate | Requires continuous scrub + image diff tooling |
| Passage bezier path exact control points vs Figma vectors | Path geometry not measured node-by-node |
| Every horse photo crop vs Figma fills at all three widths | Only chrome/type measured; Valentino height gap flagged UNVERIFIED |
| Design tokens (exact font files / tracking) beyond computed CSS | Figma text styles not fully pulled via `get_design_context` for every node |
| Mobile / tablet | Out of scope by agent rules |
| Alternate Figma hero `26:355` (y=2061 duplicate) | Superseded by `374:2` at y=0 for comparison |
| Orphan Figma “Lucia” group `46:6` | Not present as live slide (Adrian used) |

---

## 8. Top issues for remediation priority

1. **VQA-002** — Hero `100vh` breaks desktop scaling at 1440/1280  
2. **VQA-009 / VQA-010** — Legal bar size + privacy position  
3. **VQA-006** — Estate SPACE/WITH/PURPOSE vertical shift  
4. **VQA-001 / VQA-003** — Hero type + right-nav ~18–20px offsets at 1920  
5. ~~**VQA-008**~~ — London kept (Accepted); sync Figma later optional  

---

## 9. Figma access status

**Accessible.** Session created; metadata for `6:126` retrieved; multiple `get_screenshot` calls succeeded and PNGs stored under `QA-REPORT/evidence/visual/figma/`. No invented Figma measurements were used in findings.
