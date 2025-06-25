import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import * as path from 'path';
import { BibleDatabase } from '@bible/database';

// Initialize electron store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let database: BibleDatabase | null = null;

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createWindow(): void {
  // Get window state from store
  const windowState = store.get('windowState', {
    width: 1200,
    height: 800,
    x: undefined,
    y: undefined,
    maximized: false
  }) as any;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
  });

  // Restore maximized state
  if (windowState.maximized) {
    mainWindow.maximize();
  }

  // Load the web app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../web/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus on window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Save window state on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const isMaximized = mainWindow.isMaximized();
      
      store.set('windowState', {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        maximized: isMaximized
      });
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// App event handlers
app.whenReady().then(async () => {
  // Initialize database
  try {
    database = new BibleDatabase({
      databasePath: path.join(app.getPath('userData'), 'bible.db')
    });
    await database.initialize();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Create main window
  createWindow();

  // Set up menu
  createMenu();

  // Check for updates
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Clean up database connection
  if (database) {
    await database.close();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  if (!mainWindow) return null;
  
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('database-query', async (event, query, params) => {
  if (!database) {
    throw new Error('Database not initialized');
  }
  
  try {
    const db = database.getDatabase();
    if (!db) throw new Error('Database connection not available');
    
    const result = db.exec(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});

// Menu creation
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'new-note');
          }
        },
        {
          label: 'Open Bible File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (!mainWindow) return;
            
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'USFM Files', extensions: ['usfm', 'sfm'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('menu-action', 'open-bible-file', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Export Notes',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'export-notes');
          }
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Go to Verse',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'go-to-verse');
          }
        },
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'search');
          }
        },
        { type: 'separator' },
        {
          label: 'Previous Chapter',
          accelerator: 'CmdOrCtrl+Left',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'previous-chapter');
          }
        },
        {
          label: 'Next Chapter',
          accelerator: 'CmdOrCtrl+Right',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'next-chapter');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Quote Creator',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'quote-creator');
          }
        },
        {
          label: 'Reading Plans',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'reading-plans');
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'preferences');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About Bible App',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Bible App',
              message: 'Bible App',
              detail: `Version: ${app.getVersion()}\nA comprehensive Bible study application.`
            });
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/GinHouPh/bible');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});
