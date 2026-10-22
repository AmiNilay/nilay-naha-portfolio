# 🧑‍💻 Chatbot Mascot — 3D Asset Pipeline

> **Last updated:** 2026-10-22 · Component: `src/components/chatbot/ChatbotMascot.tsx`

## Honest limitation

An AI coding agent **cannot sculpt a film-quality, rigged character mesh in code**. A model built from code primitives (spheres and cylinders) is what you rejected earlier, and the spec forbids it as a final result. So the site ships in two layers:

| Layer | Status | What you see |
| :--- | :--- | :--- |
| **2D renders** cropped from your reference sheet (`public/mascot/*.webp`, 74 KB total) | ✅ Live now | Your exact character: neutral, happy, thinking, explaining, coding, plus dark and light app icons, crossfading by emotion with a gentle breathing float |
| **Real 3D model** `public/models/chatbot-mascot.glb` | ⏳ Add the file once, using the free pipeline below | The same character in real-time 3D: lit, animated, head following the cursor, expressions from shape keys |

**You don't need to change any code.** When `chatbot-mascot.glb` is deployed, `ChatbotMascot` detects it (a single `HEAD` request), lazy-loads three.js, and swaps the 2D render for the 3D model. If WebGL is unavailable, or the model fails to load, it stays on the 2D renders.

---

## Component API

```tsx
<ChatbotMascot
  theme="auto"          // "light" | "dark" | "auto" (follows the site theme)
  expression="neutral"  // neutral happy excited thinking confused sad surprised sleepy annoyed
                        // explaining coding listening talking
  animation="idle"      // "idle" | "none"  (reduced-motion → static automatically)
  size={96}             // px; validated, max 512
  icon                  // optional: use the dark/light app-icon render when neutral (launcher)
/>
```

- Accessible label: "AI coding assistant".
- `preloadMascot()` warms the cache. The chat widget calls it on hover and on idle.
- Files: `ChatbotMascot.tsx` (wrapper), `MascotScene.tsx` (GLB renderer, lazy chunk), `MascotFallback.tsx` (2D), `mascotConfig.ts` (names and mappings).

---

## Free pipeline: reference image → `chatbot-mascot.glb`

### 1. Image → rough 3D (free)

Upload the **front-view** crop (crop the full-body front view from your sheet, plain background) to one of these:

- **Hunyuan3D-2** (Tencent): Hugging Face Space, free. Good stylized characters, with textures.
- **TRELLIS** (Microsoft): Hugging Face Space, free, MIT licence.
- **Tripo AI / Meshy**: free tiers with monthly credits. Free-tier outputs may carry licence limits (e.g. CC BY or non-commercial), so check the current terms before using them.

Download **GLB** (or FBX). Generate 3–4 times and keep the best result. Supplying the front, side and back crops helps where multi-view is supported.

### 2. Clean up in Blender (free)

1. Import the mesh, then apply scale and rotation. The character should be about 1.75 units tall, facing **+Z**, feet at y=0.
2. **Retopology:** run Decimate (or *Remesh → Quad*, or the free QuadRemesher alternatives) to reach **≤ 30k triangles** for the bust region and ≤ 60k overall.
3. **Rebuild the details AI generators get wrong:**
   - **Glasses:** thin black rounded-rectangle rims, a bridge and temple arms as **separate meshes** (a bevelled curve). No opaque lenses.
   - **Eyes:** separate sphere meshes (white sclera, dark-brown iris, a glossy highlight) so they can rotate.
   - **Hoodie logo `</>`:** text converted to a mesh, slightly extruded, with an **emissive** material in `#36BFFF`.
4. **Materials (Principled BSDF):**

   | Part | Base colour | Roughness | Notes |
   | :--- | :--- | :-: | :--- |
   | Skin | warm beige | 0.55 | Subsurface 0.05 |
   | Hair | `#171319` | 0.45 | Light sheen |
   | Glasses | `#151515` | 0.6 | Matte |
   | Hoodie | `#15171C` | 0.85 | Fabric |
   | Logo | `#36BFFF` | 0.4 | Emission 1.5 |
   | Trousers | `#17191E` | 0.85 | |
   | Eyes (iris) | dark brown | 0.15 | Glossy |

5. Bake textures to **1024 px** at most and keep the material count small.

### 3. Rig and expressions

- **Body rig:** run the mesh through **Mixamo** (free, auto-rig), or use Blender **Rigify**. The head bone name must contain **`Head`**; the component turns it toward the cursor.
- **Shape keys** (all optional; names must match exactly):

  | Shape key | Used for |
  | :--- | :--- |
  | `happy` | happy, excited, explaining |
  | `thinking` | thinking, confused |
  | `sad` | sad |
  | `surprised` | surprised |
  | `annoyed` | annoyed |
  | `blink` | sleepy (and blinking, if you animate it) |
  | `mouthOpen` | talking, explaining, excited, surprised |

