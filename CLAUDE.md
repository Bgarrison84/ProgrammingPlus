System Role: You are a Staff Full-Stack Developer and EdTech Instructional Designer. Your goal is to architect a high-fidelity, offline-first, project-driven gamified programming learning app called **Programming Plus**.

Task: Build on the CCNA Mastery. Adapt the engine for a multi-language programming curriculum — no Cisco CLI, no SOC workstation. Instead add an in-browser code editor with per-language execution, project scaffolding, a "Debug It" drill, and a Portfolio Projects system designed to produce GitHub-ready work that earns jobs.

Technical Stack & Constraints:
Frontend: HTML5, Tailwind CSS, Vanilla JS (ES6+ Modules).
Persistence: localStorage + IndexedDB dual-layer (Phase 10 engine).
Architecture: Pub/Sub EventBus pattern for game loop; State Pattern for the Code Editor engine.
Offline-first PWA: 100% offline, no CDN, service worker cache-first.
Content: Split JSON (meta.json + weekN.json) for progressive loading (Phase 10 pattern).
Code execution: Pyodide (Python WASM), Lua.vm.js (Lua), sandboxed JS eval for JavaScript. C++/C#/Go/Rust run against pre-validated test cases (output comparison) since full compilation is impractical offline.

---

## Git & GitHub Fundamentals (Track 0 — Required for All Learners)

Git is not optional. Every portfolio project lives on GitHub. This track is completed before picking a language track and unlocks the Portfolio Projects mode.

### Git Simulator Engine

The app includes a **Git Simulator** (`js/engine/GitSimulator.js`) — a virtual repository state machine that responds to real git commands typed in a terminal-style UI. No actual git binary required. State is:

```
virtualRepo {
  commits: [{ hash, message, author, timestamp, parent }],
  branches: { main: <hash>, feature-x: <hash> },
  HEAD: 'main',
  index: { staged: [], unstaged: [] },
  workingTree: { [filename]: content },
  remotes: { origin: { url, branches: {} } }
}
```

Supported commands (full parse + state update):
`git init`, `git status`, `git add <file>`, `git add .`, `git commit -m "msg"`,
`git log`, `git log --oneline`, `git diff`, `git diff --staged`,
`git branch`, `git branch <name>`, `git checkout <branch>`, `git checkout -b <branch>`,
`git merge <branch>`, `git rebase <branch>`,
`git remote add origin <url>`, `git push`, `git pull`, `git fetch`, `git clone <url>`,
`git stash`, `git stash pop`, `git reset HEAD <file>`, `git reset --soft HEAD~1`,
`git revert <hash>`, `git tag <name>`, `git cherry-pick <hash>`

Conflict simulation: merging two branches that edited the same file produces conflict markers in `workingTree`; learner must resolve manually then `git add` + `git commit`.

### Track 0 Units

**G-U1 — Version Control Fundamentals** (maps to week 1)
- What is version control and why it exists (diff from "save as v2")
- The three trees: working directory, staging area (index), commit history
- `git init`, `git status`, `git add`, `git commit`, `git log`
- Writing good commit messages (imperative mood, 50-char subject, body if needed)
- `.gitignore` — what to ignore and why (secrets, build artefacts, OS files)
- Lab G1: Init a repo, make 5 meaningful commits, view log

**G-U2 — Branching & Merging** (maps to week 2)
- What a branch is (just a pointer to a commit)
- `git branch`, `git checkout -b`, `git merge`
- Fast-forward vs 3-way merge — when each happens and why
- Merge conflicts: reading conflict markers, resolving, completing the merge
- `git rebase` — what it does and when NOT to use it (shared branches)
- `git stash` — park changes without committing
- Lab G2: Create a feature branch, make commits, merge back, resolve a simulated conflict

**G-U3 — Remote Repositories & GitHub** (maps to week 3)
- `git remote add origin`, `git push -u origin main`, `git pull`, `git fetch`
- Clone vs fork — when to use each
- Pull Request workflow: fork → branch → commit → push → open PR → review → merge
- Branch protection rules and why main should be protected
- Rebasing a feature branch onto updated main before a PR
- Lab G3: Simulate push/pull cycle; open a PR in the simulated GitHub UI

**G-U4 — GitHub Features & Best Practices** (maps to week 4)
- README.md: what makes a great README (description, demo GIF, install, usage, contributing, licence)
- GitHub Issues: bug reports, feature requests, issue templates
- GitHub Actions: what CI/CD is; anatomy of a workflow YAML; trigger on push → run tests
- GitHub Pages: deploy a static site from a repo in 2 steps
- Semantic versioning (v1.2.3 — major.minor.patch) and git tags
- Repository hygiene: small focused PRs, conventional commits, changelog
- Lab G4: Write a README for a project; read and interpret a GitHub Actions workflow file

### Track 0 Questions (200+ total)

Topics covered across 200+ MCQ, T/F, drag-drop, and scenario questions:

| Topic | Count | Types |
|---|---|---|
| Core concepts (VCS purpose, staging, HEAD, SHA) | 30 | MC, T/F |
| Commit workflow (add → commit → log → diff) | 25 | MC, scenario |
| Branching model (branch, checkout, merge, rebase) | 30 | MC, drag-drop |
| Conflict resolution | 20 | scenario (3-sub-Q) |
| Remote operations (push, pull, fetch, clone) | 25 | MC, scenario |
| GitHub workflow (fork, PR, review, merge) | 25 | MC, drag-drop |
| GitHub Actions (YAML anatomy, triggers, jobs, steps) | 20 | MC, scenario |
| Best practices (commit messages, .gitignore, README, tags) | 25 | MC, T/F |

**Drag-drop sets** (ordering exercises):
- Correct order of a feature branch workflow (branch → commit → push → PR → review → merge)
- Resolving a merge conflict step-by-step
- Git object model: blob → tree → commit → branch → HEAD
- GitHub Actions pipeline stages: trigger → checkout → install → test → deploy
- Semantic version bumping rules (major/minor/patch scenarios)

**Scenario questions** (3 sub-questions each, 5 scenarios):
1. "You accidentally committed a secret API key to main. What do you do?" (remove → rewrite history → rotate key → force-push → notify team)
2. "Your feature branch is 30 commits behind main. A teammate's PR broke your code. Walk through the fix."
3. "You need to undo the last commit but keep the changes staged. Which command?"
4. "A pull request has a merge conflict. Walk through resolving it on GitHub vs locally."
5. "You pushed to the wrong branch. How do you move those commits to the right branch?"

### Track 0 Portfolio Project

**GIT-P1: Developer Profile & First Repository** — 200 XP · 2–3 hrs · Unlocks Portfolio mode
- Create a GitHub profile README (`github.com/username/username`): animated header, skills badges, GitHub stats card, pinned repos, "Currently Learning" section
- Set up a pinned repository for one completed lab/project with full README
- Add a `.github/workflows/greet.yml` — a GitHub Action that comments "Thanks for opening this issue!" on new issues
- Tag the first release as `v0.1.0`; add `LICENSE` and `.gitignore` to every repo
- Resume bullet: "Maintained developer GitHub profile with pinned projects, custom profile README with badges, and CI workflows across multiple repositories."
- Interview: "Walk me through what happens between `git push` and a GitHub Actions run completing."
- GitHub topics: `github-profile` `readme` `github-actions` `portfolio`

---

## Language Tracks

| Track | Language | Focus | Difficulty | Career Target |
|-------|----------|-------|------------|---------------|
| T1 | Python | Scripting, automation, data, backend | Beginner | Data analyst, backend dev, automation engineer |
| T2 | JavaScript | Web interactivity, DOM, APIs, Node | Beginner–Intermediate | Frontend dev, full-stack dev |
| T3 | Lua | Game scripting (Roblox/LÖVE2D) | Beginner–Intermediate | Game dev, modding, embedded scripting |
| T4 | C# | Unity game dev, .NET apps, WPF | Intermediate | Game dev, .NET developer, enterprise dev |
| T5 | C++ | Systems, game engines, performance | Intermediate–Advanced | Systems programmer, game engine dev, embedded |
| T6 | Go | Backend services, CLIs, concurrency | Intermediate | Backend dev, DevOps/platform engineer, SRE |
| T7 | Rust | Memory safety, systems, WebAssembly | Advanced | Systems programmer, WebAssembly dev, security engineer |

Each track has 6 units (U1–U6). Units map to `week` in the content schema.

---

## Curriculum Units per Track

**Unit 1 — Foundations**
- Variables, types, and operators
- Input / output basics
- Comments and code style
- Your first program: Hello, World → small interactive script

**Unit 2 — Control Flow**
- Conditionals (if / else / switch/match)
- Loops (for, while, do-while)
- Nested logic and short-circuit evaluation
- Mini-project: Number guessing game

**Unit 3 — Functions & Scope**
- Function declaration, parameters, return values
- Scope rules (local, global, closures where relevant)
- Recursion basics
- Mini-project: Calculator with function library

**Unit 4 — Data Structures**
- Arrays / lists / vectors
- Dictionaries / maps / hash tables
- Strings and string manipulation
- Mini-project: Contact book / inventory system

**Unit 5 — Object-Oriented / Modular Patterns**
- Structs, classes, interfaces (language-dependent)
- Encapsulation, inheritance, polymorphism
- Modules and file organisation
- Mini-project: RPG character system

**Unit 6 — Projects & Capstone**
- Error handling and debugging
- File I/O and external data
- Working with libraries / packages
- Capstone project: Full mini-app (game, CLI tool, or web component)

---

## Core Module Requirements

### Code Editor Engine (replaces Terminal.js / AnalystWorkstation.js)
An in-browser code editor supporting:
- **Syntax-highlighted textarea** (no external libs — CSS class-based colouring via tokeniser)
- **Run button**: executes code against the active runtime (Pyodide / Lua.vm / JS eval)
- **Test runner**: compares stdout against `expectedOutput[]` in the lab spec
- **Diff view**: shows actual vs expected output when tests fail
- **Hint system**: progressive hints (1 → 2 → 3) before showing solution
- Commands: `run`, `test`, `reset`, `hint`, `solution` (solution costs XP)
- `validate()` compares actual output / state against `expectedOutput` or `testCases[]`
- **Export button**: downloads learner's code as a properly-named source file

### Debug It Drill (replaces Subnetting / Alert Triage)
- Rapid-fire: shown 10 broken code snippets in 5 minutes
- Spot the bug: choose the correct fix from 4 options
- Score: accuracy % + speed bonus
- Languages rotate based on active track

