/**
 * GrindView.js — Quiz Mode View
 */
import { QuizEngine } from '../core/QuizEngine.js';
import { bus } from '../core/EventBus.js';

export class GrindView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
    this.quiz        = null;
    
    this._confidenceMode  = false;
    this._smartDifficulty = false;
    this._adaptiveInfo    = null;
    this._sessionStartTime = 0;
    
    // Presets from other views (e.g. Stats)
    this.presetDomain = null;
    this.presetWeek   = null;
  }

  setPresets(domain, week) {
    this.presetDomain = domain;
    this.presetWeek   = week;
  }

  render() {
    const presetDomain = this.presetDomain;
    const presetWeek   = this.presetWeek;
    this.presetDomain = null; 
    this.presetWeek   = null;

    const questions = this.content.trackQuestions || [];
    const allQIds = questions.filter(q => q.type !== 'cli_lab').map(q => q.id);
    const srs     = this.store.getSRSStats(allQIds);
    const srsTotal = srs.due + srs.new;
    const meta = this.content.meta || {};
    const UNIT_LABELS = meta.unit_labels || {};

    this.containerEl.innerHTML = `
      <div class="max-w-3xl mx-auto p-6 space-y-4 pb-12">
        <div class="flex items-center justify-between">
          <h2 class="text-blue-400 font-bold text-xl uppercase tracking-widest">The Grind</h2>
          <div class="flex gap-2 text-xs">
            <select id="quiz-domain" class="bg-[#2d2d30] border border-[#3e3e42] text-gray-300 rounded px-2 py-1 outline-none">
              <option value="all">All Units</option>
              ${QuizEngine.domainsFrom(questions).map(d => `<option value="${d}" ${d === presetDomain ? 'selected' : ''}>Unit: ${d}</option>`).join('')}
            </select>
            <select id="quiz-week" class="bg-[#2d2d30] border border-[#3e3e42] text-gray-300 rounded px-2 py-1 outline-none">
              <option value="all">Any Level</option>
              ${[1,2,3,4,5,6].map(w => `<option value="${w}" ${String(w) === String(presetWeek) ? 'selected' : ''}>Week ${w}</option>`).join('')}
            </select>
            <select id="quiz-difficulty" class="bg-[#2d2d30] border border-[#3e3e42] text-gray-300 rounded px-2 py-1 outline-none">
              <option value="all">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <label class="flex items-center gap-1 cursor-pointer select-none border border-[#3e3e42] rounded px-2 py-1" title="Spaced Repetition: serves due questions first">
              <input type="checkbox" id="quiz-srs" checked class="accent-[#569cd6]">
              <span class="text-gray-300">SRS</span>
            </label>
            <button id="start-quiz" class="px-4 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-semibold transition-colors">Start</button>
          </div>
        </div>

        <div class="flex gap-3 text-[11px] font-mono bg-[#0d0d0d] border border-[#3e3e42] rounded px-4 py-2">
          <span class="text-cyan-400">&#9632; New <strong>${srs.new}</strong></span>
          <span class="text-yellow-400">&#9632; Due <strong>${srs.due}</strong></span>
          <span class="text-blue-400">&#9632; Learning <strong>${srs.learning}</strong></span>
          <span class="text-green-500">&#9632; Mastered <strong>${srs.mastered}</strong></span>
          <span class="ml-auto text-gray-600">${allQIds.length} total questions</span>
        </div>

        <div id="quiz-area" class="hidden"></div>
        <div id="quiz-prompt" class="text-center py-16 bg-[#252526]/50 rounded-lg border border-[#3e3e42] border-dashed">
          ${srsTotal > 0
            ? `<p class="text-yellow-400 font-semibold">${srs.due} due · ${srs.new} new</p>
               <p class="text-gray-500 text-sm mt-1">SRS mode will serve these first.</p>`
            : `<p class="text-green-400 font-semibold">Ready for review?</p>
               <p class="text-gray-500 text-sm mt-1">Select your filters and press Start to begin.</p>`}
        </div>
      </div>`;

    this.containerEl.querySelector('#start-quiz')?.addEventListener('click', () => this.startQuiz());

    if (presetDomain || presetWeek) setTimeout(() => this.startQuiz(), 0);
  }

  startQuiz() {
    const questions = this.content.trackQuestions || [];
    const domain = this.containerEl.querySelector('#quiz-domain').value;
    const week   = this.containerEl.querySelector('#quiz-week').value;
    const diff   = this.containerEl.querySelector('#quiz-difficulty').value;
    const srs    = this.containerEl.querySelector('#quiz-srs').checked;

    this.quiz = new QuizEngine(questions, this.store, {
      domain: domain !== 'all' ? domain : null,
      week:   week   !== 'all' ? parseInt(week) : null,
      difficulty: diff !== 'all' ? diff : null,
      srs: srs,
      limit: 10
    });

    this.quiz.start();
    this.containerEl.querySelector('#quiz-prompt').classList.add('hidden');
    const area = this.containerEl.querySelector('#quiz-area');
    area.classList.remove('hidden');
    this._renderQuestion();
  }

  _renderQuestion() {
    const q = this.quiz.currentQuestion;
    if (!q) {
      this._renderSummary();
      return;
    }

    const area = this.containerEl.querySelector('#quiz-area');
    area.innerHTML = `
      <div class="bg-[#252526] border border-[#3e3e42] rounded-lg p-6 space-y-4 shadow-xl">
        <div class="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#3e3e42] pb-2">
          <span>${q.domain} · ${q.difficulty}</span>
          <span>Question ${this.quiz.progress.current} / ${this.quiz.progress.total}</span>
        </div>
        
        <p class="text-lg text-gray-200 leading-relaxed">${q.question}</p>
        
        <div class="grid grid-cols-1 gap-2">
          ${q.options.map((opt, i) => `
            <button data-idx="${i}" class="quiz-opt text-left px-4 py-3 bg-[#1e1e1e] hover:bg-[#2d2d30] border border-[#3e3e42] rounded text-sm text-gray-300 transition-all">
              <span class="text-gray-600 font-mono mr-3">${String.fromCharCode(65+i)}</span> ${opt}
            </button>
          `).join('')}
        </div>
        
        <div id="quiz-feedback" class="hidden text-sm p-4 rounded-lg border"></div>
      </div>`;

    area.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => this._handleAnswer(parseInt(btn.dataset.idx), btn));
    });
  }

  _handleAnswer(idx, btn) {
    const result = this.quiz.answer(idx);
    const feedback = this.containerEl.querySelector('#quiz-feedback');
    const opts = this.containerEl.querySelectorAll('.quiz-opt');
    
    opts.forEach(b => b.disabled = true);
    
    feedback.classList.remove('hidden');
    if (result.correct) {
      btn.classList.add('border-green-600', 'bg-green-900/10', 'text-green-400');
      feedback.className = "text-sm p-4 rounded-lg border border-green-900 bg-green-900/20 text-green-400 mt-4";
      feedback.innerHTML = `<div class="font-bold mb-1">✓ Correct (+${result.xpGained} XP)</div>${result.explanation}`;
    } else {
      btn.classList.add('border-red-700', 'bg-red-900/10', 'text-red-400');
      opts[this.quiz.currentQuestion.correct_answer].classList.add('border-green-600', 'text-green-400');
      feedback.className = "text-sm p-4 rounded-lg border border-red-900 bg-red-900/20 text-red-400 mt-4";
      feedback.innerHTML = `<div class="font-bold mb-1">❌ Incorrect</div>${result.explanation}`;
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = "mt-4 w-full py-2 bg-[#007acc] text-white rounded font-bold hover:bg-[#0062a3] transition-colors";
    nextBtn.textContent = "Next Question →";
    nextBtn.onclick = () => {
      this.quiz.next();
      this._renderQuestion();
    };
    feedback.appendChild(nextBtn);
  }

  _renderSummary() {
    const results = this.quiz.results;
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const xp = results.reduce((sum, r) => sum + r.xpGained, 0);

    const area = this.containerEl.querySelector('#quiz-area');
    area.innerHTML = `
      <div class="bg-[#252526] border border-[#3e3e42] rounded-lg p-8 text-center space-y-6 shadow-xl">
        <div class="text-5xl mb-2">🏁</div>
        <h2 class="text-2xl font-bold text-white uppercase tracking-wider">Session Complete</h2>
        
        <div class="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div class="bg-[#1e1e1e] p-3 rounded border border-[#3e3e42]">
            <div class="text-xs text-gray-500 uppercase">Score</div>
            <div class="text-xl font-bold text-[#569cd6]">${Math.round(correct/total*100)}%</div>
          </div>
          <div class="bg-[#1e1e1e] p-3 rounded border border-[#3e3e42]">
            <div class="text-xs text-gray-500 uppercase">XP Gained</div>
            <div class="text-xl font-bold text-green-400">+${xp}</div>
          </div>
        </div>

        <button id="finish-quiz" class="w-full max-w-xs py-3 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg font-bold shadow-lg transition-colors">
          Return to Hub
        </button>
      </div>`;

    area.querySelector('#finish-quiz').onclick = () => {
      bus.emit('nav:switch', { view: 'story' });
    };
  }
}