- **Animation clips** (optional; names are case-insensitive): `Idle` (the default; subtle breathing), `Thinking` (hand near chin), `Explaining` (open-hand gesture), `Talking`, `Coding` (looking down), `Happy`, `Listening`. Mixamo provides free idle and gesture animations; rename them in the NLA editor.

### 4. Export and compress

1. Blender → *File → Export → glTF 2.0*: format **GLB**, include Shape Keys, Skinning and Animations, +Y up.
2. Compress it (free, verified flags):

   ```bash
   npx @gltf-transform/cli optimize mascot-raw.glb public/models/chatbot-mascot.glb \
     --compress meshopt --texture-compress webp --texture-size 1024
   ```

3. **Target size:** under 1.5 MB. Add `--simplify true --simplify-ratio 0.5` if it's larger.
4. Check the result at <https://gltf-viewer.donmccurdy.com/>, including morph targets and clips.

### 5. Ship

Put the file at `public/models/chatbot-mascot.glb`, then commit and push. Vercel deploys it and the chatbot switches to 3D automatically. To roll back, delete the file.

### 6. Regenerate the 2D renders (when the reference changes)

The crops come from the reference sheet with Python and Pillow. Edit the boxes if the layout differs.

```bash
python -c "
from PIL import Image
im=Image.open('reference.png')
boxes={'avatar-dark':(214,34,590,410),'avatar-light':(668,34,1044,410),'neutral':(10,466,250,706),
       'happy':(245,466,485,706),'thinking':(470,466,710,706),'explaining':(716,466,956,706),'coding':(985,466,1225,706)}
for k,b in boxes.items():
  c=im.crop(b)
  for s in (256,128): c.resize((s,s),Image.LANCZOS).save(f'public/mascot/{k}-{s}.webp',quality=80,method=6)
"
```

Or render them from the finished GLB in Blender (a transparent background, a head-and-shoulders camera, the same file names) so the 2D and 3D versions match exactly.

---

## Spec checklist status

| Requirement | Status |
| :--- | :--- |
| Real 3D character | ⏳ Needs the GLB from the pipeline above; the renderer is ready |
| Same model in light and dark | ✅ Lighting changes per theme (stronger cool rim in dark), the model doesn't |
| Neutral, happy and thinking expressions | ✅ 2D now; 3D through shape keys |
| Lazy loading and static fallback | ✅ |
| Reduced motion | ✅ Static pose |
| Small-size readability (28–76 px) | ✅ Uses the cropped busts and app icons |
| Front, side and back previews | ⏳ Available on the reference sheet; renderable from the GLB in Blender |
| Lip-sync | ❌ Not implemented. `mouthOpen` is static per state and isn't driven by audio timing |

## Regenerating the transparent 2D avatars (updated 2026-10-22)

The images in `public/mascot/` are **transparent cut-outs**: no backdrop, disc or glow, just the figure. They were made with [rembg](https://github.com/danielgatis/rembg) (free, local, model `isnet-general-use`):

```bash
python -m venv rbenv && rbenv/Scripts/python -m pip install "rembg[cpu]" pillow
# crop each tile from the reference sheet, then:
rbenv/Scripts/python -c "from rembg import remove,new_session;from PIL import Image;s=new_session('isnet-general-use');remove(Image.open('tile.png'),session=s,post_process_mask=True).save('cut.png')"
```

Trim to the alpha bounding box, pad to a square with the shoulders on the bottom edge, and export `<name>-256.webp` and `<name>-128.webp` (quality 88). The main avatar (`avatar-light` / `avatar-dark`) uses the same cut-out in both themes; dark mode only adds a faint cool rim via CSS.

## Current model (2026-10-22 11:33)

`public/models/chatbot-mascot.glb` was generated from the transparent portrait cut-out with **TRELLIS** (Hugging Face Space `trellis-community/TRELLIS`, `/generate_and_extract_glb`, mesh simplify 0.95, texture 1024) through `gradio_client`. It was then:
1. rotated 180° about Y with `trimesh`, because TRELLIS output faced −Z;
2. given a JPEG texture (quality 86) with `pygltflib` + Pillow, since `gltf-transform --texture-compress` failed here (sharp colourspace error);
3. compressed with `npx @gltf-transform/cli@4.1.1 optimize in.glb out.glb --compress meshopt --texture-compress false`, going from 1.83 MB to 266 KB.

It has no bones or shape keys. `MascotScene` therefore turns the whole model toward the pointer and adds breathing, a nod (happy) and a tilt (thinking). Add a `Head` bone or shape keys in Blender to unlock full expressions.
