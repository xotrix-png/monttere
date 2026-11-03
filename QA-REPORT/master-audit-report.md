# MONTÉRRE — Master Desktop Audit Report

**Date:** 2026-11-03 (Asia/Bangkok)  
**Lead:** QA Team Lead (coordinator)  
**Mode:** AUDIT ONLY — no website source fixes  
**Figma reference:** https://www.figma.com/design/CO0yT5ll32AvgonliVkn5x/Horse?node-id=6-126 (`CO0yT5ll32AvgonliVkn5x`)  
**Implementation under test (canonical):** GitHub `main` @ `a74b2eb` — full site  
**Local verification:** `http://127.0.0.1:5174/` (worktree of `origin/main`)

---

## 1. Agent completion status

| Agent | Custom Agent file | Run ID | Report | Status |
|-------|-------------------|--------|--------|--------|
| Visual QA | `.cursor/agents/visual-qa.md` | [Visual QA](bc-605df7c8-149f-5005-bc01-018c997822fd) | `QA-REPORT/visual-qa-report.md` | **Completed** |
| Frontend QA | `.cursor/agents/frontend-qa.md` | [Frontend QA](bc-65568f2a-48f1-5609-9ad2-63f9e02d3efc) | `QA-REPORT/frontend-qa-report.md` | **Completed** |
| Interaction QA | `.cursor/agents/interaction-qa.md` | [Interaction QA](bc-30844fa2-d713-5263-992f-45bdc4657eca) | `QA-REPORT/interaction-qa-report.md` | **Completed** (environment caveat — see §3) |

All three Custom Agents were created and launched. All three returned reports.

---

## 2. Raw finding counts (as reported by specialists)

| Source | Critical | High | Medium | Low | Total |
|--------|---------:|-----:|-------:|----:|------:|
| Visual QA | 0 | 6 | 7 | 3 | **16** |
| Frontend QA | 0 | 8 | 9 | 6 | **23** |
| Interaction QA | 3 | 2 | 1 | 0 | **6** |
| **Raw sum** | **3** | **16** | **17** | **9** | **45** |

After de-duplication, conflict resolution, and lead re-verification on `main`, see §5–§6.

---

## 3. Critical environment caveat (Interaction vs Visual/Frontend)

During the parallel run, the coordinator workspace was switched onto branch `cursor/visual-qa-report-22fd`, which is based on **`master` (Hero-only App)**:

```jsx
// App.jsx on master / visual-qa branch
<main><Hero /></main>
```

Canonical product code lives on **`main`** with Gallery, Philosophy, Estate, Quiet, Passage, Heritage, Contacts, SiteLogo.

**Lead retest on `origin/main` @ 1920×1080 (Playwright Chromium, 2026-11-03):**

| Check | Result |
|-------|--------|
| `documentElement.scrollHeight` | **37264** |
| Sections present | membership, collection, philosophy, estate (+panels), essence, craft, heritage, contacts |
| Mouse wheel scroll | **PASS** (`scrollY` 0 → 3000) |
| Programmatic scroll | **PASS** |
| Click CONTACT nav | **PASS** (`scrollY` → 35749) |
| `pageerror` | **none** |

### Conflict resolution

| Interaction claim | Lead verdict |
|-------------------|--------------|
| **IQA-001** Complete scroll failure (Critical) | **NOT a defect on `main`.** Explained by Hero-only checkout / wrong tree under test. Marked **ENVIRONMENT / INVALID for product**. |
| **IQA-002** All nav non-functional (Critical) | **NOT a defect on `main`** for CONTACT (verified). Other nav items **NOT RETESTED** exhaustively → treat product nav as **PASS with partial retest**; Interaction claim **INVALID as site-wide Critical**. |
| **IQA-003** REQUEST MEMBERSHIP non-functional (Critical) | **UNVERIFIED on `main`** in lead retest (not clicked). On Hero-only tree, CTA may be present without destinations. **Do not treat as confirmed Critical** until retested on `main`. |
| **IQA-004** Logo click non-functional (High) | **Likely expected / Low product risk** — logo is a settle/morph chrome, not necessarily a home link. Needs product intent. **UNVERIFIED as defect**. |
| **IQA-005** DevTools Console tab inaccessible (High) | **Tooling limitation** of computer-use agent host — **not a website defect**. |
| **IQA-006** (Medium, if present in full report) | Retain only if independent of scroll-lock narrative; else defer. |

