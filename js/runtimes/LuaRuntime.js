/**
 * LuaRuntime.js — Lua.vm.js WASM wrapper for in-browser Lua execution.
 *
 * Lua.vm.js must be loaded separately.
 * Download from: https://github.com/logiceditor-com/lua.vm.js
 * Place lua.vm.js in the project root.
 *
 * If Lua.vm.js is not available, execute() throws a helpful error.
 */

const LUA_VM_URL = './lua.vm.js';

let _luaVMLoaded  = false;
let _luaVMLoading = null;

async function _loadLuaVM() {
  if (_luaVMLoaded) return;
  if (_luaVMLoading) return _luaVMLoading;

  _luaVMLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LUA_VM_URL;
    script.onload  = () => { _luaVMLoaded = true; resolve(); };
    script.onerror = () => reject(new Error(
      `Failed to load Lua.vm.js from ${LUA_VM_URL}. Place lua.vm.js in the project root.`
    ));
    document.head.appendChild(script);
  });

  return _luaVMLoading;
}

export class LuaRuntime {
  /**
   * Execute Lua code and return captured stdout as a string.
   * @param {string} code
   * @returns {Promise<string>}
   */
  async execute(code) {
    try {
      await _loadLuaVM();
    } catch (err) {
      throw new Error(
        `Lua runtime not available: ${err.message}\n` +
        `To enable Lua execution, download lua.vm.js and place it in the project root.`
      );
    }

    if (typeof globalThis.Lua === 'undefined') {
      throw new Error('Lua runtime loaded but Lua global is not defined. Check lua.vm.js compatibility.');
    }

    return new Promise((resolve, reject) => {
      const lines = [];

      try {
        const L = new globalThis.Lua.State();

        // Override the Lua print function to capture output
        L.execute(`
          local _orig_print = print
          local _captured = {}
          print = function(...)
            local args = {...}
            local parts = {}
            for i = 1, #args do
              parts[i] = tostring(args[i])
            end
            table.insert(_captured, table.concat(parts, '\\t'))
          end
        `);

        // Run the user's code
        const result = L.execute(code);

        if (result !== 0) {
          reject(new Error('Lua execution error (non-zero exit code)'));
          return;
        }

        // Retrieve captured output
        L.execute(`_pp_output = table.concat(_captured, '\\n')`);
        const output = L.get('_pp_output') ?? '';

        resolve(String(output));
      } catch (err) {
        reject(new Error(String(err.message || err)));
      }
    });
  }
}
