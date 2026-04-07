# Programming Plus

**Offline-first, project-driven gamified app for learning multiple programming languages**

Built on the CCNA Mastery template. Adapted for a multi-language programming curriculum with in-browser code execution, project-based learning, and a "Debug It" drill.

---

## Status: 🚧 In Development

| Phase | Status | Notes |
|-------|--------|-------|
| Foundation | ⬜ Not started | Fork, branding, skeleton content |
| Content Build (Python + JS) | ⬜ Not started | 1,600+ questions |
| Code Editor Engine | ⬜ Not started | CodeEditor.js, Pyodide, Lua.vm |
| Lua + C# + C++ Tracks | ⬜ Not started | 2,000+ questions |
| Go + Rust + Diagrams | ⬜ Not started | 1,300+ questions |
| Polish & Launch | ⬜ Not started | PWA, track selector, streak system |

---

## Language Tracks

| Track | Language | Difficulty | Target Audience |
|-------|----------|------------|-----------------|
| T1 | Python | Beginner | Absolute beginners, scripters |
| T2 | JavaScript | Beginner–Intermediate | Web developers |
| T3 | Lua | Beginner–Intermediate | Game scripters (Roblox, LÖVE2D) |
| T4 | C# | Intermediate | Unity devs, .NET developers |
| T5 | C++ | Intermediate–Advanced | Game engine / systems devs |
| T6 | Go | Intermediate | Backend / CLI developers |
| T7 | Rust | Advanced | Systems / WASM developers |

---

## Key Features

- **Real code execution**: Python runs via Pyodide (WASM), Lua via Lua.vm.js, JavaScript via sandboxed eval
- **Project-first learning**: every unit builds toward a mini-project; each track ends with a capstone
- **Debug It drill**: rapid-fire broken code snippets — spot and fix the bug in 5 minutes
- **Capstone Projects**: multi-phase build challenges (like boss battles, but you ship code)
- **Language XP**: separate XP pool per language track — your Python rank doesn't affect your Rust rank
- **Code notebook**: save, flag, and export your solutions and notes
- **All offline**: 100% offline PWA, no internet required after install

---

## Key Differences from CCNA Mastery

