#!/usr/bin/env node
/**
 * GLAM MODA - procedural soundtrack + SFX renderer (zero dependencies, Node 24, ESM).
 *
 * Re-render everything (takes a few seconds, output is deterministic):
 *   cd C:\Users\a.elradi\glam-moda-videos
 *   node scripts/make-audio.mjs              # all files
 *   node scripts/make-audio.mjs music-cs pop # only the named outputs
 *   AUDIO_DEBUG=1 node scripts/make-audio.mjs music-cs   # also print per-bus levels
 *
 * Output -> public/audio/ (RIFF WAV, PCM 16-bit, stereo, 44.1 kHz):
 *   music-cs.wav     28.0 s  14 bars, A minor deep/future-house groove
 *   music-wazir.wav  64.0 s  32 bars, D minor cinematic-tech house with a power-down
 *   pop, send, ding, whoosh, click, key, impact, powerdown, powerup, success (.wav)
 *
 * Timing grid (the visuals are synced to it): 120 BPM, beat = 0.5 s = 15 frames @ 30 fps,
 * bar = 2.0 s = 60 frames. Bar N starts at exactly N * 2.0 s (sample N * 88200).
 * Kicks, claps, bass and impacts sit exactly on that grid; only 16th hats get a slight swing.
 *
 * Every sound is synthesized from scratch in this file (seeded PRNG), so the audio is
 * original and royalty-free.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ════════════════════════════════════════════════════════════════════════════
// 1. Constants & small helpers
// ════════════════════════════════════════════════════════════════════════════

const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s  = 15 frames
const BAR = 4 * BEAT; // 2.0 s  = 60 frames
const STEP = BEAT / 4; // 16th note = 0.125 s
const HAT_SWING = 0.01; // seconds added to off-16th hats only
const TWO_PI = Math.PI * 2;
const MASTER_PEAK = 10 ** (-1 / 20); // -1 dBFS
const SFX_PEAK = 10 ** (-3 / 20); // -3 dBFS
const DEBUG = !!process.env.AUDIO_DEBUG;

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');

const toSamples = (seconds) => Math.round(seconds * SR);
const midiToHz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
/** Time in seconds of a grid position (bar, beat within bar, 16th within beat). */
const gridTime = (bar, beat = 0, step = 0) => bar * BAR + beat * BEAT + step * STEP;
const repeatCycle = (cycle, count) => Array.from({ length: count }, (_, i) => cycle[i % cycle.length]);

// ════════════════════════════════════════════════════════════════════════════
// 2. DSP primitives
// ════════════════════════════════════════════════════════════════════════════

