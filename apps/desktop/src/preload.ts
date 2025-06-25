import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // File dialogs
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),

  // Database operations
  databaseQuery: (query: string, params?: any[]) => 
    ipcRenderer.invoke('database-query', query, params),

  // Menu actions
  onMenuAction: (callback: (action: string, ...args: any[]) => void) => {
    ipcRenderer.on('menu-action', (event, action, ...args) => callback(action, ...args));
  },

  // Remove menu action listener
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  },

  // Platform detection
  platform: process.platform,
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getUserDataPath: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      databaseQuery: (query: string, params?: any[]) => Promise<any>;
      onMenuAction: (callback: (action: string, ...args: any[]) => void) => void;
      removeMenuActionListener: () => void;
      platform: string;
      isDevelopment: boolean;
    };
  }
}
