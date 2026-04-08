/**
 * main.js — Application Entry Point & Orchestrator
 * Bootstraps the Store, HUD, Router, and Game Juice (Audio/FX).
 */

import { Store }        from './core/Store.js';
import { HUD }          from './ui/HUD.js';
import { Router }       from './ui/Router.js';
import { bus }          from './core/EventBus.js';
import { AudioManager } from './core/AudioManager.js';
import { FXManager }    from './ui/FXManager.js';

const store   = new Store();
let router    = null;
let content   = null;
let audio     = null;
let fx        = null;

// Award XP from custom events
document.addEventListener('prog-xp', e => {
  if (e.detail?.amount) {
    store.addXP(e.detail.amount, e.detail.reason || 'interaction');
  }
});

async function init() {
  try {
    await store.ready;

    // Initialize Game Juice
    audio = new AudioManager(store);
    fx    = new FXManager();

    // Load content
    const metaRes = await fetch('./data/content.json');
    if (!metaRes.ok) throw new Error('Failed to load content.json');
    const meta = await metaRes.json();

    content = {
      meta: meta._meta,
      storyBeats: meta.story || [],
      questions: meta.questions || [],
      labs: meta.labs || [],
      projects: meta.projects || [],
    };

    // Filter content based on active track
    updateContentForTrack(store.state.activeTrack || 'python');

    new HUD(store, {
      levelBadge:      document.getElementById('hud-level'),
      xpBar:           document.getElementById('hud-xp-bar'),
      xpText:          document.getElementById('hud-xp-text'),
      playerName:      document.getElementById('hud-player-name'),
      hintCount:       document.getElementById('hud-hints'),
      inventoryList:   document.getElementById('inventory-list'),
      toastContainer:  document.getElementById('toast-container'),
      weekBadge:       document.getElementById('hud-week'),
    });

    router = new Router(content, store, document.getElementById('app-view'));
    
    // Auto-route based on git track completion
    if (!store.state.languageXP || !store.state.languageXP.git || store.state.languageXP.git === 0) {
      if (store.state.activeTrack !== 'git') {
        store.switchTrack('git');
        updateContentForTrack('git');
      }
      router.switchView('story');
    } else {
      router.switchView('story');
    }

    // Global event: play click sound on nav buttons and general buttons
    document.addEventListener('click', e => {
      if (e.target.closest('[data-nav]') || e.target.closest('button')) {
        bus.emit('ui:click');
      }
    });

  } catch (err) {
    console.error('[init] Critical failure:', err);
    document.body.innerHTML = `
      <div class="h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-red-400 font-mono p-5 text-center">
        <h1 class="text-2xl mb-2">⚠️ Boot Error</h1>
        <p class="text-gray-500 max-w-md leading-relaxed">Failed to load critical application data.</p>
        <pre class="mt-4 text-xs text-gray-600 bg-black p-3 rounded text-left">${err.stack || err}</pre>
        <button onclick="location.reload()" class="mt-5 px-4 py-2 bg-[#2d2d30] border border-[#3e3e42] text-white rounded hover:bg-[#3e3e42]">Retry</button>
      </div>`;
  }
}

function updateContentForTrack(trackId) {
  if (!content) return;
  
  // Create track-specific filtered lists
  content.trackStory = content.storyBeats.filter(b => b.track === trackId);
  content.trackQuestions = content.questions.filter(q => q.track === trackId);
  content.trackLabs = content.labs.filter(l => l.track === trackId);
  content.trackProjects = content.projects.filter(p => p.track === trackId);
  
  if (router) {
    // If the router is active, we might need to refresh the current view
    if (router.currentViewInstance && router.currentViewInstance.render) {
      router.currentViewInstance.render();
    }
  }
}

window.switchTrack = (trackId) => {
  store.switchTrack(trackId);
  updateContentForTrack(trackId);
};

document.addEventListener('DOMContentLoaded', init);
