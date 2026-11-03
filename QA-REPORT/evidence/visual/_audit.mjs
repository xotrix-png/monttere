import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/agent/repos/monttere/QA-REPORT/evidence/visual';
const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
];

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function measurePage(page) {
  return page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel,
        tag: el.tagName,
        id: el.id || null,
        className: (el.className?.toString?.() || '').slice(0, 160),
        text: (el.innerText || '').slice(0, 120).replace(/\s+/g, ' ').trim(),
        x: Math.round(r.left),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        position: cs.position,
        zIndex: cs.zIndex,
        opacity: cs.opacity,
        transform: cs.transform,
        maskImage: cs.maskImage || cs.webkitMaskImage,
        overflow: cs.overflow,
        backgroundImage: cs.backgroundImage?.slice(0, 80),
      };
    };

    const children = [...document.querySelectorAll('main > *')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        i,
        tag: el.tagName,
        id: el.id || null,
        className: (el.className?.toString?.() || '').slice(0, 160),
        y: Math.round(r.top + window.scrollY),
        h: Math.round(r.height),
        w: Math.round(r.width),
        x: Math.round(r.left),
      };
    });

    // Key text nodes for typography / layout
    const textTargets = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    while (walk.nextNode()) {
      const el = walk.currentNode;
      const t = (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)
        ? el.textContent.trim()
        : '';
      if (!t || t.length < 2 || t.length > 80) continue;
      const interesting = /mont[eé]rre|request membership|the collection|heritage|philosophy|stables|arena|paddocks|clubhouse|quiet|between|generations|of equestrians|view horse|scroll|space with|purpose|contacts?|private membership|our story|hello@|©/i.test(t);
      if (!interesting) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(el);
      textTargets.push({
        text: t.slice(0, 90),
        tag: el.tagName,
        className: (el.className?.toString?.() || '').slice(0, 100),
        x: Math.round(r.left),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily.slice(0, 80),
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        lineHeight: cs.lineHeight,
        color: cs.color,
      });
    }

    const logo = pick('[class*="logo" i], [class*="SiteLogo" i], .site-logo, #site-logo')
      || pick('img[alt*="logo" i]')
      || null;

    // Fixed/sticky elements
    const fixed = [...document.querySelectorAll('*')].filter((el) => {
      const p = getComputedStyle(el).position;
      return p === 'fixed' || p === 'sticky';
    }).slice(0, 40).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        className: (el.className?.toString?.() || '').slice(0, 100),
        position: cs.position,
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
        zIndex: cs.zIndex,
      };
    });

    // Images with natural vs rendered size (crop signals)
    const images = [...document.images].slice(0, 60).map((img) => {
      const r = img.getBoundingClientRect();
      return {
        src: (img.currentSrc || img.src || '').split('/').pop()?.slice(0, 80),
        alt: img.alt?.slice(0, 40),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        x: Math.round(r.left),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        objectFit: getComputedStyle(img).objectFit,
        objectPosition: getComputedStyle(img).objectPosition,
      };
    });

    return {
      url: location.href,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scrollHeight: document.documentElement.scrollHeight,
      children,
      logo,
      fixed,
      textTargets,
      images,
      hero: pick('section.hero, .hero, #hero, [class*="Hero"]'),
      nav: [...document.querySelectorAll('nav a, header a, .nav a, [class*="nav"] a')].slice(0, 20).map((a) => {
        const r = a.getBoundingClientRect();
        return {
          text: a.textContent.trim(),
          x: Math.round(r.left),
          y: Math.round(r.top + window.scrollY),
          w: Math.round(r.width),
          h: Math.round(r.height),
          fontSize: getComputedStyle(a).fontSize,
        };
      }),
    };
  });
}

async function captureAtScroll(page, outDir, label, y) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  const file = path.join(outDir, `${label}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function runViewport(vp) {
  const outDir = path.join(OUT, vp.name);
  ensureDir(outDir);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2500);

  // Kill/disable heavy animations for stable stills where possible, but don't edit site — only evaluate temporary pause
  await page.evaluate(() => {
    document.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch {} });
  });

  const metrics = await measurePage(page);
  fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(metrics, null, 2));

  // Full page screenshot (may be tall)
  await page.screenshot({ path: path.join(outDir, 'fullpage.png'), fullPage: true });

  // Section captures based on measured children + key offsets
  const shots = [];
  shots.push(await captureAtScroll(page, outDir, '00-hero', 0));

  for (const child of metrics.children) {
    const name = (child.id || child.className || `block-${child.i}`)
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || `block-${child.i}`;
    const label = `${String(child.i + 1).padStart(2, '0')}-${name}`;
    shots.push(await captureAtScroll(page, outDir, label, Math.max(0, child.y)));
    // mid-section if tall
    if (child.h > vp.height * 1.4) {
      shots.push(await captureAtScroll(page, outDir, `${label}-mid`, child.y + Math.floor(child.h / 2) - Math.floor(vp.height / 2)));
      shots.push(await captureAtScroll(page, outDir, `${label}-end`, Math.max(0, child.y + child.h - vp.height)));
    }
  }

  // Extra scroll samples through gallery/collection if present
  const gallery = metrics.children.find((c) => /gallery|collection/i.test(c.className + (c.id || '')));
  if (gallery) {
    for (let k = 0; k < 8; k++) {
      const y = gallery.y + Math.floor((gallery.h / 8) * k);
      shots.push(await captureAtScroll(page, outDir, `gallery-progress-${k}`, y));
    }
  }

  // Bottom / contacts
  shots.push(await captureAtScroll(page, outDir, '99-bottom', Math.max(0, metrics.scrollHeight - vp.height)));

  // Capture specific key elements via text search scroll
  const keyPhrases = [
    'THE COLLECTION',
    'THE PHILOSOPHY',
    'SPACE',
    '01 STABLES',
    '02 ARENA',
    '03 PADDOCKS',
    '04 CLUBHOUSE',
    'THE QUIET',
    'GENERATIONS',
    'OF EQUESTRIANS',
    'OUR STORY',
    'NAVIGATION',
  ];
  for (const phrase of keyPhrases) {
    const found = await page.evaluate((p) => {
      const els = [...document.querySelectorAll('*')];
      for (const el of els) {
        if (el.children.length === 0 && el.textContent?.trim().toUpperCase().includes(p.toUpperCase())) {
          const r = el.getBoundingClientRect();
          return Math.round(r.top + window.scrollY - 120);
        }
        if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().toUpperCase().includes(p.toUpperCase()))) {
          const r = el.getBoundingClientRect();
          if (r.height > 0 && r.height < 800) return Math.round(r.top + window.scrollY - 120);
        }
      }
      return null;
    }, phrase);
    if (found != null) {
      const slug = phrase.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      shots.push(await captureAtScroll(page, outDir, `key-${slug}`, Math.max(0, found)));
    }
  }

  await browser.close();
  return { vp: vp.name, metrics, shots: shots.length };
}

ensureDir(OUT);
const results = [];
for (const vp of VIEWPORTS) {
  console.log('Auditing', vp.name);
  results.push(await runViewport(vp));
}
fs.writeFileSync(path.join(OUT, 'audit-summary.json'), JSON.stringify(results.map((r) => ({
  vp: r.vp,
  scrollHeight: r.metrics.scrollHeight,
  children: r.metrics.children,
  textCount: r.metrics.textTargets.length,
  shots: r.shots,
})), null, 2));
console.log('DONE', JSON.stringify(results.map((r) => ({ vp: r.vp, shots: r.shots, sections: r.metrics.children.length })), null, 2));
