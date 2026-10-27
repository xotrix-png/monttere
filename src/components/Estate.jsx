import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import furTransition2 from "../assets/images/fur-transition-2.png";
import doorsBg from "../assets/images/doors-bg.png";
import doorPhotoUrl from "../assets/images/doors-leaf-left.png";
import doorModelUrl from "../../3D/Door/saloon_door.glb?url";
import stablesVideo from "../assets/videos/stable-loop.mp4";
import arenaVideo from "../assets/videos/arena-loop.mp4";
import paddocksVideo from "../assets/videos/pasture-loop.mp4";
import clubhouseVideo from "../assets/videos/terrace-loop.mp4";
import arrowNe from "../assets/images/gallery-arrow-ne.svg";
import "./Estate.css";

gsap.registerPlugin(ScrollTrigger);

/*
  After Philosophy (frame ends y:10391.075).
  Fur: Figma 256:2 «шерсть переход 2», y:9974.307, 1920×793.657.
  Doors: one saloon leaf, hinged at the screen edges.
  The right leaf is that model mirrored, same height and angle.
  Scroll: the page keeps moving and both leaves swing open.
  Panels: 90:395, 106:3, 107:7, 107:10. No sky transition.
*/
/** Both leaves reach this angle, swung toward the camera. */
const DOOR_OPEN = 38;
const DOOR_SCRUB = 0.85;

const PANELS = [
  {
    id: "stables",
    video: stablesVideo,
    height: 852,
    veil: { left: 0, width: 673.68 },
    kicker: "01   STABLES",
    kickerTop: 81.888,
    title: "SPACE TO BREATHE",
    titleTop: 149.476,
    titleWidth: 587.486,
    body: "Sixteen private stalls, natural light and thoughtfully designed spaces created for the comfort of every horse",
    bodyTop: 536.109,
    bodyX: 138.337,
    bodyWidth: 590.148,
    ruleTop: 644.11,
    ruleWidth: 187.817,
    buttonTop: 694.11,
  },
  {
    id: "arena",
    video: arenaVideo,
    height: 852,
    veil: { left: -14.334, width: 688.014 },
    kicker: "02  ARENA",
    kickerTop: 100.001,
    title: "PRECISION NEEDS SPACE",
    titleTop: 167.591,
    titleWidth: 751.76,
    body: "A dedicated training arena where discipline meets freedom of movement",
    bodyTop: 520.211,
    bodyX: 138.337,
    bodyWidth: 462.824,
    ruleTop: 628.212,
    ruleWidth: 186.181,
    buttonTop: 678.212,
  },
  {
    id: "paddocks",
    video: paddocksVideo,
    height: 853,
    veil: { left: -14.334, width: 688.014 },
    kicker: "03 PADDOCKS",
    kickerTop: 100.002,
    title: "BEFORE. AFTER. TOGETHER.",
    titleTop: 167.592,
    titleWidth: 797.645,
    body: "Open fields surrounded by centuries-old forest. A quieter rhythm of movement and rest",
    bodyTop: 520.211,
    bodyX: 138.337,
    bodyWidth: 489.446,
    ruleTop: 628.212,
    ruleWidth: 186.181,
    buttonTop: 678.212,
  },
  {
    id: "clubhouse",
    video: clubhouseVideo,
    height: 1036,
    veil: { left: 0, width: 673.68, height: 852.981 },
    kicker: "04  CLUBHOUSE",
    kickerTop: 109.02,
    title: "A QUIETER RHYTHM",
    titleTop: 176.68,
    titleWidth: 532.68,
    body: "A private space for club members to gather, unwind and share the day",
    bodyTop: 529.3,
    bodyX: 142.662,
    bodyWidth: 489.446,
    ruleTop: 637.302,
    ruleWidth: 186.181,
    buttonTop: 687.301,
  },
];

