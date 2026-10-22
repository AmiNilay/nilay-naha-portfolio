"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CLIP_FOR, MASCOT_GLB_URL, MORPH_FOR, type MascotExpression } from "./mascotConfig";

/**
 * Real-time renderer for public/models/chatbot-mascot.glb. Loaded lazily by
 * ChatbotMascot only when the file exists. Head-and-shoulders framing is fitted
 * from the model's bounding box; morph targets and clips are matched by name.
 */

let gltfPromise: Promise<any> | null = null;
function loadGltf() {
  if (!gltfPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    gltfPromise = loader.loadAsync(MASCOT_GLB_URL);
  }
  return gltfPromise;
}

export default function MascotScene({
  expression,
  size,
  theme,
  animate,
  onReady,
  onError,
}: {
  expression: MascotExpression;
  size: number;
  theme: "light" | "dark";
  animate: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const exprRef = useRef(expression);
  const applyRef = useRef<(e: MascotExpression) => void>(() => {});
  exprRef.current = expression;

  useEffect(() => {
    applyRef.current(expression);
  }, [expression]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let frame = 0;
    let visible = true;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);

    // Soft three-point lighting; stronger cool rim in dark mode.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2d36, theme === "dark" ? 0.9 : 1.2));
    const key = new THREE.DirectionalLight(0xfff4e8, 2.2);
    key.position.set(-2, 2.5, 3);
    const fill = new THREE.DirectionalLight(0xe8eeff, 0.7);
    fill.position.set(2.5, 0.5, 2);
    const rim = new THREE.DirectionalLight(0x5ab8ff, theme === "dark" ? 2.4 : 1.1);
    rim.position.set(1.5, 2, -3);
    scene.add(key, fill, rim);

    let mixer: THREE.AnimationMixer | null = null;
    let clips: THREE.AnimationClip[] = [];
    let current: THREE.AnimationAction | null = null;
    const morphMeshes: THREE.Mesh[] = [];
    const morphTargets: Record<string, number> = {};
    let head: THREE.Object3D | null = null;
    let model: THREE.Object3D | null = null;
    const pointer = { x: 0, y: 0 };
    const clock = new THREE.Clock();

    const playClip = (name?: string) => {
      if (!mixer || !clips.length) return;
      const clip =
        (name && clips.find((c) => c.name.toLowerCase() === name.toLowerCase())) ||
        clips.find((c) => c.name.toLowerCase() === "idle") ||
        clips[0];
      const next = mixer.clipAction(clip);
      if (next === current) return;
      next.reset().fadeIn(0.3).play();
      current?.fadeOut(0.3);
      current = next;
    };

    applyRef.current = (e) => {
      for (const k of Object.keys(morphTargets)) morphTargets[k] = 0;
      Object.assign(morphTargets, MORPH_FOR[e] || {});
      playClip(CLIP_FOR[e]);
    };

    loadGltf()
      .then((gltf) => {
        if (disposed) return;
        // Each instance (launcher, header) needs its own copy of the cached scene.
        model = cloneSkinned(gltf.scene) as THREE.Object3D;
        scene.add(model);
        model.traverse((o: any) => {
          if (o.isMesh && o.morphTargetDictionary) morphMeshes.push(o);
          // Image-to-3D exports often ship metallic PBR values that render dark;
          // the texture already carries the shading, so keep it matte.
          if (o.isMesh && o.material && "metalness" in o.material) {
            o.material.metalness = Math.min(o.material.metalness, 0.05);
            o.material.roughness = Math.max(o.material.roughness, 0.7);
            // The baked texture already carries the shading: let a little of it
            // glow through so colours stay vivid instead of light-dependent and dull.
            if (o.material.map) {
              o.material.map.colorSpace = THREE.SRGBColorSpace;
              o.material.emissive = new THREE.Color(0xffffff);
              o.material.emissiveMap = o.material.map;
              o.material.emissiveIntensity = theme === "dark" ? 0.45 : 0.35;
            }
            o.material.needsUpdate = true;
          }
          if (!head && o.isBone && /head/i.test(o.name)) head = o;
        });

        // Frame head and shoulders. A full-body model is tall (height > 2x width):
        // show its top ~30%. A bust (e.g. image-to-3D output) is framed whole.
        const box = new THREE.Box3().setFromObject(model);
        const sz = box.getSize(new THREE.Vector3());
        const isBust = sz.y < sz.x * 2;
        const focusY = isBust ? box.min.y + sz.y * 0.5 : box.max.y - sz.y * 0.15;
        const frameH = isBust ? sz.y * 0.98 : sz.y * 0.32;
        const dist = frameH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.08;
        const cx = (box.min.x + box.max.x) / 2;
        camera.position.set(cx, focusY, box.max.z + dist);
        camera.lookAt(cx, focusY, (box.min.z + box.max.z) / 2);

        clips = gltf.animations || [];
        if (clips.length) mixer = new THREE.AnimationMixer(model);
        applyRef.current(exprRef.current);
        renderer.render(scene, camera);
        onReady();
      })
      .catch(() => {
        if (!disposed) onError();
      });

    const onMove = (ev: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp((ev.clientX - (r.left + r.width / 2)) / 400, -1, 1);
      pointer.y = THREE.MathUtils.clamp((ev.clientY - (r.top + r.height / 2)) / 400, -1, 1);
    };
    if (animate) window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!model || !visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (animate) mixer?.update(dt);
      // Ease morph targets toward the requested expression.
      for (const mesh of morphMeshes) {
        const dict = mesh.morphTargetDictionary!;
        const infl = mesh.morphTargetInfluences!;
        for (const name of Object.keys(dict)) {
          const target = morphTargets[name] ?? 0;
          const i = dict[name];
          infl[i] += (target - infl[i]) * Math.min(1, dt * 8);
        }
      }
      if (animate) {
        // Rigged model: turn the Head bone. Unrigged bust: turn the whole model,
        // plus gentle breathing and a per-expression gesture (no morphs to drive).
        const h = (head || model) as THREE.Object3D;
        const t = clock.elapsedTime;
        const e = exprRef.current;
        const tiltZ = !head && (e === "thinking" || e === "confused") ? 0.12 : 0;
        const nod = !head && (e === "happy" || e === "excited") ? Math.sin(t * 6) * 0.04 : 0;
        const k = Math.min(1, dt * 4);
        h.rotation.y += (pointer.x * (head ? 0.35 : 0.45) + (head ? 0 : Math.sin(t * 0.6) * 0.06) - h.rotation.y) * k;
        h.rotation.x += (pointer.y * 0.2 + nod - h.rotation.x) * k;
        h.rotation.z += (tiltZ - h.rotation.z) * k;
        if (!head) model.scale.setScalar(1 + Math.sin(t * 1.6) * 0.008);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      mixer?.stopAllAction();
      if (model) scene.remove(model); // geometry/materials are shared with the cached glTF
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Rebuild only when the canvas size, theme lighting or motion mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, theme, animate]);

  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden />;
}
