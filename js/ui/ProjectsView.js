/**
 * ProjectsView.js — Portfolio Projects
 */
import { bus } from '../core/EventBus.js';
import { GitSimulator } from '../engine/GitSimulator.js';
import { CodeEditor } from '../engine/CodeEditor.js';
import { JSRuntime } from '../runtimes/JSRuntime.js';

export class ProjectsView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
    this.projects    = content.projects || [];
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
            ${this.projects.filter(p => this.store.isProjectComplete ? this.store.isProjectComplete(p.id) : false).length} / ${this.projects.length} COMPLETE
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          ${this.projects.map(p => {
            const prog     = this.store.getProjectProgress ? this.store.getProjectProgress(p.id) : null;
            const done     = prog?.completedPhases?.length ?? 0;
            const total    = p.phases.length;
            const complete = done >= total;
            const locked   = state.level < (p.minLevel || 1);
            
            const diffMap = {
              beginner:  'text-blue-400',
              easy:      'text-green-400',
              medium:    'text-yellow-400',
              hard:      'text-orange-400',
              epic:      'text-purple-400',
              legendary: 'text-rose-400',
              mythic:    'text-cyan-400 font-black tracking-tighter'
            };
            const diffColor = diffMap[p.difficulty] || 'text-gray-400';
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

                    <!-- Native Export Options (Desktop Edition) -->
                    ${complete && window.electron ? `
                      <div class="mt-4 flex gap-2">
                        <button data-export-folder="${p.id}" class="text-[10px] px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800 rounded hover:bg-blue-900/50 transition-colors">📁 Save to Folder</button>
                        <button data-export-zip="${p.id}" class="text-[10px] px-2 py-1 bg-purple-900/30 text-purple-400 border border-purple-800 rounded hover:bg-purple-900/50 transition-colors">📦 Download .zip</button>
                      </div>
                    ` : ''}

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
      el.addEventListener('click', e => {
        if (e.target.closest('[data-export-folder]')) {
          this._exportProject(el.dataset.proj, 'folder');
          return;
        }
        if (e.target.closest('[data-export-zip]')) {
          this._exportProject(el.dataset.proj, 'zip');
          return;
        }
        
        const proj = this.projects.find(p => p.id === el.dataset.proj);
        if (proj) this._renderProjectDetail(proj);
      });
    });
  }

  async _exportProject(projectId, mode) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project || !window.electron) return;

    // Gather all code from this project's phases
    const files = [];
    project.phases.forEach((ph, i) => {
      if (ph.type === 'code' || ph.type === 'terminal') {
        const userCode = this.store.getCodeSnippet ? this.store.getCodeSnippet(`proj_${projectId}_p${i}`) : null;
        files.push({
          name: ph.filename || (ph.type === 'code' ? 'main.js' : 'commands.txt'),
          content: userCode || ph.solution || ph.starter_code || ''
        });
      }
    });

    // Add professional README.md
    files.push({
      name: 'README.md',
      content: this._generateReadme(project)
    });

    // Add .gitignore based on track
    files.push({
      name: '.gitignore',
      content: this._getGitignore(project.track || 'javascript')
    });

    if (files.length === 0) {
      alert('No code files found to export for this project.');
      return;
    }

    const projectData = { title: project.title, files };
    let result;

    if (mode === 'folder') {
      result = await window.electron.saveProject(projectData);
      if (result.success) {
        localStorage.setItem('last_project_export_path', result.path);
        // Auto-init git
        const gitRes = await window.electron.initGit(result.path);
        if (gitRes.success) {
          bus.emit('toast', { message: 'Git initialized and first commit created!', type: 'success' });
        }
      }
    } else {
      result = await window.electron.zipProject(projectData);
    }

    if (result.success) {
      alert(`Project successfully exported to: ${result.path}`);
    } else if (result.error !== 'Cancelled') {
      alert(`Export failed: ${result.error}`);
    }
  }

  _generateReadme(project) {
    return `# ${project.title}

${project.description}

## Project Briefing
${project.briefing}

## Career Focus
This project demonstrates skills relevant to **${project.track} development**.

## Built With
- Programming Plus Developer Studio
- Language: ${project.track}

## Author
Completed by a Junior Developer at Pixel Forge Studio.
`;
  }

  _getGitignore(track) {
    const templates = {
      python: "__pycache__/\n*.py[cod]\n*$py.class\n.env\nvenv/\n",
      javascript: "node_modules/\n.DS_Store\n.env\ndist/\n",
      lua: "*.out\n*.exe\n*.dll\n",
      csharp: "[Bb]in/\n[Oo]bj/\n*.user\n*.suo\n",
      cpp: "*.o\n*.exe\n*.out\nbuild/\n",
      go: "bin/\npkg/\n",
      rust: "target/\nCargo.lock\n"
    };
    return templates[track] || "# Default gitignore\n.DS_Store\n.env\n";
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