### Portfolio Projects Mode (core differentiator)
- Distinct from Capstone quizzes — these are **real, GitHub-uploadable projects**
- Each project has: brief, learning objectives, recruiter card, folder structure, phase guide
- **Guided mode**: step-by-step phase unlocks with in-app code editor and test validation
- **Challenge mode**: brief + folder structure only — learner codes it outside the app
- **GitHub Export**: downloads a zip with `src/`, `README.md` (pre-filled), and `.gitignore`
- **Recruiter card**: one-sentence resume bullet + talking points for interviews
- Portfolio screen shows a card wall — completed projects show a green "Portfolio Ready" badge
- See §Portfolio Projects Catalogue below for the full project list

### Store Extensions (beyond CCNA Phase 10 base)
- `activeTrack: 'python'` — currently selected language track
- `portfolioProjects: {}` — per-project phase completion, mode (guided/challenge), date
- `debugHistory: []` — Debug It drill results for accuracy trending
- `codeSnippets: {}` — saved learner code per lab (persists across sessions)
- `languageXP: {}` — separate XP pool per language track
- `earnedBadges: []` — portfolio badges (Junior Dev, API Builder, etc.)

### Content Schema Extensions

**Code Lab:**
```json
{
  "id": "lab_py_u3_reverse_string",
  "type": "code_lab",
  "track": "python",
  "unit": 3,
  "title": "Reverse a String",
  "difficulty": "easy",
  "xp": 40,
  "starter_code": "def reverse_string(s):\n    # TODO: return s reversed\n    pass",
  "test_cases": [
    { "input": "hello", "expected_output": "olleh" },
    { "input": "racecar", "expected_output": "racecar" },
    { "input": "", "expected_output": "" }
  ],
  "hints": ["Python slicing can reverse a sequence", "Try s[::-1]"],
  "solution": "def reverse_string(s):\n    return s[::-1]",
  "concepts": ["strings", "slicing", "functions"],
  "explanation": "Slice notation s[start:stop:step] — a step of -1 traverses backwards."
}
```

**Debug Drill:**
```json
{
  "id": "debug_js_u2_loop",
  "type": "debug_drill",
  "track": "javascript",
  "unit": 2,
  "broken_code": "for (let i = 0; i <= 10; i++) {\n  console.log(i);\n}",
  "bug_description": "Loop runs 11 times instead of 10",
  "options": [
    "Change <= to <",
    "Change i++ to i--",
    "Start i at 1",
    "Change let to var"
  ],
  "correct_fix_index": 0,
  "explanation": "i <= 10 includes 10 itself, producing values 0–10 (11 iterations). Use i < 10 for exactly 10."
}
```

**Portfolio Project:**
```json
{
  "id": "portfolio_py_weather_cli",
  "type": "portfolio_project",
  "track": "python",
  "tier": "junior",
  "title": "Weather CLI",
  "tagline": "Fetch live weather data from an API and display it in the terminal.",
  "recruiter_card": {
    "resume_bullet": "Built a Python CLI tool that fetches live weather via REST API with error handling and caching.",
    "skills_demonstrated": ["REST API consumption", "JSON parsing", "CLI argument parsing (argparse)", "Error handling", "Environment variables for secrets"],
    "interview_talking_points": [
      "Why did you choose argparse over sys.argv?",
      "How would you cache results to avoid hitting the API on every call?",
      "How do you handle API key security — what would you never do?"
    ]
  },
  "phases": [
    { "id": "p1", "title": "Project setup & API exploration", "type": "guided" },
    { "id": "p2", "title": "Fetch and parse weather JSON", "type": "code" },
    { "id": "p3", "title": "Add CLI arguments with argparse", "type": "code" },
    { "id": "p4", "title": "Error handling + friendly messages", "type": "code" },
    { "id": "p5", "title": "Write README.md", "type": "guided" }
  ],
  "folder_structure": "weather-cli/\n├── weather.py\n├── .env.example\n├── requirements.txt\n└── README.md",
  "github_topics": ["python", "cli", "weather-api", "rest-api", "argparse"],
  "xp": 400,
  "badge": "API Wrangler"
}
```

---

## Portfolio Projects Catalogue

### Design Principles
Every portfolio project must:
1. **Be runnable** — a recruiter/interviewer can clone it and run it in under 2 minutes
2. **Have a good README** — project description, demo GIF or screenshot placeholder, install steps, usage, tech stack, and what you learned
3. **Demonstrate one job-relevant skill clearly** — not a "show everything" project
4. **Be completable in one session** (Junior: 2–4 hrs · Mid: 4–8 hrs · Senior: 8–16 hrs)
5. **Tell a story** — each project has a recruiter card with a resume bullet and interview talking points

Projects are tiered: **Junior** (0–1 yr experience signal) → **Mid** (1–3 yr) → **Senior** (3+ yr). Build in order — each tier assumes the previous is on your GitHub.

---

### Python Track Portfolio (14 projects)

#### Junior Tier

**PY-J1: Number Cruncher CLI** — 250 XP · 2–3 hrs
A CLI calculator that reads math expressions, handles order of operations, and supports variables (e.g., `x = 5`, then `x * 3`).
- Skills: Parsing, REPL loop, string → AST evaluation, error handling
- Resume bullet: "Built a CLI math REPL in Python supporting variables and order of operations."
- Interview: "How would you extend this to support functions like `sqrt()`?"
- GitHub topics: `python` `cli` `repl` `parsing`

**PY-J2: File Organiser** — 300 XP · 2–3 hrs
A script that scans a directory and moves files into subfolders by extension (`.jpg → Images/`, `.pdf → Documents/`, etc.). Supports dry-run mode (`--dry-run`) that prints what it would do without moving anything.
- Skills: `os` / `pathlib`, `argparse`, file I/O, real-world automation
- Resume bullet: "Automated file organisation with Python using pathlib; reduced manual sorting time by 90%."
- Interview: "What edge cases did you handle? (hidden files, duplicates, permission errors)"
- GitHub topics: `python` `automation` `file-management` `cli` `pathlib`

**PY-J3: Weather CLI** — 350 XP · 3–4 hrs
Fetch current weather + 3-day forecast from OpenWeatherMap API (free tier). Display in a clean terminal layout with colour codes (hot = red, cold = blue). Cache results to a JSON file to avoid repeated API calls.
- Skills: `requests`, JSON parsing, `argparse`, environment variables for API keys, caching, error handling
- Resume bullet: "Python CLI tool consuming a REST API with response caching and graceful error handling."
- Interview: "How do you store your API key securely? What's wrong with hardcoding it?"
- GitHub topics: `python` `cli` `weather-api` `rest-api` `json-cache`

**PY-J4: CSV Data Reporter** — 350 XP · 3–4 hrs
Takes any CSV as input; outputs: row count, column types, min/max/mean for numeric columns, most-common value for string columns, and a summary report saved as `report.txt`.
- Skills: `csv` module (no pandas — shows you know the standard lib), data analysis logic, report generation
- Resume bullet: "CLI data analysis tool processing arbitrary CSVs without external dependencies."
- Interview: "When would you use pandas instead of the csv module? What's the trade-off?"
- GitHub topics: `python` `csv` `data-analysis` `cli` `reporting`

#### Mid Tier

