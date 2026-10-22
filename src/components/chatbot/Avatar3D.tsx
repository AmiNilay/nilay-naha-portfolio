"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { AvatarEmotion } from "./HumanAvatar";
import { publishSnapshot } from "./avatarSnapshot";

/**
 * Small procedural 3D assistant (head + shoulders) built from three.js
 * primitives — no model download. Physically based materials with key, rim
 * and fill lights on a transparent background. Eyes track the pointer, the
 * head turns toward it, blinks, breathes, and changes brows/mouth/lids per
 * emotion. Rendering pauses while offscreen or when the tab is hidden.
 * Loaded lazily via ./Avatar (next/dynamic, ssr:false) — never in the main bundle.
 */

type MouthShape = "smile" | "grin" | "neutral" | "frown" | "o" | "flat";

interface Pose {
  browY: number; // brow lift
  browTilt: number; // + raises inner ends (worried), − lowers them (cross)
  browAsym: number; // extra lift on the right brow (quizzical)
  mouth: MouthShape;
  lid: number; // 0 open → 1 closed
  lookX: number;
  lookY: number;
  tilt: number; // head roll
}

const POSES: Record<AvatarEmotion, Pose> = {
  neutral: { browY: 0, browTilt: 0, browAsym: 0, mouth: "neutral", lid: 0.08, lookX: 0, lookY: 0, tilt: 0 },
  happy: { browY: 0.03, browTilt: 0.05, browAsym: 0, mouth: "grin", lid: 0.22, lookX: 0, lookY: 0, tilt: 0.05 },
  excited: { browY: 0.07, browTilt: 0.05, browAsym: 0, mouth: "grin", lid: 0, lookX: 0, lookY: 0.1, tilt: 0 },
  thinking: { browY: 0.02, browTilt: 0, browAsym: 0.06, mouth: "flat", lid: 0.12, lookX: 0.7, lookY: 0.6, tilt: -0.08 },
  confused: { browY: 0, browTilt: -0.1, browAsym: 0.09, mouth: "flat", lid: 0.1, lookX: -0.2, lookY: 0.1, tilt: 0.12 },
  sad: { browY: 0.01, browTilt: 0.4, browAsym: 0, mouth: "frown", lid: 0.3, lookX: 0, lookY: -0.4, tilt: 0.06 },
  surprised: { browY: 0.1, browTilt: 0.08, browAsym: 0, mouth: "o", lid: 0, lookX: 0, lookY: 0, tilt: 0 },
  sleepy: { browY: -0.02, browTilt: 0.1, browAsym: 0, mouth: "flat", lid: 0.72, lookX: 0, lookY: -0.3, tilt: 0.16 },
  annoyed: { browY: -0.03, browTilt: -0.4, browAsym: 0, mouth: "flat", lid: 0.3, lookX: 0.3, lookY: 0, tilt: -0.05 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function buildCharacter() {
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xe0a47c,
    roughness: 0.52,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffb199),
    sheenRoughness: 0.6,
  });
  const skinShade = new THREE.MeshStandardMaterial({ color: 0xc98a63, roughness: 0.6 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x1d130d, roughness: 0.48, metalness: 0.05 });
  const eyeWhite = new THREE.MeshPhysicalMaterial({ color: 0xf8f4f0, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 });
  const iris = new THREE.MeshPhysicalMaterial({ color: 0x5b3a22, roughness: 0.25, clearcoat: 1 });
  const pupil = new THREE.MeshStandardMaterial({ color: 0x050302, roughness: 0.1 });
  const lips = new THREE.MeshStandardMaterial({ color: 0xa85b52, roughness: 0.45 });
  const mouthDark = new THREE.MeshStandardMaterial({ color: 0x3b1414, roughness: 0.9, side: THREE.DoubleSide });
  const teeth = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.3 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.78 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.32, metalness: 0.65 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0e7490, emissiveIntensity: 0.8, roughness: 0.3 });

  const bust = new THREE.Group();
  const head = new THREE.Group();
  head.position.y = 0.15;
  bust.add(head);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], scale?: [number, number, number], rot?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    if (scale) m.scale.set(...scale);
    if (rot) m.rotation.set(...rot);
    parent.add(m);
    return m;
  };

  // Shoulders, neck, collar
  add(bust, new THREE.SphereGeometry(1, 40, 20), shirt, [0, -1.72, -0.1], [1.65, 0.62, 0.95]);
  add(bust, new THREE.CylinderGeometry(0.3, 0.36, 0.6, 24), skinShade, [0, -1.05, -0.05]);
  add(bust, new THREE.TorusGeometry(0.4, 0.035, 10, 40), accent, [0, -1.3, 0.02], undefined, [Math.PI / 2 - 0.15, 0, 0]);

  // Head shape: cranium + jaw blend
  add(head, new THREE.SphereGeometry(1, 56, 40), skin, [0, 0, 0], [0.88, 1.06, 0.94]);
  add(head, new THREE.SphereGeometry(0.62, 40, 24), skin, [0, -0.42, 0.18], [1.05, 0.85, 1.05]);
  // Ears
  add(head, new THREE.SphereGeometry(0.17, 20, 16), skinShade, [-0.86, 0, -0.05], [0.45, 1, 0.75]);
  add(head, new THREE.SphereGeometry(0.17, 20, 16), skinShade, [0.86, 0, -0.05], [0.45, 1, 0.75]);
  // Nose
  add(head, new THREE.SphereGeometry(0.075, 20, 16), skin, [0, -0.14, 0.93], [0.85, 1.25, 1.05]);

  // Hair: cap tilted back, back volume, front quiff
  add(head, new THREE.SphereGeometry(1.0, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.44), hair, [0, 0.06, -0.02], [0.94, 1.1, 1.0], [-0.32, 0, 0]);
  add(head, new THREE.SphereGeometry(0.96, 40, 24), hair, [0, 0.12, -0.2], [0.92, 1.02, 0.86]);
  add(head, new THREE.SphereGeometry(0.42, 32, 16), hair, [0.12, 0.86, 0.42], [1.5, 0.55, 0.9], [0.25, 0, -0.28]);

  // Eyes (each: white, iris group that rotates, lid that closes)
  const eyes: { iris: THREE.Group; lid: THREE.Mesh }[] = [];
  for (const x of [-0.31, 0.31]) {
    const eye = new THREE.Group();
    eye.position.set(x, 0.1, 0.76);
    head.add(eye);
    add(eye, new THREE.SphereGeometry(0.135, 28, 20), eyeWhite, [0, 0, 0]);
    const irisGroup = new THREE.Group();
    eye.add(irisGroup);
    add(irisGroup, new THREE.SphereGeometry(0.075, 24, 16), iris, [0, 0, 0.1], [1, 1, 0.45]);
    add(irisGroup, new THREE.SphereGeometry(0.038, 16, 12), pupil, [0, 0, 0.128], [1, 1, 0.35]);
    add(irisGroup, new THREE.SphereGeometry(0.016, 8, 8), teeth, [0.025, 0.028, 0.14]);
    const lid = add(eye, new THREE.SphereGeometry(0.15, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), skin, [0, 0, 0]);
    eyes.push({ iris: irisGroup, lid });
  }

  // Brows (group per brow so tilt rotates around its centre)
  const brows: THREE.Group[] = [];
  for (const x of [-0.31, 0.31]) {
    const g = new THREE.Group();
    g.position.set(x, 0.34, 0.84);
    head.add(g);
    add(g, new THREE.CapsuleGeometry(0.032, 0.2, 4, 10), hair, [0, 0, 0], undefined, [0, 0, Math.PI / 2]);
    brows.push(g);
  }

  // Mouth variants
  const mouth = new THREE.Group();
  mouth.position.set(0, -0.47, 0.86);
  mouth.rotation.x = -0.22;
  head.add(mouth);
  const arc = add(mouth, new THREE.TorusGeometry(0.17, 0.026, 12, 36, Math.PI), lips, [0, 0, 0]);
  const grin = new THREE.Group();
  mouth.add(grin);
  add(grin, new THREE.CircleGeometry(0.19, 36, Math.PI, Math.PI), mouthDark, [0, 0.02, 0]);
  add(grin, new THREE.BoxGeometry(0.3, 0.05, 0.02), teeth, [0, -0.005, 0.006]);
  add(grin, new THREE.TorusGeometry(0.19, 0.022, 10, 36, Math.PI), lips, [0, 0.02, 0], undefined, [0, 0, Math.PI]);
  const oMouth = new THREE.Group();
  mouth.add(oMouth);
  add(oMouth, new THREE.CircleGeometry(0.07, 24), mouthDark, [0, 0, 0], [1, 1.3, 1]);
  add(oMouth, new THREE.TorusGeometry(0.075, 0.025, 10, 28), lips, [0, 0, 0.004], [1, 1.3, 1]);

  // Headset
  add(head, new THREE.TorusGeometry(1.0, 0.045, 12, 56, Math.PI), metal, [0, 0.04, -0.05], [0.95, 1.08, 1]);
  for (const x of [-0.92, 0.92]) add(head, new THREE.CylinderGeometry(0.2, 0.2, 0.16, 28), metal, [x, 0, -0.04], undefined, [0, 0, Math.PI / 2]);
  add(head, new THREE.CylinderGeometry(0.018, 0.018, 0.72, 10), metal, [0.72, -0.4, 0.38], undefined, [0.9, 0.3, 0.75]);
  add(head, new THREE.SphereGeometry(0.055, 16, 12), accent, [0.4, -0.58, 0.68]);

  return { bust, head, eyes, brows, mouth: { arc, grin, oMouth } };
}

