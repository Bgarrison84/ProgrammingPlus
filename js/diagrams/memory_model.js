/**
 * memory_model.js — Interactive stack vs heap diagram
 *
 * Shows:
 *   - Stack: function call frames, local variables, fixed-size allocation
 *   - Heap: dynamic allocation, pointers/references
 *   - Language annotations: which languages use GC vs manual vs ownership
 *
 * Contract: export function render(container) — no globals, no shared state.
 */

export function render(container) {
  container.innerHTML = `
    <div class="memory-diagram font-mono text-sm select-none" style="background:#1e1e1e;color:#d4d4d4;padding:1.5rem;border-radius:0.5rem;border:1px solid #3e3e42;">

      <h3 style="color:#569cd6;font-weight:700;font-size:1rem;margin-bottom:0.25rem;">Memory Model — Stack vs Heap</h3>
      <p style="color:#858585;font-size:0.75rem;margin-bottom:1rem;">Click a region to learn how each language manages it.</p>

      <!-- Language tab selector -->
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;" id="mm-lang-tabs">
        ${['Python','JavaScript','Lua','C#','C++','Go','Rust'].map((lang, i) => `
          <button data-lang="${lang.toLowerCase().replace('#','sharp').replace('++','pp')}"
            style="padding:0.25rem 0.75rem;font-size:0.7rem;border-radius:0.25rem;border:1px solid #3e3e42;
                   background:${i===0?'#569cd6':'#252526'};color:${i===0?'#fff':'#d4d4d4'};cursor:pointer;font-family:monospace;"
          >${lang}</button>
        `).join('')}
      </div>

      <!-- Diagram -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">

        <!-- Stack -->
        <div id="mm-stack" data-region="stack" style="cursor:pointer;padding:0.75rem;background:#252526;border:2px solid #3e3e42;border-radius:0.5rem;transition:border-color 0.15s;">
          <div style="color:#4ec9b0;font-weight:700;margin-bottom:0.5rem;">📚 Stack</div>
          <div style="display:flex;flex-direction:column-reverse;gap:0.25rem;">
            <div style="padding:0.4rem 0.5rem;background:#1a3a3a;border:1px solid #4ec9b0;border-radius:0.25rem;font-size:0.7rem;">
              main() frame<br>
              <span style="color:#858585;font-size:0.65rem;">local x = 5 &nbsp; local y = 10</span>
            </div>
            <div style="padding:0.4rem 0.5rem;background:#1a3a3a;border:1px dashed #4ec9b0;border-radius:0.25rem;font-size:0.7rem;">
              add(a, b) frame<br>
              <span style="color:#858585;font-size:0.65rem;">a=5 &nbsp; b=10 &nbsp; return addr</span>
            </div>
            <div style="padding:0.4rem 0.5rem;background:#1a2a2a;border:1px dashed #3e3e42;border-radius:0.25rem;font-size:0.7rem;color:#858585;">
              ↑ grows upward
            </div>
          </div>
          <div style="margin-top:0.5rem;font-size:0.65rem;color:#858585;">
            ✓ Fast (just move stack pointer)<br>
            ✓ Auto-freed when function returns<br>
            ✗ Fixed / limited size (~1–8MB)
          </div>
        </div>

        <!-- Heap -->
        <div id="mm-heap" data-region="heap" style="cursor:pointer;padding:0.75rem;background:#252526;border:2px solid #3e3e42;border-radius:0.5rem;transition:border-color 0.15s;">
          <div style="color:#ce9178;font-weight:700;margin-bottom:0.5rem;">🏔 Heap</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.25rem;">
            <div style="padding:0.4rem;background:#3a2a1a;border:1px solid #ce9178;border-radius:0.25rem;font-size:0.65rem;">
              Object @ 0x4a2f<br><span style="color:#858585;">{ name: "Alex" }</span>
            </div>
            <div style="padding:0.4rem;background:#1e1e1e;border:1px dashed #3e3e42;border-radius:0.25rem;font-size:0.65rem;color:#3e3e42;">
              (free)
            </div>
            <div style="padding:0.4rem;background:#1e1e1e;border:1px dashed #3e3e42;border-radius:0.25rem;font-size:0.65rem;color:#3e3e42;">
              (free)
            </div>
            <div style="padding:0.4rem;background:#3a2a1a;border:1px solid #ce9178;border-radius:0.25rem;font-size:0.65rem;">
              Array @ 0x8c10<br><span style="color:#858585;">[1,2,3,4,5]</span>
            </div>
          </div>
          <div style="margin-top:0.5rem;font-size:0.65rem;color:#858585;">
            ✓ Dynamic size (grows at runtime)<br>
            ✓ Lives past function scope<br>
            ✗ Slower · must track lifetime
          </div>
        </div>
      </div>

      <!-- Info panel -->
      <div id="mm-info" style="margin-top:1rem;padding:0.75rem;background:#252526;border-left:3px solid #569cd6;border-radius:0 0.25rem 0.25rem 0;min-height:5rem;font-size:0.75rem;color:#d4d4d4;">
        <strong style="color:#569cd6;">Python</strong> — Stack &amp; Heap<br><br>
        All Python objects live on the <strong>heap</strong> (even small ints are objects).
        Local variables on the stack hold <em>references</em> (pointers) to heap objects.
        Memory is managed by a <strong>garbage collector</strong> with reference counting + cyclic GC.
        You never call free() — Python handles it automatically.
      </div>
    </div>
  `;

  // Language-specific info texts
  const INFO = {
    python:     '<strong style="color:#569cd6">Python</strong> — Garbage Collected<br><br>All Python objects live on the <strong>heap</strong>. Local variables hold <em>references</em>. Memory is managed by <strong>reference counting + cyclic GC</strong>. You never call free().',
    javascript: '<strong style="color:#dcdcaa">JavaScript</strong> — Garbage Collected<br><br>Primitives (numbers, booleans) may live on the stack; objects and arrays on the <strong>heap</strong>. The <strong>V8/SpiderMonkey GC</strong> handles collection automatically via mark-and-sweep.',
    lua:        '<strong style="color:#4ec9b0">Lua</strong> — Garbage Collected<br><br>Lua tables, strings, and functions live on the heap. The runtime uses an <strong>incremental mark-and-sweep GC</strong>. You can tune collection with collectgarbage().',
    csharp:     '<strong style="color:#c586c0">C#</strong> — .NET GC<br><br>Value types (int, struct) live on the <strong>stack</strong>. Reference types (class, string, array) live on the <strong>heap</strong>. The <strong>.NET CLR GC</strong> manages heap objects in generations (Gen0→2).',
    cpp:        '<strong style="color:#f44747">C++</strong> — Manual / Smart Pointers<br><br>Local variables on the <strong>stack</strong> are freed automatically. Heap memory (new/delete) must be managed manually — or use <strong>smart pointers</strong> (unique_ptr, shared_ptr) which automate ownership.',
    go:         '<strong style="color:#569cd6">Go</strong> — Garbage Collected<br><br>The Go compiler decides stack vs heap via <strong>escape analysis</strong>. Variables that "escape" a function move to the heap. The <strong>tricolor mark-and-sweep GC</strong> runs concurrently with your code.',
    rust:       '<strong style="color:#ce9178">Rust</strong> — Ownership System (no GC)<br><br>Stack for values with known size; heap via <strong>Box&lt;T&gt;, Vec, String</strong>. The <strong>ownership + borrow checker</strong> ensures memory is freed at compile time — no GC, no dangling pointers, no use-after-free.',
  };

  const infoEl = container.querySelector('#mm-info');
  const tabs   = container.querySelector('#mm-lang-tabs');
  const stack  = container.querySelector('#mm-stack');
  const heap   = container.querySelector('#mm-heap');

  // Tab switching
  tabs?.addEventListener('click', e => {
    const btn  = e.target.closest('button[data-lang]');
    if (!btn) return;
    const lang = btn.dataset.lang;

    // Update tab styles
    tabs.querySelectorAll('button').forEach(b => {
      b.style.background = b === btn ? '#569cd6' : '#252526';
      b.style.color      = b === btn ? '#fff'    : '#d4d4d4';
    });

    if (infoEl && INFO[lang]) infoEl.innerHTML = INFO[lang];
  });

  // Region hover highlights
  [stack, heap].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', () => { el.style.borderColor = '#569cd6'; });
    el.addEventListener('mouseleave', () => { el.style.borderColor = '#3e3e42'; });
    el.addEventListener('click', () => {
      const region = el.dataset.region;
      if (!infoEl) return;
      if (region === 'stack') {
        infoEl.innerHTML = `<strong style="color:#4ec9b0">Stack</strong> — LIFO, automatic lifetime<br><br>
          Function calls push a new <em>frame</em> onto the stack. When the function returns, the frame is popped and all local variables are gone. This is why you can't return a pointer to a local variable in C/C++ — it won't exist after the function returns.`;
      } else {
        infoEl.innerHTML = `<strong style="color:#ce9178">Heap</strong> — Dynamic, manual/GC lifetime<br><br>
          Memory you allocate at runtime (new, malloc, Box::new). Lives until explicitly freed (C/C++) or until the GC/ownership system determines no references remain (GC languages / Rust). Heap allocation is slower than stack due to bookkeeping overhead.`;
      }
    });
  });
}
