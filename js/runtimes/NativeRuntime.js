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
      python: { cmd: 'python', args: [], testCmd: 'pytest' },
      rust:   { cmd: 'rustc',  args: ['--out-dir', 'temp_bin'], testCmd: 'cargo test' },
      go:     { cmd: 'go',     args: ['run'], testCmd: 'go test' },
      csharp: { cmd: 'dotnet', args: ['run'], testCmd: 'dotnet test' },
      cpp:    { cmd: 'g++',    args: ['-o', 'temp_bin/app'], testCmd: 'make test' }
    };
  }

  /**
   * Execute code using the native binary via Electron IPC.
   * @param {string} code
   * @returns {Promise<string>}
   */
  async execute(code) {
    return this._runIPC('run-native', code);
  }

  /**
   * Run unit tests for the given code.
   * @param {string} code
   * @returns {Promise<object>} { success, stdout, stderr }
   */
  async test(code) {
    if (!window.electron) throw new Error('Native testing requires Desktop Edition.');
    const config = this.commands[this.language];
    return window.electron.runNative(config.testCmd || config.cmd, config.args, code);
  }

  async _runIPC(channel, code) {
    if (!window.electron) {
      throw new Error('Native execution is only available in the Desktop Edition.');
    }

    const config = this.commands[this.language];
    if (!config) {
      throw new Error(`Native execution not configured for: ${this.language}`);
    }

    const result = await window.electron.runNative(config.cmd, config.args, code);
    if (!result.success) {
      throw new Error(result.stderr || result.error);
    }
    return result.stdout || 'Execution finished (no output).';
  }
}
