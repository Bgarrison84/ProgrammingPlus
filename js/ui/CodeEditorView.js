/**
 * CodeEditorView.js — Wrapper for the CodeEditor engine
 */
import { CodeEditor } from '../engine/CodeEditor.js';
import { bus } from '../core/EventBus.js';

// Runtimes will be loaded dynamically or passed in
// For now, we'll assume they are available globally or imported
import { JSRuntime } from '../runtimes/JSRuntime.js';
import { PythonRuntime } from '../runtimes/PythonRuntime.js';
import { LuaRuntime } from '../runtimes/LuaRuntime.js';

export class CodeEditorView {
  constructor(content, store, containerEl) {
    this.content = content;
    this.store = store;
    this.containerEl = containerEl;
    this.activeEditor = null;
    
    this.runtimes = {
      javascript: new JSRuntime(),
      python: new PythonRuntime(),
      lua: new LuaRuntime()
    };
  }

  render() {
    const state = this.store.state;
    const unit = state.currentWeek;
    const labs = (this.content.trackLabs || []).filter(l => l.unit === unit);

    if (labs.length === 0) {
      this.containerEl.innerHTML = `
        <div class="p-8 text-center">
          <div class="text-4xl mb-4">⌨️</div>
          <h2 class="text-xl font-bold text-gray-300">No Practical Labs Yet</h2>
          <p class="text-gray-500 mt-2">Finish the Story tasks for Unit ${unit} to unlock coding challenges.</p>
          <button id="back-to-story" class="mt-6 px-6 py-2 bg-[#007acc] text-white rounded">Back to Story</button>
        </div>`;
      this.containerEl.querySelector('#back-to-story').addEventListener('click', () => {
        bus.emit('nav:switch', { view: 'story' });
      });
      return;
    }

    this.containerEl.innerHTML = `
      <div class="p-4 max-w-5xl mx-auto h-full flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-blue-400 font-bold text-sm uppercase tracking-widest">Practical Labs</h2>
            <p class="text-gray-500 text-xs mt-0.5">Unit ${unit} Challenges for ${state.activeTrack.toUpperCase()}</p>
          </div>
          <div id="lab-selector-container">
            <select id="lab-select" class="bg-[#3c3c3c] text-white text-xs border border-[#3e3e42] rounded p-1.5 outline-none">
              ${labs.map(l => `<option value="${l.id}">${l.title}</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="editor-workspace" class="flex-1 min-h-0"></div>
      </div>`;

    const labSelect = this.containerEl.querySelector('#lab-select');
    labSelect.addEventListener('change', (e) => {
      this._loadLab(e.target.value);
    });

    // Load first lab by default
    if (labs.length > 0) {
      this._loadLab(labs[0].id);
    }
  }

  _loadLab(labId) {
    const lab = this.content.trackLabs.find(l => l.id === labId);
    if (!lab) return;

    const workspace = this.containerEl.querySelector('#editor-workspace');
    this.activeEditor = new CodeEditor(lab, this.runtimes, this.store);
    this.activeEditor.render(workspace);
  }
}
