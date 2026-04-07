/**
 * JSRuntime.js — Sandboxed JavaScript execution with stdout capture.
 *
 * Intercepts console.log / console.error inside a sandboxed eval context.
 * Uses a restricted Function constructor to limit access to globals.
 *
 * Security note: This is sandboxed for UX (capturing output), not for
 * security isolation. Do not use this to run untrusted third-party code.
 * All content is first-party (from content.json).
 */

export class JSRuntime {
  /**
   * Execute JS code and return captured stdout as a string.
   * @param {string} code
   * @returns {Promise<string>} stdout lines joined by '\n'
   */
  async execute(code) {
    const lines = [];

    // Build a restricted sandbox object
    const sandbox = {
      console: {
        log:   (...args) => lines.push(args.map(String).join(' ')),
        error: (...args) => lines.push('[error] ' + args.map(String).join(' ')),
        warn:  (...args) => lines.push('[warn] '  + args.map(String).join(' ')),
        info:  (...args) => lines.push(args.map(String).join(' ')),
      },
      // Safe subset of globals
      Math, JSON, Date, Array, Object, String, Number, Boolean, parseInt, parseFloat,
      isNaN, isFinite, encodeURIComponent, decodeURIComponent,
      // Block dangerous APIs
      fetch: undefined, XMLHttpRequest: undefined, eval: undefined,
      window: undefined, document: undefined, globalThis: undefined,
    };

    try {
      // Create function with sandbox keys as parameters
      const keys   = Object.keys(sandbox);
      const values = Object.values(sandbox);
      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, `"use strict";\n${code}`);
      const result = fn(...values);

      // If the code returns a Promise, await it
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (err) {
      throw new Error(err.message || String(err));
    }

    return lines.join('\n');
  }
}
