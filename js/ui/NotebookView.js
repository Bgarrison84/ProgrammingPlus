/**
 * NotebookView.js — Mistake Notebook & Saved Code
 */
import { QuizEngine } from '../core/QuizEngine.js';
import { bus } from '../core/EventBus.js';

export class NotebookView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
  }

  render() {
    const questions = this.content.trackQuestions || [];
    const state = this.store.state;
    
    // Map question IDs to question objects
    const questionMap = {};
    questions.forEach(q => { questionMap[q.id] = q; });

    const mistakeIds = Object.keys(state.mistakeNotebook || {});
    const mistakeQs = mistakeIds
      .map(id => questionMap[id])
      .filter(Boolean);

    const codeSnippets = Object.entries(state.codeSnippets || {});

    this.containerEl.innerHTML = `
      <div class="max-w-4xl mx-auto p-6 space-y-6 pb-12">
        <div class="flex items-center justify-between">
          <h2 class="text-[#ce9178] font-bold text-xl uppercase tracking-widest">Mistake Notebook</h2>
          <div class="text-xs text-gray-500">${mistakeQs.length} tracked errors</div>
        </div>

        <!-- Saved Code Snippets -->
        <div class="bg-[#252526] border border-[#3e3e42] rounded-lg p-5">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#3e3e42] pb-2 mb-4">Saved Code</h3>
          ${codeSnippets.length > 0 ? `
            <div class="space-y-4">
              ${codeSnippets.map(([labId, code]) => `
                <div class="space-y-2">
                  <div class="text-xs text-blue-400 font-mono">${labId}</div>
                  <pre class="bg-[#0d0d0d] p-3 rounded border border-[#3e3e42] text-[11px] text-gray-300 overflow-x-auto"><code>${this._escapeHtml(code)}</code></pre>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-xs text-gray-600 italic">No code snippets saved yet. Complete labs in the Code Editor to see your work here.</p>
          `}
        </div>

        <!-- Recent Mistakes -->
        <div class="bg-[#252526] border border-[#3e3e42] rounded-lg p-5">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#3e3e42] pb-2 mb-4">Conceptual Gaps</h3>
          ${mistakeQs.length > 0 ? `
            <div class="space-y-3">
              ${mistakeQs.map(q => `
                <div class="p-3 bg-[#1e1e1e] border border-[#3e3e42] rounded text-xs">
                  <div class="text-gray-400 mb-1 font-semibold">${q.question}</div>
                  <div class="text-red-400/80 mb-2">Error count: ${state.mistakeNotebook[q.id]}</div>
                  <div class="text-green-400/60 p-2 bg-black/30 rounded">${q.explanation}</div>
                </div>
              `).join('')}
              <button id="clear-mistakes" class="mt-4 text-[10px] text-gray-600 hover:text-red-400 transition-colors">Clear mistake history</button>
            </div>
          ` : `
            <p class="text-xs text-gray-600 italic">Your notebook is empty. Mistakes made during The Grind appear here for review.</p>
          `}
        </div>
      </div>`;

    this.containerEl.querySelector('#clear-mistakes')?.addEventListener('click', () => {
      if (confirm('Permanently clear your mistake history?')) {
        this.store.clearNotebook();
        this.render();
      }
    });
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
