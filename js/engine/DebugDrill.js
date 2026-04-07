/**
 * DebugDrill.js — Rapid-fire "spot the bug" drill for Programming Plus
 *
 * Replaces Subnetting.js from CCNA Mastery.
 *
 * Mechanic:
 *   - 10 broken code snippets shown one at a time
 *   - Learner chooses the correct fix from 4 options
 *   - 5-minute timer (configurable)
 *   - Score: (correct / total) × 100 + speed bonus
 *
 * Content source: content.json → debug_drills[]
 * Filtered by active track (language).
 */

import { bus } from '../core/EventBus.js';

const DRILL_SIZE    = 10;
const TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
const XP_PER_CORRECT = 15;
const SPEED_BONUS_XP = 50; // awarded for >80% correct in <3 minutes

export class DebugDrill {
  /**
   * @param {object[]} allDrills — debug_drills[] from content.json
   * @param {string}   track     — e.g. 'python', 'javascript'
   * @param {object}   store     — GameState store
   */
  constructor(allDrills, track, store) {
    this.allDrills = allDrills;
    this.track     = track;
    this.store     = store;

    this._queue    = [];
    this._current  = null;
    this._idx      = 0;
    this._correct  = 0;
    this._startMs  = null;
    this._timerRef = null;
    this._container = null;
    this._active   = false;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  render(container) {
    this._container = container;
    this._buildQueue();
    this._render_ready();
  }

  start() {
    if (this._queue.length === 0) {
      this._render_empty();
      return;
    }
    this._idx     = 0;
    this._correct = 0;
    this._active  = true;
    this._startMs = Date.now();
    this._startTimer();
    this._showQuestion();
  }

  stop() {
    this._active = false;
    this._stopTimer();
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  _buildQueue() {
    const pool = this.allDrills.filter(d => d.track === this.track || !d.track);
    // Shuffle and take DRILL_SIZE
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this._queue = shuffled.slice(0, DRILL_SIZE);
  }

  _showQuestion() {
    if (this._idx >= this._queue.length) {
      this._finish();
      return;
    }
    this._current = this._queue[this._idx];
    this._render_question(this._current);
  }

  _handleAnswer(chosenIndex) {
    if (!this._active) return;

    const isCorrect = chosenIndex === this._current.correct_fix_index;
    if (isCorrect) this._correct++;

    const elapsed = Date.now() - this._startMs;
    bus.emit('debug:answered', {
      drillId:   this._current.id,
      correct:   isCorrect,
      timeMs:    elapsed,
      track:     this.track,
    });

    this._render_feedback(isCorrect, this._current.explanation);

    // Record in store
    if (this.store) {
      this.store.recordDebugResult({
        drillId:   this._current.id,
        track:     this.track,
        correct:   isCorrect,
        timeMs:    elapsed,
        timestamp: Date.now(),
      });
    }

    // Auto-advance after 1.5s
    setTimeout(() => {
      this._idx++;
      this._showQuestion();
    }, 1500);
  }

  _finish() {
    this._active = false;
    this._stopTimer();

    const totalMs    = Date.now() - this._startMs;
    const accuracy   = Math.round((this._correct / this._queue.length) * 100);
    const xpEarned   = this._correct * XP_PER_CORRECT;
    const speedBonus = (accuracy >= 80 && totalMs < 3 * 60 * 1000) ? SPEED_BONUS_XP : 0;
    const totalXP    = xpEarned + speedBonus;

    if (this.store) {
      this.store.addXP(totalXP);
    }

    bus.emit('debug:complete', {
      track:      this.track,
      correct:    this._correct,
      total:      this._queue.length,
      accuracy,
      totalMs,
      xpEarned:   totalXP,
      speedBonus: speedBonus > 0,
    });

    this._render_results(accuracy, totalXP, speedBonus > 0, totalMs);
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  _render_ready() {
    if (!this._container) return;
    const count = this._queue.length;
    this._container.innerHTML = `
      <div class="debug-drill flex flex-col items-center gap-6 p-6 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] font-mono">
        <h2 class="text-[#d4d4d4] text-xl font-bold">🐛 Debug It — ${this._trackLabel()} Track</h2>
        <p class="text-[#858585] text-sm text-center max-w-md">
          ${count} broken code snippets. Find the bug and choose the correct fix.<br>
          You have <span class="text-yellow-400">5 minutes</span>.
          Speed bonus if you hit 80%+ accuracy in under 3 minutes.
        </p>
        <div class="flex gap-4 text-sm text-[#858585]">
          <span>📋 ${count} questions</span>
          <span>⏱ 5:00</span>
          <span>⚡ ${count * XP_PER_CORRECT} XP + ${SPEED_BONUS_XP} speed bonus</span>
        </div>
        <button data-action="start"
          class="px-6 py-2 bg-[#569cd6] text-white font-semibold rounded hover:bg-[#4e8ec2] transition-colors">
          Start Drill
        </button>
      </div>
    `;
    this._container.querySelector('[data-action="start"]')
      ?.addEventListener('click', () => this.start());
  }

  _render_question(drill) {
    if (!this._container) return;
    const remaining = Math.max(0, TIME_LIMIT_MS - (Date.now() - this._startMs));
    const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

    const optionsHtml = drill.options.map((opt, i) => `
      <button data-idx="${i}"
        class="w-full text-left px-3 py-2 bg-[#252526] border border-[#3e3e42] rounded text-[#d4d4d4] text-sm hover:border-[#569cd6] hover:bg-[#2d2d30] transition-colors font-mono">
        <span class="text-[#569cd6] mr-2">${String.fromCharCode(65 + i)}.</span>${this._escapeHtml(opt)}
      </button>
    `).join('');

    this._container.innerHTML = `
      <div class="debug-drill flex flex-col gap-4 p-6 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] font-mono">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <span class="text-[#858585] text-sm">Question ${this._idx + 1} / ${this._queue.length}</span>
          <span class="text-yellow-400 font-bold tabular-nums" data-role="timer">${mm}:${ss}</span>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-[#252526] rounded-full h-1.5">
          <div class="bg-[#569cd6] h-1.5 rounded-full transition-all"
            style="width: ${((this._idx / this._queue.length) * 100).toFixed(1)}%"></div>
        </div>

        <!-- Bug description -->
        <p class="text-red-400 text-xs">🐛 ${this._escapeHtml(drill.bug_description)}</p>

        <!-- Broken code -->
        <pre class="p-3 bg-[#0d0d0d] border border-red-900 rounded text-red-300 text-sm overflow-x-auto whitespace-pre-wrap">${this._escapeHtml(drill.broken_code)}</pre>

        <!-- Options -->
        <p class="text-[#858585] text-xs">Choose the correct fix:</p>
        <div class="flex flex-col gap-2" data-role="options">
          ${optionsHtml}
        </div>
      </div>
    `;

    // Wire option buttons
    this._container.querySelectorAll('[data-role="options"] [data-idx]')
      .forEach(btn => {
        btn.addEventListener('click', () => {
          this._handleAnswer(parseInt(btn.dataset.idx, 10));
        });
      });
  }

  _render_feedback(isCorrect, explanation) {
    const optionsEl = this._container?.querySelector('[data-role="options"]');
    if (!optionsEl) return;

    // Disable all buttons
    optionsEl.querySelectorAll('button').forEach((btn, i) => {
      btn.disabled = true;
      if (i === this._current.correct_fix_index) {
        btn.classList.add('border-green-500', 'bg-[#1a3a1a]');
      }
    });

    // Show feedback banner
    const banner = document.createElement('div');
    banner.className = `mt-2 p-3 rounded text-sm ${isCorrect ? 'bg-[#1a3a1a] text-green-400' : 'bg-[#3a1a1a] text-red-400'}`;
    banner.textContent = isCorrect
      ? `✅ Correct! ${explanation}`
      : `❌ Wrong. ${explanation}`;
    optionsEl.after(banner);
  }

  _render_results(accuracy, xpEarned, speedBonus, totalMs) {
    if (!this._container) return;
    const mm = String(Math.floor(totalMs / 60000)).padStart(2, '0');
    const ss = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, '0');
    const grade = accuracy >= 90 ? '🏆 Expert' : accuracy >= 70 ? '✅ Solid' : accuracy >= 50 ? '📈 Improving' : '📚 Keep Practising';

    this._container.innerHTML = `
      <div class="debug-drill flex flex-col items-center gap-4 p-6 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] font-mono text-center">
        <h2 class="text-[#d4d4d4] text-xl font-bold">Drill Complete!</h2>
        <div class="text-4xl font-black ${accuracy >= 70 ? 'text-green-400' : 'text-red-400'}">${accuracy}%</div>
        <p class="text-[#858585]">${this._correct} / ${this._queue.length} correct · ${mm}:${ss}</p>
        <p class="text-lg">${grade}</p>
        ${speedBonus ? `<p class="text-yellow-400 text-sm">⚡ Speed Bonus: +${SPEED_BONUS_XP} XP</p>` : ''}
        <p class="text-[#4ec9b0] font-bold">+${xpEarned} XP earned</p>
        <button data-action="retry"
          class="mt-2 px-6 py-2 bg-[#569cd6] text-white font-semibold rounded hover:bg-[#4e8ec2] transition-colors">
          Try Again
        </button>
      </div>
    `;
    this._container.querySelector('[data-action="retry"]')
      ?.addEventListener('click', () => {
        this._buildQueue();
        this._render_ready();
      });
  }

  _render_empty() {
    if (!this._container) return;
    this._container.innerHTML = `
      <div class="p-6 text-center text-[#858585] font-mono">
        No debug drills available for the <strong class="text-[#d4d4d4]">${this._trackLabel()}</strong> track yet.
        Check back after more content is added!
      </div>
    `;
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────

  _startTimer() {
    this._timerRef = setInterval(() => {
      if (!this._active) { this._stopTimer(); return; }
      const remaining = TIME_LIMIT_MS - (Date.now() - this._startMs);
      if (remaining <= 0) {
        this._stopTimer();
        this._finish();
        return;
      }
      const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
      const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
      const el = this._container?.querySelector('[data-role="timer"]');
      if (el) {
        el.textContent = `${mm}:${ss}`;
        el.className = remaining < 60000
          ? 'text-red-400 font-bold tabular-nums animate-pulse'
          : 'text-yellow-400 font-bold tabular-nums';
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timerRef) {
      clearInterval(this._timerRef);
      this._timerRef = null;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _trackLabel() {
    const labels = {
      python: 'Python', javascript: 'JavaScript', lua: 'Lua',
      csharp: 'C#', cpp: 'C++', go: 'Go', rust: 'Rust',
    };
    return labels[this.track] ?? this.track;
  }

  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
