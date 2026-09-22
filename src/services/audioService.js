import * as THREE from 'three';

const buffers = new Map();
let listener = null;
let audioCtx = null;

function ensureContext() {
  if (!audioCtx) {
    audioCtx = THREE.AudioContext.getContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function makeTone(duration, freqStart, freqEnd, noise = 0.15) {
  const ctx = ensureContext();
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const freq = freqStart + (freqEnd - freqStart) * t;
    const env = Math.sin(Math.PI * Math.min(1, t * 8)) * Math.exp(-t * 3.2);
    const n = (Math.random() * 2 - 1) * noise;
    data[i] = (Math.sin(2 * Math.PI * freq * (i / rate)) + n) * env * 0.55;
  }
  return buffer;
}

function buildLibrary() {
  if (buffers.size) return;
  buffers.set('bark', makeTone(0.28, 220, 420, 0.22));
  buffers.set('happyBark', makeTone(0.34, 320, 640, 0.12));
  buffers.set('eat', makeTone(0.4, 90, 70, 0.45));
  buffers.set('jump', makeTone(0.22, 180, 520, 0.08));
  buffers.set('whine', makeTone(0.7, 480, 360, 0.05));
}

export function attachListener(camera) {
  buildLibrary();
  if (!listener) {
    listener = new THREE.AudioListener();
    camera.add(listener);
  }
  return listener;
}

export function createPositionalVoice(camera) {
  const l = attachListener(camera);
  const voice = new THREE.PositionalAudio(l);
  voice.setRefDistance(1.2);
  voice.setRolloffFactor(1.4);
  voice.setVolume(0.85);
  return voice;
}

export function playPositional(voice, name) {
  buildLibrary();
  const buffer = buffers.get(name);
  if (!voice || !buffer) return;
  if (voice.isPlaying) voice.stop();
  voice.setBuffer(buffer);
  voice.play();
}

export const AUDIO_CUES = ['bark', 'happyBark', 'eat', 'jump', 'whine'];
