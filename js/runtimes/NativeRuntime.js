/**
 * NativeRuntime.js — Executes code via real system binaries using Electron's IPC.
 * Supports: Python, Rust, Go, C#, C++, etc.
 */

export class NativeRuntime {
  /**
   * @param {string} language — 'python', 'rust', 'go', 'csharp', 'cpp'
   */
  constructor(language) {
    this.language = language;
    
    // Command mappings for native binaries
    this.commands = {
      python: { cmd: 'python', args: [] },
      rust:   { cmd: 'rustc',  args: ['--out-dir', 'temp_bin'] }, // simplified
      go:     { cmd: 'go',     args: ['run'] },
      csharp: { cmd: 'dotnet', args: ['run'] },
      cpp:    { cmd: 'g++',    args: ['-o', 'temp_bin/app'] }
    };
  }

  /**
   * Execute code using the native binary via Electron IPC.
   * @param {string} code
   * @returns {Promise<string>}
   */
  async execute(code) {
    if (!window.electron) {
      throw new Error('Native execution is only available in the Desktop Edition.');
    }

    const config = this.commands[this.language];
    if (!config) {
      throw new Error(`Native execution not configured for: ${this.language}`);
    }

    // Special handling for languages that need compilation vs script
    if (this.language === 'python') {
      const result = await window.electron.runNative(config.cmd, config.args, code);
      if (!result.success) {
        throw new Error(result.stderr || result.error);
      }
      return result.stdout;
    }

    // For others (Go, Rust, etc.), we can expand logic here
    const result = await window.electron.runNative(config.cmd, config.args, code);
    if (!result.success) {
      throw new Error(result.stderr || result.error);
    }
    return result.stdout || 'Execution finished (no output).';
  }
}
