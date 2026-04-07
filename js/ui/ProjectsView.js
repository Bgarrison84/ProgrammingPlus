/**
 * ProjectsView.js — Portfolio Projects
 */
import { bus } from '../core/EventBus.js';
import { GitSimulator } from '../engine/GitSimulator.js';
import { CodeEditor } from '../engine/CodeEditor.js';
import { JSRuntime } from '../runtimes/JSRuntime.js';

const PROJECTS = [
  {
    id: 'proj_first_website',
    title: 'Your First Landing Page',
    icon: '🌐',
    difficulty: 'easy',
    xp: 500,
    minLevel: 1,
    description: 'Build and host a simple landing page for Pixel Forge Studio using HTML and Git.',
    briefing: 'Sarah wants you to create a simple landing page for the studio. You need to structure the HTML, style it, and then use Git to track your changes.',
    phases: [
      {
        id: 'p0', type: 'quiz', title: 'Web Fundamentals', xp: 100,
        questions: [
          { q: 'Which tag is used to define the main heading of a page?', opts: ['<p>', '<h1>', '<header>', '<div>'], ans: 1, exp: '<h1> is the standard tag for the most important heading on a page.' },
          { q: 'What does CSS stand for?', opts: ['Computer Style Sheets', 'Creative Style System', 'Cascading Style Sheets', 'Colorful Style Sheets'], ans: 2, exp: 'CSS stands for Cascading Style Sheets, used for styling web content.' }
        ]
      },
      {
        id: 'p1', type: 'terminal', title: 'Initialize the Project', xp: 200,
        objectives: ['Initialize a new Git repository', 'Create index.html', 'Stage and commit your changes'],
        hints: ['git init', 'touch index.html', 'git add .', 'git commit -m "initial commit"'],
        targetCommand: 'git commit'
      },
      {
        id: 'p2', type: 'code', title: 'Structure the Page', xp: 200,
        runtime: 'javascript', // Using JS runtime as a proxy for HTML/CSS validation if needed
        starter_code: '<!-- Write your HTML here -->\n<h1>Welcome to Pixel Forge</h1>',
        solution: '<h1>Welcome to Pixel Forge</h1>\n<p>Creating amazing indie games.</p>',
        objectives: ['Add an <h1> tag', 'Add a <p> tag with studio description'],
        test_cases: [
          { expected_output: '<h1>Welcome to Pixel Forge</h1>\n<p>Creating amazing indie games.</p>' }
        ]
      }
    ]
  }
];

export class ProjectsView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
  }

  render() {
    const state = this.store.state;
    this.containerEl.innerHTML = `
      <div class="p-6 space-y-6 max-w-5xl mx-auto pb-12">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[#4ec9b0] font-bold text-xl uppercase tracking-widest">Portfolio Projects</h2>
            <p class="text-gray-500 text-xs mt-1">Multi-phase projects to build your developer portfolio.</p>
          </div>
          <div class="text-right text-xs text-gray-600 font-mono">
            ${PROJECTS.filter(p => this.store.isProjectComplete ? this.store.isProjectComplete(p.id) : false).length} / ${PROJECTS.length} COMPLETE
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          ${PROJECTS.map(p => {
            const prog     = this.store.getProjectProgress ? this.store.getProjectProgress(p.id) : null;
            const done     = prog?.completedPhases?.length ?? 0;
            const total    = p.phases.length;
            const complete = done >= total;
            const locked   = state.level < (p.minLevel || 1);
            const diffColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[p.difficulty] || 'text-gray-400';
            const borderCls = complete ? 'border-green-900 bg-green-950/10' : locked ? 'border-gray-800 opacity-50' : 'border-[#3e3e42] hover:border-[#569cd6] cursor-pointer';

            return `
              <div class="proj-card rounded-lg border ${borderCls} bg-[#252526] p-5 transition-all" data-proj="${p.id}">
                <div class="flex items-start gap-4">
                  <div class="text-4xl shrink-0">${p.icon}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                      <span class="text-white font-bold text-base">${p.title}</span>
                      <span class="${diffColor} text-[10px] font-bold uppercase tracking-tighter border border-current px-1.5 rounded">${p.difficulty}</span>
                      <span class="text-gray-500 text-xs font-mono">${p.xp} XP</span>
                      ${complete ? '<span class="text-green-400 text-xs font-bold ml-auto">✓ COMPLETED</span>' : ''}
                    </div>
                    <p class="text-gray-400 text-sm mt-2">${p.description}</p>

                    <!-- Progress bar -->
                    <div class="mt-4 flex items-center gap-3">
                      <div class="flex gap-1 flex-1">
                        ${p.phases.map((ph, i) => {
                          const phDone = prog?.completedPhases?.includes(i);
                          return `<div class="flex-1 rounded-full h-1 ${phDone ? 'bg-green-500' : 'bg-[#1e1e1e]"'}" title="${ph.title}"></div>`;
                        }).join('')}
                      </div>
                      <span class="text-gray-600 text-[10px] font-mono">${done}/${total}</span>
                    </div>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    this.containerEl.querySelectorAll('.proj-card:not(.opacity-50)').forEach(el => {
      el.addEventListener('click', () => {
        const proj = PROJECTS.find(p => p.id === el.dataset.proj);
        if (proj) this._renderProjectDetail(proj);
      });
    });
  }

  _renderProjectDetail(project) {
    // Basic implementation for now, similar to CCNA Mastery but themed
    this.containerEl.innerHTML = `
      <div class="p-6 space-y-6 max-w-4xl mx-auto pb-12">
        <div class="flex items-center gap-4">
          <button id="proj-back" class="text-gray-500 hover:text-gray-300 text-xs px-3 py-1 border border-[#3e3e42] rounded transition-colors">← Back</button>
          <h2 class="text-white font-bold text-xl">${project.title}</h2>
        </div>
        
        <div class="bg-[#252526] border border-blue-900/30 rounded-lg p-5">
          <div class="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Project Briefing</div>
          <p class="text-gray-300 text-sm leading-relaxed">${project.briefing}</p>
        </div>

        <div class="space-y-3">
          <div class="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Phases</div>
          ${project.phases.map((ph, i) => `
            <div class="rounded-lg border border-[#3e3e42] bg-[#1e1e1e] p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-[#2d2d30] border border-[#3e3e42] flex items-center justify-center text-xs text-gray-500 font-bold">${i+1}</span>
                <div>
                  <div class="text-sm font-bold text-gray-200">${ph.title}</div>
                  <div class="text-[10px] text-gray-500 uppercase">${ph.type} phase</div>
                </div>
              </div>
              <button class="text-xs px-4 py-1.5 bg-[#2d2d30] text-gray-300 border border-[#3e3e42] rounded hover:bg-[#3e3e42] transition-colors">Launch</button>
            </div>
          `).join('')}
        </div>
        
        <div class="text-center py-12 text-gray-600 text-xs italic">
          Click a phase to begin. Complete all phases to finish the project.
        </div>
      </div>`;

    this.containerEl.querySelector('#proj-back').onclick = () => this.render();
  }
}
