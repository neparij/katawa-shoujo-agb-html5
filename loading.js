// Loading overlay functionality
export class LoadingManager {
    constructor() {
        this.loadingOverlay = null;
        this.loadingText = null;
        this.init();
    }

    init() {
        // Create and inject loading overlay HTML
        this.createLoadingHTML();
        this.bindElements();
    }

    createLoadingHTML() {
        const loadingHTML = `
            <div id="loading-overlay">
                <div class="loading-spinner"></div>
                <div id="loading-text">Loading...</div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    bindElements() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
    }

    show(text = 'Loading...') {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hide() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    updateText(text) {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
}

// CSS for loading overlay
export const loadingCSS = `
#loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(36, 36, 36, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

#loading-text {
  color: #F5DEB3;
  font-size: 18px;
  font-weight: 500;
  margin-top: 20px;
  text-align: center;
  letter-spacing: 0.5px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(245, 222, 179, 0.2);
  border-top: 4px solid #F5DEB3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(245, 222, 179, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`; 