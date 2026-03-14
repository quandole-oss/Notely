/*
 * NOTELY — useAudio Hook
 * Web Audio API piano synthesis — no external dependencies
 * Produces a warm, piano-like tone using oscillators + envelope shaping
 * Supports all notes across multiple octaves
 */

// Note frequencies (Hz) — Equal temperament, A4 = 440Hz
const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 3
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56,
  "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00,
  "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  // Octave 4 (middle octave)
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13,
  "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00,
  "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  // Octave 5
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25,
  "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99,
  "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
};

// Map simple note names to default octave 4 frequencies
const SIMPLE_NOTE_MAP: Record<string, string> = {
  "C": "C4", "C2": "C5",
  "D": "D4",
  "E": "E4",
  "F": "F4",
  "G": "G4",
  "A": "A4",
  "B": "B4",
  // Solfège aliases
  "DO": "C4", "RE": "D4", "MI": "E4", "FA": "F4",
  "SOL": "G4", "LA": "A4", "SI": "B4",
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function getFrequency(note: string): number {
  // Try direct lookup first (e.g. "C4", "E4")
  if (NOTE_FREQUENCIES[note]) return NOTE_FREQUENCIES[note];
  // Try simple name map (e.g. "C", "E", "DO", "MI")
  const mapped = SIMPLE_NOTE_MAP[note.toUpperCase()];
  if (mapped && NOTE_FREQUENCIES[mapped]) return NOTE_FREQUENCIES[mapped];
  // Fallback to middle C
  return NOTE_FREQUENCIES["C4"];
}

/**
 * Play a piano-like note using Web Audio API synthesis.
 * Uses a combination of sine + triangle oscillators with ADSR envelope
 * to approximate a warm piano tone without any sample files.
 */
export function playNote(note: string, duration: number = 1.2, velocity: number = 0.8): void {
  try {
    const ctx = getAudioContext();
    const freq = getFrequency(note);
    const now = ctx.currentTime;
    const v = Math.max(0, Math.min(1, velocity));

    // Master gain (controls overall volume)
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    // ADSR envelope — scaled by velocity
    const attack = 0.01;
    const decay = 0.15;
    const sustain = 0.4;
    const release = duration * 0.6;

    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.5 * v, now + attack);
    masterGain.gain.linearRampToValueAtTime(sustain * 0.5 * v, now + attack + decay);
    masterGain.gain.setValueAtTime(sustain * 0.5 * v, now + duration - release);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Primary oscillator — sine wave (fundamental)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);
    osc1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + duration);

    // Second oscillator — triangle wave (adds warmth, 2nd harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.3 * v, now);
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, now); // octave up
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now);
    osc2.stop(now + duration * 0.7);

    // Third oscillator — sine (3rd harmonic, adds brightness)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.1 * v, now);
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 3, now);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now);
    osc3.stop(now + duration * 0.4);

    // Low-pass filter — brighter when louder
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500 + 1500 * v, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + duration);
    // Reconnect through filter
    masterGain.disconnect();
    masterGain.connect(filter);
    filter.connect(ctx.destination);

  } catch (err) {
    // Silently fail — audio is enhancement, not critical
    console.warn("Audio playback failed:", err);
  }
}

/**
 * Play a short success chime (ascending 3-note arpeggio)
 */
export function playSuccessChime(): void {
  playNote("C4", 0.4);
  setTimeout(() => playNote("E4", 0.4), 120);
  setTimeout(() => playNote("G4", 0.6), 240);
}

/**
 * Play a short error sound (descending 2-note)
 */
export function playErrorSound(): void {
  playNote("E4", 0.3);
  setTimeout(() => playNote("C4", 0.4), 150);
}

/**
 * Play a big celebration fanfare
 */
export function playCelebration(): void {
  const notes = ["C4", "E4", "G4", "C5"];
  notes.forEach((note, i) => {
    setTimeout(() => playNote(note, 0.5), i * 130);
  });
}

/**
 * Play a drum/rhythm tap sound
 */
export function playDrumTap(type: "kick" | "snare" | "hihat" = "kick"): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === "kick") {
      // Kick drum: low sine sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "snare") {
      // Snare: noise burst
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
    } else {
      // Hi-hat: high-frequency noise
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 7000;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
    }
  } catch (err) {
    console.warn("Drum playback failed:", err);
  }
}

/**
 * Play a synthesised instrument note — each instrument has a clearly different timbre.
 * piano/drums delegate to existing helpers; guitar, flute, trumpet are custom.
 */
export function playInstrumentNote(instrument: string, note: string = "C4", duration: number = 0.8): void {
  try {
    if (instrument === "piano") { playNote(note, duration); return; }
    if (instrument === "drums") { playDrumTap("kick"); setTimeout(() => playDrumTap("hihat"), 150); return; }

    const ctx = getAudioContext();
    const freq = getFrequency(note);
    const now = ctx.currentTime;

    if (instrument === "guitar") {
      // Plucky triangle — fast attack, quick decay
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } else if (instrument === "flute") {
      // Airy sine + vibrato LFO
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      // Vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5, now);
      lfoGain.gain.setValueAtTime(4, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gain.gain.setValueAtTime(0.4, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } else if (instrument === "trumpet") {
      // Bold square + sawtooth layered, brighter filter
      const osc1 = ctx.createOscillator();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(freq, now);
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(freq, now);
      const mix = ctx.createGain();
      mix.gain.setValueAtTime(0.3, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gain.gain.setValueAtTime(0.35, now + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc1.connect(gain);
      osc2.connect(mix);
      mix.connect(gain);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(4000, now);
      gain.connect(filter);
      filter.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    }
  } catch (err) {
    console.warn("Instrument playback failed:", err);
  }
}

/**
 * React hook that returns a stable playNote function
 */
export function useAudio() {
  return {
    playNote,
    playSuccessChime,
    playErrorSound,
    playCelebration,
    playDrumTap,
    playInstrumentNote,
  };
}