/** Deterministic PRNG (mulberry32) -> function returning [0, 1). */
function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** PolyBLEP residual for a discontinuity at phase 0 (phase in [0,1), dt = f/SR). */
function polyBlep(t, dt) {
  if (t < dt) {
    t /= dt;
    return t + t - t * t - 1;
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
}

/** Band-limited sawtooth sample at a given phase. */
function sawAt(phase, dt) {
  return 2 * phase - 1 - polyBlep(phase, dt);
}

/** Band-limited square sample at a given phase. */
function squareAt(phase, dt) {
  let v = phase < 0.5 ? 1 : -1;
  v += polyBlep(phase, dt);
  const shifted = phase + 0.5;
  v -= polyBlep(shifted >= 1 ? shifted - 1 : shifted, dt);
  return v;
}

/**
 * Topology-preserving-transform state-variable filter (Zavalishin).
 * process() returns the low-pass output; .lp / .bp / .hp hold all three outputs
 * (.bp is the raw band output, multiply by .k for a unity-gain band-pass).
 */
class SVF {
  constructor(cutoff = 1000, q = Math.SQRT1_2) {
    this.ic1 = 0;
    this.ic2 = 0;
    this.lp = 0;
    this.bp = 0;
    this.hp = 0;
    this.set(cutoff, q);
  }

  set(cutoff, q = this.q) {
    const fc = clamp(cutoff, 5, SR * 0.45);
    const g = Math.tan((Math.PI * fc) / SR);
    this.q = q;
    this.k = 1 / q;
    this.a1 = 1 / (1 + g * (g + this.k));
    this.a2 = g * this.a1;
    this.a3 = g * this.a2;
  }

  process(v0) {
    const v3 = v0 - this.ic2;
    const v1 = this.a1 * this.ic1 + this.a2 * v3;
    const v2 = this.ic2 + this.a2 * this.ic1 + this.a3 * v3;
    this.ic1 = 2 * v1 - this.ic1;
    this.ic2 = 2 * v2 - this.ic2;
    this.lp = v2;
    this.bp = v1;
    this.hp = v0 - this.k * v1 - v2;
    return v2;
  }
}

/** A stereo buffer / mix bus. */
function createBus(length) {
  return { L: new Float32Array(length), R: new Float32Array(length) };
}

/** Equal-power pan gains for pan in [-1, 1]. */
function panGains(pan) {
  const a = ((clamp(pan, -1, 1) + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}

/** Add a mono buffer into a bus at a time (seconds), with gain and pan. */
function mixMono(bus, time, buf, gain = 1, pan = 0) {
  const start = toSamples(time);
  const [gl, gr] = panGains(pan);
  const end = Math.min(buf.length, bus.L.length - start);
  for (let i = Math.max(0, -start); i < end; i++) {
    const v = buf[i] * gain;
    bus.L[start + i] += v * gl;
    bus.R[start + i] += v * gr;
  }
}

/** Add a stereo buffer into a bus at a time (seconds). */
function mixStereo(bus, time, src, gain = 1) {
  const start = toSamples(time);
  const end = Math.min(src.L.length, bus.L.length - start);
  for (let i = Math.max(0, -start); i < end; i++) {
    bus.L[start + i] += src.L[i] * gain;
    bus.R[start + i] += src.R[i] * gain;
  }
}

/** dst += src * gain (whole length). */
function addBus(dst, src, gain = 1) {
  for (let i = 0; i < dst.L.length; i++) {
    dst.L[i] += src.L[i] * gain;
    dst.R[i] += src.R[i] * gain;
  }
}

/** Multiply a bus by a per-sample gain curve (Float32Array). */
function multiplyBus(bus, curve) {
  for (let i = 0; i < bus.L.length; i++) {
    bus.L[i] *= curve[i];
    bus.R[i] *= curve[i];
  }
}

/**
 * Piecewise automation curve rendered per sample from [timeSeconds, value] points.
 * 'log' interpolates exponentially (use it for frequencies). Two points at the same
 * time make an instant step.
 */
function automation(points, length, mode = 'lin') {
  const out = new Float32Array(length);
  const pts = points.map(([t, v]) => [toSamples(t), v]);
  let seg = 0;
  for (let i = 0; i < length; i++) {
    while (seg < pts.length - 1 && i >= pts[seg + 1][0]) seg++;
    const [s0, v0] = pts[seg];
    if (i < s0 || seg === pts.length - 1) {
      out[i] = i < s0 ? pts[0][1] : v0;
      continue;
    }
    const [s1, v1] = pts[seg + 1];
    const x = (i - s0) / (s1 - s0);
    out[i] = mode === 'log' ? v0 * (v1 / v0) ** x : v0 + (v1 - v0) * x;
  }
  return out;
}

/**
 * Filter a whole bus in place. cutoff = number or per-sample Float32Array
 * (coefficients refreshed every 32 samples). qs = one Q per cascaded 12 dB stage.
 */
function filterBus(bus, type, cutoff, qs = [Math.SQRT1_2]) {
  const constant = typeof cutoff === 'number';
  for (const ch of [bus.L, bus.R]) {
    const stages = qs.map((q) => new SVF(constant ? cutoff : cutoff[0], q));
    for (let i = 0; i < ch.length; i++) {
      if (!constant && (i & 31) === 0) for (const s of stages) s.set(cutoff[i]);
      let x = ch[i];
      for (const s of stages) {
        s.process(x);
        x = type === 'lp' ? s.lp : type === 'hp' ? s.hp : s.k * s.bp;
      }
      ch[i] = x;
    }
  }
}

/** Filter a mono buffer in place with a fixed cutoff. */
function filterMono(buf, type, cutoff, q = Math.SQRT1_2) {
  const f = new SVF(cutoff, q);
  for (let i = 0; i < buf.length; i++) {
    f.process(buf[i]);
    buf[i] = type === 'lp' ? f.lp : type === 'hp' ? f.hp : f.k * f.bp;
  }
  return buf;
}

function peakOf(bus) {
  let p = 0;
  for (let i = 0; i < bus.L.length; i++) p = Math.max(p, Math.abs(bus.L[i]), Math.abs(bus.R[i]));
  return p;
}

function normalizeBus(bus, target) {
  const p = peakOf(bus);
  if (p > 0) multiplyBusConst(bus, target / p);
  return bus;
}

function multiplyBusConst(bus, g) {
  for (let i = 0; i < bus.L.length; i++) {
    bus.L[i] *= g;
    bus.R[i] *= g;
  }
}

function normalizeMono(buf, target = 1) {
  let p = 0;
  for (let i = 0; i < buf.length; i++) p = Math.max(p, Math.abs(buf[i]));
  if (p > 0) for (let i = 0; i < buf.length; i++) buf[i] *= target / p;
  return buf;
}

/** Raised-cosine fade-in over the first `seconds`. */
function fadeInBus(bus, seconds) {
  const n = Math.min(toSamples(seconds), bus.L.length);
  for (let i = 0; i < n; i++) {
    const g = 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
    bus.L[i] *= g;
    bus.R[i] *= g;
  }
}

/** Raised-cosine fade-out ending exactly at the last sample (last sample = 0). */
function fadeOutBus(bus, seconds) {
  const len = bus.L.length;
  const n = Math.min(toSamples(seconds), len);
  for (let i = 0; i < n; i++) {
    const x = (i + 1) / n; // reaches 1 on the final sample
    const g = 0.5 + 0.5 * Math.cos(Math.PI * x);
    bus.L[len - n + i] *= g;
    bus.R[len - n + i] *= g;
  }
}

function fadeOutMono(buf, seconds) {
  const n = Math.min(toSamples(seconds), buf.length);
  for (let i = 0; i < n; i++) buf[buf.length - n + i] *= 1 - (i + 1) / n;
  return buf;
}

// ════════════════════════════════════════════════════════════════════════════
// 3. Effects: sidechain, delay, reverb, master
// ════════════════════════════════════════════════════════════════════════════

/**
 * Kick-triggered ducking curve: gain dips to `depth` on each hit (4 ms look-ahead ramp)
 * and recovers with an S-curve over `recover` seconds. Overlapping hits take the minimum.
 */
function sidechainCurve(length, hitTimes, depth = 0.35, recover = 0.42, curve = null) {
  const env = curve ?? new Float32Array(length).fill(1);
  const att = toSamples(0.004);
  const rec = toSamples(recover);
  for (const time of hitTimes) {
    const s0 = toSamples(time);
    for (let i = -att; i < rec; i++) {
      const idx = s0 + i;
      if (idx < 0 || idx >= length) continue;
      let g;
      if (i < 0) g = 1 - (1 - depth) * ((i + att) / att);
      else {
        const x = i / rec;
        g = depth + (1 - depth) * x * x * (3 - 2 * x);
      }
      if (g < env[idx]) env[idx] = g;
    }
  }
  return env;
}

/**
 * Stereo ping-pong feedback delay (in place): out = dry + mix * wet.
 * The wet path is high-passed going in and damped (low-passed) in the feedback loop.
 */
function applyPingPongDelay(bus, { time, feedback = 0.35, mix = 0.3, dampHz = 4500, hpHz = 250 }) {
  const d = toSamples(time);
  const lineL = new Float32Array(d);
  const lineR = new Float32Array(d);
  const inHp = new SVF(hpHz);
  const dampL = new SVF(dampHz);
  const dampR = new SVF(dampHz);
  let w = 0;
  for (let i = 0; i < bus.L.length; i++) {
    const outL = lineL[w];
    const outR = lineR[w];
    inHp.process(0.5 * (bus.L[i] + bus.R[i]));
    lineL[w] = inHp.hp + dampR.process(outR) * feedback; // input enters left, bounces L -> R -> L
    lineR[w] = dampL.process(outL) * feedback;
    bus.L[i] += mix * outL;
    bus.R[i] += mix * outR;
    if (++w >= d) w = 0;
  }
}

/** Small Schroeder/Freeverb-style stereo reverb. Returns a new wet-only bus. */
function renderReverb(send, { feedback = 0.82, damp = 0.35, inputGain = 0.12 } = {}) {
  const COMBS = [1116, 1188, 1277, 1356, 1422, 1491];
  const ALLPASSES = [556, 441, 341];
  const out = createBus(send.L.length);
  for (const [key, spread] of [
    ['L', 0],
    ['R', 23],
  ]) {
    const input = send[key];
    const output = out[key];
    const combs = COMBS.map((n) => ({ buf: new Float32Array(n + spread), i: 0, store: 0 }));
    const aps = ALLPASSES.map((n) => ({ buf: new Float32Array(n + spread), i: 0 }));
    for (let s = 0; s < input.length; s++) {
      const x = input[s] * inputGain;
      let acc = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.store = y * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * feedback;
        if (++c.i >= c.buf.length) c.i = 0;
        acc += y;
      }
      for (const a of aps) {
        const b = a.buf[a.i];
        a.buf[a.i] = acc + b * 0.5;
        if (++a.i >= a.buf.length) a.i = 0;
        acc = b - acc;
      }
      output[s] = acc;
    }
  }
  return out;
}

/** 2nd-order shelving EQ from the SVF: y = x + (G - 1) * (hp | lp) (minimum-phase, no notch). */
function shelfBus(bus, type, freq, gainDb) {
  const c = 10 ** (gainDb / 20) - 1;
  for (const ch of [bus.L, bus.R]) {
    const f = new SVF(freq);
    for (let i = 0; i < ch.length; i++) {
      f.process(ch[i]);
      ch[i] += c * (type === 'high' ? f.hp : f.lp);
    }
  }
}

/**
 * Look-ahead peak limiter (offline): forward min-filter of the required gain over the
 * look-ahead window, box-averaged over the same window (so the gain is already down when
 * the peak arrives and never exceeds what the peak needs), then a smooth release.
 */
function limitBus(bus, ceiling = 1, lookahead = 0.005, release = 0.08) {
  const n = bus.L.length;
  const la = Math.max(1, toSamples(lookahead));
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(bus.L[i]), Math.abs(bus.R[i]));
    need[i] = p > ceiling ? ceiling / p : 1;
  }
  const fwdMin = new Float32Array(n); // min of need[i .. i+la)
  const dq = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (tail > head && need[dq[tail - 1]] >= need[i]) tail--;
    dq[tail++] = i;
    while (dq[head] >= i + la) head++;
    fwdMin[i] = need[dq[head]];
  }
  const rel = 1 - Math.exp(-1 / (release * SR));
  let acc = 0;
  let g = 1;
  for (let i = 0; i < n; i++) {
    acc += fwdMin[i];
    if (i >= la) acc -= fwdMin[i - la];
    const avg = acc / Math.min(i + 1, la);
    g = Math.min(avg, g + (1 - g) * rel);
    bus.L[i] *= g;
    bus.R[i] *= g;
  }
}

/**
 * Master chain: rumble high-pass -> tilt EQ (-2 dB lows, +3 dB highs) -> look-ahead limiter
 * (mix peaks pushed `limitDb` into it) -> tanh soft-clip -> 20 ms fade-in + raised-cosine
 * fade-out -> peak-normalize to -1 dBFS.
 */
