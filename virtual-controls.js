// Virtual on-screen controls for mobile devices
export class VirtualControls {
    constructor() {
        this.isVisible = false;
        this.isEnabled = false;
        this.activeButtons = new Set();
        this.controlsContainer = null;
        this.isMobile = this.detectMobile();
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 600 ||
               'ontouchstart' in window;
    }

    init() {
        this.createControlsHTML();
        this.bindElements();
        this.attachEventListeners();
        
        // Enable by default on mobile, disable on desktop
        if (this.isMobile) {
            this.enable();
            this.show();
        } else {
            this.disable();
            this.hide();
        }
    }

    createControlsHTML() {
        const controlsHTML = `
            <div id="virtual-controls" class="virtual-controls-hidden">
                <div class="virtual-controls-container">
                    <!-- D-Pad -->
                    <div class="dpad-container">
                        <div class="dpad">
                            <button class="dpad-btn dpad-up" data-button="up">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <button class="dpad-btn dpad-left" data-button="left">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="dpad-btn dpad-center"></button>
                            <button class="dpad-btn dpad-right" data-button="right">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="dpad-btn dpad-down" data-button="down">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button class="virtual-action-btn btn-b" data-button="b">B</button>
                        <button class="virtual-action-btn btn-a" data-button="a">A</button>
                    </div>

                    <!-- System Buttons -->
                    <div class="system-buttons">
                        <div class="system-left">
                            <button class="system-btn btn-select" data-button="select">SELECT</button>
                            <button class="shoulder-btn btn-l" data-button="l">L</button>
                        </div>
                        <div class="system-right">
                            <button class="system-btn btn-start" data-button="start">START</button>
                            <button class="shoulder-btn btn-r" data-button="r">R</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', controlsHTML);
    }

    bindElements() {
        this.controlsContainer = document.getElementById('virtual-controls');
        this.buttons = this.controlsContainer.querySelectorAll('[data-button]');
    }

    attachEventListeners() {
        this.buttons.forEach(button => {
            const buttonName = button.dataset.button;
            
            // Touch events
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pressButton(buttonName, button);
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.unpressButton(buttonName, button);
            });
            
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.unpressButton(buttonName, button);
            });

            // Mouse events (for desktop testing)
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.pressButton(buttonName, button);
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.unpressButton(buttonName, button);
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                this.unpressButton(buttonName, button);
            });

            // Prevent context menu
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });

        // Prevent scrolling when touching controls
        this.controlsContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
    }

    pressButton(buttonName, buttonElement) {
        if (!this.isEnabled) return;
        if (this.activeButtons.has(buttonName)) return;
        
        this.activeButtons.add(buttonName);
        buttonElement.classList.add('pressed');
        
        // Send button press to emulator
        if (window.Module && window.Module.buttonPress) {
            window.Module.buttonPress(buttonName);
        }
    }

    unpressButton(buttonName, buttonElement) {
        if (!this.isEnabled) return;
        if (!this.activeButtons.has(buttonName)) return;
        
        this.activeButtons.delete(buttonName);
        buttonElement.classList.remove('pressed');
        
        // Send button unpress to emulator
        if (window.Module && window.Module.buttonUnpress) {
            window.Module.buttonUnpress(buttonName);
        }
    }

    show() {
        if (this.controlsContainer) {
            this.controlsContainer.classList.remove('virtual-controls-hidden');
            this.isVisible = true;
        }
    }

    hide() {
        if (this.controlsContainer) {
            this.controlsContainer.classList.add('virtual-controls-hidden');
            this.isVisible = false;
        }
    }

    enable() {
        this.isEnabled = true;
        if (this.controlsContainer) {
            this.controlsContainer.classList.remove('virtual-controls-disabled');
        }
    }

    disable() {
        this.isEnabled = false;
        if (this.controlsContainer) {
            this.controlsContainer.classList.add('virtual-controls-disabled');
        }
        // Release any active buttons
        this.releaseAllButtons();
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
            this.disable();
        } else {
            this.show();
            this.enable();
        }
    }

    releaseAllButtons() {
        this.buttons.forEach(button => {
            const buttonName = button.dataset.button;
            this.unpressButton(buttonName, button);
        });
    }

    isMobileDevice() {
        return this.isMobile;
    }

    isControlsVisible() {
        return this.isVisible;
    }
}

// CSS for virtual controls
export const virtualControlsCSS = `
#virtual-controls {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 0.6;
}

#virtual-controls.virtual-controls-hidden {
  opacity: 0;
  pointer-events: none;
}

#virtual-controls.virtual-controls-disabled {
  opacity: 0;
  pointer-events: none;
}

.virtual-controls-container {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* D-Pad */
.dpad-container {
  position: absolute;
  bottom: 120px;
  left: 30px;
  pointer-events: auto;
}

.dpad {
  position: relative;
  width: 120px;
  height: 120px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 2px;
}

.dpad-btn {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border: 1px solid #333;
  color: #F5DEB3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dpad-up { grid-column: 2; grid-row: 1; }
.dpad-left { grid-column: 1; grid-row: 2; }
.dpad-center { 
  grid-column: 2; 
  grid-row: 2; 
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}
.dpad-right { grid-column: 3; grid-row: 2; }
.dpad-down { grid-column: 2; grid-row: 3; }

.dpad-btn:not(.dpad-center):active,
.dpad-btn:not(.dpad-center).pressed {
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-color: #F5DEB3;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 222, 179, 0.2);
}

/* Action Buttons */
.action-buttons {
  position: absolute;
  bottom: 140px;
  right: 30px;
  display: flex;
  gap: 15px;
  pointer-events: auto;
}

.virtual-action-btn {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border: 1px solid #333;
  color: #F5DEB3;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.virtual-action-btn:active,
.virtual-action-btn.pressed {
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-color: #F5DEB3;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 222, 179, 0.2);
}

// .btn-a {
//   background: linear-gradient(145deg, #dc143c, #b71c1c);
//   border-color: #dc143c;
// }

// .btn-b {
//   background: linear-gradient(145deg, #1e90ff, #1976d2);
//   border-color: #1e90ff;
// }

/* System Buttons */
.system-buttons {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  pointer-events: auto;
}

.system-left,
.system-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.system-btn {
  padding: 8px 16px;
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border: 1px solid #333;
  color: #F5DEB3;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.shoulder-btn {
  padding: 6px 12px;
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border: 1px solid #333;
  color: #F5DEB3;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.system-btn:active,
.system-btn.pressed,
.shoulder-btn:active,
.shoulder-btn.pressed {
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-color: #F5DEB3;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 222, 179, 0.2);
}

`; 