export default function Avatar3D({
  emotion = "neutral",
  size = 56,
  track = true,
  reduceMotion = false,
  className = "",
  onReady,
}: {
  emotion?: AvatarEmotion;
  size?: number;
  track?: boolean;
  reduceMotion?: boolean;
  className?: string;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emotionRef = useRef(emotion);
  const trackRef = useRef(track);
  const onReadyRef = useRef(onReady);
  emotionRef.current = emotion;
  trackRef.current = track;
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the wrapper keeps showing the SVG fallback
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, -0.2, 7.4);
    camera.lookAt(0, -0.42, 0);

    scene.add(new THREE.HemisphereLight(0xfff4e8, 0x2a2622, 0.85));
    const key = new THREE.DirectionalLight(0xffe2c4, 2.4);
    key.position.set(-3, 3.5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x67e8f9, 2.2);
    rim.position.set(3.5, 1.5, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xc7d2fe, 0.6);
    fill.position.set(2.5, -1, 3);
    scene.add(fill);

    const c = buildCharacter();
    scene.add(c.bust);

    // Animated state
    const cur = { ...POSES.neutral, yaw: 0, pitch: 0 };
    let mouthShape: MouthShape | null = null;
    let pointer = { x: 0, y: 0, at: 0 };
    let blinkUntil = 0;
    let nextBlink = performance.now() + 2000;
    let visible = true;
    let frames = 0;
    let raf = 0;
    const motion = reduceMotion ? 0.35 : 1;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height * 0.4), at: performance.now() };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    const setMouth = (shape: MouthShape) => {
      if (shape === mouthShape) return;
      mouthShape = shape;
      const { arc, grin, oMouth } = c.mouth;
      arc.visible = shape === "smile" || shape === "neutral" || shape === "frown" || shape === "flat";
      grin.visible = shape === "grin";
      oMouth.visible = shape === "o";
      // [rotation.z, scaleX, scaleY, offsetY] for the lip arc (lower half = smile, upper half = frown).
      const ARC: Partial<Record<MouthShape, [number, number, number, number]>> = {
        smile: [Math.PI, 1, 0.55, 0.02],
        neutral: [Math.PI, 0.9, 0.22, 0],
        flat: [Math.PI, 0.8, 0.06, -0.01],
        frown: [0, 0.8, 0.4, -0.07],
      };
      const a = ARC[shape];
      if (a) {
        arc.rotation.z = a[0];
        arc.scale.set(a[1], a[2], 1);
        arc.position.set(0, a[3], 0);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = now / 1000;
      const pose = POSES[emotionRef.current] || POSES.neutral;
      const k = 0.14;

      // Gaze target: pointer, idle look-around, or the pose's own look.
      let lx = pose.lookX;
      let ly = pose.lookY;
      if (trackRef.current && emotionRef.current !== "thinking" && emotionRef.current !== "sleepy") {
        if (now - pointer.at < 2500) {
          lx = clamp(pointer.x / 260, -1, 1);
          ly = clamp(-pointer.y / 220, -1, 1);
        } else {
          lx = Math.sin(t * 0.45) * 0.55 * motion;
          ly = Math.sin(t * 0.31 + 1) * 0.25 * motion;
        }
      }
      cur.lookX = lerp(cur.lookX, lx, k);
      cur.lookY = lerp(cur.lookY, ly, k);
      cur.yaw = lerp(cur.yaw, cur.lookX * 0.42, 0.08);
      cur.pitch = lerp(cur.pitch, -cur.lookY * 0.22, 0.08);
      cur.browY = lerp(cur.browY, pose.browY, k);
      cur.browTilt = lerp(cur.browTilt, pose.browTilt, k);
      cur.browAsym = lerp(cur.browAsym, pose.browAsym, k);
      cur.tilt = lerp(cur.tilt, pose.tilt, 0.06);

      // Blink every 2.5–6 s (skip while sleepy — lids already low).
      if (now > nextBlink) {
        blinkUntil = now + 130;
        nextBlink = now + 2500 + Math.random() * 3500;
      }
      const lid = now < blinkUntil ? 1 : pose.lid;
      cur.lid = lerp(cur.lid, lid, now < blinkUntil ? 0.6 : 0.2);

      // Head + body motion
      const bob = emotionRef.current === "excited" ? Math.abs(Math.sin(t * 7)) * 0.07 : 0;
      c.head.rotation.set(cur.pitch, cur.yaw + Math.sin(t * 0.6) * 0.03 * motion, cur.tilt + Math.sin(t * 0.5) * 0.02 * motion);
      c.bust.position.y = (Math.sin(t * 1.4) * 0.015 + bob) * motion;
      c.bust.rotation.y = cur.yaw * 0.25;

      c.eyes.forEach((eye) => {
        eye.iris.rotation.set(-cur.lookY * 0.32, cur.lookX * 0.42, 0);
        // Lid hemisphere: tipped back when open, swung over the eye when closed.
        eye.lid.rotation.x = lerp(-1.05, 1.5, cur.lid);
      });
      c.brows[0].position.y = 0.34 + cur.browY;
      c.brows[1].position.y = 0.34 + cur.browY + cur.browAsym;
      c.brows[0].rotation.z = cur.browTilt * 0.6;
      c.brows[1].rotation.z = -cur.browTilt * 0.6;
      setMouth(pose.mouth);

      renderer.render(scene, camera);
      frames++;
      if (frames === 2) onReadyRef.current?.();
      if (frames === 12 && emotionRef.current === "neutral") publishSnapshot(canvas.toDataURL("image/png"));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [size, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={className}
      role="img"
      aria-label={`Assistant avatar, ${emotion}`}
    />
  );
}