function masterBus(bus, { limitDb = 5, drive = 1.1, fadeIn = 0.02, fadeOutStart }) {
  filterBus(bus, 'hp', 24, [Math.SQRT1_2]);
  shelfBus(bus, 'low', 60, -2);
  shelfBus(bus, 'high', 4500, 3);
  multiplyBusConst(bus, 10 ** (limitDb / 20) / peakOf(bus));
  limitBus(bus, 1);
  for (const ch of [bus.L, bus.R]) for (let i = 0; i < ch.length; i++) ch[i] = Math.tanh(ch[i] * drive);
  fadeInBus(bus, fadeIn);
  fadeOutBus(bus, bus.L.length / SR - fadeOutStart);
  return normalizeBus(bus, MASTER_PEAK);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. Instruments (each returns a mono Float32Array or a stereo {L, R})
// ════════════════════════════════════════════════════════════════════════════

/** Kick: sine with a 130 -> 45 Hz pitch drop, ~350 ms body, 2nd harmonic + tanh for laptop speakers, click. */
function synthKick(rng, o = {}) {
  const { f0 = 130, f1 = 45, sweep = 0.022, decay = 0.35, click = 0.3, drive = 1.8, h2 = 0.18 } = o;
  const n = toSamples(decay) + 1;
  const out = new Float32Array(n);
  const clickHp = new SVF(3000);
  const norm = Math.tanh(drive);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const amp = Math.min(1, t / 0.0008) * Math.max(0, 1 - t / decay) ** 1.7;
    const body = Math.sin(TWO_PI * phase) + h2 * Math.sin(2 * TWO_PI * phase);
    clickHp.process(rng() * 2 - 1);
    out[i] = Math.tanh(drive * body * amp) / norm + click * clickHp.hp * Math.exp(-t / 0.0012);
    phase += (f1 + (f0 - f1) * Math.exp(-t / sweep)) / SR;
    if (phase >= 1) phase -= 1;
  }
  return out;
}

/** Muffled "heartbeat" sub kick for cold opens. */
function synthHeartbeat(rng) {
  const buf = synthKick(rng, { f0: 90, f1: 40, sweep: 0.03, decay: 0.42, click: 0, drive: 1.3, h2: 0.12 });
  filterMono(buf, 'lp', 170, 0.8);
  return fadeOutMono(normalizeMono(buf), 0.02);
}

/** Clap: 3 noise bursts 9 ms apart + ~150 ms tail, band-passed ~1.4 kHz, decorrelated L/R. */
function synthClap(rng, { tail = 0.15, fc = 1400, q = 1.2, spacing = 0.009 } = {}) {
  const n = toSamples(2 * spacing + tail * 1.5);
  const out = createBus(n);
  [out.L, out.R].forEach((ch, c) => {
    const bp = new SVF(fc * (c === 0 ? 0.92 : 1.08), q);
    const presence = new SVF(3000, 0.8);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let env = 0;
      for (let b = 0; b < 3; b++) {
        const tb = t - b * spacing;
        if (tb >= 0) env = Math.max(env, Math.exp(-tb / 0.0025));
      }
      const tt = t - 2 * spacing;
      if (tt >= 0) env = Math.max(env, 0.8 * Math.exp(-tt / (tail / 4)));
      const x = (rng() * 2 - 1) * env;
      bp.process(x);
      presence.process(x);
      ch[i] = bp.k * bp.bp + 0.4 * presence.k * presence.bp;
    }
  });
  fadeOutBus(out, 0.01);
  return normalizeBus(out, 1);
}

/** Snare for fills: short pitched body + bright noise. */
function synthSnare(rng, { tone = 185, decay = 0.14 } = {}) {
  const n = toSamples(decay + 0.02);
  const out = new Float32Array(n);
  const hp = new SVF(1800);
  const bp = new SVF(4200, 0.9);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    phase += (tone * (1 + 0.5 * Math.exp(-t / 0.012))) / SR;
    const body = Math.sin(TWO_PI * phase) * Math.exp(-t / 0.04);
    const nz = rng() * 2 - 1;
    hp.process(nz);
    bp.process(nz);
    const noise = (0.8 * hp.hp + 0.5 * bp.k * bp.bp) * Math.exp(-t / (decay / 4));
    out[i] = Math.tanh(1.4 * (0.6 * body + noise)) * Math.min(1, t / 0.0005);
  }
  return fadeOutMono(normalizeMono(out), 0.015);
}

const METAL_HZ = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]; // 808-style inharmonic square bank

/** Hi-hat: noise + metallic square bank, high-passed (>= 7 kHz, 24 dB/oct). */
function synthHat(rng, { decay = 0.04, hpHz = 7500, metal = 0.4 } = {}) {
  const n = toSamples(decay * 1.25) + 1;
  const out = new Float32Array(n);
  const hp1 = new SVF(hpHz);
  const hp2 = new SVF(hpHz);
  const top = new SVF(13000);
  const phases = METAL_HZ.map(() => rng());
  const incs = METAL_HZ.map((f) => f / SR);
  const tau = decay / 4;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let m = 0;
    for (let k = 0; k < 6; k++) {
      m += squareAt(phases[k], incs[k]);
      phases[k] += incs[k];
      if (phases[k] >= 1) phases[k] -= 1;
    }
    const x = (1 - metal) * (rng() * 2 - 1) + (metal * m) / 3;
    hp1.process(x);
    hp2.process(hp1.hp);
    out[i] = top.process(hp2.hp) * Math.min(1, t / 0.0005) * Math.exp(-t / tau);
  }
  return fadeOutMono(out, Math.min(0.01, decay * 0.25));
}

/** Crash cymbal: wide noise + metal, high-passed, darkening over a ~1.5 s decay. */
function synthCrash(rng, { decay = 1.5, hpHz = 3800 } = {}) {
  const n = toSamples(decay * 1.4);
  const metal = new Float32Array(n);
  const phases = METAL_HZ.map(() => rng());
  const incs = METAL_HZ.map((f) => (f * 1.73) / SR);
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let k = 0; k < 6; k++) {
      m += squareAt(phases[k], incs[k]);
      phases[k] += incs[k];
      if (phases[k] >= 1) phases[k] -= 1;
    }
    metal[i] = m / 6;
  }
  const out = createBus(n);
  for (const ch of [out.L, out.R]) {
    const hp1 = new SVF(hpHz);
    const hp2 = new SVF(hpHz);
    const lp = new SVF(16000);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      if ((i & 31) === 0) lp.set(6000 + 10000 * Math.exp(-t / 0.5));
      const x = 0.7 * (rng() * 2 - 1) + 0.3 * metal[i];
      hp1.process(x);
      hp2.process(hp1.hp);
      ch[i] = lp.process(hp2.hp) * Math.min(1, t / 0.002) * Math.exp(-t / (decay / 3.2));
    }
  }
  fadeOutBus(out, decay * 0.3);
  return normalizeBus(out, 1);
}

/** Impact: 70 -> 30 Hz sub boom (1.2 s) + short low noise hit + optional crash. */
function synthImpact(rng, { crash = true, crashGain = 0.45, noiseGain = 0.5, boomDecay = 1.2 } = {}) {
  const crashBuf = crash ? synthCrash(rng) : null;
  const n = Math.max(toSamples(boomDecay) + 1, crashBuf ? crashBuf.L.length : 0);
  const out = createBus(n);
  const lpL = new SVF(3000, 0.8);
  const lpR = new SVF(3000, 0.8);
  const norm = Math.tanh(1.6);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ampBoom = t < boomDecay ? Math.min(1, t / 0.003) * (1 - t / boomDecay) ** 2.2 : 0;
    const boom = Math.tanh(1.6 * Math.sin(TWO_PI * phase) * ampBoom) / norm;
    phase += (30 + 40 * Math.exp(-t / 0.22)) / SR;
    if (phase >= 1) phase -= 1;
    if ((i & 31) === 0) {
      const fc = 250 + 2800 * Math.exp(-t / 0.06);
      lpL.set(fc);
      lpR.set(fc);
    }
    const nEnv = noiseGain * Math.min(1, t / 0.001) * Math.exp(-t / 0.05);
    out.L[i] = boom + lpL.process(rng() * 2 - 1) * nEnv;
    out.R[i] = boom + lpR.process(rng() * 2 - 1) * nEnv;
  }
  if (crashBuf) mixStereo(out, 0, crashBuf, crashGain);
  return out;
}

