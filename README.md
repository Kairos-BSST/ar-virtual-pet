# AR Pet Companion

A mobile-first WebAR virtual dog. Place a companion on a real surface, then feed, pet, talk, and gesture.

## Stack

- React + Vite
- React Three Fiber / Three.js / WebXR (`ARButton` + hit-test)
- Tailwind CSS
- Zustand
- MediaPipe Hands
- TensorFlow.js gesture scoring
- Web Speech API

## Run

```bash
npm install
npm run dev
```

Open the HTTPS URL on your phone (same Wi-Fi). Accept the certificate warning if the dev SSL cert is self-signed.

Chrome on Android is required for `immersive-ar`. Desktop Chrome still runs a floor preview so you can test feeding, tap, voice, and gestures without a headset.

## How to use

1. Allow camera (hands) and microphone (voice) when prompted.
2. Tap **Start AR** on a compatible device, scan a floor, then tap to spawn the dog.
3. On desktop, tap the dark floor plane to spawn.
4. **Feed** — pick Bone / Chicken / Biscuit, tap Feed, then tap the floor. The dog walks over and eats.
5. **Tap the dog** — tail wag, hearts, occasional bark.
6. **Voice** — Bark, Sit, Jump, Dance, Come here, Run, Stop, Eat.
7. **Hands** — Open palm (come), point left/right, thumbs up (jump), raised hand (sit), fist (stop).

## Optional GLB assets

Place files in `public/models/`:

- `dog.glb` (clips: idle, walk, run, sit, jump, bark, eat, tailWag)
- `bone.glb`, `chicken.glb`, `biscuit.glb`

If they are missing, the app uses a built-in low-poly dog and treat meshes so `npm run dev` still works.

## Production notes

- Serve over HTTPS.
- Target 60 FPS: DPR is capped, assets lazy-load, animations are clip-driven.
- WebXR hit-test anchors the pet on the detected plane; desktop uses a y=0 floor.
