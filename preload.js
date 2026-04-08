const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  runNative: (command, args, input) => ipcRenderer.invoke('run-native', command, args, input),
  saveProject: (projectData) => ipcRenderer.invoke('save-project-native', projectData),
  zipProject: (projectData) => ipcRenderer.invoke('zip-project-native', projectData),
  openPath: (path) => ipcRenderer.invoke('open-path-native', path),
  checkCompiler: (command) => ipcRenderer.invoke('check-compiler-native', command),
  initGit: (dir) => ipcRenderer.invoke('git-init-native', dir),
  askAI: (prompt) => ipcRenderer.invoke('ollama-chat-native', prompt),
  platform: process.platform,
  isElectron: true
});