/**
 * Riser: stereo white noise through a band-pass sweeping f0 -> f1 (exponential), level
 * ramping up and a spinning auto-pan. Exactly `duration` long, ends with a 4 ms fade so
 * it stops dead on the downbeat.
 */
function synthRiser(rng, duration, { f0 = 400, f1 = 9000, q = 2 } = {}) {
  const n = toSamples(duration);
  const out = createBus(n);
  const bpL = new SVF(f0, q);
  const bpR = new SVF(f0, q);
  const whL = new SVF(f0, 7);
  const whR = new SVF(f0, 7);
  const endFade = toSamples(0.004);
  let spin = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    if ((i & 31) === 0) {
      const fc = f0 * (f1 / f0) ** x;
      bpL.set(fc);
      bpR.set(fc * 1.04);
      whL.set(fc * 1.5);
      whR.set(fc * 1.45);
    }
    spin += (TWO_PI * (0.4 + 5.6 * x * x)) / SR;
    const pan = 0.35 * Math.sin(spin);
    const level = (0.03 + 0.97 * x ** 2.2) * Math.min(1, (n - 1 - i) / endFade);
    const nl = rng() * 2 - 1;
    const nr = rng() * 2 - 1;
    bpL.process(nl);
    bpR.process(nr);
    whL.process(nl);
    whR.process(nr);
    out.L[i] = (bpL.k * bpL.bp + 0.35 * whL.k * whL.bp) * level * (1 - pan);
    out.R[i] = (bpR.k * bpR.bp + 0.35 * whR.k * whR.bp) * level * (1 + pan);
  }
  return normalizeBus(out, 1);
}

/** Power-down: saw + sine falling 300 -> 40 Hz over `duration`, filter tracking the pitch. */
function synthPowerDown(rng, { duration = 0.7, f0 = 300, f1 = 40, tail = 0.05 } = {}) {
  const n = toSamples(duration + tail);
  const mono = new Float32Array(n);
  const lp = new SVF(2000, 0.9);
  let phase = rng();
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = Math.min(1, t / duration);
    const f = f0 * (f1 / f0) ** (x ** 0.8);
    const dt = f / SR;
    if ((i & 31) === 0) lp.set(f * 5);
    const amp = Math.min(1, t / 0.004) * (1 - x * 0.85) ** 1.2;
    const y = 0.55 * Math.sin(TWO_PI * phase) + 0.45 * lp.process(sawAt(phase, dt));
    mono[i] = Math.tanh(1.3 * y * amp);
    phase += dt;
    if (phase >= 1) phase -= 1;
  }
  fadeOutMono(mono, tail + 0.1);
  normalizeMono(mono);
  return { L: mono, R: mono.slice() };
}

/** Off-beat bass note: saw (low-passed ~380 Hz + small env) + sine sub an octave down. */
const bassCache = new Map();
function synthBassNote(midi, { dur = 0.2, cutoff = 380, envAmt = 450 } = {}) {
  const key = `${midi}:${dur}:${cutoff}`;
  if (bassCache.has(key)) return bassCache.get(key);
  const f = midiToHz(midi);
  const release = 0.03;
  const n = toSamples(dur + release);
  const out = new Float32Array(n);
  const lp = new SVF(cutoff, 1.0);
  const dt = f / SR;
  let pSaw = 0;
  let pSub = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if ((i & 31) === 0) lp.set(cutoff + envAmt * Math.exp(-t / 0.05));
    const rel = t < dur ? 1 : 0.5 + 0.5 * Math.cos((Math.PI * (t - dur)) / release);
    const amp = Math.min(1, t / 0.004) * (1 - (0.25 * Math.min(t, dur)) / dur) * rel;
    const saw = lp.process(sawAt(pSaw, dt));
    const sub = Math.sin(TWO_PI * pSub) * 0.5 + Math.sin(TWO_PI * pSaw) * 0.35;
    out[i] = Math.tanh(1.3 * (0.8 * saw + sub) * amp);
    pSaw += dt;
    if (pSaw >= 1) pSaw -= 1;
    pSub += dt / 2;
    if (pSub >= 1) pSub -= 1;
  }
  bassCache.set(key, out);
  return out;
}

/** Pad/arp amplitude shape: sine attack, hold, cosine release (equal-power crossfades). */
function padEnvelope(t, attack, hold, release) {
  if (t < attack) return Math.sin((Math.PI / 2) * (t / attack));
  if (t < hold) return 1;
  const r = (t - hold) / release;
  return r < 1 ? Math.cos((Math.PI / 2) * r) : 0;
}

/**
 * Pad chord straight into a bus: 3 detuned saws per note (-8 / 0 / +8 cents, spread L/C/R),
 * with a slow per-voice pitch drift. Filtering & sidechain happen later on the whole bus.
 */
function renderPadChord(bus, rng, notes, time, dur, { attack = 0.2, release = 0.25, gain = 0.05, detune = 8 } = {}) {
  const start = toSamples(time);
  const n = Math.min(toSamples(dur + release), bus.L.length - start);
  for (const midi of notes) {
    const f = midiToHz(midi);
    const voices = [
      [-(detune + rng()), -0.75],
      [0, 0],
      [detune + rng(), 0.75],
    ];
    for (const [cents, pan] of voices) {
      const [gl, gr] = panGains(pan);
      const baseInc = (f * 2 ** (cents / 1200)) / SR;
      const lfoRate = 0.15 + rng() * 0.25;
      const lfoPhase = rng() * TWO_PI;
      let phase = rng();
      let inc = baseInc;
      for (let i = 0; i < n; i++) {
        if ((i & 31) === 0) inc = baseInc * (1 + 0.0012 * Math.sin(lfoPhase + (TWO_PI * lfoRate * i) / SR));
        const s = sawAt(phase, inc) * padEnvelope(i / SR, attack, dur, release) * gain;
        phase += inc;
        if (phase >= 1) phase -= 1;
        bus.L[start + i] += s * gl;
        bus.R[start + i] += s * gr;
      }
    }
  }
}

