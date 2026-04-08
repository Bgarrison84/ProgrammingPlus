const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  runNative: (command, args, input) => ipcRenderer.invoke('run-native', command, args, input),
  saveProject: (projectData) => ipcRenderer.invoke('save-project-native', projectData),
  zipProject: (projectData) => ipcRenderer.invoke('zip-project-native', projectData),
  openPath: (path) => ipcRenderer.invoke('open-path-native', path),
  checkCompiler: (command) => ipcRenderer.invoke('check-compiler-native', command),
  initGit: (dir) => ipcRenderer.invoke('git-init-native', dir),
  askAI: (prompt) => ipcRenderer.invoke('ollama-chat-native', prompt),
  lintCode: (command, args, input) => ipcRenderer.invoke('lint-code-native', command, args, input),
  terminal: {
    send: (data) => ipcRenderer.send('terminal-input', data),
    resize: (cols, rows) => ipcRenderer.send('terminal-resize', { cols, rows }),
    onData: (cb) => ipcRenderer.on('terminal-data', (event, data) => cb(data))
  },
  platform: process.platform,
  isElectron: true
});
