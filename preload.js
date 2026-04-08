const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  runNative: (command, args, input) => ipcRenderer.invoke('run-native', command, args, input),
  saveProject: (projectData) => ipcRenderer.invoke('save-project-native', projectData),
  zipProject: (projectData) => ipcRenderer.invoke('zip-project-native', projectData),
  openPath: (path) => ipcRenderer.invoke('open-path-native', path),
  platform: process.platform,
  isElectron: true
});