/** One arp pluck: saw (optionally mixed with square) through a plucked low-pass, ~120 ms decay. */
function renderArpNote(bus, rng, midi, time, { vel, pan, cutoff, squareMix = 0, decay = 0.12 }) {
  const start = toSamples(time);
  const n = Math.min(toSamples(0.3), bus.L.length - start);
  const [gl, gr] = panGains(pan);
  const inc = midiToHz(midi) / SR;
  const lp = new SVF(1000, 1.0);
  const tau = decay / 2.6;
  const fadeStart = n - toSamples(0.02);
  let phase = rng();
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if ((i & 31) === 0) lp.set(Math.min(16000, cutoff[start + i] * (0.55 + 1.7 * Math.exp(-t / 0.03))));
    // Square is inverted so its fundamental adds to (rather than cancels) the saw fundamental.
    const osc = (1 - squareMix) * sawAt(phase, inc) - squareMix * 0.7 * squareAt(phase, inc);
    phase += inc;
    if (phase >= 1) phase -= 1;
    let amp = Math.min(1, t / 0.0015) * Math.exp(-t / tau) * vel;
    if (i > fadeStart) amp *= (n - i) / (n - fadeStart);
    const y = lp.process(osc) * amp;
    bus.L[start + i] += y * gl;
    bus.R[start + i] += y * gr;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 5. Arrangement helpers (a "song" = a set of stereo buses + the kick hit list)
// ════════════════════════════════════════════════════════════════════════════

const BUS_NAMES = ['kick', 'clap', 'hats', 'bass', 'pad', 'arp', 'fx'];
const CLOSED_HAT_VEL = [0.85, 0.45, 0.7, 0.5]; // per 16th within a beat
const ARP_ACCENT = [1, 0.55, 0.7, 0.9, 0.6, 0.75, 1, 0.55, 0.85, 0.6, 0.7, 0.95, 0.6, 0.75, 0.95, 0.6]; // 3-3-2 lilt

function createSong(bars, seed) {
  const length = toSamples(bars * BAR);
  const song = { bars, length, rng: createRng(seed), kickTimes: [] };
  for (const name of BUS_NAMES) song[name] = createBus(length);
  return song;
}

/** Turn per-bar chord names ('X' or 'X>Y' = two halves) into merged time segments. */
function buildProgression(barNames, chordTable) {
  const segments = [];
  barNames.forEach((name, bar) => {
    const parts = name.split('>');
    parts.forEach((part, k) => {
      const t0 = bar * BAR + (k * BAR) / parts.length;
      const t1 = bar * BAR + ((k + 1) * BAR) / parts.length;
      const last = segments[segments.length - 1];
      if (last && last.name === part && Math.abs(last.t1 - t0) < 1e-9) last.t1 = t1;
      else segments.push({ name: part, t0, t1, ...chordTable[part] });
    });
  });
  return segments;
}

const chordAt = (progression, t) =>
  progression.find((s) => t >= s.t0 - 1e-9 && t < s.t1 - 1e-9) ?? progression[progression.length - 1];

/** Up-down arpeggio order over the chord tones (no repeated turnaround notes). */
function arpSequence(notes) {
  const up = [...notes].sort((a, b) => a - b);
  return [...up, ...up.slice(1, -1).reverse()];
}

function playKick(song, time, sample, gain = 1) {
  mixMono(song.kick, time, sample, gain, 0);
  song.kickTimes.push(time);
}

function playClap(song, time, gain = 1) {
  mixStereo(song.clap, time, synthClap(song.rng), gain);
}

/**
 * Hats for one bar. mode '16ths' = closed 16ths (open hat replaces the "and" when open=true),
 * '8ths' = closed 8ths only. gainAt(t) scales every hit (fades). beats = which beats play.
 */
function playHatsBar(song, bar, { mode = '16ths', open = true, gainAt = () => 1, beats = [0, 1, 2, 3] } = {}) {
  const { rng } = song;
  for (const beat of beats) {
    for (let step = 0; step < 4; step++) {
      const onGrid = gridTime(bar, beat, step);
      if (open && step === 2) {
        mixMono(song.hats, onGrid, synthHat(rng, { decay: 0.14, hpHz: 7000 }), 0.75 * gainAt(onGrid), -0.2);
        continue;
      }
      if (mode === '8ths' && step % 2 === 1) continue;
      const t = onGrid + (step % 2 === 1 ? HAT_SWING : 0);
      const vel = CLOSED_HAT_VEL[step] * (0.92 + 0.16 * rng()) * gainAt(onGrid);
      mixMono(song.hats, t, synthHat(rng, { decay: 0.03 + 0.015 * rng() }), vel, 0.2);
    }
  }
}

/** Off-beat bass (each beat's "and") on the root of the chord playing at that moment. */
function playBassBar(song, progression, bar, { beats = [0, 1, 2, 3], gain = 1 } = {}) {
  for (const beat of beats) {
    const t = gridTime(bar, beat) + BEAT / 2;
    mixMono(song.bass, t, synthBassNote(chordAt(progression, t).root), gain, 0);
  }
}

/** 16th-note snare roll with a crescendo over the last beat of `bar`. */
function playSnareFill(song, bar) {
  for (let k = 0; k < 4; k++) {
    const vel = 0.35 + 0.65 * ((k + 1) / 4) ** 1.3;
    mixMono(song.clap, gridTime(bar, 3, k), synthSnare(song.rng, { tone: 180 + 12 * k }), vel * 0.85, k % 2 ? 0.12 : -0.12);
  }
}

function playCrash(song, time, gain = 0.4) {
  mixStereo(song.fx, time, synthCrash(song.rng), gain);
}

function playImpact(song, time, { gain = 1, soft = false } = {}) {
  const impact = soft ? synthImpact(song.rng, { crash: false, noiseGain: 0.3 }) : synthImpact(song.rng);
  mixStereo(song.fx, time, impact, soft ? gain * 0.55 : gain);
}

/** Riser that ends exactly at `endTime` (the downbeat it leads into). */
function playRiser(song, startTime, endTime, gain = 0.5) {
  mixStereo(song.fx, startTime, synthRiser(song.rng, endTime - startTime), gain);
}

/** Pad for every chord segment inside [from, to). */
function playPad(song, progression, { from = 0, to = Infinity, attackAt = () => 0.2, release = 0.2, gain = 0.05 } = {}) {
  for (const seg of progression) {
    if (seg.t0 < from || seg.t0 >= to) continue;
    renderPadChord(song.pad, song.rng, seg.pad, seg.t0, seg.t1 - seg.t0, { attack: attackAt(seg), release, gain });
  }
}

/** Arp 16ths for one bar, one octave above the pad chord that is playing at each step. */
function playArpBar(song, progression, bar, { steps = 16, level, cutoff, squareMix = 0, velAt = () => 1 }) {
  for (let s = 0; s < steps; s++) {
    const t = gridTime(bar, 0, s);
    const seq = arpSequence(chordAt(progression, t).pad);
    const vel = ARP_ACCENT[s] * level[toSamples(t)] * velAt(s);
    renderArpNote(song.arp, song.rng, seq[s % seq.length] + 12, t, {
      vel,
      pan: s % 2 ? 0.3 : -0.3,
      cutoff,
      squareMix,
    });
  }
}

/** Prints per-bus RMS in a window (AUDIO_DEBUG=1). */
function debugLevels(label, buses, t0, t1) {
  if (!DEBUG) return;
  const a = toSamples(t0);
  const b = toSamples(t1);
  const parts = Object.entries(buses).map(([name, bus]) => {
    let sum = 0;
    for (let i = a; i < b; i++) sum += (bus.L[i] ** 2 + bus.R[i] ** 2) / 2;
    return `${name} ${(10 * Math.log10(sum / (b - a) + 1e-20)).toFixed(1)}`;
  });
  console.log(`  [${label}] RMS dB ${t0}-${t1}s: ${parts.join(' | ')}`);
}

/** Sum the buses with their mix gains into a fresh bus. */
function mixdown(length, parts) {
  const mix = createBus(length);
  for (const [bus, gain] of parts) addBus(mix, bus, gain);
  return mix;
}

// ════════════════════════════════════════════════════════════════════════════
// 6. Tracks
// ════════════════════════════════════════════════════════════════════════════

// Mix gains shared by both tracks (buses are rendered at roughly unit peak level).
const MIX = { kick: 0.85, clap: 0.95, hats: 1.8, bass: 0.65, pad: 2.2, arp: 0.9, fx: 0.7, reverb: 0.3 };

const CS_CHORDS = {
  Am9: { pad: [57, 60, 64, 67, 71], root: 45 },
  Fmaj7: { pad: [53, 57, 60, 64, 67], root: 41 },
  Cadd9: { pad: [55, 60, 62, 64, 67], root: 48 },
  G6: { pad: [55, 59, 62, 64], root: 43 },
};
// Am9 -> Fmaj7 -> Cadd9 -> G6 cycle, phased so the bar-2 drop lands on Am9; the outro resolves home.
const CS_BARS = [...repeatCycle(['Cadd9', 'G6', 'Am9', 'Fmaj7'], 13), 'Am9'];

/** Track 1: music-cs.wav - 28.0 s, 14 bars. */
function renderCsMusic() {
  const song = createSong(14, 0xc5a11);
  const { rng, length } = song;
  const prog = buildProgression(CS_BARS, CS_CHORDS);
  const kick = synthKick(rng);

  const padCutoff = automation(
    [[0, 300], [2, 1400], [3.95, 1750], [4, 1300], [24, 1550], [26, 1500], [28, 450]],
    length,
    'log',
  );
  const arpCutoff = automation([[0, 450], [2, 650], [4, 1800], [20, 4200], [26, 4200], [28, 2000]], length, 'log');
  const arpLevel = automation([[0, 0.22], [2, 0.3], [4, 0.75], [4, 0.9], [28, 0.9]], length);

  // Pad (bar 0 swells in slowly) + arp (quiet & filtered in bar 0, opening in bar 1, full from bar 2).
  playPad(song, prog, { attackAt: (seg) => (seg.t0 === 0 ? 0.9 : 0.2) });
  for (let bar = 0; bar < 14; bar++) {
    const outro = bar === 13;
    playArpBar(song, prog, bar, {
      steps: outro ? 8 : 16,
      level: arpLevel,
      cutoff: arpCutoff,
      velAt: (s) => (outro ? 1 - s / 10 : 1),
    });
  }

  // Bar 1 build: 16th hats fading in.
  playHatsBar(song, 1, { mode: '16ths', open: false, gainAt: (t) => ((t - 2) / 2) ** 1.5 });

  // Bars 2-12: full groove.
  for (let bar = 2; bar <= 12; bar++) {
    for (let beat = 0; beat < 4; beat++) playKick(song, gridTime(bar, beat), kick);
    playClap(song, gridTime(bar, 1));
    playClap(song, gridTime(bar, 3));
    playHatsBar(song, bar, { mode: '16ths', open: true });
    playBassBar(song, prog, bar);
  }
  playSnareFill(song, 9);

  // FX: soft intro impact, riser into the drop, impacts / crashes at section starts, outro hit.
  playImpact(song, 0.1, { soft: true });
  playRiser(song, gridTime(1), gridTime(2));
  playImpact(song, gridTime(2));
  for (const bar of [6, 10, 12]) playCrash(song, gridTime(bar));
  playImpact(song, gridTime(13));

  return finishTrack(song, {
    label: 'cs',
    padCutoff,
    fadeOutStart: 26.6,
    debugWindow: [8, 16],
  });
}

const WAZIR_CHORDS = {
  Dm9: { pad: [50, 53, 57, 60, 64], root: 38 },
  Bbmaj7: { pad: [53, 57, 58, 62, 65], root: 46 },
  Gm9: { pad: [53, 57, 58, 62, 67], root: 43 },
  A7sus4: { pad: [52, 55, 57, 62, 64], root: 45 },
  A: { pad: [52, 57, 61, 64], root: 45 },
};
const WAZIR_CYCLE = ['Dm9', 'Bbmaj7', 'Gm9', 'A7sus4>A'];
// The cycle restarts at each section start so every crash bar lands on Dm9.
const WAZIR_BARS = [
  'Bbmaj7', 'A7sus4>A', //                bars 0-1   cold open: VI -> V into the drop
  ...repeatCycle(WAZIR_CYCLE, 15), //      bars 2-16  main groove
  ...repeatCycle(WAZIR_CYCLE, 4), //       bars 17-20 lighter variation
  ...repeatCycle(WAZIR_CYCLE, 7), //       bars 21-27
  'A7sus4', 'A7sus4', //                  bars 28-29 dominant left unresolved through the power-down drone
  'Dm9', 'Dm9', //                        bars 30-31 return + outro on the tonic
];

/** Track 2: music-wazir.wav - 64.0 s, 32 bars. */
function renderWazirMusic() {
  const song = createSong(32, 0x3a21e);
  const { rng, length } = song;
  const prog = buildProgression(WAZIR_BARS, WAZIR_CHORDS);
  const kick = synthKick(rng, { f0: 125, f1: 43, decay: 0.37 });
  const heartbeat = synthHeartbeat(rng);
  const POWER_DOWN = gridTime(28, 2); // 57.0 s
  const RETURN = gridTime(30); // 60.0 s

  const padCutoff = automation(
    [
      [0, 330], [3.95, 430], [4, 1150], [34, 1500], [34.05, 1000], [42, 1150], [42.05, 1450],
      [POWER_DOWN, 1600], [POWER_DOWN + 0.15, 200], [RETURN, 200], [RETURN + 0.01, 1750], [62, 1750], [64, 500],
    ],
    length,
    'log',
  );
  const padLevel = automation(
    [[0, 0.75], [3.99, 0.8], [4, 1], [POWER_DOWN, 1], [POWER_DOWN + 0.15, 0.45], [RETURN, 0.45], [RETURN + 0.01, 1]],
    length,
  );
  const arpCutoff = automation(
    [[4, 1800], [34, 5000], [34.05, 3000], [42, 3200], [42.05, 4800], [57, 5600], [60, 6000], [62, 6000], [64, 2500]],
    length,
    'log',
  );
  const arpLevel = automation([[4, 0.85], [34, 0.95], [34.05, 0.75], [42, 0.8], [42.05, 0.95], [60, 1], [64, 1]], length);

  // Pad everywhere (slow swell for the cold open).
  playPad(song, prog, { attackAt: (seg) => (seg.t0 === 0 ? 1.2 : 0.2), gain: 0.052 });

  // Cold open: heartbeat on beats 1 & 3, ticking 8th hats in bar 1, riser into the drop.
  const heartbeatTimes = [];
  for (const bar of [0, 1]) {
    for (const beat of [0, 2]) {
      mixMono(song.kick, gridTime(bar, beat), heartbeat, 0.8, 0);
      heartbeatTimes.push(gridTime(bar, beat));
    }
  }
  playHatsBar(song, 1, { mode: '8ths', open: false, gainAt: () => 0.45 });
  playRiser(song, gridTime(1), gridTime(2));
  playImpact(song, gridTime(2));

  // Groove bars 2-28 (bar 28 only up to the power-down) and bar 30.
  const grooveBars = [...Array.from({ length: 27 }, (_, i) => i + 2), 30];
  for (const bar of grooveBars) {
    const beats = bar === 28 ? [0, 1] : [0, 1, 2, 3];
    const lighter = bar >= 17 && bar <= 20;
    for (const beat of beats) playKick(song, gridTime(bar, beat), kick);
    if (bar !== 17) for (const beat of beats.filter((b) => b % 2 === 1)) playClap(song, gridTime(bar, beat));
    playHatsBar(song, bar, { mode: '16ths', open: !lighter, beats });
    playBassBar(song, prog, bar, { beats });
    playArpBar(song, prog, bar, { steps: bar === 28 ? 8 : 16, level: arpLevel, cutoff: arpCutoff, squareMix: 0.45 });
  }
  // Outro arp: half a bar, fading, then the delay tail rings.
  playArpBar(song, prog, 31, { steps: 8, level: arpLevel, cutoff: arpCutoff, squareMix: 0.45, velAt: (s) => 1 - s / 10 });

  playSnareFill(song, 6);
  playSnareFill(song, 16);
  for (const bar of [6, 10, 14, 17, 21, 25]) playCrash(song, gridTime(bar));

  // Power-down at 57.0 s, riser 59.0 -> 60.0 s, big return at 60.0 s, outro impact at 62.0 s.
  mixStereo(song.fx, POWER_DOWN, synthPowerDown(rng), 0.8);
  playRiser(song, gridTime(29, 2), RETURN);
  playImpact(song, RETURN);
  playImpact(song, gridTime(31));

  // Hard gate for drums/bass/arp (+their delay/reverb tails) between the power-down and the return.
  const gate = automation([[0, 1], [POWER_DOWN, 1], [POWER_DOWN + 0.004, 0], [RETURN, 0], [RETURN, 1]], length);

  return finishTrack(song, {
    label: 'wazir',
    padCutoff,
    padLevel,
    sidechainExtra: heartbeatTimes,
    fadeOutStart: 62.6,
    gate,
    debugWindow: [20, 28],
  });
}

/** Shared bus processing + mixdown + mastering for both tracks. */
function finishTrack(song, { label, padCutoff, padLevel = null, sidechainExtra = [], fadeOutStart, gate = null, debugWindow }) {
  const { length } = song;

  // Pad: 24 dB/oct low-pass with automation, then kick sidechain pump (+ lighter heartbeat pump).
  filterBus(song.pad, 'lp', padCutoff, [0.54, 1.31]);
  const duck = sidechainCurve(length, song.kickTimes, 0.35);
  sidechainCurve(length, sidechainExtra, 0.6, 0.42, duck);
  multiplyBus(song.pad, duck);
  if (padLevel) multiplyBus(song.pad, padLevel);

  // Arp: presence shelf for sparkle, then dotted-8th ping-pong delay.
  shelfBus(song.arp, 'high', 2500, 4);
  applyPingPongDelay(song.arp, { time: 0.75 * BEAT, feedback: 0.35, mix: 0.3 });

  // Reverb send (clap/snare + arp), high-passed so it never muddies the low end.
  const send = mixdown(length, [
    [song.clap, 0.5],
    [song.arp, 0.35],
  ]);
  filterBus(send, 'hp', 350);
  const reverb = renderReverb(send);

  if (gate) for (const bus of [song.kick, song.clap, song.hats, song.bass, song.arp, reverb]) multiplyBus(bus, gate);

  const parts = {
    kick: [song.kick, MIX.kick],
    clap: [song.clap, MIX.clap],
    hats: [song.hats, MIX.hats],
    bass: [song.bass, MIX.bass],
    pad: [song.pad, MIX.pad],
    arp: [song.arp, MIX.arp],
    fx: [song.fx, MIX.fx],
    reverb: [reverb, MIX.reverb],
  };
  if (DEBUG) {
    const scaled = Object.fromEntries(
      Object.entries(parts).map(([k, [bus, g]]) => [k, mixdown(length, [[bus, g]])]),
    );
    debugLevels(label, scaled, ...debugWindow);
  }
  const mix = mixdown(length, Object.values(parts));
  return masterBus(mix, { limitDb: 4, drive: 1.1, fadeOutStart });
}

// ════════════════════════════════════════════════════════════════════════════
// 7. Sound effects (all end up trimmed, peak -3 dBFS, stereo)
// ════════════════════════════════════════════════════════════════════════════

/** Bell-ish tone from [ratio, amplitude, decaySeconds] partials. */
function synthBell(freq, duration, partials, attack = 0.001) {
  const n = toSamples(duration);
  const out = new Float32Array(n);
  for (const [ratio, amp, tau] of partials) {
    const f = freq * ratio;
    if (f > SR * 0.45) continue;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      out[i] += amp * Math.sin(TWO_PI * f * t) * Math.exp(-t / tau) * Math.min(1, t / attack);
    }
  }
  return out;
}

