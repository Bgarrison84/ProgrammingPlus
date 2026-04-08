/**
 * Router.js — View Management & Navigation
 */
import { bus } from '../core/EventBus.js';
import { StoryMode } from './StoryMode.js';
import { GitView } from './GitView.js';
import { CodeEditorView } from './CodeEditorView.js';
import { GrindView } from './GrindView.js';
import { StatsView } from './StatsView.js';
import { NotebookView } from './NotebookView.js';
import { InventoryView } from './InventoryView.js';
import { ProjectsView } from './ProjectsView.js';
import { AchievementsView } from './AchievementsView.js';

export class Router {
  constructor(content, store, appViewEl) {
    this.content    = content;
    this.store      = store;
    this.appViewEl  = appViewEl;
    this.currentView = null;
    this.views = {};

    this._init();
  }

  _init() {
    // Registry of view classes
    this.viewRegistry = {
      story:        StoryMode,
      git:          GitView,
      editor:       CodeEditorView,
      grind:        GrindView,
      stats:        StatsView,
      notebook:     NotebookView,
      inventory:    InventoryView,
      projects:     ProjectsView,
      achievements: AchievementsView,
    };

    bus.on('nav:switch', e => this.switchView(e.view, e));
    
    // Global exposure for legacy compatibility if needed
    window.switchView = (view) => this.switchView(view);
  }

  switchView(viewId, params = {}) {
    if (!this.viewRegistry[viewId]) {
      console.error(`View not found: ${viewId}`);
      this.appViewEl.innerHTML = `<div class="p-8 text-center py-20 bg-[#252526]/50 rounded-lg border border-[#3e3e42] border-dashed mx-6 mt-6">
        <div class="text-5xl mb-4 opacity-20">🏗️</div>
        <div class="text-gray-400 text-lg font-bold mb-2">View Under Construction</div>
        <p class="text-gray-600 text-sm max-w-sm mx-auto">The '${viewId}' module is currently being compiled. Check back soon for more features!</p>
        <button onclick="window.switchView('story')" class="mt-8 px-6 py-2 bg-[#3c3c3c] text-white rounded border border-[#3e3e42]">Return to Hub</button>
      </div>`;
      
      // Update nav UI anyway
      document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.classList.toggle('nav-active', btn.dataset.nav === viewId);
      });
      return;
    }

    // Clean up current view if needed
    if (this.currentViewInstance?.destroy) {
      this.currentViewInstance.destroy();
    }

    this.currentView = viewId;
    
    // Update nav UI
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.classList.toggle('nav-active', btn.dataset.nav === viewId);
    });

    // Instantiate or reuse view
    const ViewClass = this.viewRegistry[viewId];
    const instance = new ViewClass(this.content, this.store, this.appViewEl);
    
    if (params.domain || params.week) {
      if (instance.setPresets) instance.setPresets(params.domain, params.week);
    }

    this.currentViewInstance = instance;
    instance.render();

    // Scroll to top
    window.scrollTo(0, 0);
    
    console.log(`[Router] Switched to ${viewId}`);
  }
}
