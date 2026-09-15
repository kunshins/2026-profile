// Web Audio API Synthesizer for Ghibli Atmosphere
// Pure procedural synthesis: zero external audio files needed!

class GhibliSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.ambientGain = null;
    this.windOsc = null;
    this.windFilter = null;
    this.pentatonicScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]; // C Major pentatonic (nostalgic Ghibli vibe)
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.initWindAmbience();
  }

  toggleMute() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.35, now + 0.3);
    }
    if (!this.isMuted) {
      this.playChimeSequence();
    }
    return !this.isMuted;
  }

  initWindAmbience() {
    if (!this.ctx) return;
    try {
      // Procedural pink/brown noise for gentle wind
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        output[i] = (b0 + b1 + b2) * 0.12;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(this.windFilter);
      this.windFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);
      whiteNoise.start();

      // Subtle breeze modulation
      setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const targetFreq = 200 + Math.random() * 240;
        this.windFilter.frequency.linearRampToValueAtTime(targetFreq, now + 3);
      }, 4000);
    } catch (e) {
      console.warn("Audio ambient init failed:", e);
    }
  }

  // Play a gentle music-box bell chime
  playChime(freq = null, decay = 1.2) {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const chosenFreq = freq || this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(chosenFreq, now);

    // Add slight harmonic overtone for music box sparkle
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(chosenFreq * 2.01, now);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + (decay * 0.7));

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + decay);
    osc2.stop(now + decay);
  }

  // Melodic sequence on welcome / interaction
  playChimeSequence() {
    const notes = [
      this.pentatonicScale[1],
      this.pentatonicScale[3],
      this.pentatonicScale[4],
      this.pentatonicScale[6]
    ];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 1.4);
      }, idx * 160);
    });
  }

  // Paper airplane swoosh effect
  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.Q.value = 3.0;

    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.2);

    // Finish with high celebratory chime
    setTimeout(() => {
      this.playChime(783.99, 2.0); // High G chime
    }, 600);
  }
}

export const soundEngine = new GhibliSoundEngine();