function monoToBus(mono) {
  return { L: mono, R: mono.slice() };
}

/** Trim leading/trailing near-silence, soften the edges and normalize to -3 dBFS. */
function finishSfx(bus) {
  const peak = peakOf(bus);
  const level = (i) => Math.max(Math.abs(bus.L[i]), Math.abs(bus.R[i]));
  let a = 0;
  while (a < bus.L.length - 1 && level(a) < peak * 0.001) a++;
  let b = bus.L.length - 1;
  while (b > a && level(b) < peak * 0.0003) b--;
  const out = { L: bus.L.slice(a, b + 1), R: bus.R.slice(a, b + 1) };
  fadeInBus(out, 0.0005);
  fadeOutBus(out, Math.min(0.006, (out.L.length / SR) * 0.2));
  return normalizeBus(out, SFX_PEAK);
}

/** pop: incoming chat bubble - rounded sine blip 600 -> 950 Hz in 40 ms, ~90 ms. */
function sfxPop() {
  const n = toSamples(0.09);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = t < 0.04 ? 600 * (950 / 600) ** (t / 0.04) : 950;
    phase += f / SR;
    const amp = Math.sin((Math.PI / 2) * Math.min(1, t / 0.004)) * (1 - t / 0.09) ** 1.5;
    const body = 0.35 * Math.sin(TWO_PI * 300 * t) * Math.exp(-t / 0.015);
    out[i] = (Math.sin(TWO_PI * phase) + 0.12 * Math.sin(2 * TWO_PI * phase) + body) * amp;
  }
  return finishSfx(monoToBus(out));
}

