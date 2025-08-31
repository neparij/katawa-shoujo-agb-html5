// Error handling functionality
export class ErrorManager {
    constructor() {
        this.errorBox = null;
        this.errorMessage = null;
        this.init();
    }

    init() {
        this.createErrorHTML();
        this.bindElements();
    }

    createErrorHTML() {
        const errorHTML = `
            <div id="error-box">
                <h3>Error</h3>
                <p id="error-message"></p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    bindElements() {
        this.errorBox = document.getElementById('error-box');
        this.errorMessage = document.getElementById('error-message');
    }

    show(title, message) {
        console.log('Error:', title, message);
        
        if (!this.errorBox || !this.errorMessage) {
            console.error('Error elements not found!');
            alert(`${title}: ${message}`);
            return;
        }
        
        this.errorMessage.textContent = message;
        this.errorBox.style.display = 'block';
        
        console.error(title + ':', message);
    }

    hide() {
        if (this.errorBox) {
            this.errorBox.style.display = 'none';
        }
    }
}

// CSS for error box
export const errorCSS = `
#error-box {
  width: 80%;
  max-width: 600px;
  background-color: #ff4444;
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px 0;
  display: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1002;
}

#error-box h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

#error-box p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}
`; 