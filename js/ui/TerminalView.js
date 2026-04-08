/**
 * TerminalView.js — Integrated Xterm.js Terminal
 * Only fully functional in Desktop Edition.
 */
import { bus } from '../core/EventBus.js';

export class TerminalView {
  constructor(content, store, containerEl) {
    this.content     = content;
    this.store       = store;
    this.containerEl = containerEl;
    this.term        = null;
    this._initialized = false;
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="p-4 h-full flex flex-col space-y-4">
        <div>
          <h2 class="text-[#4ec9b0] font-bold text-sm uppercase tracking-widest">Real-Time Terminal</h2>
          <p class="text-gray-500 text-[10px] mt-0.5">Direct access to your system shell (Desktop Edition only).</p>
        </div>
        
        <div id="terminal-container" class="flex-1 bg-black rounded border border-[#3e3e42] overflow-hidden">
          ${!window.electron ? `
            <div class="h-full flex flex-col items-center justify-center text-center p-8">
              <div class="text-4xl mb-4 grayscale">🖥️</div>
              <div class="text-gray-400 font-bold">Desktop Edition Only</div>
              <p class="text-gray-600 text-xs mt-2 max-w-xs">Real-time terminal access requires the native desktop application to connect to your system shell.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (window.electron && !this._initialized) {
      this._initTerminal();
    }
  }

  async _initTerminal() {
    if (this._initialized) return;
    
    // Load Xterm.js dynamically
    if (!window.Terminal) {
      await this._loadScript('./node_modules/xterm/lib/xterm.js');
      await this._loadCSS('./node_modules/xterm/css/xterm.css');
    }

    const container = document.getElementById('terminal-container');
    if (!container) return;

    this.term = new window.Terminal({
      theme: {
        background: '#000000',
        foreground: '#d4d4d4',
        cursor: '#569cd6'
      },
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      cursorBlink: true
    });

    this.term.open(container);
    this._initialized = true;

    // Connect to Electron PTY
    const onDataHandler = (data) => {
      if (this.term) this.term.write(data);
    };
    
    window.electron.terminal.onData(onDataHandler);

    this.term.onData((data) => {
      window.electron.terminal.send(data);
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (!this.term) return;
      const cols = Math.floor(container.clientWidth / 8);
      const rows = Math.floor(container.clientHeight / 18);
      if (cols > 0 && rows > 0) {
        this.term.resize(cols, rows);
        window.electron.terminal.resize(cols, rows);
      }
    });
    resizeObserver.observe(container);

    // Cleanup on destroy
    this.destroy = () => {
      if (this.term) {
        this.term.dispose();
        this.term = null;
      }
      this._initialized = false;
      resizeObserver.disconnect();
    };
  }

  _loadScript(src) {
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  _loadCSS(href) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
}
