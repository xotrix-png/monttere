import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import doorPhotoUrl from "../assets/images/doors-leaf-left.png";
import doorModelUrl from "../../3D/Door/saloon_door.glb?url";

gsap.registerPlugin(ScrollTrigger);

const DOOR_OPEN = 38;
const DOOR_SCRUB = 0.85;

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

/** Desktop WebGL saloon doors. Same renderer, pose and scrub as before the split. */
export function mountEstateDoors(stage, canvas) {
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
    const scale = (1364 * unit) / metrics.height;
    const y = 12 * unit - metrics.minY * scale;
    const z = 8 * unit;
    const edge = width * 0.5 * (z / distance);
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
}