function loadDoorTexture(url) {
  const photo = new THREE.Texture();
  photo.colorSpace = THREE.SRGBColorSpace;
  photo.flipY = false;
  photo.anisotropy = 8;
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    // The photo keeps a gray-black cutout around the leaf. Replace only
    // those pixels, so the foot reads as the same wood as the rail.
    const cutoutAt = (data, i) => {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const black = r < 10 && g < 10 && b < 10;
      const paper = r > 165 && Math.abs(r - g) < 14 && Math.abs(r - b) < 14;
      return black || paper;
    };
    const full = ctx.getImageData(0, 0, image.width, image.height);
    const src = new Uint8ClampedArray(full.data);
    const w = image.width;
    let left = 0;
    let right = (w - 120) * 4;
    for (let y = 0; y < image.height; y += 1) {
      const row = y * w * 4;
      for (let x = 48; x < 420; x += 1) {
        if (!cutoutAt(src, row + x * 4)) {
          left = row + x * 4;
          break;
        }
      }
      for (let x = w - 48; x > w - 420; x -= 1) {
        if (!cutoutAt(src, row + x * 4)) {
          right = row + x * 4;
          break;
        }
      }
      for (let x = 0; x < w; x += 1) {
        const d = row + x * 4;
        if (!cutoutAt(src, d)) continue;
        const s = x < w / 2 ? left : right;
        full.data[d] = src[s];
        full.data[d + 1] = src[s + 1];
        full.data[d + 2] = src[s + 2];
        full.data[d + 3] = 255;
      }
    }
    ctx.putImageData(full, 0, 0);
    photo.generateMipmaps = false;
    photo.minFilter = THREE.LinearFilter;
    photo.magFilter = THREE.LinearFilter;
    photo.image = canvas;
    photo.needsUpdate = true;
  };
  image.src = url;
  return photo;
}

function prepareLeaf(root, photo) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      material.side = THREE.DoubleSide;
      material.envMapIntensity = 0;
      if (!material.map) return;
      photo.wrapS = THREE.ClampToEdgeWrapping;
      photo.wrapT = THREE.ClampToEdgeWrapping;
      material.map = photo;
      material.color.set(0xffffff);
      material.metalness = 0;
      material.roughness = 0.92;
    });
  });
}

function mirrorLeaf(source) {
  const clone = source.clone(true);
  clone.traverse((node) => {
    if (!node.isMesh) return;
    node.geometry = node.geometry.clone();
    node.geometry.scale(-1, 1, 1);
  });
  return clone;
}