**PY-M1: Task Manager REST API** — 500 XP · 5–6 hrs
A FastAPI app with full CRUD for tasks (`/tasks`, `/tasks/{id}`). Tasks stored in SQLite via SQLModel. Endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`. Includes Pydantic validation + OpenAPI docs at `/docs`.
- Skills: FastAPI, Pydantic, SQLite/SQLModel, REST design, HTTP status codes
- Resume bullet: "Built a RESTful task API with FastAPI + SQLite, including validation, error handling, and auto-generated OpenAPI docs."
- Interview: "What's the difference between 422 and 400? When would you return each?"
- GitHub topics: `python` `fastapi` `rest-api` `sqlite` `pydantic`

**PY-M2: Web Scraper + Dataset** — 500 XP · 5–7 hrs
Scrape a public site (e.g., Hacker News, a Wikipedia list, a job board's public page) and produce a clean JSON dataset. Handle pagination, rate-limit politely (sleep between requests), and save progress so it can resume after interruption.
- Skills: `requests` + `BeautifulSoup`, pagination logic, resume-from-checkpoint, data cleaning
- Resume bullet: "Built a resumable web scraper in Python that scraped N records across M pages with polite rate-limiting."
- Interview: "How do you avoid getting rate-limited or blocked? What ethical considerations apply?"
- GitHub topics: `python` `web-scraping` `beautifulsoup` `data-collection`

**PY-M3: Discord Bot** — 600 XP · 6–8 hrs
A Discord bot with 5+ slash commands: `!help`, `!poll <question> <opt1> <opt2>`, `!remind <time> <message>`, `!trivia`, `!define <word>` (hits a dictionary API). Persists poll votes and reminders to a JSON file.
- Skills: `discord.py`, async/await, slash commands, event handling, background tasks, JSON persistence
- Resume bullet: "Built a Discord bot with poll, reminder, and trivia commands using discord.py; handles 5 slash commands with persistent state."
- Interview: "What's the difference between a command and an event in discord.py?"
- GitHub topics: `python` `discord-bot` `discord-py` `async` `slash-commands`

**PY-M4: Automated Report Generator** — 550 XP · 5–7 hrs
Script that reads sales data from CSV, computes weekly totals and trends, and generates a formatted PDF report with charts using `reportlab` or `fpdf2`. Schedulable via cron or `schedule` library.
- Skills: data aggregation, PDF generation, scheduling, `matplotlib` for chart → image → embed
- Resume bullet: "Automated weekly sales reporting from CSV data to PDF with embedded charts, schedulable via cron."
- Interview: "How would you deploy this to run automatically in the cloud on a schedule?"
- GitHub topics: `python` `automation` `pdf-generation` `data-visualization` `reporting`

#### Senior Tier

**PY-S1: Async Web Scraper Pipeline** — 800 XP · 8–12 hrs
An async scraper using `aiohttp` + `asyncio` that fetches 100+ URLs concurrently with a semaphore-based rate limiter. Results stream into a producer-consumer queue, processed by worker coroutines, and saved to SQLite. Includes progress bar via `tqdm`.
- Skills: `asyncio`, `aiohttp`, semaphores, producer-consumer pattern, concurrent I/O
- Resume bullet: "Async scraping pipeline in Python using asyncio + aiohttp; processes 100 URLs concurrently with semaphore rate-limiting and SQLite persistence."
- Interview: "What's the difference between threading, multiprocessing, and asyncio? When would you use each?"
- GitHub topics: `python` `asyncio` `aiohttp` `web-scraping` `concurrency`

**PY-S2: CLI Tool with Proper Packaging** — 700 XP · 8–10 hrs
A useful CLI tool (e.g., a `git` log formatter, a code stats counter, a markdown linter) packaged properly with `pyproject.toml`, installable via `pip install .`, with entry points, a `tests/` directory using `pytest`, and a GitHub Actions workflow that runs tests on push.
- Skills: `pyproject.toml`, entry points, `pytest`, CI/CD (GitHub Actions), packaging best practices
- Resume bullet: "Packaged a Python CLI tool for pip distribution with pyproject.toml, pytest test suite, and GitHub Actions CI."
- Interview: "What's in pyproject.toml? How does it replace setup.py? What's a wheel?"
- GitHub topics: `python` `cli-tool` `packaging` `pyproject-toml` `github-actions`

**PY-S3: ML Model + FastAPI Serving** — 900 XP · 10–14 hrs
Train a simple ML model (e.g., scikit-learn: sentiment classifier on a public dataset, or a regression model). Serialize it with `joblib`. Serve predictions via a FastAPI endpoint. Add an HTML form frontend that submits to the API. Include model metrics in the README.
- Skills: `scikit-learn`, `joblib`, FastAPI, model serialization, REST + HTML integration, ML metrics (accuracy, F1)
- Resume bullet: "End-to-end ML pipeline: trained sentiment classifier, serialized with joblib, served via FastAPI REST endpoint with HTML frontend."
- Interview: "What's overfitting? How would you detect and prevent it in your model?"
- GitHub topics: `python` `machine-learning` `fastapi` `scikit-learn` `nlp`

#### Library Tier — Python (real libraries, real projects)

**PY-L1: Pygame — 2D Space Shooter** — 450 XP · 5–7 hrs · Library: `pygame`
A top-down space shooter: player ship (mouse/keyboard), bullet firing, enemy waves that increase in speed, collision detection, health bar, score, game-over screen, high-score file. Sprite classes extend `pygame.sprite.Sprite`. Sound effects via `pygame.mixer`.
- Skills: `pygame` game loop, `pygame.sprite.Group`, collision with `spritecollide`, `pygame.mixer`, sprite sheets
- Resume bullet: "2D space shooter in Python/pygame with sprite groups, collision detection, wave-based enemies, sound effects, and high-score persistence."
- Interview: "What's a sprite group and why is it better than manually iterating a list of sprites?"
- GitHub topics: `python` `pygame` `game-dev` `sprite` `2d-game`

**PY-L2: Pygame — Platformer with Tiled Maps** — 600 XP · 7–9 hrs · Library: `pygame` + `pytmx`
A side-scrolling platformer: character controller (run, jump, coyote-time, wall-slide), animated sprites (spritesheet slicing), Tiled map loading via `pytmx`, scrolling camera, coin collectibles, 3 levels, main menu + pause.
- Skills: `pytmx`, spritesheet animation, scrolling camera math, Tiled map workflow, game state FSM
- Resume bullet: "Side-scrolling platformer in pygame with Tiled map levels, spritesheet animation, scrolling camera, and wall-slide mechanics."
- Interview: "How does a scrolling camera work? (render objects relative to a camera offset, not absolute screen coords)"
- GitHub topics: `python` `pygame` `platformer` `tiled-maps` `spritesheet` `game-dev`

**PY-L3: Tkinter — Desktop Budget App** — 400 XP · 4–6 hrs · Library: `tkinter`
A desktop budget tracker with: add/edit/delete transactions, category filter, monthly summary chart (Tkinter Canvas bar chart — no matplotlib), export to CSV, persistent SQLite storage. Uses `ttk` widgets for a modern look.
- Skills: `tkinter`, `ttk`, `sqlite3`, `Canvas` drawing for charts, event-driven GUI architecture, CRUD UI patterns
- Resume bullet: "Desktop budget app in Python/Tkinter with SQLite persistence, category filtering, a custom Canvas bar chart, and CSV export — zero external GUI dependencies."
- Interview: "What's the event loop in Tkinter? Why can't you do long-running operations on the main thread?"
- GitHub topics: `python` `tkinter` `sqlite` `desktop-app` `budget-tracker` `gui`

**PY-L4: Pillow — Batch Image Processor** — 350 XP · 3–4 hrs · Library: `Pillow`
A CLI tool that processes a folder of images: resize to a target resolution, convert formats (PNG → JPG), apply filters (greyscale, blur, sharpen, watermark), and output a contact sheet (grid of thumbnails). Handles EXIF rotation.
- Skills: `PIL.Image`, `ImageFilter`, `ImageDraw`, `ImageFont`, thumbnail generation, EXIF data (`_getexif`)
- Resume bullet: "Batch image processor in Python/Pillow: resize, format-convert, apply filters, watermark, and generate thumbnail contact sheets from a CLI."
- Interview: "What is EXIF data? Why do photos sometimes appear rotated when displayed programmatically?"
- GitHub topics: `python` `pillow` `image-processing` `cli` `batch-processing`

**PY-L5: Pandas + Matplotlib — Data Story** — 500 XP · 5–7 hrs · Libraries: `pandas`, `matplotlib`, `seaborn`
Pick a public dataset (e.g., Netflix titles, Spotify charts, world population). Produce a 5-page analysis: load → clean → explore → visualise (3+ chart types: line, bar, heatmap) → write findings as a Jupyter-style markdown report saved to `report/`. Reproducible via a single `python analyse.py` run.
- Skills: `pandas` (groupby, merge, fillna, pivot_table), `matplotlib` subplots, `seaborn` heatmap, markdown report generation
- Resume bullet: "Reproducible data analysis pipeline in pandas/matplotlib/seaborn — cleaned and visualised [dataset] with 3 chart types and a written findings report."
- Interview: "What's the difference between `groupby().agg()` and `pivot_table()`?"
- GitHub topics: `python` `pandas` `matplotlib` `seaborn` `data-analysis` `data-visualization`

**PY-L6: Flask — Full Web App** — 650 XP · 7–9 hrs · Library: `Flask`
A link-bookmark manager web app: user auth (Flask-Login, bcrypt), add/edit/delete bookmarks with tags, search, tag filter, paginated list. SQLite via Flask-SQLAlchemy. Jinja2 templates. Bootstrap 5 for styling. Deployed to a free host (Render or Railway) — the README links to the live app.
- Skills: Flask routing, Jinja2 templates, Flask-Login, Flask-SQLAlchemy, pagination, deployment
- Resume bullet: "Flask web app with user auth, CRUD bookmarks with tag filtering and search, SQLAlchemy/SQLite, and deployed to Render."
- Interview: "What's the difference between Flask-Login's `current_user` and a session cookie? How does Flask-Login know who is logged in?"
- GitHub topics: `python` `flask` `web-app` `flask-login` `sqlalchemy` `sqlite` `deployed`

**PY-L7: OpenCV — Motion Detector** — 550 XP · 5–7 hrs · Library: `opencv-python`
Reads a webcam stream (or a video file). Detects motion between frames using frame-differencing + contour detection. Draws bounding boxes around moving objects. Saves short video clips when motion is detected. Displays FPS counter and motion status in the frame.
- Skills: `cv2.VideoCapture`, frame differencing, Gaussian blur, thresholding, contour detection, `cv2.VideoWriter`
- Resume bullet: "Motion detector in Python/OpenCV using frame differencing and contour detection — automatically clips and saves motion events from a video stream."
- Interview: "Why apply a Gaussian blur before frame differencing? What does it remove?"
- GitHub topics: `python` `opencv` `computer-vision` `motion-detection` `video-processing`

---

### JavaScript Track Portfolio (12 projects + library tier)

#### Junior Tier

**JS-J1: Quiz App** — 250 XP · 2–3 hrs
A 10-question trivia quiz entirely in vanilla JS. Questions stored in a JS array. Randomised order each run. Score tracked. Results screen shows correct/incorrect breakdown. Zero frameworks, zero libraries.
- Skills: DOM manipulation, event listeners, state management without a framework, CSS transitions
- Resume bullet: "Vanilla JS quiz app with randomised questions, live score tracking, and animated result reveal — no frameworks."
- Interview: "Why would you choose vanilla JS over React for something this small?"
- GitHub topics: `javascript` `vanilla-js` `dom` `quiz-app`

**JS-J2: Expense Tracker** — 300 XP · 3–4 hrs
Track income and expenses. Add/delete entries with description, amount, category. Totals update live. Data persists in `localStorage`. Export to CSV button. Clean, mobile-responsive CSS.
- Skills: DOM, `localStorage`, array methods (filter/reduce), CSV generation via Blob, responsive CSS
- Resume bullet: "Expense tracker app using vanilla JS with localStorage persistence and CSV export — no build tools or frameworks."
- Interview: "What are the limits of localStorage? How would you upgrade to a database backend?"
- GitHub topics: `javascript` `expense-tracker` `localstorage` `pwa-ready`

**JS-J3: Markdown Previewer** — 300 XP · 2–3 hrs
A split-pane editor: left pane is a `<textarea>`, right pane renders live Markdown preview using a hand-rolled Markdown parser (headers, bold, italic, code blocks, links). No marked.js — write the regex yourself.
- Skills: regex, DOM, live event handlers, parsing, CSS layout (flexbox/grid)
- Resume bullet: "Live Markdown previewer with a hand-written regex-based parser — demonstrates understanding of parsing without library dependency."
- Interview: "What's the hardest Markdown feature to parse? (Answer: nested structures, table alignment)"
- GitHub topics: `javascript` `markdown` `parser` `live-preview` `vanilla-js`

#### Mid Tier

**JS-M1: Real-Time Chat (WebSockets)** — 600 XP · 6–8 hrs
Frontend: vanilla JS WebSocket client, message list, username prompt. Backend: Node.js `ws` server that broadcasts messages to all connected clients. Support: join/leave notifications, message history (last 50, stored in memory). No React, no Socket.io — raw WebSockets.
- Skills: WebSocket API (client + server), Node.js, broadcast pattern, connection lifecycle
- Resume bullet: "Real-time chat app using raw WebSockets (client + Node.js server); supports N concurrent users with join/leave events and message history."
- Interview: "What's the difference between HTTP polling, long-polling, and WebSockets? When would you use each?"
- GitHub topics: `javascript` `nodejs` `websockets` `real-time` `chat`

**JS-M2: Browser Extension** — 550 XP · 5–7 hrs
A useful Chrome/Firefox extension (ideas: tab counter + manager, reading time estimator, colour picker for any webpage, focus mode that blocks distracting sites). Has a popup UI, uses `chrome.storage` for settings, and a background service worker.
- Skills: Extension manifest v3, `chrome.storage`, service workers, popup HTML/JS, content scripts, permissions model
- Resume bullet: "Published a browser extension using Manifest v3 with storage API, popup UI, and content script injection."
- Interview: "What's the difference between a content script and a background service worker?"
- GitHub topics: `javascript` `chrome-extension` `browser-extension` `manifest-v3`

**JS-M3: Data Visualisation Dashboard** — 650 XP · 6–8 hrs
Fetch a public JSON dataset (e.g., GitHub trending repos, COVID data, weather history). Render: a bar chart, a line chart, and a pie chart — all drawn on `<canvas>` with vanilla JS (no Chart.js). Filterable by date range or category. Responsive.
- Skills: `<canvas>` 2D API, `fetch`, data transformation, chart math (scaling, axes), responsive canvas
- Resume bullet: "Data dashboard with 3 chart types drawn on HTML5 Canvas from scratch — no charting libraries."
- Interview: "What's the coordinate system of the Canvas API? How do you handle DPI scaling for sharp rendering?"
- GitHub topics: `javascript` `canvas` `data-visualization` `charts` `dashboard`

**JS-M4: Offline-First PWA** — 700 XP · 7–9 hrs
A useful app (e.g., recipe manager, reading list, flashcard app) that works fully offline. Implements: service worker with cache-first strategy, `manifest.json` for installability, IndexedDB for data, background sync for queued actions when back online.
- Skills: Service Worker lifecycle, Cache API, IndexedDB, Web App Manifest, background sync
- Resume bullet: "Offline-first PWA with service worker cache-first strategy, IndexedDB storage, and background sync — installable on mobile."
- Interview: "What's the difference between cache-first and network-first strategies? When would you use each?"
- GitHub topics: `javascript` `pwa` `service-worker` `indexeddb` `offline-first`

#### Senior Tier

**JS-S1: Micro-Framework** — 800 XP · 8–12 hrs
Build a ~100-line reactive UI framework (virtual DOM diffing, component model, state binding). Then use it to build a todo app and a real-time clock to prove it works. Document the design decisions in the README.
- Skills: Virtual DOM, diffing algorithm, reactive state, closure-based components, performance trade-offs
- Resume bullet: "Implemented a 100-line reactive UI micro-framework with virtual DOM diffing and component model — demonstrates deep understanding of how React/Vue work under the hood."
- Interview: "Walk me through your diffing algorithm. What's O(n) diffing vs O(n²)?"
- GitHub topics: `javascript` `virtual-dom` `micro-framework` `reactivity` `compiler`

**JS-S2: Node.js REST API + Auth** — 900 XP · 10–14 hrs
Express.js API with: user registration + login (bcrypt passwords, JWT tokens), protected routes (middleware), SQLite database (via `better-sqlite3`), input validation (no external validator — write your own), rate limiting, and a Postman/Bruno collection for testing all endpoints.
- Skills: Express.js, JWT, bcrypt, SQLite, middleware pattern, API design, security fundamentals
- Resume bullet: "REST API in Node.js/Express with JWT auth, bcrypt password hashing, SQLite, custom input validation, and rate limiting."
- Interview: "Where do you store the JWT secret? What happens if it leaks? What's a refresh token?"
- GitHub topics: `nodejs` `express` `jwt` `rest-api` `sqlite` `authentication`

#### Library Tier — JavaScript

**JS-L1: Three.js — 3D Solar System** — 500 XP · 5–7 hrs · Library: `Three.js`
An interactive 3D solar system: sun at centre, 8 planets orbiting with correct relative sizes and orbital speeds, moons for Earth and Jupiter, asteroid belt (instanced mesh for performance), click-to-focus camera animation, planet info panel on click.
- Skills: Three.js scene/camera/renderer, `InstancedMesh`, orbit controls, raycasting for clicks, animation loop, `PerspectiveCamera` transitions
- Resume bullet: "Interactive 3D solar system in Three.js with instanced asteroid belt, click-to-focus camera, and planet info panels — demonstrates 3D web graphics."
- Interview: "What's the difference between a PerspectiveCamera and an OrthographicCamera? When would you use each?"
- GitHub topics: `javascript` `threejs` `3d` `webgl` `solar-system` `interactive`

**JS-L2: p5.js — Generative Art Portfolio** — 400 XP · 4–5 hrs · Library: `p5.js`
Build 5 generative art sketches: (1) Perlin noise flow field, (2) recursive fractal tree (mouse controls branching angle), (3) particle system with gravity + bounce, (4) Conway's Game of Life with custom colour themes, (5) audio visualiser reacting to mic input. Each sketch is a separate p5 instance on one page.
- Skills: `p5.js` draw loop, Perlin noise, recursion, particle physics, cellular automata, `p5.AudioIn` + FFT
- Resume bullet: "Generative art portfolio of 5 p5.js sketches: Perlin flow field, fractal tree, particle physics, Conway's Life, and live audio visualiser — demonstrates creative coding."
- Interview: "What's Perlin noise and how does it differ from `Math.random()`?"
- GitHub topics: `javascript` `p5js` `generative-art` `creative-coding` `canvas`

**JS-L3: D3.js — Interactive Data Dashboard** — 600 XP · 6–8 hrs · Library: `D3.js`
A 3-panel data dashboard using D3 v7: (1) zoomable line chart with brush-to-select time range, (2) force-directed graph of connected nodes (drag nodes, click to highlight connections), (3) animated choropleth map using TopoJSON. All three charts respond to a shared filter dropdown.
- Skills: D3 scales/axes, zoom + brush, `forceSimulation`, `geoPath` + `geoMercator`, TopoJSON, data join (enter/update/exit)
- Resume bullet: "D3.js data dashboard with a zoomable line chart, force-directed graph, and animated choropleth map — all linked by a shared filter."
- Interview: "Explain D3's data join pattern: enter, update, exit. Why does it exist?"
- GitHub topics: `javascript` `d3js` `data-visualization` `svg` `interactive-charts` `dashboard`

**JS-L4: Phaser 3 — Side-Scrolling Game** — 600 XP · 6–8 hrs · Library: `Phaser 3`
A side-scrolling action game: player with run/jump/attack animations (spritesheet), Tiled tilemap levels, enemy patrol AI (FSM: patrol → chase → attack), pickups (coins, health), physics-based platforms, camera follow, HUD (hearts + score), scene management (Menu → Game → GameOver).
- Skills: Phaser 3 scene lifecycle, `Arcade Physics`, `StaticGroup` tilemaps, `AnimationManager`, FSM enemy AI, Tiled integration
- Resume bullet: "Side-scrolling action game in Phaser 3 with FSM enemy AI, Tiled tilemap levels, spritesheet animation, and scene management."
- Interview: "What's the difference between Arcade Physics and Matter.js in Phaser? When would you choose Matter.js?"
- GitHub topics: `javascript` `phaser3` `game-dev` `2d-game` `tilemap` `arcade-physics`

**JS-L5: Socket.io — Multiplayer Drawing App** — 650 XP · 6–8 hrs · Libraries: `Socket.io`, `Express`
A collaborative whiteboard: multiple users draw on a shared canvas in real time. Features: colour picker, brush size, eraser, undo (last 10 strokes per user), clear canvas (broadcast), room system (each room has its own canvas state), user list with presence indicators.
- Skills: Socket.io rooms, event broadcasting, canvas drawing API, real-time state sync, presence detection (connect/disconnect events)
- Resume bullet: "Real-time multiplayer whiteboard using Socket.io with room isolation, undo, and user presence — 5 simultaneous users tested."
- Interview: "What's the difference between `socket.emit`, `socket.broadcast.emit`, and `io.to(room).emit`?"
- GitHub topics: `javascript` `socketio` `real-time` `collaborative` `canvas` `multiplayer`

---

### Go Track Portfolio (10 projects + library tier)

#### Junior Tier

**GO-J1: CLI Task Manager** — 300 XP · 3–4 hrs
Command-line task manager: `task add "Buy milk"`, `task list`, `task done 2`, `task delete 2`. Data stored in `~/.tasks.json`. Built with `cobra` CLI framework. Coloured output with `fatih/color`.
- Skills: cobra, JSON file I/O, flag parsing, struct marshalling, cross-platform paths
- Resume bullet: "CLI task manager in Go using cobra framework with JSON file persistence and coloured terminal output."
- Interview: "Why Go for a CLI tool? Compare to Python's argparse."
- GitHub topics: `go` `cli` `cobra` `task-manager` `json`

**GO-J2: URL Shortener Service** — 350 XP · 3–4 hrs
HTTP server (no framework) that exposes: `POST /shorten` (returns a short code), `GET /{code}` (redirects). Stores mappings in an in-memory map (protected by `sync.RWMutex` for concurrency). Custom 404 page. Logs all requests.
- Skills: `net/http`, goroutine safety, `sync.RWMutex`, HTTP redirects, middleware (logging)
- Resume bullet: "URL shortener HTTP service in Go using only the standard library with concurrent-safe in-memory store."
- Interview: "Why do you need a mutex here? What would happen without it?"
- GitHub topics: `go` `http-server` `url-shortener` `concurrency` `stdlib`

#### Mid Tier

**GO-M1: REST API with SQLite** — 600 XP · 6–8 hrs
A book-tracking API: `GET/POST /books`, `GET/PUT/DELETE /books/{id}`. Uses `database/sql` + `mattn/go-sqlite3`. Input validated with struct tags + a small validator. Structured JSON logging with `slog`. Graceful shutdown on SIGTERM.
- Skills: `database/sql`, `gorilla/mux` or stdlib routing, JSON marshalling, structured logging (`slog`), graceful shutdown
- Resume bullet: "Go REST API for book tracking with SQLite, structured slog logging, and graceful shutdown — production-ready patterns."
- Interview: "What's the difference between `gorilla/mux` and the stdlib `ServeMux`? When does it matter?"
- GitHub topics: `go` `rest-api` `sqlite` `slog` `graceful-shutdown`

**GO-M2: Concurrent File Downloader** — 600 XP · 5–7 hrs
Takes a list of URLs from a text file; downloads all files concurrently using a worker pool (configurable with `--workers N`). Progress bar per file using goroutines + channels. Retry on failure (up to 3 times). Reports total time and bytes downloaded.
- Skills: goroutines, channels, `sync.WaitGroup`, worker pool pattern, `io.TeeReader` for progress, retry logic
- Resume bullet: "Concurrent file downloader in Go with configurable worker pool, per-file progress tracking, and automatic retry — demonstrates Go concurrency patterns."
- Interview: "Walk me through your worker pool implementation. What's the difference between a buffered and unbuffered channel here?"
- GitHub topics: `go` `concurrency` `goroutines` `channels` `worker-pool` `downloader`

**GO-M3: Rate Limiter Middleware** — 550 XP · 5–6 hrs
An HTTP middleware that implements token bucket rate limiting per IP address. Configurable: `--rate 10/s`, `--burst 20`. Returns `429 Too Many Requests` with a `Retry-After` header when exceeded. Includes a demo server and a load testing script.
- Skills: Token bucket algorithm, HTTP middleware pattern, `sync.Map`, `time.Ticker`, HTTP headers
- Resume bullet: "Implemented a token bucket rate limiter middleware in Go with per-IP tracking and `Retry-After` headers."
- Interview: "What's the difference between token bucket and leaky bucket? When would you choose each?"
- GitHub topics: `go` `rate-limiting` `middleware` `token-bucket` `http`

#### Senior Tier

**GO-S1: gRPC Service + CLI Client** — 850 XP · 10–14 hrs
A user management gRPC service with: `CreateUser`, `GetUser`, `ListUsers`, `DeleteUser`. Protobuf schema. TLS with self-signed certs. A CLI client (`grpc-client`) that calls all methods. Reflection enabled for grpcurl testing. Interceptors for logging and auth token validation.
- Skills: Protocol Buffers, gRPC, TLS, interceptors, `grpcurl`, code generation from `.proto`
- Resume bullet: "gRPC user management service in Go with TLS, logging/auth interceptors, and a CLI client — demonstrates modern API design beyond REST."
- Interview: "When would you choose gRPC over REST? What are the trade-offs?"
- GitHub topics: `go` `grpc` `protobuf` `tls` `microservices`

**GO-S2: Job Queue with Persistence** — 900 XP · 10–14 hrs
A job queue server: producers submit jobs via HTTP; workers pull jobs via long-poll. Jobs persist to SQLite (survive restarts). Status: `pending → running → done | failed`. Retry on failure with exponential back-off. Dashboard endpoint at `GET /status` showing queue depth and worker count.
- Skills: Job queue design, SQLite transactions, long-polling, exponential back-off, dashboard API
- Resume bullet: "Persistent job queue in Go with HTTP intake, SQLite-backed durability, retry with exponential back-off, and a status dashboard — production-ready background processing."
- Interview: "How do you handle the case where a worker crashes mid-job? (visibility timeout / heartbeat pattern)"
- GitHub topics: `go` `job-queue` `background-processing` `sqlite` `worker-pool`

#### Library Tier — Go

**GO-L1: Gin — REST API with Full Auth** — 600 XP · 6–8 hrs · Library: `gin-gonic/gin`
A fully-featured REST API using the Gin framework: user registration/login (bcrypt + JWT via `golang-jwt/jwt`), middleware chain (auth, logging, CORS, rate-limit), GORM + SQLite models, graceful shutdown, and a Swagger doc generated from comments via `swaggo/swag`.
- Skills: Gin routing + groups, middleware chaining, GORM auto-migrate, JWT middleware, `swaggo`, graceful shutdown
- Resume bullet: "Production-pattern REST API in Go/Gin with JWT middleware, GORM/SQLite, rate limiting, and Swagger docs generated from annotations."
- Interview: "When would you choose Gin over the stdlib `net/http`? What does Gin actually add?"
- GitHub topics: `go` `gin` `rest-api` `jwt` `gorm` `sqlite` `swagger`

**GO-L2: GORM + PostgreSQL — Blog API** — 600 XP · 6–8 hrs · Library: `gorm.io/gorm`
A blog API: posts, comments, tags (many-to-many), authors (one-to-many). Full CRUD. GORM with PostgreSQL (local Docker or Supabase free tier). Pagination with cursor-based approach (not offset — explain why in README). Database migrations via GORM `AutoMigrate`.
- Skills: GORM associations (HasMany, BelongsTo, ManyToMany), cursor pagination, PostgreSQL, Docker Compose for local DB
- Resume bullet: "Blog REST API in Go/GORM with PostgreSQL, many-to-many tags, cursor-based pagination, and Docker Compose — demonstrates production database patterns."
- Interview: "What's wrong with offset-based pagination at scale? How does cursor pagination fix it?"
- GitHub topics: `go` `gorm` `postgresql` `rest-api` `docker` `cursor-pagination`

**GO-L3: Bubble Tea — Interactive TUI App** — 550 XP · 5–7 hrs · Library: `charmbracelet/bubbletea`
A terminal user interface app using the Bubble Tea framework (Elm architecture). Ideas: a `git`-like log browser (navigate commits with keyboard, show diff on select), or a server monitoring dashboard (CPU/RAM/disk as live-updating bars), or a Kanban board (Todo / In Progress / Done columns, drag cards).
- Skills: Bubble Tea Model/Update/View pattern, `tea.Cmd` for async operations, `lipgloss` for styling, keyboard navigation
- Resume bullet: "Interactive TUI in Go using Bubble Tea (Elm architecture) with keyboard navigation and lipgloss styling — demonstrates terminal UX design."
- Interview: "What's the Elm architecture? How does it differ from MVC?"
- GitHub topics: `go` `bubbletea` `tui` `terminal` `elm-architecture` `charmbracelet`

---

### C# Track Portfolio (10 projects + library tier)

#### Junior Tier

**CS-J1: Console Bank Account** — 250 XP · 2–3 hrs
A console app simulating a bank account: deposit, withdraw, transfer (between two accounts), and statement print. Uses OOP: `Account`, `Transaction`, `Bank` classes. Validates inputs (insufficient funds, negative amounts). Saves to JSON.
- Skills: OOP fundamentals, `System.Text.Json`, input validation, exception handling
- Resume bullet: "Console bank simulator in C# demonstrating OOP design with Account/Transaction/Bank classes, input validation, and JSON persistence."
- GitHub topics: `csharp` `oop` `console-app` `banking-simulation`

**CS-J2: Unity 2D Platformer** — 500 XP · 4–6 hrs
A Unity 2D platformer with: rigidbody player controller (run, jump, coyote-time), 3 levels (tilemaps), collectibles (coins), hazards (spikes), enemies (simple patrol AI), win/lose states, and a main menu.
- Skills: Unity physics (Rigidbody2D, Collider2D), Tilemap, ScriptableObjects for data, basic AI (patrol), scene management
- Resume bullet: "Unity 2D platformer with coyote-time jump, tilemap levels, patrol enemies, and collectibles — demonstrates Unity fundamentals and game feel."
- Interview: "What is coyote time? Why does it make jumps feel better?"
- GitHub topics: `csharp` `unity` `unity2d` `platformer` `game-dev`

#### Mid Tier

**CS-M1: ASP.NET Core REST API** — 650 XP · 6–8 hrs
A recipes API: CRUD for recipes + ingredients. Uses Entity Framework Core with SQLite. JWT authentication. Input validation with Data Annotations. Swagger/OpenAPI docs. Integration tests with `WebApplicationFactory`.
- Skills: ASP.NET Core, EF Core, JWT, Data Annotations, Swagger, integration testing
- Resume bullet: "ASP.NET Core recipes API with EF Core/SQLite, JWT auth, Swagger docs, and integration tests using WebApplicationFactory."
- GitHub topics: `csharp` `aspnetcore` `ef-core` `rest-api` `jwt` `integration-tests`

**CS-M2: Unity Turn-Based RPG** — 700 XP · 7–9 hrs
Turn-based combat system: player vs 3 enemy types, ability system (4 abilities per character), status effects (poison, stun, burn), loot drops, save/load via JSON serialization. ScriptableObject-driven character stats and abilities.
- Skills: ScriptableObjects, state machine (player turn → enemy turn), serialization, event system
- Resume bullet: "Unity turn-based RPG with ability system, status effects, loot, and JSON save/load — demonstrates game architecture and ScriptableObject patterns."
- GitHub topics: `csharp` `unity` `rpg` `turn-based` `scriptableobjects` `game-dev`

#### Senior Tier

**CS-S1: WPF/MAUI Desktop App with MVVM** — 850 XP · 10–14 hrs
A habit tracker desktop app with: MVVM architecture (`INotifyPropertyChanged`, `RelayCommand`), SQLite via EF Core, streak calculation, calendar heat-map view (custom control), data export to CSV, and dark/light theme toggle.
- Skills: MVVM pattern, data binding, custom controls, EF Core, theme switching
- Resume bullet: "MAUI desktop habit tracker using MVVM, custom calendar heatmap control, EF Core/SQLite, and theme switching — demonstrates enterprise .NET patterns."
- GitHub topics: `csharp` `maui` `mvvm` `desktop-app` `ef-core` `custom-controls`

#### Library Tier — C#

**CS-L1: Unity — 3D Third-Person Adventure** — 750 XP · 8–10 hrs · Library: `Unity` + `Cinemachine` + `Input System`
A 3D third-person game: character controller using Unity's new Input System (WASD + gamepad), Cinemachine follow camera with lock-on target switching, 3 enemy types with NavMesh pathfinding, pickup items (health, ammo), trigger-based dialogue system, main menu + pause screen, build exported to WebGL.
- Skills: `NavMeshAgent`, Cinemachine virtual cameras, new Input System action maps, WebGL build pipeline, animator controller (blend trees)
- Resume bullet: "Unity 3D third-person adventure with NavMesh AI, Cinemachine cameras, new Input System with gamepad support, and WebGL export — playable in browser."
- Interview: "What's the difference between the old Input Manager and the new Input System? Why did Unity change it?"
- GitHub topics: `csharp` `unity` `unity3d` `game-dev` `navmesh` `cinemachine` `webgl`

**CS-L2: MonoGame — 2D Puzzle Game** — 600 XP · 6–8 hrs · Library: `MonoGame`
A Sokoban-style puzzle game in MonoGame (cross-platform, no Unity): tile-based grid, push-block mechanics, undo stack (Ctrl+Z), 10 handcrafted levels loaded from text files, level editor (click to place tiles), high-score file, published to itch.io.
- Skills: MonoGame game loop, `SpriteBatch`, tilemap loading from text, undo/redo stack (Command pattern), `ContentManager`
- Resume bullet: "Cross-platform 2D puzzle game in MonoGame with 10 levels, undo system (Command pattern), built-in level editor, and published to itch.io."
- Interview: "What's the Command pattern? How does it enable unlimited undo?"
- GitHub topics: `csharp` `monogame` `puzzle-game` `command-pattern` `cross-platform` `game-dev`

**CS-L3: Avalonia — Cross-Platform Dev Tools App** — 700 XP · 7–9 hrs · Library: `Avalonia UI`
A developer utility app (JSON formatter + validator, Base64 encoder/decoder, regex tester, colour picker with hex/RGB/HSL, JWT decoder) — all in one desktop app that runs on Windows, macOS, and Linux. MVVM with ReactiveUI. Settings persisted to JSON.
- Skills: Avalonia UI, ReactiveUI, MVVM reactive bindings, `JsonDocument`, regex, cross-platform packaging
- Resume bullet: "Cross-platform developer toolkit in Avalonia UI/ReactiveUI: JSON formatter, regex tester, JWT decoder, and colour picker — runs on Windows/macOS/Linux."
- Interview: "How does Avalonia achieve cross-platform rendering? How does it compare to MAUI?"
- GitHub topics: `csharp` `avalonia` `reactiveui` `cross-platform` `developer-tools` `desktop-app`

---

### C++ Track Portfolio (8 projects + library tier)

#### Junior Tier

**CPP-J1: Dynamic Array (std::vector clone)** — 300 XP · 3–4 hrs
Implement a template class `DynArray<T>` with: `push_back`, `pop_back`, `operator[]`, `size`, `capacity`, `reserve`, `clear`. Doubles capacity on overflow. Passes a suite of unit tests.
- Skills: Templates, raw memory management (`new`/`delete[]`), move semantics basics, operator overloading
- Resume bullet: "Implemented a generic dynamic array in C++ with amortized O(1) push_back, manual memory management, and a test suite."
- Interview: "What's the amortized complexity of push_back? Why double the capacity instead of incrementing by 1?"
- GitHub topics: `cpp` `data-structures` `templates` `memory-management`

**CPP-J2: ASCII Dungeon Crawler** — 400 XP · 4–5 hrs
Terminal dungeon crawler: procedurally-generated map (BSP or random walk), player + monsters with HP, turn-based movement, item pickups, fog of war. Renders in terminal with ANSI colour codes. Saves/loads game state.
- Skills: 2D arrays, OOP (Entity, Player, Monster), random generation, ANSI codes, file I/O
- Resume bullet: "Terminal dungeon crawler in C++ with procedural map generation, turn-based combat, fog of war, and game state persistence."
- GitHub topics: `cpp` `game-dev` `terminal` `procedural-generation` `ascii`

#### Mid Tier

**CPP-M1: Thread Pool** — 600 XP · 5–7 hrs
A fixed-size thread pool: submit tasks via `pool.submit(fn)` which returns a `std::future`. Worker threads wait on a condition variable. Supports: task queue, graceful shutdown (drain queue before joining), and a benchmark comparing pool vs sequential execution.
- Skills: `std::thread`, `std::mutex`, `std::condition_variable`, `std::future`, `std::packaged_task`, RAII
- Resume bullet: "C++ thread pool with task queue, future-based result retrieval, graceful shutdown, and benchmarks — demonstrates modern concurrency primitives."
- Interview: "What's a spurious wakeup? Why do you need the predicate in `wait()`?"
- GitHub topics: `cpp` `concurrency` `thread-pool` `futures` `modern-cpp`

**CPP-M2: Mini Raytracer** — 700 XP · 7–10 hrs
Ray-casts spheres and planes with: Phong shading (ambient, diffuse, specular), shadows, reflections, configurable camera, and outputs a PPM image. Multithreaded (one thread per row). Produces a 512×512 image in < 1 second.
- Skills: 3D math (vectors, dot product, ray-sphere intersection), Phong model, multithreading, PPM format
- Resume bullet: "Multithreaded raytracer in C++ producing 512×512 Phong-shaded images with shadows and reflections in under 1 second."
- GitHub topics: `cpp` `raytracer` `3d-math` `multithreading` `computer-graphics`

#### Senior Tier

**CPP-S1: Custom Memory Allocator** — 850 XP · 10–14 hrs
A pool allocator: pre-allocates a fixed block of memory, manages free slots with a free list, provides `allocate(size)` and `deallocate(ptr)`. Tracks fragmentation. Benchmarks against `malloc`. Includes an arena allocator variant. Full test suite.
- Skills: Pointer arithmetic, free list pattern, alignment, memory-mapped files, benchmark methodology
- Resume bullet: "Custom pool + arena allocator in C++ with free-list management, fragmentation tracking, and benchmarks showing 3–5× improvement over malloc for small allocations."
- GitHub topics: `cpp` `memory-allocator` `systems-programming` `performance` `low-level`

#### Library Tier — C++

**CPP-L1: SDL2 — 2D Top-Down RPG** — 650 XP · 7–9 hrs · Library: `SDL2` + `SDL_image` + `SDL_mixer`
A top-down RPG in SDL2 (no engine): tile map rendered from a CSV + tileset PNG, player movement with animation (walking direction frames), 4 NPC characters with dialogue trees, 2 interactable items, sound effects + looping background music via `SDL_mixer`, save/load via JSON, and a camera that follows the player.
- Skills: `SDL_Renderer`, spritesheet rendering, tilemap CSV loading, camera offset math, `SDL_mixer` channels, JSON save state
- Resume bullet: "2D top-down RPG in SDL2 from scratch: tilemap, spritesheet animation, NPC dialogue trees, SDL_mixer audio, and JSON save/load — no engine used."
- Interview: "How do you handle delta time in SDL2? Why is it necessary for frame-rate-independent movement?"
- GitHub topics: `cpp` `sdl2` `game-dev` `rpg` `tilemap` `spritesheet`

**CPP-L2: SFML — Particle System + Physics** — 600 XP · 6–8 hrs · Library: `SFML`
An interactive particle system: click to spawn emitters (fire, smoke, sparkle, water), each particle has velocity, gravity, drag, lifetime, and colour fade. Mouse-drag to create a force attractor. Config file (INI format) controls particle limits and physics constants. Renders 10,000+ particles at 60 FPS using a vertex array.
- Skills: `sf::VertexArray` batched rendering, SFML game loop, particle physics simulation, config file parsing, frame-rate-independent update
- Resume bullet: "SFML particle system rendering 10,000+ particles at 60 FPS using batched vertex arrays — demonstrates SFML graphics pipeline and physics simulation."
- Interview: "Why is `sf::VertexArray` faster than drawing 10,000 individual sprites? What's a draw call?"
- GitHub topics: `cpp` `sfml` `particle-system` `physics-simulation` `game-dev` `graphics`

**CPP-L3: OpenGL — 3D Scene from Scratch** — 900 XP · 10–14 hrs · Library: `OpenGL` + `GLFW` + `GLM`
Build a 3D rendered scene step by step: triangle → cube → multiple textured objects → Phong lighting (ambient/diffuse/specular) → directional + point lights → normal mapping on one surface → a freely-moving camera (mouse look + WASD). No game engine. Shaders written in GLSL.
- Skills: OpenGL pipeline (VAO, VBO, EBO), GLSL vertex/fragment shaders, `glm` math, texture loading (`stb_image`), camera matrix math (view/projection), lighting models
- Resume bullet: "3D OpenGL scene from scratch: GLSL shaders, Phong lighting with normal mapping, and free-look camera — built without any engine or abstraction library."
- Interview: "Walk me through what happens between a vertex position in your C++ code and a pixel on screen. (vertex shader → rasterisation → fragment shader)"
- GitHub topics: `cpp` `opengl` `glsl` `3d-graphics` `computer-graphics` `shaders`

**CPP-L4: Raylib — 2D Platformer + Level Editor** — 550 XP · 6–8 hrs · Library: `raylib`
A 2D platformer using raylib (beginner-friendly, single-header C library): physics-based player, 5 levels defined as tile grids in JSON, an in-app level editor (drag tiles, save to JSON), parallax background scrolling, particle effects on jump/land, controller support via raylib's gamepad API, exported to web via Emscripten.
- Skills: raylib game loop, `Rectangle` collision detection, JSON level loading, Emscripten WASM export, gamepad input
- Resume bullet: "2D platformer in raylib with JSON-driven levels, an in-app level editor, parallax scrolling, and Emscripten WebAssembly export — playable in browser."
- Interview: "What is Emscripten? How does it let you run C++ in a browser?"
- GitHub topics: `cpp` `raylib` `platformer` `game-dev` `emscripten` `webassembly` `level-editor`

---

### Rust Track Portfolio (8 projects + library tier)

#### Junior Tier

**RS-J1: CLI Word Counter** — 300 XP · 2–3 hrs
A `wc`-like tool: counts lines, words, characters, and bytes per file. Accepts multiple files + stdin. Totals row at the bottom. Handles errors gracefully (file not found, permission denied) using `Result` and `?` operator. Proper argument parsing with `clap`.
- Skills: `clap`, file I/O, iterators, `Result`/`Option` handling, `?` operator, error types
- Resume bullet: "Rust CLI word counter with clap argument parsing, multi-file support, and idiomatic error handling via Result and the ? operator."
- Interview: "Why doesn't Rust have null? How do Option and Result replace it?"
- GitHub topics: `rust` `cli` `clap` `file-io` `error-handling`

**RS-J2: Markdown to HTML Converter** — 350 XP · 3–4 hrs
Parse a subset of Markdown (headers, bold, italic, code, links, lists) and convert to HTML. Uses a hand-rolled parser (no pulldown-cmark). Outputs to stdout or `--output file.html`. Handles malformed input gracefully.
- Skills: String parsing, pattern matching, iterator chaining, `String` vs `&str`, output formatting
- Resume bullet: "Rust Markdown→HTML converter with a hand-written parser — demonstrates Rust's string handling, pattern matching, and iterator composition."
- GitHub topics: `rust` `markdown` `parser` `cli` `html-generation`

#### Mid Tier

**RS-M1: HTTP Server from Scratch** — 700 XP · 7–10 hrs
A minimal HTTP/1.1 server built on `TcpListener` (no Actix, no Axum). Supports: `GET`/`POST`, static file serving, a simple router (path → handler), connection keep-alive, and `Content-Type` inference. Handles concurrent connections via thread-per-connection.
- Skills: `TcpStream`, `BufReader`, HTTP parsing, routing, thread-per-connection, `Arc<Mutex<>>`
- Resume bullet: "HTTP/1.1 server built from TcpListener in Rust — no frameworks — with routing, static files, keep-alive, and thread-per-connection concurrency."
- Interview: "What's the problem with thread-per-connection at scale? How would you fix it? (async + Tokio)"
- GitHub topics: `rust` `http-server` `networking` `tcp` `concurrency` `from-scratch`

**RS-M2: Async Web Scraper (Tokio)** — 700 XP · 7–9 hrs
Async scraper using `tokio` + `reqwest` + `scraper`. Takes a seed URL, follows links up to depth 2, extracts all `<a href>` and `<title>` tags, deduplicates URLs, and writes results to JSON. Semaphore limits concurrent requests to 10.
- Skills: `tokio`, `reqwest`, `scraper`, async/await, `Arc<Semaphore>`, `tokio::sync::mpsc`, JSON output
- Resume bullet: "Async web scraper in Rust (Tokio + reqwest) with depth-limited crawling, semaphore rate-limiting, and JSON output."
- GitHub topics: `rust` `async` `tokio` `reqwest` `web-scraping` `concurrency`

#### Senior Tier

**RS-S1: Lock-Free Ring Buffer** — 900 XP · 10–14 hrs
A fixed-capacity single-producer / single-consumer (SPSC) lock-free ring buffer using `AtomicUsize` for head/tail. Passes a concurrent correctness test (producer + consumer threads running 10M iterations). Benchmarks against `Mutex<VecDeque>`. Documents memory ordering choices (Acquire/Release) in the README.
- Skills: `AtomicUsize`, `Ordering`, SPSC design, memory ordering, benchmark with `criterion`, unsafe Rust
- Resume bullet: "Lock-free SPSC ring buffer in Rust using atomics — demonstrates understanding of memory ordering, concurrency correctness, and unsafe Rust."
- Interview: "Explain the difference between `Relaxed`, `Acquire`, `Release`, and `SeqCst` ordering."
- GitHub topics: `rust` `lock-free` `concurrency` `atomics` `ring-buffer` `unsafe-rust`

#### Library Tier — Rust

**RS-L1: Actix-web — REST API with Auth** — 700 XP · 7–10 hrs · Library: `actix-web` + `sqlx`
A task management API using Actix-web 4: user auth (bcrypt + JWT middleware), CRUD endpoints for tasks with tags, PostgreSQL via `sqlx` (async, compile-time query checking), migrations with `sqlx migrate`, input validation with `validator`, structured logging with `tracing`, and Docker Compose for the DB.
- Skills: Actix-web extractors, `sqlx` async queries + compile-time checks, `tracing` spans, JWT middleware as actix middleware, Docker Compose
- Resume bullet: "Production-pattern REST API in Rust/Actix-web: JWT auth, async sqlx/PostgreSQL, compile-time SQL verification, tracing, and Docker Compose."
- Interview: "What does sqlx's compile-time query checking actually verify? What can it not check?"
- GitHub topics: `rust` `actix-web` `sqlx` `postgresql` `rest-api` `jwt` `docker`

**RS-L2: Bevy — 2D Space Shooter** — 700 XP · 7–10 hrs · Library: `Bevy`
A 2D space shooter built in the Bevy game engine: ECS architecture (entities, components, systems), player ship (keyboard movement, bullet firing), 3 enemy types with different movement patterns, collision detection via Bevy's built-in physics (`bevy_rapier2d`), health components, score, particle effects on explosion, and a WebAssembly build deployed to GitHub Pages.
- Skills: Bevy ECS (queries, resources, events, schedules), `bevy_rapier2d` colliders, Bevy 2D rendering, WASM build + `trunk`
- Resume bullet: "2D space shooter in Rust/Bevy ECS with rapier2d physics, particle explosions, and a WebAssembly build deployed to GitHub Pages."
- Interview: "What is the Entity-Component-System pattern? How does it differ from OOP inheritance for game objects?"
- GitHub topics: `rust` `bevy` `game-dev` `ecs` `2d-game` `webassembly` `rapier2d`

**RS-L3: Axum + HTMX — Hypermedia Web App** — 650 XP · 7–9 hrs · Libraries: `axum`, `askama`, `sqlx`
A notes web app using Axum for the HTTP layer, Askama for server-side HTML templates, HTMX for dynamic UI (no JavaScript written — HTMX attributes swap HTML fragments), and SQLite via sqlx. CRUD for notes with search, all driven by HTMX `hx-get`/`hx-post`/`hx-delete` attributes — no JSON API, pure hypermedia.
- Skills: Axum routing + handlers, Askama template rendering, HTMX hypermedia patterns, sqlx SQLite, form handling
- Resume bullet: "Full-stack web app in Rust (Axum + Askama + HTMX) with zero JavaScript — pure hypermedia architecture using HTMX for dynamic UI."
- Interview: "What is HTMX? How does the hypermedia approach differ from a JSON API + SPA?"
- GitHub topics: `rust` `axum` `htmx` `askama` `hypermedia` `web-app` `sqlx`

---

### Lua Track Portfolio (6 projects + library tier)

#### Junior Tier

**LUA-J1: LÖVE2D Snake** — 300 XP · 3–4 hrs
Classic Snake game in LÖVE2D: grid-based movement, food spawning, collision detection (wall + self), score display, increasing speed, game-over screen, restart. Clean code structure (separate files for snake, food, game logic).
- Skills: LÖVE2D game loop (update/draw), table manipulation (snake segments as table), collision, timers
- Resume bullet: "Snake game in LÖVE2D demonstrating game loop architecture, table-based entity management, and collision detection."
- GitHub topics: `lua` `love2d` `game-dev` `snake` `2d-game`

**LUA-J2: Neovim Plugin** — 400 XP · 4–5 hrs
A Neovim plugin (Lua API) that adds a useful command: e.g., `WordCount` (shows word/line/char count in status line), or `TodoList` (scans current file for `-- TODO:` comments and lists them in a floating window), or `FormatDate` (inserts formatted date at cursor).
- Skills: Neovim Lua API (`vim.api`, `vim.fn`, `vim.cmd`), floating windows, autocmds, keymapping
- Resume bullet: "Neovim plugin in Lua using the Neovim Lua API — demonstrates familiarity with the Neovim ecosystem and event-driven plugin architecture."
- GitHub topics: `lua` `neovim` `neovim-plugin` `vim` `developer-tools`

#### Mid Tier

**LUA-M1: LÖVE2D Tower Defense** — 650 XP · 7–9 hrs
Tower defense game: path-following enemies (waypoints), 3 tower types (slow, damage, area), tower placement grid, wave system (enemies get tougher each wave), HP bar, gold economy (kill enemies → earn → buy towers). Saved high score to file.
- Skills: Waypoint path-following, entity management, game economy, wave spawning, UI/HUD, file I/O
- Resume bullet: "LÖVE2D tower defense with 3 tower types, wave-based spawning, economy system, and persistent high score — demonstrates complex game state management."
- GitHub topics: `lua` `love2d` `tower-defense` `game-dev` `entity-system`

**LUA-M2: Roblox Game System** — 600 XP · 6–8 hrs
A complete Roblox experience module: obby (obstacle course) with checkpoint system, leaderboard (DataStore), NPC dialogue system (ProximityPrompt + speech bubbles), and a simple shop UI (currency via DataStore, cosmetic items). Follows Roblox scripting conventions (LocalScript / Script / ModuleScript separation).
- Skills: Roblox DataStore, RemoteEvents/RemoteFunctions, LocalScript vs Script, ProximityPrompt, UI (ScreenGui), ModuleScript patterns
- Resume bullet: "Roblox experience with checkpoint obby, persistent leaderboard via DataStore, NPC dialogue, and a cosmetics shop — demonstrates Roblox architecture patterns."
- GitHub topics: `lua` `roblox` `roblox-studio` `game-dev` `datastore`

#### Library Tier — Lua

**LUA-L1: LÖVE2D — Full Roguelike** — 750 XP · 8–10 hrs · Libraries: `LÖVE2D` + `bump.lua` + `astar.lua`
A top-down roguelike: procedurally-generated dungeon (BSP room placement + corridor carving), player with melee + ranged combat, 5 enemy types with A* pathfinding (`astar.lua`), inventory system (pick up + equip weapons/armour), status effects (poison, slow), floor-based progression (enemies scale per floor), permadeath + high-score table, minimap.
- Skills: BSP dungeon generation, `bump.lua` collision, A* pathfinding integration, Lua OOP (metatables/`__index`), serialisation with `serpent`
- Resume bullet: "Full roguelike in LÖVE2D with BSP dungeon generation, A* enemy pathfinding, inventory system, status effects, and permadeath — 10+ hours of gameplay depth."
- Interview: "Explain BSP dungeon generation. How do you ensure rooms don't overlap?"
- GitHub topics: `lua` `love2d` `roguelike` `procedural-generation` `astar` `game-dev`

**LUA-L2: LÖVE2D — Multiplayer Party Game (LAN)** — 700 XP · 7–9 hrs · Libraries: `LÖVE2D` + `sock.lua` (UDP)
A 2–4 player LAN party game (e.g., top-down battle arena or racing game) using UDP networking via `sock.lua`. Implements: client-server architecture, state synchronisation (position, health, score), client-side prediction + server reconciliation for smooth feel, and a lobby screen where players join by IP. Works on local network without internet.
- Skills: UDP networking, client-server game architecture, client-side prediction, state delta compression, `sock.lua`
- Resume bullet: "LAN multiplayer party game in LÖVE2D using UDP with client-side prediction and server reconciliation — demonstrates real-time networking fundamentals."
- Interview: "What's client-side prediction? Why do you need server reconciliation alongside it?"
- GitHub topics: `lua` `love2d` `multiplayer` `networking` `udp` `game-dev`

**LUA-L3: Defold — Mobile-Ready Hyper-Casual Game** — 600 XP · 6–8 hrs · Library: `Defold Engine`
A hyper-casual mobile game in Defold (Google's free Lua game engine): tap mechanics, increasing difficulty curve, particle effects, UI animations, leaderboard (local high scores), haptic feedback, and exported as an HTML5 build (playable in browser) + Android APK. Uses Defold's component-entity system and message-passing architecture.
- Skills: Defold's component system, Lua message passing (`msg.post`), `go.animate` tweening, `gui` module for UI, HTML5 + Android export pipeline
- Resume bullet: "Hyper-casual mobile game in Defold (Lua): HTML5 + Android export, particle effects, difficulty scaling, and local leaderboard — demonstrates cross-platform mobile game dev."
- Interview: "How does Defold's message-passing architecture differ from direct function calls? What does it enable?"
- GitHub topics: `lua` `defold` `mobile-game` `hyper-casual` `game-dev` `html5`

---

## Cross-Language / Full-Stack Portfolio Projects

These sit above individual tracks. Unlock after completing a Mid-tier project in two different tracks.

**FULL-J1: Personal Portfolio Website** — 400 XP · 4–6 hrs · JavaScript + any backend
A personal portfolio site hosting all completed projects. Features: project cards (auto-generated from a JSON file), contact form (backend: Python/Go/Node.js handles form submission → email via API or saves to JSON), dark/light mode, smooth scroll, animated hero section.
- Skills: Frontend design, JSON-driven content, form handling, backend integration, responsive CSS
- Resume bullet: "Personal developer portfolio site with JSON-driven project showcase, contact form backend, and dark/light theme — live on GitHub Pages."
- GitHub topics: `portfolio` `html` `css` `javascript` `personal-website`

**FULL-M1: REST API + Frontend SPA** — 900 XP · 10–14 hrs · Go or Python backend + JavaScript frontend
A fully working full-stack app (e.g., a note-taking app, a bookmarks manager, a habit tracker). Backend: Go or Python REST API with JWT auth. Frontend: vanilla JS SPA (no React) with client-side routing (`history.pushState`). Data flows: register → login → CRUD → logout.
- Skills: Full-stack integration, CORS, JWT flow, client-side routing, fetch + async/await, auth state management
- Resume bullet: "Full-stack note-taking SPA — Go/Python REST backend with JWT auth and a vanilla JS frontend with client-side routing — no frameworks end to end."
- GitHub topics: `full-stack` `rest-api` `vanilla-js` `spa` `jwt` `go` OR `python`

**FULL-S1: CLI Dev Tool (Published)** — 1000 XP · 12–16 hrs · Go or Rust
Build and *publish* a real CLI tool that solves a genuine problem. Ideas: a `dotfiles` manager, a `git` helper that improves a workflow, a dependency graph visualiser, a fast log searcher. Must be: installable via `brew` / `cargo install` / `go install`, have a GitHub release with binaries for Linux/macOS/Windows, a proper README with demo GIF, and at least 10 GitHub stars.
- Skills: Cross-compilation, release automation (GitHub Actions), binary distribution, README + GIF, community building
- Resume bullet: "Published open-source CLI tool in Go/Rust with GitHub Actions release pipeline, cross-platform binaries, and X GitHub stars."
- GitHub topics: `cli-tool` `open-source` `go` OR `rust` `developer-tools` `github-actions`

---

## Portfolio UI in the App

The Portfolio screen (`renderPortfolio()`) is distinct from Labs and Capstone:

```
Portfolio Mode
├── Career Track picker (what role are you targeting?)
│   ├── Backend Dev → Python + Go projects highlighted
│   ├── Frontend Dev → JavaScript projects highlighted
│   ├── Game Dev → C#/Lua/C++ projects highlighted
│   └── Systems Dev → C++/Rust projects highlighted
├── Project wall — card grid
│   ├── Completed: green "Portfolio Ready" badge + "View Code" + "GitHub Export"
│   ├── In Progress: progress bar + "Continue"
│   └── Locked: blur + "Complete PY-J2 first"
├── Recruiter Dashboard
│   ├── "Resume Bullets" — copy-paste ready text for each completed project
│   ├── "GitHub README" — pre-filled README.md for each completed project
│   └── "Interview Prep" — talking points and likely questions per project
└── GitHub Export
    ├── Downloads a .zip with: src/, README.md, .gitignore, requirements.txt / go.mod
    └── README.md is pre-filled with project description, install steps, and usage
