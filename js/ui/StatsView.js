/**
 * StatsView.js — Performance Dashboard & Analytics
 */
import { QuizEngine } from '../core/QuizEngine.js';
import { bus } from '../core/EventBus.js';

export class StatsView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
  }

  render() {
    const state = this.store.state;
    const stats = this._calculateStats();

    this.containerEl.innerHTML = `
      <div class="max-w-5xl mx-auto p-6 space-y-6 pb-12">
        <div class="flex items-center justify-between">
          <h2 class="text-[#569cd6] font-bold text-xl uppercase tracking-widest">Developer Analytics</h2>
          <div class="text-right">
            <div class="text-xs text-gray-500">Rank: <span class="text-green-400 font-bold">${this._getRankName(state.level)}</span></div>
            <div class="text-[10px] text-gray-600 uppercase mt-0.5">Active Track: ${state.activeTrack}</div>
          </div>
        </div>

        <!-- Top Grid: Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-[#252526] border border-[#3e3e42] p-4 rounded-lg">
            <div class="text-[10px] text-gray-500 uppercase font-semibold mb-1">Global XP</div>
            <div class="text-2xl font-bold text-white">${state.xp.toLocaleString()}</div>
          </div>
          <div class="bg-[#252526] border border-[#3e3e42] p-4 rounded-lg">
            <div class="text-[10px] text-gray-500 uppercase font-semibold mb-1">Track XP</div>
            <div class="text-2xl font-bold text-[#569cd6]">${(state.languageXP[state.activeTrack] || 0).toLocaleString()}</div>
          </div>
          <div class="bg-[#252526] border border-[#3e3e42] p-4 rounded-lg">
            <div class="text-[10px] text-gray-500 uppercase font-semibold mb-1">Overall Accuracy</div>
            <div class="text-2xl font-bold text-green-400">${stats.accuracy}%</div>
          </div>
          <div class="bg-[#252526] border border-[#3e3e42] p-4 rounded-lg">
            <div class="text-[10px] text-gray-500 uppercase font-semibold mb-1">Study Time</div>
            <div class="text-2xl font-bold text-orange-400">${Math.round(state.studyMinutes / 60)}h ${state.studyMinutes % 60}m</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left: Unit Progress -->
          <div class="bg-[#252526] border border-[#3e3e42] p-5 rounded-lg space-y-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#3e3e42] pb-2">Unit Proficiency</h3>
            <div class="space-y-4">
              ${stats.unitStats.map(u => `
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-300">${u.name}</span>
                    <span class="${u.color}">${u.accuracy}% (${u.correct}/${u.total})</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div class="h-full ${u.bg}" style="width: ${u.accuracy}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Daily Activity -->
          <div class="bg-[#252526] border border-[#3e3e42] p-5 rounded-lg">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-[#3e3e42] pb-2">Activity Heatmap</h3>
            <div id="heatmap-container" class="mt-4 flex flex-wrap gap-1"></div>
            <p class="text-[10px] text-gray-600 mt-4 italic">* Squares represent daily study minutes over the last 30 days.</p>
          </div>
        </div>
      </div>`;

    this._renderHeatmap();
  }

  _calculateStats() {
    const state = this.store.state;
    const history = state.quizHistory || [];
    
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    history.forEach(h => {
      totalCorrect += h.correct;
      totalQuestions += h.total;
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Unit Stats (simplified)
    const questions = this.content.trackQuestions || [];
    const domains = QuizEngine.domainsFrom(questions);
    const unitStats = domains.map(d => {
      let dCorrect = 0;
      let dTotal = 0;
      history.forEach(h => {
        if (h.domainStats?.[d]) {
          dCorrect += h.domainStats[d].correct;
          dTotal += h.domainStats[d].total;
        }
      });
      const acc = dTotal > 0 ? Math.round((dCorrect / dTotal) * 100) : 0;
      return {
        name: d,
        accuracy: acc,
        correct: dCorrect,
        total: dTotal,
        color: acc >= 80 ? 'text-green-400' : acc >= 60 ? 'text-yellow-400' : 'text-red-400',
        bg: acc >= 80 ? 'bg-green-500' : acc >= 60 ? 'bg-yellow-500' : 'bg-red-500'
      };
    });

    return { accuracy, unitStats };
  }

  _renderHeatmap() {
    const container = this.containerEl.querySelector('#heatmap-container');
    if (!container) return;

    const log = this.store.state.studyLog || {};
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const mins = log[key] || 0;
      
      const opacity = mins === 0 ? 0.05 : mins < 15 ? 0.3 : mins < 45 ? 0.6 : 1.0;
      const square = document.createElement('div');
      square.className = "w-3 h-3 rounded-sm bg-[#569cd6]";
      square.style.opacity = opacity;
      square.title = `${key}: ${mins} minutes`;
      container.appendChild(square);
    }
  }

  _getRankName(level) {
    const ranks = [
      'Script Kiddie', 'Junior Dev', 'Code Monkey', 'Software Engineer', 
      'Senior Developer', 'Architect', 'Tech Lead', 'Principal Engineer', 
      'CTO', 'Coding God'
    ];
    return ranks[Math.min(level - 1, ranks.length - 1)] || 'Hacker';
  }
}
