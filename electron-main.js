const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('app.html');
  // win.webContents.openDevTools(); // Uncomment for debugging
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers for Native Operations ---

// Open a path in the system file explorer
ipcMain.handle('open-path-native', async (event, targetPath) => {
  if (fs.existsSync(targetPath)) {
    shell.openPath(targetPath);
    return { success: true };
  }
  return { success: false, error: 'Path does not exist' };
});

// Check if a compiler/binary exists on the system
ipcMain.handle('check-compiler-native', async (event, command) => {
  return new Promise((resolve) => {
    const checkCmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
    exec(checkCmd, (error) => {
      resolve({
        exists: !error,
        command
      });
    });
  });
});

// Initialize a git repo in a folder
ipcMain.handle('git-init-native', async (event, targetDir) => {
  return new Promise((resolve) => {
    const cmd = `cd /d "${targetDir}" && git init && git add . && git commit -m "Initial commit from Programming Plus"`;
    exec(cmd, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout,
        stderr,
        error: error ? error.message : null
      });
    });
  });
});

// Execute native command (e.g., python, rustc, go)
ipcMain.handle('run-native', async (event, command, args, input) => {
  return new Promise((resolve) => {
    const tempFile = path.join(app.getPath('temp'), `pp_temp_${Date.now()}`);
    fs.writeFileSync(tempFile, input);

    const fullCommand = `${command} ${args.join(' ')} "${tempFile}"`;
    
    exec(fullCommand, (error, stdout, stderr) => {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      
      resolve({
        success: !error,
        stdout,
        stderr,
        error: error ? error.message : null
      });
    });
  });
});

// Save project to a real folder (for GitHub)
ipcMain.handle('save-project-native', async (event, projectData) => {
  const { title, files } = projectData;
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: `Select folder to save: ${title}`
  });

  if (result.canceled) return { success: false, error: 'Cancelled' };

  const targetDir = result.filePaths[0];
  try {
    for (const file of files) {
      const filePath = path.join(targetDir, file.name);
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(filePath, file.content);
    }
    return { success: true, path: targetDir };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Zip and save project
ipcMain.handle('zip-project-native', async (event, projectData) => {
  const { title, files } = projectData;
  const zip = new AdmZip();
  
  for (const file of files) {
    zip.addFile(file.name, Buffer.from(file.content, 'utf8'));
  }

  const result = await dialog.showSaveDialog({
    defaultPath: `${title.replace(/\s+/g, '_')}.zip`,
    filters: [{ name: 'Zip Files', extensions: ['zip'] }]
  });

  if (result.canceled) return { success: false, error: 'Cancelled' };

  try {
    zip.writeZip(result.filePath);
    return { success: true, path: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