**Implication:** Interaction QA coverage of Collection→Contacts is **NOT TESTED** against the real product. A **follow-up Interaction pass on `main`** is required before shipping interaction sign-off.

Visual QA and Frontend QA reports describe the **full** site (metrics match `main` height 37264; Frontend lists all components) and remain the primary evidence base for product defects.

---

## 4. Sections inspected

| Section | Visual | Frontend | Interaction (agent) | Lead on `main` |
|---------|--------|----------|---------------------|----------------|
| Hero | Yes (Figma) | Yes | Hero only (claimed) | Yes |
| Collection + horse gallery | Yes | Yes | NOT TESTED* | Present |
| Philosophy | Yes | Yes | NOT TESTED* | Present |
| Estate (doors + panels) | Yes | Yes | NOT TESTED* | Present |
| Quiet / Essence | Yes | Yes | NOT TESTED* | Present |
| Passage / Craft | Yes | Yes | NOT TESTED* | Present |
| Heritage | Yes | Yes | NOT TESTED* | Present |
| Contacts + SiteLogo | Yes | Yes | NOT TESTED* | CONTACT jump OK |
| Fixed SiteLogo | Yes | Yes | Logo click fail (caveat) | Present |

\*Interaction agent reported unreachable due to scroll failure under wrong tree.

---

## 5. Desktop resolutions

| Resolution | Visual | Frontend | Interaction | Lead |
|------------|--------|----------|-------------|------|
| **1920 × 1080** | Full compare | Smoke + DOM | Partial / invalid tree | Retest PASS scroll/nav |
| **1440 × 900** | Spot-check | Code-risk notes | **NOT TESTED** | NOT TESTED |
| **1280 × 800** | Spot-check | Code-risk notes | **NOT TESTED** | NOT TESTED |

---

## 6. Consolidated product findings (confirmed / keep)

Duplicates merged; Interaction Criticals excluded from product Critical tally.

### Confirmed Critical (product)

**None** after conflict resolution.

### High (prioritized)

| ID(s) | Topic | Section | Notes |
|-------|-------|---------|-------|
| **FQA-001** (+ visual crop risk) | Collection horse clipped in 100vh pin | Gallery / Collection | Confirmed DOM: design ~1159 vs slide 1080 |
| **VQA-002** | Hero `100vh` vs scaled 1080 artboard | Hero | 50–90px drift @ 1440/1280 |
| **VQA-006** | Estate SPACE/WITH/PURPOSE ~−79px Y | Estate doors | Figma vs DOM |
| ~~**VQA-008**~~ | Location London vs Figma Gomel | Contacts | **ACCEPTED** — keep **London, United Kingdom**; Figma stale |
| **VQA-009** | Legal bar ~14px vs ~24px Figma | Contacts | |
| **VQA-010** | Privacy link ~+120px X | Contacts | |
| **FQA-002** | ~22MB GLB + 4× `preload="auto"` videos | Estate | Perf |
| **FQA-003** | Always-on WebGL RAF + ReadPixels stalls | Estate | Perf / jank |
| **FQA-004** / **FQA-016** | `#arabella`…`#isabelle` CTAs missing targets | Gallery | Dead anchors |
| **FQA-005** | Mixed `100vw` / `100cqw` Scale | Multi | Scrollbar seam risk |
| **FQA-006** | SiteLogo morph JS unit ≠ CSS/`Hero` | SiteLogo | Jump risk |
| **FQA-007** | ~999 kB single JS chunk | Build | |
| **FQA-008** | Estate “VIEW HORSE” self-hash CTAs | Estate | Copy / dead UX |

### Medium (selected)

| ID(s) | Topic |
|-------|-------|
| **VQA-001**, **VQA-003**, **VQA-004**, **VQA-005** | Hero +18px brand stack; right nav X; nav weight split; logo opacity ~0.82 |
| **VQA-007**, **VQA-011**, **VQA-012**, **VQA-013** | Estate height; Contacts quote; horse panel height variance; logo mid-scroll drift |
| **FQA-009**–**FQA-015**, **FQA-017** | z-index/fur, GLTF null, texture race, fonts, images, will-change, Quiet units, canvas overhang |

### Low

VQA-014–016; FQA-018–023 — polish, placeholders, dead CSS, long pin cost notes.

---

## 7. Multi-agent overlaps (same underlying issue)