```

### Portfolio Mode Schema additions

```json
{
  "id": "portfolio_py_m1_task_api",
  "type": "portfolio_project",
  "track": "python",
  "tier": "mid",
  "career_paths": ["backend", "fullstack"],
  "unlocks_after": ["portfolio_py_j3_weather_cli"],
  "title": "Task Manager REST API",
  "tagline": "...",
  "recruiter_card": { ... },
  "phases": [ ... ],
  "folder_structure": "...",
  "github_export": {
    "files": ["main.py", "models.py", ".env.example", "requirements.txt", "README.md"],
    "gitignore_template": "python",
    "readme_template": "..."
  },
  "xp": 500,
  "badge": "API Builder"
}
```

---

## Gamification Layer for Portfolio

| Achievement | Trigger |
|---|---|
| **Version Controlled** | Complete Track 0 (Git & GitHub fundamentals) |
| **First Commit** | Complete first portfolio project (any track) |
| **Library User** | Complete first Library-tier project (any track) |
| **Junior Dev** | Complete all Junior-tier projects in one track |
| **Mid-Level** | Complete all Mid-tier projects in one track |
| **Library Expert** | Complete all Library-tier projects in one track |
| **Full-Stack** | Complete FULL-M1 cross-language project |
| **Open Source Hero** | Complete FULL-S1 (published CLI tool) |
| **Portfolio Ready** | Complete 5+ projects across 2+ tracks |
| **Career Ready** | Complete all projects in a career path (e.g., Backend Dev) |
| **Polyglot** | Complete at least one project in 3 different languages |
| **Framework Fluent** | Complete Library-tier projects in 3 different languages |
| **Game Dev** | Complete 3+ game projects (pygame, Phaser, Unity, LÖVE2D, Bevy, SDL2, or Raylib) |

---

## Backlog / Implementation Phases

### Phase 1 — Foundation
- [ ] Set up folder structure and copy Phase 10 engine files from CCNA Mastery
- [ ] Update branding: app name "Programming Plus", VS Code dark colour palette
- [ ] Create data/meta.json + data/week1.json skeleton (Track 0 + Python U1)
- [ ] Build `GitSimulator.js` — virtual repo state machine with 25 supported commands
- [ ] Write Track 0 (Git & GitHub): 200+ questions, 4 labs, GIT-P1 portfolio project
- [ ] Write Python Track U1: 200+ questions + 5 code labs + 2 story beats
- [ ] Build basic CodeEditor.js (textarea + JS eval runner for JavaScript track)
- [ ] Implement Debug It Drill (replaces Subnetting drill)

### Phase 2 — Content Build (Python + JavaScript)
- [ ] Complete Python Track U1–U6: 800+ questions, 30 code labs, 6 capstones
- [ ] Complete JavaScript Track U1–U6: 800+ questions, 30 code labs, 6 capstones
- [ ] Write 40+ story beats across both tracks
- [ ] Add 15+ drag-drop sets (syntax patterns, type hierarchies, control flow, git workflows)
- [ ] Add 10+ scenario question groups (debug scenario → 3 sub-questions)

### Phase 3 — Code Editor Engine
- [ ] Build CodeEditor.js with syntax highlighting tokeniser
- [ ] Integrate Pyodide for Python execution (offline WASM bundle)
- [ ] Implement test runner: compare stdout vs expectedOutput
- [ ] Implement diff view for failing tests
- [ ] Build solution reveal system (costs 50 XP)
- [ ] Add code export button (download as .py / .js)

### Phase 4 — Portfolio Projects Mode + Library Tier (Python & JavaScript)
- [ ] `renderPortfolio()` view with card wall, career-path filter, tier tabs (Junior/Mid/Senior/Library), lock/unlock logic
- [ ] Implement guided phase runner for portfolio projects (reuse Projects engine from CCNA)
- [ ] GitHub export: zip generator (js-zip or File API) with pre-filled README + .gitignore
- [ ] Recruiter Dashboard: resume bullets + interview talking points per completed project
- [ ] `store.portfolioProjects{}` + `earnedBadges[]` + portfolio-specific achievements
- [ ] Add PY-J1 through PY-S3 (12 Python core projects) with full content
- [ ] Add PY-L1 through PY-L7 (7 Python library projects: pygame ×2, Tkinter, Pillow, pandas, Flask, OpenCV)
- [ ] Add JS-J1 through JS-S2 (10 JavaScript core projects) with full content
- [ ] Add JS-L1 through JS-L5 (5 JS library projects: Three.js, p5.js, D3.js, Phaser 3, Socket.io)
- [ ] GIT-P1 (developer profile project) as Track 0 graduation

### Phase 5 — Additional Language Tracks + Library Tier
- [ ] Go Track U1–U6: 600+ questions, 20 labs, 7 core projects + 3 library projects (Gin, GORM, Bubble Tea)
- [ ] C# Track U1–U6: 700+ questions, 25 labs, 5 core projects + 3 library projects (Unity 3D, MonoGame, Avalonia)
- [ ] C++ Track U1–U6: 700+ questions, 25 labs, 5 core projects + 4 library projects (SDL2, SFML, OpenGL, Raylib)
- [ ] Rust Track U1–U6: 700+ questions, 20 labs, 5 core projects + 3 library projects (Actix-web, Bevy, Axum+HTMX)
- [ ] Lua Track U1–U6: 600+ questions, 20 labs, 4 core projects + 3 library projects (LÖVE2D roguelike, multiplayer, Defold)
- [ ] Concept diagrams: call stack, heap vs stack, memory model, ownership (Rust), concurrency models, git object model
- [ ] Language comparison interactive diagram (feature matrix: types, concurrency, memory, use cases)
- [ ] Cross-language projects: FULL-J1, FULL-M1, FULL-S1

### Phase 6 — Polish & Launch
- [ ] Landing page (VS Code dark theme — #1e1e1e bg, #569cd6 accent)
- [ ] Track selector UI (7 language cards + Track 0 Git card on home screen)
- [ ] Career path selector (Backend / Frontend / Game / Systems / Data)
- [ ] Library filter on Portfolio screen (filter by library/framework used)
- [ ] "Timed Code Challenge" mode (replaces Exam Sim — 10 coding questions, 30 min)
- [ ] PWA offline + service worker
- [ ] Study planner + daily coding streak
- [ ] Beta test with beginner and intermediate learners across tracks

---

## Key Differences from CCNA Mastery / CySA+

| Feature | CCNA Mastery | CySA+ | Programming Plus |
|---------|-------------|-------|-----------------|
| Interactive engine | Cisco IOS CLI | SOC Analyst Workstation | In-browser Code Editor (Pyodide/Lua/JS eval) + Git Simulator |
| Hands-on drill | IP Subnetting | Alert Triage (TP/FP) | Debug It (spot the bug in broken code) |
| Boss battles | CLI + MCQ gauntlet | Multi-phase IR Simulation | Portfolio Projects (real GitHub-ready builds) |
| Labs | CLI config validation | Log/pcap analysis | Code execution vs test cases |
| Capstone | Mega Labs (CLI) | IR Simulations | Library Tier Projects (real frameworks, real employers want) |
| Story persona | Junior network engineer | Junior SOC analyst | Junior developer at a game studio |
| Colour palette | Terminal green (#00ff41) | SOC blue/red (#0ea5e9) | Editor dark (#1e1e1e + #569cd6) |
| Content domains | NF · NA · IC · IS · SF · AP | SecOps · VulnMgmt · IR · Reporting | Track 0 (Git) + 7 language tracks × 6 units |
| Unique mechanic | Subnetting calculator | CVSS scorer | Real code execution + GitHub portfolio export + recruiter cards |
| Version control | No | No | Track 0 — Git & GitHub fundamentals with Git Simulator |
| Library projects | No | No | 28 library-tier projects across 7 tracks (pygame, Three.js, Bevy, SDL2, etc.) |

---

## Colour Palette

```css
--bg-primary:    #1e1e1e;   /* VS Code dark */
--bg-secondary:  #252526;   /* sidebar */
--bg-tertiary:   #2d2d30;   /* tabs/panels */
--accent-blue:   #569cd6;   /* keywords */
--accent-green:  #4ec9b0;   /* types / success */
--accent-orange: #ce9178;   /* strings */
--accent-yellow: #dcdcaa;   /* functions */
--accent-purple: #c586c0;   /* control flow */
--text-primary:  #d4d4d4;   /* default text */
--text-dim:      #858585;   /* comments */
--error-red:     #f44747;   /* errors / test failures */
```

---

*Project initialized: 2026-03-28*
*Portfolio Projects system designed: 2026-03-30*
*Based on CCNA Mastery Phase 10 engine / CySA+ adaptation pattern*
*Target launch: 120 days from start*
