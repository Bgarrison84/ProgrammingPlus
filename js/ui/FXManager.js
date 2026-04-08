/**
 * FXManager.js — Visual Effects Engine
 * Handles floating text, particles, and UI shakes.
 */
import { bus } from '../core/EventBus.js';

export class FXManager {
  constructor() {
    bus.on('xp:gained', (e) => this.spawnFloatingText(`+${e.amount} XP`, 'text-green-400'));
    bus.on('level:up',  (e) => this.spawnFloatingText(`LEVEL UP!`, 'text-yellow-400 font-bold text-xl'));
    bus.on('ui:error',  () => this.shakeElement(document.body));
  }

  /**
   * Spawns floating text at the mouse position or center screen.
   */
  spawnFloatingText(text, classes) {
    const el = document.createElement('div');
    el.className = `fixed pointer-events-none z-[9999] animate-float-up ${classes}`;
    el.textContent = text;
    
    // Default to center if no mouse event context
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  /**
   * Shakes an element (e.g., on error).
   */
  shakeElement(el) {
    el.classList.add('animate-shake');
    el.addEventListener('animationend', () => el.classList.remove('animate-shake'), { once: true });
  }
}
