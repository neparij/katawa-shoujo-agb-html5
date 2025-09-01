// Emulator functionality
import mGBAEmulator from '@thenick775/mgba-wasm';
// import "@emulatorjs/core-mgba";
import { ENV } from "./env.js";
import mGBA from "@thenick775/mgba-wasm";

export class EmulatorManager {
    constructor(loadingManager, errorManager) {
        this.loadingManager = loadingManager;
        this.errorManager = errorManager;
        this.canvas = null;
        this.Module = null;
        this.romName = ENV.ROM_PATH;
        this.romCacheKey = ENV.ROM_CACHE_KEY;
        this.ENABLE_LOADING_DELAYS = ENV.ENABLE_LOADING_DELAYS;
        this.init();
    }

    init() {
        this.createCanvasHTML();
        this.bindElements();
        this.initializeEmulator().catch(error => {
            this.errorManager.show("Error loading the game", error.message);
        });
    }

    createCanvasHTML() {
        const canvasHTML = `
            <canvas id="screen" width="240" height="160"></canvas>
        `;
        
        // Wait for app container to exist, then append to it
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.insertAdjacentHTML('beforeend', canvasHTML);
        } else {
            // Fallback to body if app container doesn't exist yet
            document.body.insertAdjacentHTML('beforeend', canvasHTML);
        }
    }

    bindElements() {
        this.canvas = document.getElementById('screen');
    }

    // Helper function to add delays for testing
    delay(ms) {
        if (!this.ENABLE_LOADING_DELAYS) {
            return Promise.resolve();
        }
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ROM caching using IndexedDB
    initROMCache() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ROMCache', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('roms')) {
                    db.createObjectStore('roms', { keyPath: 'name' });
                }
            };
        });
    }

    async getROMFromCache(romCacheKey) {
        if (!romCacheKey) {
            return null;
        }
        try {
            const db = await this.initROMCache();
            const transaction = db.transaction(['roms'], 'readonly');
            const store = transaction.objectStore('roms');
            
            return new Promise((resolve, reject) => {
                const request = store.get(romCacheKey);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    if (request.result) {
                        console.log(`ROM "${romCacheKey}" found in cache`);
                        resolve(request.result.data);
                    } else {
                        console.log(`ROM "${romCacheKey}" not found in cache`);
                        resolve(null);
                    }
                };
            });
        } catch (error) {
            console.warn('Cache read failed:', error);
            return null;
        }
    }

    async storeROMInCache(romCacheKey, romData) {
        if (!romCacheKey) {
            throw new Error('No ROM cache key provided');
        }
        if (!romData || romData.length === 0) {
            throw new Error('No ROM data to cache');
        }
        try {
            const db = await this.initROMCache();
            const transaction = db.transaction(['roms'], 'readwrite');
            const store = transaction.objectStore('roms');
            
            const romRecord = {
                name: romCacheKey,
                data: romData,
                timestamp: Date.now()
            };
            
            return new Promise((resolve, reject) => {
                const request = store.put(romRecord);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    console.log(`ROM "${romCacheKey}" cached successfully`);
                    resolve();
                };
            });
        } catch (error) {
            console.warn('Cache write failed:', error);
        }
    }

    // Method to get ROM file (cached or download)
    async getROMFile(romName, romCacheKey) {
        // First, try to get from cache
        const cachedROM = await this.getROMFromCache(romCacheKey);
        if (cachedROM) {
            this.loadingManager.updateText('ROM found in cache!');
            await this.delay(500);
            return cachedROM;
        }
        
        // If not cached, download it
        this.loadingManager.updateText('Downloading ROM...');
        
        const response = await fetch("data/" + romName);
        if (!response.ok) {
            throw new Error(`Failed to fetch ROM "${romName}": ${response.status} ${response.statusText}`);
        }
        
        const contentLength = response.headers.get('Content-Length');
        let buffer;
        
        if (!contentLength) {
            // Handle loading without Content-Length header
            this.loadingManager.updateText('Downloading ROM...');
            await this.delay(2000);
            buffer = await response.arrayBuffer();
        } else {
            // Original logic for when Content-Length is available
            const total = parseInt(contentLength, 10);
            let loaded = 0;

            const reader = response.body.getReader();
            const stream = new ReadableStream({
                start: (controller) => {
                    const push = () => {
                        reader.read().then(async ({done, value}) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            loaded += value.byteLength;
                            const progress = (loaded / total * 100).toFixed(0);
                            this.loadingManager.updateText(`Downloading ROM... ${progress}%`);

                            // Add small delays during download simulation
                            await this.delay(50);

                            controller.enqueue(value);
                            push();
                        }).catch(error => {
                            console.error("Error reading the stream:", error);
                            this.errorManager.show("Error reading ROM data", error.message);
                            controller.error(error);
                        });
                    };

                    push();
                }
            });

            buffer = await new Response(stream).arrayBuffer();
        }
        
        const romData = new Uint8Array(buffer);
        
        // Cache the downloaded ROM
        try {
            await this.storeROMInCache(romCacheKey, romData);
        } catch (error) {
            console.warn('Failed to cache ROM:', error);
        }
        
        return romData;
    }

    // Method to setup emulator settings
    async setupEmulator(romData, romName, Module) {
        this.loadingManager.updateText('Validating ROM data...');
        await this.delay(1200);
        
        // Validate that we actually got ROM data, not an HTML error page
        if (romData.byteLength < 1024) {
            throw new Error(`ROM file "${romName}" appears to be too small (${romData.byteLength} bytes). Possible server error.`);
        }
        
        // Check if the response looks like HTML (common when server returns error pages)
        const firstBytes = new TextDecoder().decode(romData.slice(0, 100));
        if (firstBytes.toLowerCase().includes('<html') || firstBytes.toLowerCase().includes('<!doctype')) {
            throw new Error(`ROM file "${romName}" not found. Server returned HTML error page instead of ROM data.`);
        }
        
        this.loadingManager.updateText('Setting up emulator...');
        await this.delay(1000);
        
        await Module.FS.writeFile('/' + romName, romData);
    }

    // Method to start the game
    async startGame(romName, Module) {
        this.loadingManager.updateText('Loading game...');
        await this.delay(1500);
        
        try {
            Module.loadGame('/' + romName);
        } catch (loadError) {
            throw new Error(`Failed to load ROM "${romName}": ${loadError.message || 'Invalid ROM format'}`);
        }

        console.log("ROM loaded");
        this.loadingManager.hide();
    }

    setupCallbacks(Module) {
        Module.addCoreCallbacks({
            saveDataUpdatedCallback: () => {
                Module.FSSync().then(() => {
                    console.log("saveDataUpdatedCallback");
                });
            },
            coreCrashedCallback() {
                console.error("Core has crashed!");
                this.errorManager.show("Emulator Crashed", "The emulator has encountered a fatal error and needs to restart. Please reload the page.");
            },
            // keysReadCallback: () => {
            //     console.log("keysReadCallback");
            // }
        });
    }

    async initializeEmulator() {
        this.loadingManager.show('Loading mGBA WASM core...');


        window.Module = {
            canvas: this.canvas
        };

        await mGBA(window.Module).then(function (Module) {
            console.log(Module.version.projectName +
                ' ' +
                Module.version.projectVersion);
        });

        let isSharedBufferAvailable = function () {
            try {
                return typeof SharedArrayBuffer === 'function';
            } catch (e) {
                return false;
            }
        }

        console.log("isSharedBufferAvailable", isSharedBufferAvailable());

        Module.setCoreSettings({
            baseFpsTarget: 59.7275,
            allowOpposingDirections: false,
            videoSync: false,
            audioSync: true,
            threadedVideo: isSharedBufferAvailable(),
            rewindEnable: false,
            // timestepSync: true,
            showFpsCounter: true,
            autoSaveStateEnable: false,
            restoreAutoSaveStateOnLoad: false,
        })
        await Module.FSInit();
        this.loadingManager.updateText('Initializing filesystem...');

        // await gba.FSInit();
        console.log("Saves: ", Module.listSaves());

        this.loadingManager.updateText('Loading ROM...');
        const romData = await this.getROMFile(this.romName, this.romCacheKey);
        await this.setupEmulator(romData, this.romName, Module);
        await this.startGame(this.romName, Module);
        this.setupCallbacks(Module);
    }
}

// CSS for emulator canvas
export const emulatorCSS = `
#screen {
  width: 100%;
  max-width: 960px;
  height: calc(100dvh - 88px);
  object-fit: contain;
  image-rendering: pixelated;
}
`;
