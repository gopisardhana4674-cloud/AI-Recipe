const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendChatMessage: (messages, apiKey, activeProvider, customKeys) => 
    ipcRenderer.send('send-chat-message', { messages, apiKey, activeProvider, customKeys }),
  onChatChunk: (callback) => {
    ipcRenderer.removeAllListeners('chat-chunk');
    ipcRenderer.on('chat-chunk', (event, value) => callback(value));
  },
  onChatError: (callback) => {
    ipcRenderer.removeAllListeners('chat-error');
    ipcRenderer.on('chat-error', (event, value) => callback(value));
  },
  onChatDone: (callback) => {
    ipcRenderer.removeAllListeners('chat-done');
    ipcRenderer.on('chat-done', (event) => callback());
  },
  onToolExecuted: (callback) => {
    ipcRenderer.removeAllListeners('tool-executed');
    ipcRenderer.on('tool-executed', (event, value) => callback(value));
  },
  onConfirmAction: (callback) => {
    ipcRenderer.removeAllListeners('confirm-action');
    ipcRenderer.on('confirm-action', (event, value) => callback(value));
  },
  respondPermission: (id, allowed) => ipcRenderer.send('respond-permission', { id, allowed }),
  onActiveProviderChanged: (callback) => {
    ipcRenderer.removeAllListeners('active-provider-changed');
    ipcRenderer.on('active-provider-changed', (event, value) => callback(value));
  },
  testProvider: (provider, keys) => ipcRenderer.invoke('test-provider', { provider, keys }),
  onAddFailoverHistory: (callback) => {
    ipcRenderer.removeAllListeners('add-failover-history');
    ipcRenderer.on('add-failover-history', (event, value) => callback(value));
  },
});
