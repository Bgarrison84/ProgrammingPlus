/**
 * CodeEditor.js — In-browser code editor for Programming Plus
 *
 * Provides:
 *   - Syntax-highlighted textarea (CSS class tokeniser)
 *   - Run button with per-language runtime dispatch
 *   - Test runner (compare stdout vs expectedOutput)
 *   - Diff view for failing tests
 *   - Progressive hint system
 *   - Solution reveal (costs XP)
 *
 * Runtime dispatch is handled by separate runtime modules:
 *   - JSRuntime.js   (sandboxed eval with stdout capture)
 *   - PythonRuntime.js (Pyodide WASM — must be loaded separately)
 *   - LuaRuntime.js  (Lua.vm.js WASM — must be loaded separately)
 *
 * State Pattern:
 *   IDLE → RUNNING → PASS | FAIL → IDLE
 *   IDLE → HINT_1 → HINT_2 → HINT_3 → SOLUTION_LOCKED / SOLUTION_REVEALED
 */

import { bus } from '../core/EventBus.js';

// Editor states
const STATE = {
  IDLE:     'idle',
  RUNNING:  'running',
  PASS:     'pass',
  FAIL:     'fail',
  SOLUTION: 'solution',
};

export class CodeEditor {
  /**
   * @param {object} lab      — lab spec from content.json
   * @param {object} runtimes — { python: PythonRuntime, javascript: JSRuntime, lua: LuaRuntime }
   * @param {object} store    — GameState store (for XP deductions on solution reveal)
   */
  constructor(lab, runtimes, store) {
    this.lab      = lab;
    this.runtimes = runtimes;
    this.store    = store;
    this.state    = STATE.IDLE;
    this.hintIdx  = 0;
    
    // Multi-file support
    this.files = lab.files || {
      [lab.filename || 'main.js']: lab.starter_code || ''
    };
    this.activeFile = Object.keys(this.files)[0];
    
    this._container = null;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Render the editor into the given container element.
   * @param {HTMLElement} container
   */
  render(container) {
    this._container = container;
    container.innerHTML = this._buildHTML();
    this._wireEvents();
    this._restoreSavedCode();
    this._renderFileTabs();
  }

  _renderFileTabs() {
    const tabContainer = this._container.querySelector('#editor-tabs');
    if (!tabContainer) return;

    tabContainer.innerHTML = Object.keys(this.files).map(filename => `
      <button data-file="${filename}" class="px-3 py-1 text-[10px] border-r border-[#3e3e42] transition-colors ${
        filename === this.activeFile ? 'bg-[#1e1e1e] text-[#569cd6] border-t-2 border-t-[#569cd6]' : 'bg-[#2d2d30] text-gray-500 hover:text-gray-300'
      }">
        ${filename}
      </button>
    `).join('');
  }

  _switchFile(filename) {
    // Save current code to object
    this.files[this.activeFile] = this._getCode();
    
    this.activeFile = filename;
    this._setCode(this.files[filename]);
    this._renderFileTabs();
  }

  // ... (buildHTML needs update)

  /**
   * Run the current code against the test cases.
   * @returns {Promise<void>}
   */
  async run() {
    if (this.state === STATE.RUNNING) return;
    this._setState(STATE.RUNNING);

    const code    = this._getCode();
    let runtime = this.runtimes[this.lab.runtime];

    // Desktop Edition: Check if we should use native binaries instead of WASM
    if (this.store?.state.settings.useNative && window.electron) {
      const { NativeRuntime } = await import('../runtimes/NativeRuntime.js');
      runtime = new NativeRuntime(this.lab.runtime);
    }

    if (!runtime) {
      this._showError(`No runtime available for language: ${this.lab.runtime}`);
      this._setState(STATE.IDLE);
      return;
    }

    let stdout = '';
    try {
      stdout = await runtime.execute(code);
      if (!this.lab.test_cases?.length) {
        bus.emit('lab:success'); // Juice for general run
      }
    } catch (err) {
      this._showError(err.message || String(err));
      this._setState(STATE.FAIL);
      bus.emit('ui:error'); // Juice for error
      return;
    }

    // Run test cases if defined
    if (this.lab.test_cases?.length) {
      this._runTests(stdout);
    } else {
      // No test cases — just show output
      this._showOutput(stdout);
      this._setState(STATE.IDLE);
    }
  }

  /**
   * Show the next hint (up to 3). Third hint reveals the approach but not full solution.
   */
  showHint() {
    const hints = this.lab.hints || [];
    if (this.hintIdx >= hints.length) return;

    const hint = hints[this.hintIdx];
    this.hintIdx++;
    this._appendToConsole(`💡 Hint ${this.hintIdx}: ${hint}`, 'text-yellow-400');

    bus.emit('hint:shown', { labId: this.lab.id, hintNumber: this.hintIdx });
  }

  /**
   * Reveal the solution. Costs XP if the lab hasn't been passed yet.
   */
  revealSolution() {
    if (!this.lab.solution) return;

    const XP_COST = 50;
    if (this.state !== STATE.PASS && this.store) {
      this.store.deductXP(XP_COST);
      this._appendToConsole(`⚠️  Solution revealed — ${XP_COST} XP deducted.`, 'text-red-400');
    }

    this._setCode(this.lab.solution);
    this._setState(STATE.SOLUTION);
    bus.emit('solution:revealed', { labId: this.lab.id });
  }

  /**
   * Reset editor to starter code.
   */
  reset() {
    this._setCode(this.lab.starter_code || '');
    this.hintIdx = 0;
    this._clearConsole();
    this._setState(STATE.IDLE);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  _buildHTML() {
    const lang = this.lab.runtime || 'text';
    const title = this.lab.title || 'Code Lab';
    const difficulty = this.lab.difficulty || 'medium';
    const xp = this.lab.xp || 0;

    const difficultyColour = {
      easy:   'text-green-400',
      medium: 'text-yellow-400',
      hard:   'text-red-400',
    }[difficulty] ?? 'text-gray-400';

    const objectives = (this.lab.objectives || [])
      .map(o => `<li class="text-gray-300 text-sm">▸ ${o}</li>`)
      .join('');

    return `
      <div class="code-editor flex flex-col gap-3 p-4 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] font-mono text-sm">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[#d4d4d4] font-bold text-base">${title}</h2>
            <span class="text-[#858585] text-xs">${lang} · <span class="${difficultyColour}">${difficulty}</span> · ${xp} XP</span>
          </div>
          <div class="flex gap-2">
            ${window.electron ? `
              <button data-action="audit" class="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 border border-blue-800 rounded hover:bg-blue-900/50 transition-colors">🧹 Audit Code</button>
              <button data-action="ai" class="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 border border-purple-800 rounded hover:bg-purple-900/50 transition-colors">✨ Ask Sarah AI</button>
            ` : ''}
            <button data-action="hint"     class="px-2 py-1 text-xs bg-[#2d2d30] text-yellow-400 border border-[#3e3e42] rounded hover:bg-[#3e3e42]">💡 Hint</button>
            <button data-action="reset"    class="px-2 py-1 text-xs bg-[#2d2d30] text-gray-400  border border-[#3e3e42] rounded hover:bg-[#3e3e42]">↺ Reset</button>
            <button data-action="solution" class="px-2 py-1 text-xs bg-[#2d2d30] text-red-400   border border-[#3e3e42] rounded hover:bg-[#3e3e42]">🔓 Solution</button>
          </div>
        </div>

        <!-- Objectives -->
        ${objectives ? `<ul class="bg-[#252526] rounded p-3 border-l-2 border-[#569cd6] list-none">${objectives}</ul>` : ''}

        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Editor area -->
          <div class="flex-1 flex flex-col relative border border-[#3e3e42] rounded overflow-hidden min-w-0">
            <div id="editor-tabs" class="flex bg-[#2d2d30] border-b border-[#3e3e42] min-h-[28px]">
              <!-- Dynamic tabs -->
            </div>
            <textarea
              data-role="editor"
              spellcheck="false"
              class="w-full min-h-[300px] p-3 bg-[#1e1e1e] text-[#d4d4d4] border-none outline-none resize-none focus:ring-1 focus:ring-inset focus:ring-[#569cd6] leading-relaxed"
            >${this._escapeHtml(this.files[this.activeFile])}</textarea>
          </div>

          <!-- Visual Forge (Live Preview) -->
          ${lang === 'javascript' ? `
            <div class="flex-1 flex flex-col border border-[#3e3e42] rounded bg-[#0d0d0d] overflow-hidden min-w-0 min-h-[300px]">
              <div class="bg-[#2d2d30] border-b border-[#3e3e42] px-3 py-1 flex items-center justify-between">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">🖼️ Visual Forge</span>
                <span class="text-[10px] text-green-500 font-bold animate-pulse">● LIVE</span>
              </div>
              <div id="preview-container" class="flex-1 relative bg-white">
                <iframe id="live-preview" class="w-full h-full border-none bg-white"></iframe>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Run button -->
        <div class="flex gap-2">
          <button
            data-action="run"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#569cd6] text-white font-semibold rounded hover:bg-[#4e8ec2] transition-colors"
          >
            ▶ Run Code
          </button>
          ${this.lab.test_type === 'unit' ? `
            <button
              data-action="test"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#ce9178] text-white font-semibold rounded hover:bg-[#b57d65] transition-colors"
            >
              🧪 Run Tests
            </button>
          ` : ''}
        </div>

        <!-- Console output -->
        <div
          data-role="console"
          class="min-h-[80px] max-h-[200px] overflow-y-auto p-3 bg-[#0d0d0d] border border-[#3e3e42] rounded text-[#d4d4d4] text-xs leading-relaxed whitespace-pre-wrap"
        ><span class="text-[#858585]">// output will appear here</span></div>

      </div>
    `;
  }

  _wireEvents() {
    if (!this._container) return;

    // Listen for logs from preview iframe
    window.addEventListener('message', e => {
      if (e.data?.type === 'preview-log') {
        this._appendToConsole(`[Preview] ${e.data.payload}`, 'text-blue-300');
      }
    });

    this._container.addEventListener('click', e => {
      const tab = e.target.closest('[data-file]');
      if (tab) {
        this._switchFile(tab.dataset.file);
        return;
      }

      const action = e.target.closest('[data-action]')?.dataset?.action;
      if (!action) return;
switch (action) {
  case 'ai':       this._askAI();         break;
  case 'audit':    this._auditCode();     break;
  case 'run':      this.run();            break;
  case 'test':     this.runTests();       break;
  case 'hint':     this.showHint();       break;
  case 'reset':    this.reset();          break;
  case 'solution': this._confirmSolution(); break;
}
});

}

  async _auditCode() {
    this._clearConsole();
    this._appendToConsole('🧹 Auditing code quality...', 'text-blue-400');
    
    const { NativeRuntime } = await import('../runtimes/NativeRuntime.js');
    const runtime = new NativeRuntime(this.lab.runtime);

    try {
      const result = await runtime.lint(JSON.stringify(this.files));
      const findings = result.findings ? result.findings.trim() : '';
      
      // Calculate a grade based on weighted findings
      const lines = findings ? findings.split('\n').filter(l => l.trim()) : [];
      let score = 100;
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('error')) score -= 15;
        else if (line.toLowerCase().includes('warn')) score -= 5;
        else score -= 2; // general finding
      });

      score = Math.max(0, score);
      let grade = 'A';
      let color = 'text-green-400';

      if (score < 60) { grade = 'F'; color = 'text-red-500'; }
      else if (score < 70) { grade = 'D'; color = 'text-red-400'; }
      else if (score < 80) { grade = 'C'; color = 'text-yellow-500'; }
      else if (score < 90) { grade = 'B'; color = 'text-yellow-400'; }

      this._appendToConsole(`🏆 Code Quality Grade: ${grade} (${score}/100)`, `${color} font-bold text-lg`);
      
      if (findings) {
        this._appendToConsole('--- Findings ---', 'text-gray-500');
        this._appendToConsole(findings, 'text-gray-400');
      } else {
        this._appendToConsole('✨ No issues found! Your code is professional-grade.', 'text-green-400');
        if (score === 100) {
          // Award achievement if not already earned
          if (this.store) this.store.unlockAchievement('ach_clean_coder', 'The Pristine Developer');
        }
      }
    } catch (err) {
      this._showError(`Audit Failed: ${err.message}`);
    }
  }
async runTests() {
if (this.state === STATE.RUNNING) return;
this._setState(STATE.RUNNING);
this._clearConsole();
this._appendToConsole('🧪 Running unit tests...', 'text-[#ce9178]');

const code = JSON.stringify(this.files); // Pass all files
const { NativeRuntime } = await import('../runtimes/NativeRuntime.js');
const runtime = new NativeRuntime(this.lab.runtime);

try {
const result = await runtime.test(code);
this._setState(STATE.IDLE);

if (result.success) {
  this._appendToConsole('✅ Tests Passed!', 'text-green-400');
  this._appendToConsole(result.stdout, 'text-gray-400');
  bus.emit('lab:passed', { labId: this.lab.id, xp: this.lab.xp });
  bus.emit('lab:success');
} else {
  this._appendToConsole('❌ Tests Failed', 'text-red-400');
  this._appendToConsole(result.stderr || result.stdout, 'text-red-300');
  this._setState(STATE.FAIL);
  bus.emit('ui:error');
}
} catch (err) {
this._setState(STATE.IDLE);
this._showError(err.message);
bus.emit('ui:error');
}
}
async _askAI() {
this._appendToConsole('✨ Sarah AI is thinking...', 'text-purple-400');
const prompt = `You are Sarah, Lead Developer at Pixel Forge Studio. 
A junior developer is working on a ${this.lab.runtime} lab called "${this.lab.title}".
Lab Description: ${this.lab.description}
The current code is:
${this._getCode()}

Give a short, encouraging hint without revealing the full solution. Keep it under 3 sentences.`;

const result = await window.electron.askAI(prompt);
if (result.success) {
this._appendToConsole(`✨ Sarah AI: ${result.response}`, 'text-purple-300');
} else {
this._appendToConsole(`🔴 AI Error: ${result.error}`, 'text-red-400');
}
}
    // Auto-save code to store on change
    const textarea = this._getEditor();
    if (textarea) {
      let previewTimeout;
      textarea.addEventListener('input', () => {
        this.files[this.activeFile] = textarea.value;
        if (this.store) {
          this.store.saveCodeSnippet(this.lab.id, JSON.stringify(this.files));
        }

        // Live Preview Update (debounced)
        if (this.lab.runtime === 'javascript') {
          clearTimeout(previewTimeout);
          previewTimeout = setTimeout(() => this._updatePreview(), 500);
        }
      });

      // Tab key inserts spaces instead of moving focus
      textarea.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end   = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          
          // Trigger input event for live preview
          textarea.dispatchEvent(new Event('input'));
        }
      });
    }
  }

  _updatePreview() {
    const iframe = this._container?.querySelector('#live-preview');
    if (!iframe) return;

    // Build multi-file context if available
    let scriptContent = '';
    if (Object.keys(this.files).length > 1) {
      // Concatenate files (simple approach for preview)
      // In a real IDE we might use a bundler or local server
      scriptContent = Object.values(this.files).join('\n\n');
    } else {
      scriptContent = this._getCode();
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; overflow: hidden; background: white; font-family: sans-serif; }
            canvas { display: block; width: 100vw; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="app"></div>
          <script>
            try {
              // Redirect console.log to parent if needed
              const oldLog = console.log;
              console.log = (...args) => {
                window.parent.postMessage({ type: 'preview-log', payload: args.join(' ') }, '*');
                oldLog(...args);
              };
              
              ${scriptContent}
            } catch (err) {
              document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;"><b>Preview Error:</b><br>' + err.message + '</div>';
            }
          <\/script>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);
  }

  _restoreSavedCode() {
    if (!this.store) return;
    const saved = this.store.getCodeSnippet(this.lab.id);
    if (saved) {
      try {
        // Try parsing as multi-file JSON
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object') {
          this.files = parsed;
          this.activeFile = Object.keys(this.files)[0];
          this._setCode(this.files[this.activeFile]);
        } else {
          this._setCode(saved);
        }
      } catch (e) {
        // Fallback to plain string
        this._setCode(saved);
      }
      this._appendToConsole('// restored from last session', 'text-[#858585]');
      
      // Initial preview render
      if (this.lab.runtime === 'javascript') {
        setTimeout(() => this._updatePreview(), 100);
      }
    }
  }

  _runTests(actualOutput) {
    const cases  = this.lab.test_cases || [];
    const passed = [];
    const failed = [];

    // For single-output labs, compare trimmed full output
    if (cases.length === 1 && !cases[0].input) {
      const expected = cases[0].expected_output.trim();
      const actual   = actualOutput.trim();
      if (actual === expected) {
        passed.push({ expected, actual });
      } else {
        failed.push({ expected, actual });
      }
    } else {
      // Multi-case: each test case runs individually (runtime must support per-call)
      for (const tc of cases) {
        const expected = String(tc.expected_output).trim();
        const actual   = actualOutput.trim(); // simplified — per-call execution handled by runtime
        if (actual === expected) {
          passed.push({ expected, actual });
        } else {
          failed.push({ expected, actual });
        }
      }
    }

    if (failed.length === 0) {
      this._showPass(passed.length);
    } else {
      this._showFail(failed);
    }
  }

  _showPass(count) {
    this._clearConsole();
    this._appendToConsole(`✅ All ${count} test(s) passed!`, 'text-green-400');
    this._setState(STATE.PASS);
    bus.emit('lab:passed', { labId: this.lab.id, xp: this.lab.xp });
  }

  _showFail(failures) {
    this._clearConsole();
    this._appendToConsole(`❌ ${failures.length} test(s) failed:`, 'text-red-400');
    for (const f of failures) {
      this._appendToConsole(`  Expected: ${f.expected}`, 'text-yellow-400');
      this._appendToConsole(`  Actual:   ${f.actual}`,   'text-red-300');
    }
    this._setState(STATE.FAIL);
  }

  _showOutput(text) {
    this._clearConsole();
    this._appendToConsole(text || '(no output)', 'text-[#d4d4d4]');
  }

  _showError(message) {
    this._clearConsole();
    this._appendToConsole(`🔴 Error: ${message}`, 'text-red-400');
  }

  _confirmSolution() {
    if (this.state === STATE.PASS) {
      this.revealSolution();
      return;
    }
    const confirmed = window.confirm('Reveal solution? This will cost 50 XP.');
    if (confirmed) this.revealSolution();
  }

  _setState(newState) {
    this.state = newState;
    const runBtn = this._container?.querySelector('[data-action="run"]');
    if (!runBtn) return;

    if (newState === STATE.RUNNING) {
      runBtn.textContent = '⏳ Running...';
      runBtn.disabled = true;
    } else {
      runBtn.textContent = '▶ Run Code';
      runBtn.disabled = false;
    }

    if (newState === STATE.PASS) {
      runBtn.classList.replace('bg-[#569cd6]', 'bg-[#4ec9b0]');
    } else {
      runBtn.classList.replace('bg-[#4ec9b0]', 'bg-[#569cd6]');
    }
  }

  _getEditor()  { return this._container?.querySelector('[data-role="editor"]'); }
  _getConsole() { return this._container?.querySelector('[data-role="console"]'); }
  _getCode()    { return this._getEditor()?.value ?? this.code; }

  _setCode(code) {
    this.code = code;
    const textarea = this._getEditor();
    if (textarea) textarea.value = code;
  }

  _clearConsole() {
    const c = this._getConsole();
    if (c) c.innerHTML = '';
  }

  _appendToConsole(text, colourClass = 'text-[#d4d4d4]') {
    const c = this._getConsole();
    if (!c) return;
    const line = document.createElement('div');
    line.className = colourClass;
    line.textContent = text;
    c.appendChild(line);
    c.scrollTop = c.scrollHeight;
  }

  _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
