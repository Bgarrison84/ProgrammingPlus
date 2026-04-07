/**
 * StoryMode.js — 6-Unit Narrative Engine & Studio Home
 */
import { bus } from '../core/EventBus.js';

export class StoryMode {
  constructor(content, store, containerEl) {
    this.content     = content;
    // content.trackStory is populated by main.js
    this.store       = store;
    this.containerEl = containerEl;
    this._typingTimer = null;
  }

  get beats() {
    return this.content.trackStory || [];
  }

  /** Main entry point for rendering the Story/Home view. */
  render() {
    this.containerEl.innerHTML = `
      <div class="max-w-3xl mx-auto pb-12">
        <div id="unit-timeline" class="px-6 pt-5 pb-1"></div>
        <div id="mission-card" class="px-6 pb-1"></div>
        <div id="story-container" class="p-6"></div>
      </div>`;
    
    this._renderUnitTimeline();
    this._renderMissionCard();
    
    // The actual story beat container
    this.storyContainer = this.containerEl.querySelector('#story-container');
    this.showCurrentBeat();
  }

  // ─── Timeline & Dashboard Cards ────────────────────────────────────────────

  _renderUnitTimeline() {
    const el = this.containerEl.querySelector('#unit-timeline');
    if (!el) return;
    const state = this.store.state;
    const currentWeek = state.currentWeek; // Week maps to Unit
    const meta = this.content.meta || {};
    const UNIT_LABELS = meta.unit_labels || { "1": "U1", "2": "U2", "3": "U3", "4": "U4", "5": "U5", "6": "U6" };

    const beatsByUnit = {};
    this.beats.forEach(b => {
      if (!beatsByUnit[b.week]) beatsByUnit[b.week] = { total: 0, seen: 0 };
      beatsByUnit[b.week].total++;
      if (state.storyProgress?.[b.id]?.seen) beatsByUnit[b.week].seen++;
    });

    const units = [1, 2, 3, 4, 5, 6];
    const nodes = units.map(u => {
      const ub = beatsByUnit[u] || { total: 0, seen: 0 };
      const done    = ub.total > 0 && ub.seen >= ub.total;
      const active  = u === currentWeek;
      const locked  = u > currentWeek;
      const pct     = ub.total > 0 ? Math.round((ub.seen / ub.total) * 100) : 0;
      
      const nodeColor = done ? 'bg-green-900 border-green-500 text-green-200'
                      : active ? 'bg-[#2d2d30] border-[#569cd6] text-[#569cd6]'
                      : locked ? 'bg-[#1e1e1e] border-gray-800 text-gray-700'
                      : 'bg-[#1e1e1e] border-gray-700 text-gray-500';
      const labelColor = done ? 'text-green-500' : active ? 'text-[#569cd6]' : 'text-gray-600';
      
      return `
        <div class="flex flex-col items-center gap-1 relative">
          <div class="w-10 h-10 rounded border-2 ${nodeColor} flex items-center justify-center font-bold text-xs transition-colors" title="Unit ${u}: ${UNIT_LABELS[u]}">
            ${done ? '✓' : `U${u}`}
          </div>
          ${pct > 0 && !done ? `<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-800 rounded overflow-hidden"><div class="h-full bg-[#569cd6] rounded" style="width:${pct}%"></div></div>` : ''}
          <div class="text-center ${labelColor} text-[10px] leading-tight max-w-14 mt-1 truncate">${UNIT_LABELS[u] || ''}</div>
        </div>`;
    });

    const nodesWithConnectors = [];
    nodes.forEach((node, i) => {
      nodesWithConnectors.push(node);
      if (i < nodes.length - 1) {
        const u = i + 1;
        const done = (beatsByUnit[u]?.seen || 0) >= (beatsByUnit[u]?.total || 1) && (beatsByUnit[u]?.total || 0) > 0;
        nodesWithConnectors.push(`<div class="flex-1 h-0.5 ${done ? 'bg-green-900' : u < currentWeek ? 'bg-gray-700' : 'bg-gray-800'} self-center mb-6"></div>`);
      }
    });

    el.innerHTML = `
      <div class="bg-[#252526] border border-[#3e3e42] rounded-lg px-4 py-3">
        <div class="flex items-center gap-1 mb-1">
          <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">${state.activeTrack.toUpperCase()} ROADMAP</span>
          <span class="text-[10px] text-gray-600 ml-2">Unit ${currentWeek} of 6 active</span>
        </div>
        <div class="flex items-start pt-2 px-1">
          ${nodesWithConnectors.join('')}
        </div>
      </div>`;
  }

  _renderMissionCard() {
    const el = this.containerEl.querySelector('#mission-card');
    if (!el) return;
    const state = this.store.state;
    const unit = state.currentWeek;
    
    const labs = (this.content.trackLabs || []).filter(l => l.unit === unit);
    const labCount = labs.length;
    const labDone = labs.filter(l => state.completedLabs.some(cl => cl.id === l.id)).length;
    
    el.innerHTML = `
      <div class="bg-[#252526] border border-[#3e3e42] rounded-lg px-4 py-3 mt-3">
        <div class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Current Sprint</div>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-300">Unit ${unit} Practical Labs: ${labDone}/${labCount} done</div>
          <div class="text-xs text-gray-500">${Math.round((labDone/labCount)*100 || 0)}% complete</div>
        </div>
        <div class="w-full h-1.5 bg-[#1e1e1e] rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-[#4ec9b0]" style="width:${(labDone/labCount)*100 || 0}%"></div>
        </div>
      </div>`;
  }

  // ─── Story Beats ───────────────────────────────────────────────────────────

  showCurrentBeat() {
    const state = this.store.state;
    const unit  = state.currentWeek;

    const beat = this.beats.find(b => {
      if (b.week !== unit) return false;
      if (state.storyProgress[b.id]?.seen) return false;
      return this._checkGate(b);
    });

    if (beat) {
      this._renderBeat(beat);
      return;
    }

    const locked = this.beats.filter(b => {
      if (b.week !== unit) return false;
      if (state.storyProgress[b.id]?.seen) return false;
      return !this._checkGate(b);
    });

    if (locked.length) {
      this._renderGateWait(locked[0]);
    } else {
      this._renderAllSeen(unit);
    }
  }

  _checkGate(beat) {
    const gate = beat.gate;
    if (!gate) return true;
    const state = this.store.state;

    if (gate.type === 'lab') return state.completedLabs.some(l => l.id.includes(`_u${gate.unit}_`));
    if (gate.type === 'project') return !!state.completedProjects[gate.projectId]?.completedAt;
    return true;
  }

  _renderBeat(beat) {
    if (!this.storyContainer) return;

    this.storyContainer.innerHTML = `
      <div class="story-beat max-w-2xl mx-auto" data-beat="${beat.id}">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded bg-[#2d2d30] border-2 border-[#569cd6] flex items-center justify-center text-xl">
            ${beat.npc?.avatar || '👤'}
          </div>
          <div>
            <div class="font-bold text-gray-200">${beat.npc?.name || 'Lead Developer'}</div>
            <div class="text-xs text-gray-500">${beat.npc?.title || 'Pixel Forge Studio'}</div>
          </div>
          <div class="ml-auto text-xs text-[#dcdcaa] border border-[#dcdcaa]/30 rounded px-2 py-0.5">
            Unit ${beat.week} · ${beat.title}
          </div>
        </div>

        <div id="story-narrative" class="bg-[#1e1e1e] border border-[#3e3e42] rounded p-5 text-gray-300 leading-relaxed min-h-[100px] font-sans text-base"></div>

        ${beat.concept_visual ? `
        <div class="story-concept-block mt-4 border border-[#569cd6]/30 rounded overflow-hidden">
          <button class="story-concept-toggle w-full flex items-center justify-between px-4 py-2 bg-[#252526] hover:bg-[#2d2d30] text-left transition-colors">
            <span class="text-xs font-semibold text-[#569cd6]">📐 DOCUMENTATION: ${beat.concept_visual.title || 'Technical Concept'}</span>
            <span class="story-concept-caret text-gray-600 text-xs">▶</span>
          </button>
          <div class="story-concept-panel hidden px-4 py-4 bg-[#0d0d0d]">
            ${beat.concept_visual.explanation ? `<p class="text-sm text-gray-400 mb-4 leading-relaxed">${beat.concept_visual.explanation}</p>` : ''}
            <div class="story-diagram-container"></div>
          </div>
        </div>` : ''}

        <div id="story-quiz-container" class="mt-6 hidden space-y-4">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#3e3e42] pb-2">Checkpoint Quiz</h3>
          <div id="active-question"></div>
        </div>

        <div id="story-actions" class="mt-6 hidden">
          <button id="story-continue" class="px-8 py-2.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-semibold transition-colors shadow-lg">
            Finalize Task &rarr;
          </button>
        </div>
      </div>`;

    this._typeText(beat.narrative, () => {
      if (beat.quiz?.length) {
        this._runEmbeddedQuiz(beat);
      } else {
        const actions = this.storyContainer.querySelector('#story-actions');
        actions.classList.remove('hidden');
        this.storyContainer.querySelector('#story-continue').addEventListener('click', () => this._markSeen(beat));
      }

      const conceptToggle = this.storyContainer.querySelector('.story-concept-toggle');
      if (conceptToggle) {
        conceptToggle.addEventListener('click', () => {
          const panel  = conceptToggle.parentElement.querySelector('.story-concept-panel');
          const caret  = conceptToggle.querySelector('.story-concept-caret');
          const isOpen = !panel.classList.contains('hidden');
          panel.classList.toggle('hidden', isOpen);
          if (caret) caret.textContent = isOpen ? '▶' : '▼';
        });
      }
    });
  }

  _runEmbeddedQuiz(beat) {
    const quizContainer = this.storyContainer.querySelector('#story-quiz-container');
    const questionEl    = this.storyContainer.querySelector('#active-question');
    quizContainer.classList.remove('hidden');

    let currentQ = 0;
    const questions = beat.quiz;

    const renderQuestion = () => {
      if (currentQ >= questions.length) {
        questionEl.innerHTML = `<div class="text-green-500 font-bold text-sm">✓ All checkpoints passed!</div>`;
        const actions = this.storyContainer.querySelector('#story-actions');
        actions.classList.remove('hidden');
        this.storyContainer.querySelector('#story-continue').addEventListener('click', () => this._markSeen(beat));
        return;
      }

      const q = questions[currentQ];
      questionEl.innerHTML = `
        <div class="bg-[#252526] border border-[#3e3e42] rounded p-4 space-y-3">
          <p class="text-gray-200 text-sm font-semibold">${q.question}</p>
          <div class="space-y-2">
            ${q.options.map((opt, i) => `
              <button data-idx="${i}" class="quiz-opt w-full text-left px-4 py-2.5 text-xs bg-[#1e1e1e] hover:bg-[#2d2d30] border border-[#3e3e42] rounded text-gray-300 transition-colors">
                ${opt}
              </button>
            `).join('')}
          </div>
          <div id="quiz-feedback" class="hidden text-xs p-3 rounded border"></div>
        </div>
      `;

      questionEl.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          const isCorrect = idx === q.correct_answer;
          const feedback = questionEl.querySelector('#quiz-feedback');
          
          feedback.classList.remove('hidden');
          if (isCorrect) {
            feedback.className = "text-xs p-3 rounded border border-green-900 bg-green-900/20 text-green-400 mt-3";
            feedback.textContent = `Correct! ${q.explanation || ''}`;
            questionEl.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
            setTimeout(() => {
              currentQ++;
              renderQuestion();
            }, 2000);
          } else {
            feedback.className = "text-xs p-3 rounded border border-red-900 bg-red-900/20 text-red-400 mt-3";
            feedback.textContent = "Incorrect. Try again!";
            btn.classList.add('border-red-700', 'bg-red-900/10');
          }
        });
      });
    };

    renderQuestion();
  }

  _typeText(text, onComplete) {
    const el = this.storyContainer?.querySelector('#story-narrative');
    if (!el) return;
    clearTimeout(this._typingTimer);

    let i = 0;
    el.textContent = '';
    const speed = 15;

    const type = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        this._typingTimer = setTimeout(type, speed);
      } else {
        onComplete?.();
      }
    };

    el.addEventListener('click', () => {
      clearTimeout(this._typingTimer);
      el.textContent = text;
      onComplete?.();
    }, { once: true });

    type();
  }

  _markSeen(beat) {
    this.store.updateStoryProgress(beat.id, { seen: true });
    if (beat.xpReward) this.store.addXP(beat.xpReward, `story:${beat.id}`);
    bus.emit('story:beat_complete', { beatId: beat.id, unit: beat.week });
    
    // Check if unit complete
    const state = this.store.state;
    const unitBeats = this.beats.filter(b => b.week === beat.week);
    const allSeen = unitBeats.every(b => state.storyProgress[b.id]?.seen);
    
    if (allSeen && beat.week === state.currentWeek) {
      // Logic to advance week could go here, or depend on labs
    }
    
    setTimeout(() => this.showCurrentBeat(), 300);
  }

  _renderGateWait(nextLockedBeat) {
    if (!this.storyContainer) return;
    const gate = nextLockedBeat.gate;
    const message = gate?.type === 'project' 
      ? `Complete the ${gate.projectId} Portfolio Project to unlock this task.`
      : `Complete the Unit ${gate?.unit} practical labs to continue your onboarding.`;
    
    const navTarget = gate?.type === 'project' ? 'projects' : 'editor';
    const navLabel  = gate?.type === 'project' ? 'Go to Portfolio Projects' : 'Go to Code Editor';

    this.storyContainer.innerHTML = `
      <div class="text-center py-16 bg-[#252526]/50 rounded-lg border border-[#3e3e42] border-dashed">
        <div class="text-5xl mb-4 opacity-50">🔒</div>
        <div class="text-gray-200 text-xl font-bold mb-2">Technical Block</div>
        <p class="text-gray-500 text-sm max-w-sm mx-auto">${message}</p>
        <button id="story-go-unlock" class="mt-8 px-8 py-2.5 bg-[#3c3c3c] hover:bg-[#454545] text-white rounded font-semibold border border-[#3e3e42] transition-colors">
          ${navLabel}
        </button>
      </div>`;
    this.storyContainer.querySelector('#story-go-unlock')?.addEventListener('click', () => {
      bus.emit('nav:switch', { view: navTarget });
    });
  }

  _renderAllSeen(unit) {
    if (!this.storyContainer) return;
    this.storyContainer.innerHTML = `
      <div class="text-center py-16 bg-[#252526]/50 rounded-lg border border-[#3e3e42] border-dashed">
        <div class="text-5xl mb-4 text-green-600">✓</div>
        <div class="text-gray-200 text-xl font-bold mb-2">Unit ${unit} Sprint Complete</div>
        <p class="text-gray-500 text-sm">You've finished all story tasks for this unit. Master the practical labs to advance your rank.</p>
        <button id="story-next-step" class="mt-8 px-8 py-2.5 bg-[#569cd6] hover:bg-[#4e8ec2] text-white rounded font-semibold transition-colors">
          Open Code Editor
        </button>
      </div>`;
    this.storyContainer.querySelector('#story-next-step')?.addEventListener('click', () => {
      bus.emit('nav:switch', { view: 'editor' });
    });
  }
}