| Theme | Visual | Frontend | Interaction |
|-------|--------|----------|-------------|
| Collection / horse crop in pin | VQA-012 / VQA-014 (related) | **FQA-001** | NOT TESTED |
| Scale unit / scrollbar drift | amplified @ 1440/1280 **VQA-002** | **FQA-005**, **FQA-006**, **FQA-015** | NOT TESTED |
| Dead / misleading CTAs | — | **FQA-004**, **FQA-008**, **FQA-020** | IQA claimed all CTAs dead (**invalid Critical** on `main`) |
| Contacts legal / footer vs Figma | **VQA-009**, **VQA-010** (**VQA-008** Accepted/London) | FQA-020 (self-hash) | NOT TESTED |
| Estate perf / WebGL | — | **FQA-002**, **FQA-003** | Videos NOT TESTED |
| SiteLogo settle | **VQA-005**, **VQA-013** | **FQA-006** | IQA-004 logo click |

---

## 8. Dependencies between issues

1. **FQA-005 / FQA-006 / FQA-015** should be fixed as one “Scale unit” program — reduces VQA-002 amplification and logo pop.  
2. **FQA-001** (Collection fit) independent of Estate perf but same Gallery pin system as **FQA-023**.  
3. **FQA-002 / FQA-003 / FQA-007** form an Estate load/jank cluster.  
4. **FQA-004 / FQA-016 / FQA-008 / FQA-020** are CTA/anchor contract fixes.  
5. Contacts visual cluster (**VQA-009–011**; **VQA-008 Accepted — London**) is independent of Gallery.

---

## 9. Confirmed defects vs risks vs invalid

| Class | Count (approx.) | Examples |
|-------|----------------:|----------|
| **Confirmed product defects** | ~20+ High/Medium from VQA+FQA with evidence | FQA-001, VQA-002, VQA-006, FQA-004, … |
| **Potential risks** (code-evident, magnitude UNVERIFIED) | Several Medium | FQA-005 scrollbar px; FQA-010 null pivot; FQA-017 overlap |
| **Intentional / product decision (closed)** | 1 | **VQA-008** — keep London, United Kingdom |
| **Invalid / environment** | 3 Critical + tooling High | IQA-001–003 as site-breaking; IQA-005 DevTools |
| **NOT TESTED** | Interaction full pass on `main`; 1440/1280 interaction; reduced-motion; Safari/Firefox | See specialist NOT TESTED sections |

---

## 10. Most critical issues first (action queue — advisory only)

1. **FQA-001** — Collection clipped in pin @ 1920×1080  
2. **VQA-002** — Hero composition drift @ 1440 / 1280 (`100vh`)  
3. **FQA-004 / FQA-008** — Dead / misleading CTAs  
4. **VQA-006** — Estate door headline vertical bias  
5. **VQA-009 / VQA-010** — Contacts legal/footer vs Figma (**VQA-008** closed: London)  
6. **FQA-005 / FQA-006** — Unify Scale units + logo morph  
7. **FQA-002 / FQA-003 / FQA-007** — Estate media / WebGL / chunk budget  
8. **Re-run Interaction QA on `main`** at all three desktop sizes before interaction sign-off  

---

## 11. Report index

| File | Path |
|------|------|
| Visual | `QA-REPORT/visual-qa-report.md` |
| Frontend | `QA-REPORT/frontend-qa-report.md` |
| Interaction | `QA-REPORT/interaction-qa-report.md` |
| Master (this file) | `QA-REPORT/master-audit-report.md` |
| Visual evidence | `QA-REPORT/evidence/visual/` |
| Interaction evidence | `QA-REPORT/evidence/interaction/` |
| Custom Agents | `.cursor/agents/visual-qa.md`, `frontend-qa.md`, `interaction-qa.md` |

---

## 12. Final status (Phase 5)

1. **Custom Agents created:** Yes — all three under `.cursor/agents/`.  
2. **Agents completed:** Visual ✅ · Frontend ✅ · Interaction ✅ (with tree caveat).  
3. **Sections inspected (product):** Full page via Visual + Frontend; Interaction product coverage incomplete.  
4. **Resolutions:** Visual 1920/1440/1280; Frontend code+smoke 1920; Interaction claimed 1920 only on wrong tree; Lead verified 1920 on `main`.  
5. **Totals:** Raw 45 specialist findings → **0 confirmed Critical on `main`**; **~14 High** retained from VQA+FQA; Interaction Criticials reclassified.  
6. **Stop:** No source fixes applied in this phase.

**STOP HERE — await separate instruction for correction phase.**
