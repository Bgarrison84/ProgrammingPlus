/**
 * GitSimulator.js — Virtual Git Repository Engine
 * Simulates a git repository state machine for educational purposes.
 */

export class GitSimulator {
  constructor(initialState = null) {
    this.reset(initialState);
  }

  reset(initialState = null) {
    if (initialState) {
      this.repo = JSON.parse(JSON.stringify(initialState));
    } else {
      this.repo = {
        initialized: false,
        commits: {},
        branches: { main: null },
        HEAD: 'main',
        index: { staged: {}, unstaged: {} },
        workingTree: {},
        remotes: {}
      };
    }
  }

  _generateHash() {
    return Math.random().toString(16).substring(2, 9);
  }

  _getHeadCommit() {
    if (!this.repo.initialized) return null;
    const ref = this.repo.HEAD;
    if (this.repo.branches[ref]) {
      return this.repo.commits[this.repo.branches[ref]];
    }
    return this.repo.commits[ref] || null; // Detached HEAD
  }

  execute(commandStr) {
    const args = commandStr.trim().split(/\s+/);
    if (args[0] !== 'git') {
      return { success: false, output: 'bash: ' + args[0] + ': command not found' };
    }

    const cmd = args[1];
    if (!cmd) return { success: false, output: 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           <command> [<args>]' };

    if (cmd === 'init') return this.cmdInit();
    
    if (!this.repo.initialized) {
      return { success: false, output: 'fatal: not a git repository (or any of the parent directories): .git' };
    }

    switch (cmd) {
      case 'status': return this.cmdStatus();
      case 'add': return this.cmdAdd(args.slice(2));
      case 'commit': return this.cmdCommit(args.slice(2));
      case 'log': return this.cmdLog(args.slice(2));
      case 'branch': return this.cmdBranch(args.slice(2));
      case 'checkout': return this.cmdCheckout(args.slice(2));
      case 'merge': return this.cmdMerge(args.slice(2));
      case 'remote': return this.cmdRemote(args.slice(2));
      case 'push': return this.cmdPush(args.slice(2));
      case 'pull': return this.cmdPull(args.slice(2));
      case 'clone': return this.cmdClone(args.slice(2));
      // Basic file modifications for simulation purposes (not real git commands but needed for testing)
      case 'touch': return this.simTouch(args[2]);
      case 'echo': return this.simEcho(args.slice(2));
      default:
        return { success: false, output: `git: '${cmd}' is not a git command. See 'git --help'.` };
    }
  }

  cmdInit() {
    if (this.repo.initialized) {
      return { success: true, output: 'Reinitialized existing Git repository' };
    }
    this.repo.initialized = true;
    return { success: true, output: 'Initialized empty Git repository' };
  }

  cmdStatus() {
    let output = `On branch ${this.repo.HEAD}\n`;
    
    const stagedFiles = Object.keys(this.repo.index.staged);
    const unstagedFiles = Object.keys(this.repo.index.unstaged);
    const untrackedFiles = Object.keys(this.repo.workingTree).filter(f => 
      !this.repo.index.staged[f] && !this.repo.index.unstaged[f] && !this._isFileInHead(f)
    );

    if (stagedFiles.length === 0 && unstagedFiles.length === 0 && untrackedFiles.length === 0) {
      output += 'nothing to commit, working tree clean';
      return { success: true, output };
    }

    if (stagedFiles.length > 0) {
      output += 'Changes to be committed:\n';
      stagedFiles.forEach(f => output += `  (use "git restore --staged <file>..." to unstage)\n        modified:   ${f}\n`);
    }

    if (unstagedFiles.length > 0) {
      output += '\nChanges not staged for commit:\n';
      unstagedFiles.forEach(f => output += `  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n        modified:   ${f}\n`);
    }

    if (untrackedFiles.length > 0) {
      output += '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
      untrackedFiles.forEach(f => output += `        ${f}\n`);
    }

    return { success: true, output };
  }

  _isFileInHead(filename) {
    const headCommit = this._getHeadCommit();
    if (!headCommit) return false;
    return !!headCommit.files[filename];
  }

  cmdAdd(args) {
    if (args.length === 0) return { success: false, output: 'Nothing specified, nothing added.\nMaybe you wanted to say \'git add .\'?' };
    
    const filesToAdd = args[0] === '.' ? Object.keys(this.repo.workingTree) : args;

    for (const f of filesToAdd) {
      if (this.repo.workingTree[f] !== undefined) {
        this.repo.index.staged[f] = this.repo.workingTree[f];
        delete this.repo.index.unstaged[f];
      } else {
        return { success: false, output: `fatal: pathspec '${f}' did not match any files` };
      }
    }
    return { success: true, output: '' };
  }

  cmdCommit(args) {
    const messageIndex = args.indexOf('-m');
    if (messageIndex === -1 || !args[messageIndex + 1]) {
      return { success: false, output: 'Aborting commit due to empty commit message.' };
    }

    const message = args.slice(messageIndex + 1).join(' ').replace(/^["']|["']$/g, '');
    const stagedFiles = Object.keys(this.repo.index.staged);
    
    if (stagedFiles.length === 0) {
      return { success: false, output: 'nothing to commit, working tree clean' };
    }

    const headCommit = this._getHeadCommit();
    const parentHash = headCommit ? headCommit.hash : null;
    const files = headCommit ? { ...headCommit.files } : {};

    // Apply staged changes
    for (const f of stagedFiles) {
      files[f] = this.repo.index.staged[f];
    }

    const newCommit = {
      hash: this._generateHash(),
      message,
      author: 'Junior Dev <junior@pixelforge.com>',
      timestamp: Date.now(),
      parent: parentHash,
      files
    };

    this.repo.commits[newCommit.hash] = newCommit;
    this.repo.branches[this.repo.HEAD] = newCommit.hash;
    this.repo.index.staged = {};

    return { success: true, output: `[${this.repo.HEAD} ${newCommit.hash}] ${message}\n ${stagedFiles.length} file(s) changed` };
  }

  cmdLog(args) {
    let head = this._getHeadCommit();
    if (!head) {
      return { success: false, output: `fatal: your current branch '${this.repo.HEAD}' does not have any commits yet` };
    }

    const oneline = args.includes('--oneline');
    let output = '';
    
    while (head) {
      if (oneline) {
        output += `${head.hash} ${head.message}\n`;
      } else {
        output += `commit ${head.hash}\nAuthor: ${head.author}\nDate: ${new Date(head.timestamp).toString()}\n\n    ${head.message}\n\n`;
      }
      head = head.parent ? this.repo.commits[head.parent] : null;
    }
    return { success: true, output: output.trim() };
  }

  cmdBranch(args) {
    if (args.length === 0) {
      let output = '';
      for (const b in this.repo.branches) {
        output += (b === this.repo.HEAD ? '* ' : '  ') + b + '\n';
      }
      return { success: true, output: output.trim() };
    }

    const newBranch = args[0];
    if (this.repo.branches[newBranch]) {
      return { success: false, output: `fatal: A branch named '${newBranch}' already exists.` };
    }

    const headCommit = this._getHeadCommit();
    if (!headCommit) {
      return { success: false, output: `fatal: Not a valid object name: '${this.repo.HEAD}'.` };
    }

    this.repo.branches[newBranch] = headCommit.hash;
    return { success: true, output: '' };
  }

  cmdCheckout(args) {
    if (args.length === 0) return { success: false, output: 'fatal: missing branch name' };
    
    let targetBranch;
    if (args[0] === '-b') {
      if (args.length < 2) return { success: false, output: 'fatal: requires a branch name' };
      targetBranch = args[1];
      const res = this.cmdBranch([targetBranch]);
      if (!res.success) return res;
    } else {
      targetBranch = args[0];
      if (!this.repo.branches[targetBranch]) {
        return { success: false, output: `error: pathspec '${targetBranch}' did not match any file(s) known to git` };
      }
    }

    this.repo.HEAD = targetBranch;
    
    // Update working tree to match new branch head
    const headCommit = this._getHeadCommit();
    if (headCommit) {
      this.repo.workingTree = { ...headCommit.files };
      this.repo.index.unstaged = {}; // Clear unstaged (simplification)
    }
    
    return { success: true, output: `Switched to branch '${targetBranch}'` };
  }

  cmdMerge(args) {
    if (args.length === 0) return { success: false, output: 'fatal: missing branch name to merge' };
    const sourceBranch = args[0];
    
    if (!this.repo.branches[sourceBranch]) {
      return { success: false, output: `merge: ${sourceBranch} - not something we can merge` };
    }

    const sourceCommit = this.repo.commits[this.repo.branches[sourceBranch]];
    const targetCommit = this._getHeadCommit();

    if (!targetCommit) return { success: false, output: 'fatal: No commit to merge to.' };
    
    // Simplified Fast-Forward merge
    if (sourceCommit.parent === targetCommit.hash) {
      this.repo.branches[this.repo.HEAD] = sourceCommit.hash;
      this.repo.workingTree = { ...sourceCommit.files };
      return { success: true, output: `Updating ${targetCommit.hash}..${sourceCommit.hash}\nFast-forward` };
    }

    return { success: false, output: 'Merge conflicts not fully implemented in simulator yet. Please use fast-forward branches.' };
  }

  cmdRemote(args) {
    if (args[0] === 'add' && args.length >= 3) {
      const name = args[1];
      const url = args[2];
      this.repo.remotes[name] = { url, branches: {} };
      return { success: true, output: '' };
    }
    return { success: false, output: 'usage: git remote add <name> <url>' };
  }

  cmdPush(args) {
    const remote = args.includes('origin') ? 'origin' : (args.length > 0 ? args[0] : 'origin');
    if (!this.repo.remotes[remote]) {
      return { success: false, output: `fatal: '${remote}' does not appear to be a git repository` };
    }
    
    const branch = this.repo.HEAD;
    this.repo.remotes[remote].branches[branch] = this.repo.branches[branch];
    return { success: true, output: `To ${this.repo.remotes[remote].url}\n * [new branch]      ${branch} -> ${branch}` };
  }

  cmdPull(args) {
    return { success: true, output: 'Already up to date.' };
  }

  cmdClone(args) {
    if (args.length === 0) return { success: false, output: 'fatal: You must specify a repository to clone.' };
    this.reset();
    this.repo.initialized = true;
    this.repo.remotes['origin'] = { url: args[0], branches: { main: '0000000' } };
    this.repo.commits['0000000'] = { hash: '0000000', message: 'Initial commit', author: 'Remote', timestamp: Date.now(), parent: null, files: { 'README.md': '# Cloned Repo' } };
    this.repo.branches['main'] = '0000000';
    this.repo.HEAD = 'main';
    this.repo.workingTree = { 'README.md': '# Cloned Repo' };
    return { success: true, output: `Cloning into 'repo'...\ndone.` };
  }

  // Simulation helpers to modify files
  simTouch(filename) {
    if (!filename) return { success: false, output: 'touch: missing file operand' };
    if (!this.repo.workingTree[filename]) {
      this.repo.workingTree[filename] = '';
      this.repo.index.unstaged[filename] = '';
    }
    return { success: true, output: '' };
  }

  simEcho(args) {
    const redirectIdx = args.findIndex(a => a === '>' || a === '>>');
    if (redirectIdx === -1 || redirectIdx === args.length - 1) return { success: false, output: '' };
    
    const content = args.slice(0, redirectIdx).join(' ').replace(/^["']|["']$/g, '');
    const filename = args[redirectIdx + 1];
    const append = args[redirectIdx] === '>>';

    this.repo.workingTree[filename] = append ? (this.repo.workingTree[filename] || '') + content + '\n' : content + '\n';
    this.repo.index.unstaged[filename] = this.repo.workingTree[filename];
    
    return { success: true, output: '' };
  }
}