/** send: outgoing airy upward swoosh + small sine "whoop" + tiny tick, ~180 ms. */
function sfxSend(rng) {
  const n = toSamples(0.18);
  const out = createBus(n);
  const filters = [new SVF(900, 1.4), new SVF(900, 1.4)];
  const tickHp = new SVF(5000);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = Math.min(1, t / 0.15);
    if ((i & 15) === 0) for (const f of filters) f.set(900 * (6500 / 900) ** x ** 1.2);
    const swell = (0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, t / 0.16))) * (t < 0.16 ? 1 : 1 - (t - 0.16) / 0.02);
    phase += (380 * (1500 / 380) ** Math.min(1, t / 0.12)) / SR;
    const whoop = 0.3 * Math.sin(TWO_PI * phase) * Math.min(1, t / 0.005) * Math.max(0, 1 - t / 0.14);
    const tt = t - 0.135;
    let tick = 0;
    tickHp.process(rng() * 2 - 1);
    if (tt >= 0) tick = (0.5 * tickHp.hp + 0.5 * Math.sin(TWO_PI * 3200 * tt)) * Math.exp(-tt / 0.0015);
    for (let c = 0; c < 2; c++) {
      filters[c].process(rng() * 2 - 1);
      const v = filters[c].k * filters[c].bp * swell + whoop + tick;
      (c === 0 ? out.L : out.R)[i] = v;
    }
  }
  return finishSfx(out);
}

/** ding: two-tone notification bell, 1318 Hz then 1760 Hz, ~500 ms. */
function sfxDing() {
  const partials = [
    [1, 1, 0.16],
    [2.0, 0.35, 0.09],
    [2.76, 0.16, 0.06],
    [5.4, 0.06, 0.03],
    [8.9, 0.02, 0.015],
  ];
  const out = new Float32Array(toSamples(0.5));
  const first = synthBell(1318.5, 0.5, partials);
  const second = synthBell(1760, 0.39, partials);
  for (let i = 0; i < out.length; i++) out[i] = 0.8 * first[i];
  const off = toSamples(0.11);
  for (let i = 0; i < second.length && off + i < out.length; i++) out[off + i] += second[i];
  fadeOutMono(out, 0.06);
  return finishSfx(monoToBus(out));
}

/** whoosh: noise swell, band-pass sweeping up then down, panned left -> right, ~550 ms. */
function sfxWhoosh(rng) {
  const n = toSamples(0.55);
  const out = createBus(n);
  const bp = new SVF(500, 1.1);
  const body = new SVF(500, 0.7);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const arc = Math.sin(Math.PI * x);
    if ((i & 15) === 0) bp.set(500 * (4500 / 500) ** arc ** 1.2);
    const nz = rng() * 2 - 1;
    bp.process(nz);
    body.process(nz);
    const mono = (bp.k * bp.bp + 0.4 * body.lp) * arc ** 1.8;
    const [gl, gr] = panGains(-0.85 + 1.7 * x);
    out.L[i] = mono * gl;
    out.R[i] = mono * gr;
  }
  return finishSfx(out);
}

