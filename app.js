// Main application file
import { LoadingManager, loadingCSS } from './loading.js';
import { ErrorManager, errorCSS } from './error.js';
import { BottomPanel, bottomPanelCSS } from './bottom-panel.js';
import { controlsModalCSS } from './controls-modal.js';
import { virtualControlsCSS } from './virtual-controls.js';
import { EmulatorManager, emulatorCSS } from './emulator.js';
import { discordSDK } from './discord-sdk.js';

class App {
    constructor() {
        this.loadingManager = null;
        this.errorManager = null;
        this.bottomPanel = null;
        this.emulatorManager = null;
    }

    async init() {
        this.injectCSS();
        this.createAppContainer();
        await this.initializeManagers();
    }

    injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            ${this.getBaseCSS()}
            ${loadingCSS}
            ${errorCSS}
            ${bottomPanelCSS}
            ${controlsModalCSS}
            ${virtualControlsCSS}
            ${emulatorCSS}
        `;
        document.head.appendChild(style);
    }

    getBaseCSS() {
        return `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            html, body {
              height: 100%;
              overflow: hidden;
            }

            :root {
              font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              font-weight: 400;

              color-scheme: light dark;
              color: rgba(255, 255, 255, 0.87);
              background-color: #242424;

              font-synthesis: none;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            #app {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              height: 100vh;
              width: 100vw;
              position: relative;
            }
        `;
    }

    createAppContainer() {
        // Check if app container already exists
        let appContainer = document.getElementById('app');
        if (!appContainer) {
            appContainer = document.createElement('div');
            appContainer.id = 'app';
            document.body.appendChild(appContainer);
        }
        // Clear any existing content in the container
        appContainer.innerHTML = '';
    }

    async initializeManagers() {
        if (discordSDK.available()) {
            // Initialize Discord SDK first (fire and forget, it will handle errors)
            discordSDK.initialize().catch(error => {
                console.warn('Discord SDK initialization failed, using fallback methods:', error);
            });
        }
        
        // Initialize managers in the correct order
        this.loadingManager = new LoadingManager();
        this.errorManager = new ErrorManager();
        this.bottomPanel = new BottomPanel();
        this.emulatorManager = new EmulatorManager(this.loadingManager, this.errorManager);
        
        // Ensure proper positioning by moving canvas to app container
        const canvas = document.getElementById('screen');
        const appContainer = document.getElementById('app');
        if (canvas && appContainer) {
            appContainer.appendChild(canvas);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
}); 
