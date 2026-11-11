/**
 * Preload for the floating HUD window.
 *
 * The renderer is sandboxed and gets exactly three verbs: receive state, report
 * pointer hover (drives the idle fade), and close the window.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('openfinHud', {
  /** Subscribe to `{ config, snapshot, error, updatedAt }` pushes. */
  onState(callback) {
    if (typeof callback !== 'function') return () => {}
    const listener = (_event, state) => callback(state)
    ipcRenderer.on('hud:state', listener)
    return () => ipcRenderer.removeListener('hud:state', listener)
  },
  /** Pointer entered/left the card. */
  hover(value) {
    ipcRenderer.send('hud:hover', Boolean(value))
  },
  /** Ask the main process to close the window and quit. */
  close() {
    ipcRenderer.send('hud:close')
  },
  /** First paint done; ask for a state push. */
  ready() {
    ipcRenderer.send('hud:ready')
  },
})
