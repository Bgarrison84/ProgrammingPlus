/**
 * AchievementsView.js — Hall of Fame
 * Displays earned badges and locked achievements.
 */
import { bus } from '../core/EventBus.js';

export class AchievementsView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
    this.achievements = content.meta?.achievements || content.achievements || [];
  }

  render() {
    const unlocked = this.store.state.achievements || [];
    
    this.containerEl.innerHTML = `
      <div class="p-6 space-y-6 max-w-5xl mx-auto pb-12">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-yellow-500 font-bold text-xl uppercase tracking-widest">Achievement Hall</h2>
            <p class="text-gray-500 text-xs mt-1">Your legacy at Pixel Forge Studio.</p>
          </div>
          <div class="text-right text-xs text-gray-600 font-mono">
            ${unlocked.length} / ${this.achievements.length} UNLOCKED
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.achievements.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            const rarityClasses = {
              common:    'border-gray-700 bg-gray-900/20 text-gray-400',
              rare:      'border-blue-900/50 bg-blue-950/10 text-blue-400',
              epic:      'border-purple-900/50 bg-purple-950/10 text-purple-400',
              legendary: 'border-orange-900/50 bg-orange-950/10 text-orange-400',
              mythic:    'border-cyan-900/50 bg-cyan-950/10 text-cyan-400 animate-pulse'
            }[ach.rarity] || 'border-gray-800';

            return `
              <div class="achievement-card rounded-lg border p-4 flex items-center gap-4 transition-all ${
                isUnlocked ? `${rarityClasses}` : 'border-[#3e3e42] bg-black/20 grayscale opacity-40'
              }">
                <div class="text-4xl">${ach.icon}</div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold truncate">${ach.title}</div>
                  <div class="text-[10px] opacity-70 leading-tight mt-1">${ach.description}</div>
                  <div class="text-[9px] uppercase font-bold tracking-tighter mt-2">${ach.rarity}</div>
                </div>
                ${isUnlocked ? '<div class="text-green-500 text-xs">✓</div>' : '🔒'}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }
}
