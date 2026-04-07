/**
 * GitView.js — Terminal UI for the Git Simulator
 */
import { GitSimulator } from '../engine/GitSimulator.js';

export class GitView {
  constructor(content, store, containerEl) {
    this.content = content;
    this.store = store;
    this.containerEl = containerEl;
    this.simulator = new GitSimulator();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="p-4 space-y-4 max-w-4xl mx-auto h-full flex flex-col">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-green-400 font-bold text-sm uppercase tracking-widest">Git Terminal</h2>
            <p class="text-gray-500 text-xs mt-0.5">Practice version control with the interactive Git Simulator.</p>
          </div>
        </div>

        <div class="flex-1 rounded border border-gray-700 space-y-0 overflow-hidden flex flex-col">
          <div class="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
            <div class="flex gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <span class="text-gray-400 text-xs font-mono ml-1">bash — git-sim</span>
            <div class="ml-auto">
              <button id="git-reset-btn" class="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded">Reset Repo</button>
            </div>
          </div>
          
          <div id="git-term-out" class="flex-1 overflow-y-auto p-3 font-mono text-sm leading-relaxed bg-black text-gray-300">
            <div class="text-green-400 mb-2">Welcome to the Git Simulator! Type 'git status' or 'git init' to begin.</div>
          </div>
          
          <div class="flex items-center px-3 py-2 border-t border-gray-700 bg-black">
            <span class="text-yellow-400 font-mono text-sm select-none mr-2">$ </span>
            <input id="git-term-input" type="text" autocomplete="off" spellcheck="false"
              class="flex-1 bg-transparent text-white font-mono text-sm outline-none caret-white"
              placeholder="git command...">
          </div>
        </div>
      </div>`;

    this._wireEvents();
  }

  _wireEvents() {
    const inputEl = this.containerEl.querySelector('#git-term-input');
    const outEl = this.containerEl.querySelector('#git-term-out');
    const resetBtn = this.containerEl.querySelector('#git-reset-btn');

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = inputEl.value.trim();
        if (!cmd) return;
        
        inputEl.value = '';
        
        // Echo command
        const cmdLine = document.createElement('div');
        cmdLine.className = 'text-yellow-400 mt-2';
        cmdLine.textContent = `$ ${cmd}`;
        outEl.appendChild(cmdLine);

        // Handle clear
        if (cmd === 'clear') {
          outEl.innerHTML = '';
          return;
        }

        // Execute command
        const result = this.simulator.execute(cmd);
        
        // Display output
        if (result.output) {
          const outLine = document.createElement('div');
          outLine.className = result.success ? 'text-gray-300' : 'text-red-400';
          outLine.textContent = result.output;
          outEl.appendChild(outLine);
        }

        outEl.scrollTop = outEl.scrollHeight;

        // Add XP for successful basic commands
        if (result.success && cmd.startsWith('git ')) {
          this.store.addXP(5, `git_cmd:${cmd.split(' ')[1]}`);
        }
      }
    });

    resetBtn.addEventListener('click', () => {
      if (confirm('Reset the virtual repository to its initial state?')) {
        this.simulator.reset();
        outEl.innerHTML = '<div class="text-green-400 mb-2">Repository reset. Type \'git init\' to begin.</div>';
      }
    });
  }
}
