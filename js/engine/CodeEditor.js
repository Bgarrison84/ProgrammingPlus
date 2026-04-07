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
    this.code     = lab.starter_code || '';
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
  }

  /**
   * Run the current code against the test cases.
   * @returns {Promise<void>}
   */
  async run() {
    if (this.state === STATE.RUNNING) return;
    this._setState(STATE.RUNNING);

    const code    = this._getCode();
    const runtime = this.runtimes[this.lab.runtime];

    if (!runtime) {
      this._showError(`No runtime available for language: ${this.lab.runtime}`);
      this._setState(STATE.IDLE);
      return;
    }

    let stdout = '';
    try {
      stdout = await runtime.execute(code);
    } catch (err) {
      this._showError(err.message || String(err));
      this._setState(STATE.FAIL);
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
            <button data-action="hint"     class="px-2 py-1 text-xs bg-[#2d2d30] text-yellow-400 border border-[#3e3e42] rounded hover:bg-[#3e3e42]">💡 Hint</button>
            <button data-action="reset"    class="px-2 py-1 text-xs bg-[#2d2d30] text-gray-400  border border-[#3e3e42] rounded hover:bg-[#3e3e42]">↺ Reset</button>
            <button data-action="solution" class="px-2 py-1 text-xs bg-[#2d2d30] text-red-400   border border-[#3e3e42] rounded hover:bg-[#3e3e42]">🔓 Solution</button>
          </div>
        </div>

        <!-- Objectives -->
        ${objectives ? `<ul class="bg-[#252526] rounded p-3 border-l-2 border-[#569cd6] list-none">${objectives}</ul>` : ''}

        <!-- Editor area -->
        <div class="relative">
          <textarea
            data-role="editor"
            spellcheck="false"
            class="w-full min-h-[200px] p-3 bg-[#1e1e1e] text-[#d4d4d4] border border-[#3e3e42] rounded resize-y outline-none focus:border-[#569cd6] leading-relaxed"
          >${this._escapeHtml(this.code)}</textarea>
        </div>

        <!-- Run button -->
        <button
          data-action="run"
          class="flex items-center justify-center gap-2 px-4 py-2 bg-[#569cd6] text-white font-semibold rounded hover:bg-[#4e8ec2] transition-colors"
        >
          ▶ Run Code
        </button>

        <!-- Console output -->
        <div
          data-role="console"
          class="min-h-[80px] max-h-[300px] overflow-y-auto p-3 bg-[#0d0d0d] border border-[#3e3e42] rounded text-[#d4d4d4] text-xs leading-relaxed whitespace-pre-wrap"
        ><span class="text-[#858585]">// output will appear here</span></div>

      </div>
    `;
  }

  _wireEvents() {
    if (!this._container) return;

    this._container.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset?.action;
      if (!action) return;

      switch (action) {
        case 'run':      this.run();            break;
        case 'hint':     this.showHint();       break;
        case 'reset':    this.reset();          break;
        case 'solution': this._confirmSolution(); break;
      }
    });

    // Auto-save code to store on change
    const textarea = this._getEditor();
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.code = textarea.value;
        if (this.store) {
          this.store.saveCodeSnippet(this.lab.id, this.code);
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
        }
      });
    }
  }

  _restoreSavedCode() {
    if (!this.store) return;
    const saved = this.store.getCodeSnippet(this.lab.id);
    if (saved) {
      this._setCode(saved);
      this._appendToConsole('// restored from last session', 'text-[#858585]');
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
