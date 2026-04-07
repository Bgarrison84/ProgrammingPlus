/**
 * LuaRuntime.js — Wasmoon WASM wrapper for in-browser Lua execution.
 *
 * Wasmoon is the modern standard for Lua in the browser, using Lua 5.4/5.5 via WASM.
 * 
 * Offline usage:
 * 1. Download 'index.js' (the library) and 'glue.wasm' from:
 *    https://unpkg.com/wasmoon/dist/
 * 2. Place them in a 'lua/' directory in the project root.
 */

let _luaFactory = null;
let _loading = null;

async function _loadWasmoon() {
  if (_luaFactory) return _luaFactory;
  if (_loading) return _loading;

  _loading = (async () => {
    // Dynamically import Wasmoon's bootstrap script
    // Note: In a production app, you might want to bundle this or load via script tag in index.html
    const WASMOON_URL = './lua/index.js';
    
    if (!globalThis.wasmoon) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = WASMOON_URL;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load Wasmoon from ${WASMOON_URL}. Place 'index.js' and 'glue.wasm' in /lua/`));
        document.head.appendChild(script);
      });
    }

    // Wasmoon exposes { LuaFactory, LuaEngine, ... } on the window/global
    const { LuaFactory } = globalThis.wasmoon;
    _luaFactory = new LuaFactory();
    return _luaFactory;
  })();

  return _loading;
}

export class LuaRuntime {
  /**
   * Execute Lua code and return captured stdout as a string.
   * @param {string} code
   * @returns {Promise<string>}
   */
  async execute(code) {
    let factory;
    try {
      factory = await _loadWasmoon();
    } catch (err) {
      throw new Error(
        `Lua runtime not available: ${err.message}\n` +
        `To enable Lua execution, download Wasmoon (index.js & glue.wasm) and place them in /lua/`
      );
    }

    const lua = await factory.createEngine();
    const output = [];

    // Redirect print to capture output
    lua.global.set('print', (...args) => {
      output.push(args.map(arg => String(arg)).join('\t'));
    });

    try {
      await lua.doString(code);
    } catch (err) {
      throw new Error(err.message || String(err));
    } finally {
      // Close engine to free WASM memory
      lua.global.close();
    }

    return output.join('\n');
  }
}
