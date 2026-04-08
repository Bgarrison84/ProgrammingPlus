/**
 * AudioManager.js — Procedural Audio Engine
 * Uses Web Audio API to generate game sounds without external assets.
 */
import { bus } from './EventBus.js';

export class AudioManager {
  constructor(store) {
    this.store = store;
    this.ctx = null;
    this._initialized = false;

    // Listen for events to play sounds
    bus.on('xp:gained', () => this.play('xp'));
    bus.on('level:up',  () => this.play('levelup'));
    bus.on('ui:click',  () => this.play('click'));
    bus.on('ui:error',  () => this.play('error'));
    bus.on('lab:success', () => this.play('success'));
  }

  _init() {
    if (this._initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._initialized = true;
  }

  play(type) {
    if (!this.store.state.settings.sfxEnabled) return;
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (type) {
      case 'click':   this._beep(800, 0.05, 'sine', 0.1); break;
      case 'xp':      this._beep(1200, 0.1, 'sine', 0.1); break;
      case 'success': this._fanfare([440, 554, 659], 0.1); break;
      case 'levelup': this._fanfare([523, 659, 783, 1046], 0.15); break;
      case 'error':   this._beep(150, 0.3, 'sawtooth', 0.1); break;
    }
  }

  _beep(freq, duration, type, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _fanfare(freqs, step) {
    freqs.forEach((f, i) => {
      setTimeout(() => this._beep(f, 0.3, 'sine', 0.1), i * step * 1000);
    });
  }
}