export default function Estate() {
  const doorsRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = doorsRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
    scene.add(new THREE.AmbientLight(0xffffff, 1.12));
    const key = new THREE.DirectionalLight(0xfff6ee, 0.2);
    key.position.set(0, 0.4, 1);
    const fill = new THREE.DirectionalLight(0xd5dde6, 0.12);
    fill.position.set(0, 0.05, 0.8);
    scene.add(key, fill);

    const photo = loadDoorTexture(doorPhotoUrl);

    const root = new THREE.Group();
    scene.add(root);

    let leftPivot = null;
    let rightPivot = null;
    let metrics = null;
    const pose = { open: 0 };

    /*
      Page scrolls through. Both leaves start shut and swing open
      toward the camera by the same angle. Negative Y on the left
      and positive Y on the mirrored right both bring the free edge
      forward, so the tops stay level.
    */
    const applyPose = () => {
      const angle = THREE.MathUtils.degToRad(DOOR_OPEN * pose.open);
      if (leftPivot) leftPivot.rotation.y = -angle;
      if (rightPivot) rightPivot.rotation.y = angle;
    };

    const layout = () => {
      const width = stage.clientWidth;
      const stageH = stage.clientHeight;
      const canvasH = canvas.clientHeight;
      if (!width || !stageH || !canvasH) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, canvasH, false);
      const distance = width * (2400 / 1920);
      const overlap = Math.max(0, canvasH - stageH);
      const camY = (stageH - overlap) / 2;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(canvasH / 2 / distance));
      camera.aspect = width / canvasH;
      camera.position.set(width * 0.5, camY, distance);
      camera.lookAt(width * 0.5, camY, 0);
      camera.near = 1;
      camera.far = distance * 8;
      camera.updateProjectionMatrix();
      if (!metrics || !leftPivot || !rightPivot) return;
      const unit = width / 1920;
      /*
        Hinge foot sits 12px above the photo. The open free corner
        still laps the picture, short of the "01 STABLES" line at 82.
        The right hinge is pulled out to the frame edge.
      */
      const scale = (1364 * unit) / metrics.height;
      const y = 12 * unit - metrics.minY * scale;
      const z = 8 * unit;
      const edge = (width * 0.5) * (z / distance);
      leftPivot.scale.set(scale, scale, scale);
      leftPivot.position.set(edge + 6 * unit, y, z);
      rightPivot.scale.set(scale, scale, scale);
      rightPivot.position.set(width - edge + 78 * unit, y, z);
    };

    let alive = true;
    new GLTFLoader().load(`${doorModelUrl}?v=foot4`, (gltf) => {
      if (!alive) return;
      const source = gltf.scene.getObjectByName("HingePivot");
      source.position.set(0, 0, 0);
      source.rotation.set(0, 0, 0);
      source.scale.set(1, 1, 1);
      source.updateWorldMatrix(true, true);
      prepareLeaf(source, photo);
      const box = new THREE.Box3().setFromObject(source);
      metrics = {
        height: box.max.y - box.min.y,
        minY: box.min.y,
      };
      leftPivot = source;
      rightPivot = mirrorLeaf(source);
      root.add(leftPivot, rightPivot);
      applyPose();
      layout();
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top 75%",
        end: "bottom top",
        scrub: DOOR_SCRUB,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      pose,
      { open: 0 },
      { open: 1, ease: "none", duration: 1, onUpdate: applyPose },
      0,
    );

    const resize = () => {
      layout();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    layout();

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();
    ScrollTrigger.refresh();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
      photo.dispose();
      renderer.dispose();
      scene.traverse((node) => {
        if (!node.isMesh) return;
        node.geometry?.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material?.dispose());
      });
    };
  }, []);

  return (
    <section className="estate" id="estate" aria-label="04 THE ESTATE">
      <div className="estate__doors" ref={doorsRef}>
        <div className="estate__doors-stage" aria-hidden="true">
          <img
            className="estate__doors-bg"
            src={doorsBg}
            alt=""
            width={1920}
            height={1560}
            decoding="async"
          />
          <canvas
            ref={canvasRef}
            className="estate__doors-canvas"
            aria-hidden="true"
          />
        </div>

        <img
          className="estate__fur"
          src={furTransition2}
          alt=""
          width={1920}
          height={794}
          decoding="async"
        />

        <p className="estate__index">04</p>
        <p className="estate__label">THE ESTATE</p>

        <h2 className="estate__lockup">
          <span className="estate__space">SPACE</span>
          <span className="estate__with">WITH</span>
          <span className="estate__purpose">PURPOSE</span>
        </h2>
        <p className="estate__script">Heritage &amp; Refinement</p>
      </div>

      {PANELS.map((panel) => (
        <article
          key={panel.id}
          id={panel.id}
          className="estate__panel"
          style={{ "--panel-h": panel.height }}
          aria-label={panel.kicker.replace(/\s+/g, " ").trim()}
        >
          {panel.video ? (
            <video
              className="estate__photo"
              src={panel.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          ) : (
            <img
              className="estate__photo"
              src={panel.image}
              alt=""
              width={1920}
              height={Math.round(panel.height)}
              decoding="async"
            />
          )}
          {panel.veil ? (
            <div
              className="estate__veil"
              style={{
                "--veil-left": panel.veil.left,
                "--veil-w": panel.veil.width,
                ...(panel.veil.height != null
                  ? { "--veil-h": `calc(${panel.veil.height} * var(--u))` }
                  : null),
              }}
              aria-hidden="true"
            />
          ) : null}

          <p className="estate__kicker" style={{ "--y": panel.kickerTop }}>
            <span className="estate__kicker-line" aria-hidden="true" />
            <span className="estate__kicker-text">{panel.kicker}</span>
          </p>

          <h3
            className="estate__panel-title"
            style={{ "--y": panel.titleTop, "--w": panel.titleWidth }}
          >
            {panel.title}
          </h3>

          <p
            className="estate__body"
            style={{
              "--y": panel.bodyTop,
              "--x": panel.bodyX,
              "--w": panel.bodyWidth,
            }}
          >
            {panel.body}
          </p>

          <div
            className="estate__rule"
            style={{ "--y": panel.ruleTop, "--w": panel.ruleWidth }}
            aria-hidden="true"
          />

          <a
            className="estate__cta"
            style={{ "--y": panel.buttonTop }}
            href={`#${panel.id}`}
          >
            <span>VIEW HORSE</span>
            <img
              className="estate__cta-arrow"
              src={arrowNe}
              alt=""
              width={21}
              height={21}
            />
          </a>
        </article>
      ))}
    </section>
  );
}
