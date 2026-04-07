/**
 * InventoryView.js — Items & Achievements
 */
import { bus } from '../core/EventBus.js';

export class InventoryView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
  }

  render() {
    const state = this.store.state;
    this.containerEl.innerHTML = `
      <div class="max-w-xl mx-auto p-6 space-y-6 pb-12">
        <h2 class="text-yellow-400 font-bold text-xl uppercase tracking-widest">Inventory & Badges</h2>

        <div class="bg-[#252526] border border-[#3e3e42] p-5 rounded-lg">
          <h3 class="text-xs text-gray-500 uppercase tracking-widest mb-4 border-b border-[#3e3e42] pb-2">Developer Badges (${state.badges?.length || 0})</h3>
          <div class="grid grid-cols-4 gap-4" id="badges-list">
            ${state.badges?.length > 0 
              ? state.badges.map(b => `<div class="text-center" title="${b.description}"><div class="text-3xl mb-1">${b.icon}</div><div class="text-[9px] text-gray-400 uppercase">${b.name}</div></div>`).join('')
              : '<p class="text-gray-600 text-xs italic col-span-4">Complete projects and tracks to earn badges.</p>'}
          </div>
        </div>

        <div class="bg-[#252526] border border-[#3e3e42] p-5 rounded-lg">
          <h3 class="text-xs text-gray-500 uppercase tracking-widest mb-4 border-b border-[#3e3e42] pb-2">Hardware & Tools (${state.inventory.length})</h3>
          <ul id="inventory-list" class="space-y-2">
            ${state.inventory.length > 0
              ? ''
              : '<li class="text-gray-600 text-xs italic">No tools collected yet.</li>'}
          </ul>
        </div>

        <div class="mt-8 pt-6 border-t border-[#3e3e42]">
          <h3 class="text-xs text-red-400 uppercase tracking-widest mb-3">System Recovery</h3>
          <button id="reset-btn" class="px-4 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900 text-red-400 rounded text-xs transition-colors">
            Wipe Memory (Reset Progress)
          </button>
        </div>
      </div>`;

    const ul = this.containerEl.querySelector('#inventory-list');
    if (ul && state.inventory.length > 0) {
      const rarityColors = { common: 'text-gray-400', uncommon: 'text-green-400', rare: 'text-blue-400', legendary: 'text-yellow-400' };
      state.inventory.forEach(item => {
        const li = document.createElement('li');
        li.className = `p-3 bg-[#1e1e1e] border border-[#3e3e42] rounded flex justify-between items-center ${rarityColors[item.rarity] || 'text-gray-300'}`;
        li.innerHTML = `
          <div>
            <div class="font-semibold text-sm">${item.name}</div>
            <div class="text-[10px] opacity-60">${item.description}</div>
          </div>
          <div class="text-[10px] uppercase font-bold px-1.5 py-0.5 border border-current rounded opacity-50">${item.rarity}</div>
        `;
        ul.appendChild(li);
      });
    }

    this.containerEl.querySelector('#reset-btn')?.addEventListener('click', () => {
      if (confirm('CRITICAL: This will permanently wipe all XP, level, and track data. Continue?')) {
        this.store.reset();
        window.location.reload();
      }
    });
  }
}
