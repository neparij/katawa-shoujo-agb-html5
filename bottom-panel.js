// Bottom panel functionality with social buttons and controls trigger
import { ENV } from "./env.js";
import { ControlsModal } from "./controls-modal.js";
import { discordSDK } from "./discord-sdk.js";
import { VirtualControls } from "./virtual-controls.js";

export class BottomPanel {
    constructor() {
        this.bottomPanel = null;
        this.controlsModal = null;
        this.virtualControls = null;
        this.init();
    }

    init() {
        this.createBottomPanelHTML();
        this.bindElements();
        this.attachEventListeners();
        this.initializeControlsModal();
    }

    createBottomPanelHTML() {
        const bottomPanelHTML = `
            <div id="bottom-panel">
                <div id="bottom-actions">
                    <div id="left-actions">
                        <button id="controls-show-btn" class="action-btn">
                            <i class="fa-solid fa-gamepad"></i> <span>Controls</span>
                        </button>
                        <button id="virtual-controls-toggle-btn" class="action-btn">
                            <i class="fa-solid fa-mobile-screen-button"></i> <span>Touch</span>
                        </button>
<!--                        <button id="preferences-toggle-btn" class="action-btn">-->
<!--                            <i class="fa-solid fa-gear"></i> <span>Preferences</span>-->
<!--                        </button>-->
                    </div>
                    
                    <div id="right-actions">
                        <button id="itch-btn" class="icon-btn" title="Itch.io">
                            <i class="fab fa-itch-io"></i>
                        </button>
                        
                        <button id="discord-btn" class="icon-btn" title="Discord">
                            <i class="fab fa-discord"></i>
                        </button>

                        <i class="spacer-10"></i>
                        
                        <button id="fullscreen-btn" class="icon-btn" title="Toggle Fullscreen">
                            <i class="fa-solid fa-maximize"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', bottomPanelHTML);
    }

    bindElements() {
        this.bottomPanel = document.getElementById('bottom-panel');
        this.controlsShowBtn = document.getElementById('controls-show-btn');
        this.virtualControlsToggleBtn = document.getElementById('virtual-controls-toggle-btn');
        this.itchBtn = document.getElementById('itch-btn');
        this.discordBtn = document.getElementById('discord-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
    }

    attachEventListeners() {
        if (this.controlsShowBtn) {
            this.controlsShowBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggleControls();
            });
        }

        if (this.virtualControlsToggleBtn) {
            this.virtualControlsToggleBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggleVirtualControls();
            });
        }

        if (this.itchBtn) {
            this.itchBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.openExternalLink(ENV.ITCH_IO_LINK);
            });
        }

        if (this.discordBtn) {
            this.discordBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.openExternalLink(ENV.DISCORD_LINK);
            });
        }

        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.toggleFullscreen();
            });
        }
    }

    initializeControlsModal() {
        this.controlsModal = new ControlsModal();
        this.virtualControls = new VirtualControls();

        if (this.virtualControls.isEnabled) {
            this.controlsModal.hide();
            // this.controlsShowBtn.classList.add('hidden');
        }
    }

    toggleControls() {
        if (this.controlsModal) {
            this.controlsModal.toggle();
        }
    }

    toggleVirtualControls() {
        if (this.virtualControls) {
            this.virtualControls.toggle();

            if (this.virtualControls.isEnabled) {
                this.controlsModal.hide();
                // this.controlsShowBtn.classList.add('hidden');
            } else {
                // this.controlsShowBtn.classList.remove('hidden');
            }
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().then(() => {
                // Update icon to compress/exit fullscreen
                const icon = this.fullscreenBtn.querySelector('i');
                icon.classList.remove('fa-maximize');
                icon.classList.add('fa-minimize');
                this.fullscreenBtn.title = 'Exit Fullscreen';
            }).catch(err => {
                console.warn('Could not enter fullscreen:', err);
            });
        } else {
            // Exit fullscreen
            document.exitFullscreen().then(() => {
                // Update icon back to expand
                const icon = this.fullscreenBtn.querySelector('i');
                icon.classList.remove('fa-minimize');
                icon.classList.add('fa-maximize');
                this.fullscreenBtn.title = 'Toggle Fullscreen';
            }).catch(err => {
                console.warn('Could not exit fullscreen:', err);
            });
        }
    }

    async openExternalLink(url) {
        if (discordSDK.available() && discordSDK.isSDKReady()) {
            await discordSDK.openExternalLink(url);
        } else {
            try {
                window.open(url, '_blank');
            } catch (error) {
                console.warn('Could not open external link:', error);
                try {
                    window.location.href = url;
                } catch (finalError) {
                    console.error('All methods failed to open external link:', finalError);
                }
            }
        }
    }
}

// CSS for bottom panel
export const bottomPanelCSS = `
#bottom-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

#bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  width: 100%;
}

#left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

#right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  color: #F5DEB3;
  border: 1px solid #333;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 222, 179, 0.2);
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-color: #F5DEB3;
}

.icon-btn {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  color: #F5DEB3;
  border: 1px solid #333;
  padding: 0px 0px;
  border-radius: 8px;
  font-size: 32px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 222, 179, 0.2);
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-color: #F5DEB3;
}

.action-btn span {
  font-size: 13px;
}

@media (max-width: 600px) {
  .action-btn span {
    display: none;
  }
  .action-btn {
    padding: 0px 0px;
    font-size: 24px;
  }
}

@media (max-width: 370px) {
  #bottom-actions {
    padding: 10px;
  }
  
  .action-btn span {
    display: none;
  }
  .action-btn {
    padding: 0px 0px;
    font-size: 16px;
    height: 32px;
    min-width: 32px;
  }
  
  .icon-btn {
    font-size: 16px;
    height: 32px;
    min-width: 32px;
  }
}

.spacer-10 {
  width: 10px;
}
`; 
