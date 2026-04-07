/**
 * PythonRuntime.js — Pyodide WASM wrapper for in-browser Python execution.
 *
 * Pyodide must be loaded separately (it's a large WASM bundle, ~12MB).
 * Place pyodide/ directory in the project root (copy from the official release).
 *
 * Offline usage: download https://github.com/pyodide/pyodide/releases
 * and serve pyodide.js + pyodide.asm.wasm locally.
 *
 * If Pyodide is not available, execute() throws a clear error message
 * so the UI can show a helpful fallback.
 */

const PYODIDE_URL = './pyodide/pyodide.js';

let _pyodide  = null;
let _loading  = null;

async function _loadPyodide() {
  if (_pyodide)  return _pyodide;
  if (_loading)  return _loading;

  _loading = (async () => {
    // Dynamically import Pyodide's bootstrap script
    const script = document.createElement('script');
    script.src = PYODIDE_URL;
    document.head.appendChild(script);

    await new Promise((resolve, reject) => {
      script.onload  = resolve;
      script.onerror = () => reject(new Error(`Failed to load Pyodide from ${PYODIDE_URL}. Make sure pyodide/ is in the project root.`));
    });

    // loadPyodide is a global injected by pyodide.js
    _pyodide = await globalThis.loadPyodide({
      indexURL: './pyodide/',
    });

    return _pyodide;
  })();

  return _loading;
}

export class PythonRuntime {
  /**
   * Execute Python code and return captured stdout as a string.
   * @param {string} code
   * @returns {Promise<string>}
   */
  async execute(code) {
    let py;
    try {
      py = await _loadPyodide();
    } catch (err) {
      throw new Error(
        `Python runtime not available: ${err.message}\n` +
        `To enable Python execution, download Pyodide and place it in ProgrammingPlus/pyodide/.`
      );
    }

    // Redirect stdout to capture print() output
    let output = '';
    py.globals.set('_pp_output_lines', []);

    const wrappedCode = `
import sys
from io import StringIO
_pp_buf = StringIO()
sys.stdout = _pp_buf
try:
${code.split('\n').map(l => '    ' + l).join('\n')}
finally:
    sys.stdout = sys.__stdout__
    _pp_captured = _pp_buf.getvalue()
`;

    try {
      await py.runPythonAsync(wrappedCode);
      output = py.globals.get('_pp_captured') ?? '';
    } catch (err) {
      // Extract just the error message from Pyodide's verbose trace
      const msg = String(err.message || err).split('\n').pop() || String(err);
      throw new Error(msg);
    }

    return output.replace(/\n$/, ''); // trim trailing newline
  }
}