| Feature | CCNA Mastery | Programming Plus |
|---------|-------------|-----------------|
| Interactive engine | Cisco IOS CLI | In-browser Code Editor |
| Hands-on drill | IP Subnetting | Debug It (spot the bug) |
| Boss battles | CLI + MCQ gauntlet | Capstone Projects (build it) |
| Story persona | Junior network engineer | Junior developer at a game studio |
| Colour palette | Terminal green (#00ff41) | Editor dark (#1e1e1e + #569cd6) |
| Unique mechanic | Subnetting calculator | Real code execution (Pyodide/Lua WASM) |

---

## Folder Structure

```
ProgrammingPlus/
├── CLAUDE.md                    ← Project instructions for Claude Code
├── README.md                    ← This file
├── APP_TEMPLATE.md              ← Domain-agnostic architecture reference
├── data/
│   └── content.json             ← All tracks, questions, labs, projects, story beats
├── js/
│   ├── core/
│   │   ├── Store.js             ← GameState + languageXP + completedProjects extensions
│   │   ├── EventBus.js          ← Copy unchanged from CCNA Mastery
│   │   └── QuizEngine.js        ← Copy from CCNA Mastery; update track weights
│   ├── engine/
│   │   ├── CodeEditor.js        ← In-browser editor: syntax highlight, run, test ← STARTED
│   │   ├── DebugDrill.js        ← Rapid-fire bug-spotting drill (replaces Subnetting.js)
│   │   └── CapstoneBattle.js    ← Multi-phase project battle (adapts BossBattle.js)
│   ├── runtimes/
│   │   ├── PythonRuntime.js     ← Pyodide wrapper (WASM Python execution)
│   │   ├── LuaRuntime.js        ← Lua.vm.js wrapper (WASM Lua execution)
│   │   └── JSRuntime.js         ← Sandboxed JS eval with stdout capture
│   ├── diagrams/
│   │   ├── memory_model.js      ← Stack vs heap interactive diagram
│   │   ├── call_stack.js        ← Function call stack step-through
│   │   ├── type_system.js       ← Static vs dynamic typing comparison
│   │   ├── ownership.js         ← Rust ownership / borrow checker visualiser
│   │   └── lang_comparison.js   ← Feature matrix: all 7 languages side-by-side
│   └── ui/
│       ├── HUD.js               ← Copy from CCNA Mastery; add language track badge
│       └── StoryMode.js         ← Copy; update narrative tone (game studio theme)
├── css/
│   └── tailwind.js              ← Copy local Tailwind from CCNA Mastery
├── app.html                     ← App shell (copy + adapt from CCNA Mastery)
├── index.html                   ← Landing page with 7-language track cards
├── manifest.json                ← PWA manifest
└── sw.js                        ← Service worker (copy from CCNA Mastery)
```

---

## Getting Started

### Step 1 — Copy engine files from CCNA Mastery
```bash
SRC=/home/briston/test-claude-project/ccna-mastery
DST=/home/briston/ProgrammingPlus

cp $SRC/js/core/EventBus.js    $DST/js/core/
cp $SRC/js/core/Store.js       $DST/js/core/
cp $SRC/js/core/QuizEngine.js  $DST/js/core/
cp $SRC/js/engine/BossBattle.js $DST/js/engine/  # adapt as CapstoneBattle.js
cp $SRC/css/tailwind.js        $DST/css/
cp $SRC/sw.js                  $DST/
cp $SRC/manifest.json          $DST/
```

### Step 2 — Adapt Store.js
Add language-specific state extensions:
```js
// New state in Store defaults
activeTrack: 'python',
completedProjects: {},      // { 'python_capstone_u1': { score: 95, date: ... } }
debugHistory: [],           // [{ trackId, correct, timeMs, timestamp }]
codeSnippets: {},           // { 'lab_py_u1_l1': 'user saved code here' }
languageXP: {               // separate XP per track
  python: 0, javascript: 0, lua: 0,
  csharp: 0, cpp: 0, go: 0, rust: 0
},
```

### Step 3 — Adapt QuizEngine.js
Update EXAM_WEIGHTS per track (example for Python):
```js
static TRACK_WEIGHTS = {
  python: {
    'Foundations': 0.15,
    'Control Flow': 0.15,
    'Functions & Scope': 0.20,
    'Data Structures': 0.20,
    'OOP & Modules': 0.15,
    'Projects & Capstone': 0.15,
  },
  // ... repeat for each track
};
```

### Step 4 — Update app.html branding
- App name: "Programming Plus"
- Background: `#1e1e1e` (VS Code dark)
- Accent: `#569cd6` (keyword blue)
- Secondary accent: `#4ec9b0` (type green)
- Replace: Subnetting nav → Debug It nav; add Track Selector to home screen
- Update domain/track references and nav labels

### Step 5 — Start writing content.json
Target for Phase 1: Python Track U1 — 200+ questions + 5 code labs + 2 story beats.

---

## Study Resources for Content Writing

### Python
- Python.org official docs (python.org/doc)
- Automate the Boring Stuff with Python — automatetheboringstuff.com (free)
- CS50P (Harvard's Python course — free on edX)
- Real Python — realpython.com

### JavaScript
- MDN Web Docs — developer.mozilla.org
- javascript.info (The Modern JavaScript Tutorial — free)
- Eloquent JavaScript — eloquentjavascript.net (free)

### Lua
- Lua 5.4 Reference Manual — lua.org/manual/5.4
- Programming in Lua (PIL) — lua.org/pil (online edition free)
- LÖVE2D wiki — love2d.org/wiki

### C#
- Microsoft C# Documentation — learn.microsoft.com/dotnet/csharp
- Unity Learn — learn.unity.com (free)
- C# Player's Guide (book by RB Whitaker)

### C++
- cppreference.com — comprehensive standard library reference
- LearnCpp.com — free, thorough tutorial site
- C++ Core Guidelines — github.com/isocpp/CppCoreGuidelines

### Go
- A Tour of Go — tour.golang.org (official, interactive)
- Go by Example — gobyexample.com
- Effective Go — golang.org/doc/effective_go

### Rust
- The Rust Book — doc.rust-lang.org/book (official, free)
- Rustlings — interactive exercises
- Rust by Example — doc.rust-lang.org/rust-by-example

---

*Initialized: 2026-03-28*
