// Controls modal functionality
export class ControlsModal {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createModalHTML();
        this.bindElements();
        this.attachEventListeners();
    }

    createModalHTML() {
        const modalHTML = `
            <div id="controls-modal" class="controls-hidden">
                <div class="controls-container">
                    <div class="controls-header">
                        <h3><i class="fa-solid fa-gamepad"></i> Game Controls</h3>
                        <button id="controls-close">×</button>
                    </div>
                    
                    <div class="controls-body">
                        <div class="controls-section">
                            <h4>Movement</h4>
                            <div class="control-row">
                                <span class="control-key">↑ ↓ ← →</span>
                                <span class="control-desc">D-Pad / Movement</span>
                            </div>
                        </div>
                        
                        <div class="controls-section">
                            <h4>Action Buttons</h4>
                            <div class="control-row">
                                <span class="control-key">Z</span>
                                <span class="control-desc">B Button</span>
                            </div>
                            <div class="control-row">
                                <span class="control-key">X</span>
                                <span class="control-desc">A Button</span>
                            </div>
                        </div>
                        
                        <div class="controls-section">
                            <h4>System</h4>
                            <div class="control-row">
                                <span class="control-key">Enter</span>
                                <span class="control-desc">Start</span>
                            </div>
                            <div class="control-row">
                                <span class="control-key">Backspace</span>
                                <span class="control-desc">Select</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindElements() {
        this.modal = document.getElementById('controls-modal');
        this.closeBtn = document.getElementById('controls-close');
    }

    attachEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Close on background click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }
    }

    show() {
        if (this.modal) {
            this.modal.classList.remove('controls-hidden');
            this.isVisible = true;
        }
    }

    hide() {
        if (this.modal) {
            this.modal.classList.add('controls-hidden');
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// CSS for controls modal
export const controlsModalCSS = `
#controls-modal {
  position: fixed;
  bottom: 80px;
  left: 20px;
  z-index: 1002;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  opacity: 1;
}

#controls-modal.controls-hidden {
  transform: translateY(100%);
  opacity: 0;
  pointer-events: none;
}

.controls-container {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border: 1px solid #333;
  color: white;
  font-family: inherit;
  width: 320px;
  overflow: hidden;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  background: rgba(245, 222, 179, 0.05);
}

.controls-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #F5DEB3;
}

#controls-close {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#controls-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #F5DEB3;
}

.controls-body {
  padding: 20px;
}

.controls-section {
  margin-bottom: 24px;
}

.controls-section:last-child {
  margin-bottom: 0;
}

.controls-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #F5DEB3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-row:hover {
  background: rgba(245, 222, 179, 0.08);
  border-color: rgba(245, 222, 179, 0.2);
}

.control-key {
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  color: #F5DEB3;
  padding: 6px 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  min-width: 60px;
  text-align: center;
}

.control-desc {
  color: #ccc;
  font-size: 13px;
  font-weight: 400;
}

@media (max-width: 600px) {
  .controls-container {
    width: 240px;
  }
  .controls-header {
    padding: 8px 10px;
  }
  .controls-body {
    padding: 10px;
  }
  .control-row {
    padding: 5px 6px;
  }
  .control-key {
    padding: 3px 6px;
    min-width: 40px;
  }
}

@media (max-width: 370px) {
  #controls-modal {
    bottom: 50px;
    left: 10px;
  }
}
`; 