/** click: UI mouse click, ~25 ms. */
function sfxClick(rng) {
  const n = toSamples(0.025);
  const out = new Float32Array(n);
  const bp = new SVF(4000, 1.5);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    bp.process(rng() * 2 - 1);
    const press = bp.k * bp.bp * Math.exp(-t / 0.0012) + 0.5 * Math.sin(TWO_PI * 2200 * t) * Math.exp(-t / 0.003);
    const thump = 0.25 * Math.sin(TWO_PI * 700 * t) * Math.exp(-t / 0.005);
    const tr = t - 0.014;
    const release = tr >= 0 ? 0.2 * Math.sin(TWO_PI * 2600 * tr) * Math.exp(-tr / 0.0015) : 0;
    out[i] = press + thump + release;
  }
  return finishSfx(monoToBus(out));
}

/** key: soft single keystroke tick, ~30 ms (triggered many times while typing). */
function sfxKey(rng) {
  const n = toSamples(0.03);
  const out = new Float32Array(n);
  const tickBp = new SVF(2800, 0.9);
  const bottomBp = new SVF(1800, 1.2);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const nz = rng() * 2 - 1;
    tickBp.process(nz);
    bottomBp.process(nz);
    phase += (150 + 40 * Math.exp(-t / 0.004)) / SR;
    const tick = tickBp.k * tickBp.bp * Math.exp(-t / 0.0018);
    const thock = 0.45 * Math.sin(TWO_PI * phase) * Math.exp(-t / 0.007);
    const tb = t - 0.011;
    const bottom = tb >= 0 ? 0.35 * bottomBp.k * bottomBp.bp * Math.exp(-tb / 0.0015) : 0;
    out[i] = tick + thock + bottom;
  }
  filterMono(out, 'lp', 7000);
  filterMono(out, 'hp', 70); // remove the DC bump of the short thock
  return finishSfx(monoToBus(out));
}

/** impact: standalone sub boom + noise hit + crash, ~1.5 s. */
function sfxImpact(rng) {
  const hit = synthImpact(rng);
  const n = toSamples(1.5);
  const out = { L: hit.L.slice(0, n), R: hit.R.slice(0, n) };
  fadeOutBus(out, 0.25);
  return finishSfx(out);
}

/** powerdown: standalone falling sweep 300 -> 40 Hz, ~0.8 s. */
function sfxPowerDown(rng) {
  return finishSfx(synthPowerDown(rng, { duration: 0.72, tail: 0.08 }));
}

/** powerup: rising sweep 60 -> 600 Hz with sparkle pings and shimmer, ~0.8 s. */
function sfxPowerUp(rng) {
  const dur = 0.8;
  const n = toSamples(dur);
  const out = createBus(n);
  const lp = new SVF(400, 0.9);
  const shimmer = [new SVF(6000), new SVF(6000)];
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = t / dur;
    const f = 60 * 10 ** Math.min(1, t / 0.7);
    const dt = f / SR;
    if ((i & 31) === 0) lp.set(f * 6);
    const amp = (0.35 + 0.65 * Math.min(1, x / 0.8)) * Math.min(1, t / 0.003);
    const tone = (0.6 * Math.sin(TWO_PI * phase) + 0.4 * lp.process(sawAt(phase, dt))) * amp;
    phase += dt;
    if (phase >= 1) phase -= 1;
    for (let c = 0; c < 2; c++) {
      shimmer[c].process(rng() * 2 - 1);
      (c === 0 ? out.L : out.R)[i] = Math.tanh(1.2 * tone) + 0.12 * x * x * shimmer[c].hp;
    }
  }
  // Sparkle: short high sine pings, denser toward the end.
  for (let k = 0; k < 18; k++) {
    const t0 = 0.12 + 0.62 * Math.sqrt(rng());
    const f = 2500 + 4500 * rng();
    const ping = new Float32Array(toSamples(0.06));
    for (let i = 0; i < ping.length; i++) ping[i] = Math.sin((TWO_PI * f * i) / SR) * Math.exp(-i / SR / 0.012);
    mixMono(out, t0, ping, 0.12 + 0.12 * rng(), rng() * 1.6 - 0.8);
  }
  fadeOutBus(out, 0.08);
  return finishSfx(out);
}

/** success: positive two-note chime E6 -> B6, ~400 ms. */
function sfxSuccess() {
  const partials = [
    [1, 1, 0.13],
    [2, 0.22, 0.06],
    [3, 0.08, 0.03],
    [4.0, 0.04, 0.02],
  ];
  const out = new Float32Array(toSamples(0.4));
  const first = synthBell(1318.5, 0.4, partials, 0.002);
  const second = synthBell(1975.5, 0.31, partials, 0.002);
  for (let i = 0; i < out.length; i++) out[i] = 0.85 * first[i];
  const off = toSamples(0.09);
  for (let i = 0; i < second.length && off + i < out.length; i++) out[off + i] += second[i];
  fadeOutMono(out, 0.05);
  return finishSfx(monoToBus(out));
}

// ════════════════════════════════════════════════════════════════════════════
// 8. WAV writer & main
// ════════════════════════════════════════════════════════════════════════════

function toInt16(x) {
  if (!Number.isFinite(x)) throw new Error('Non-finite sample while encoding WAV');
  const s = clamp(x, -1, 1);
  return s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
}

/** Write a RIFF/WAVE file: PCM 16-bit, stereo, 44.1 kHz. */
function writeWav(path, { L, R }) {
  const channels = 2;
  const bytesPerSample = 2;
  const frames = L.length;
  const dataSize = frames * channels * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16); // fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * channels * bytesPerSample, 28); // byte rate
  buf.writeUInt16LE(channels * bytesPerSample, 32); // block align
  buf.writeUInt16LE(8 * bytesPerSample, 34); // bits per sample
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataSize, 40);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    buf.writeInt16LE(toInt16(L[i]), o);
    buf.writeInt16LE(toInt16(R[i]), o + 2);
    o += 4;
  }
  writeFileSync(path, buf);
}

const OUTPUTS = {
  'music-cs': () => renderCsMusic(),
  'music-wazir': () => renderWazirMusic(),
  pop: () => sfxPop(),
  send: () => sfxSend(createRng(101)),
  ding: () => sfxDing(),
  whoosh: () => sfxWhoosh(createRng(103)),
  click: () => sfxClick(createRng(104)),
  key: () => sfxKey(createRng(105)),
  impact: () => sfxImpact(createRng(106)),
  powerdown: () => sfxPowerDown(createRng(107)),
  powerup: () => sfxPowerUp(createRng(108)),
  success: () => sfxSuccess(),
};

function main() {
  const wanted = process.argv.slice(2).map((a) => a.replace(/\.wav$/, ''));
  const unknown = wanted.filter((w) => !(w in OUTPUTS));
  if (unknown.length) throw new Error(`Unknown output(s): ${unknown.join(', ')}. Known: ${Object.keys(OUTPUTS).join(', ')}`);
  mkdirSync(OUT_DIR, { recursive: true });
  const started = performance.now();
  for (const [name, render] of Object.entries(OUTPUTS)) {
    if (wanted.length && !wanted.includes(name)) continue;
    const t0 = performance.now();
    const audio = render();
    const file = join(OUT_DIR, `${name}.wav`);
    writeWav(file, audio);
    const secs = (audio.L.length / SR).toFixed(3);
    console.log(`${name}.wav  ${secs}s  (${((performance.now() - t0) / 1000).toFixed(2)}s render)`);
  }
  console.log(`Done in ${((performance.now() - started) / 1000).toFixed(1)}s -> ${OUT_DIR}`);
}

main();
