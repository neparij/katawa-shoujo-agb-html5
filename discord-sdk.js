// Discord SDK Manager
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { ENV } from './env.js';

export class DiscordSDKManager {
    constructor() {
        this.sdk = null;
        this.isReady = false;
        this.isInitializing = false;
        this.initPromise = null;
    }

    available() {
        return !!ENV.DISCORD_CLIENT_ID && ENV.DISCORD_CLIENT_ID.length > 0;
    }

    async initialize() {
        // Prevent multiple initializations
        if (this.isInitializing) {
            return this.initPromise;
        }
        
        if (this.isReady) {
            return this.sdk;
        }

        this.isInitializing = true;
        
        this.initPromise = this._initializeSDK();
        const result = await this.initPromise;
        
        this.isInitializing = false;
        return result;
    }

    async _initializeSDK() {
        try {
            // Check if we have a valid client ID
            if (!ENV.DISCORD_CLIENT_ID || ENV.DISCORD_CLIENT_ID === "YOUR_DISCORD_CLIENT_ID") {
                console.warn('Discord client ID not configured. External links will use fallback methods.');
                return null;
            }

            console.log('Initializing Discord SDK...');
            this.sdk = new DiscordSDK(ENV.DISCORD_CLIENT_ID);
            
            await this.sdk.ready();
            this.isReady = true;
            
            console.log('Discord SDK initialized successfully');
            return this.sdk;
        } catch (error) {
            console.warn('Failed to initialize Discord SDK:', error);
            this.sdk = null;
            this.isReady = false;
            return null;
        }
    }

    async openExternalLink(url) {
        try {
            // Initialize SDK if not already done
            if (!this.isReady && !this.isInitializing) {
                await this.initialize();
            }
            
            // If we're still initializing, wait for it
            if (this.isInitializing) {
                await this.initPromise;
            }

            // Use Discord SDK if available
            if (this.sdk && this.isReady) {
                console.log('Opening external link via Discord SDK:', url);
                await this.sdk.commands.openExternalLink({ url });
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Failed to open external link via Discord SDK:', error);
            return false;
        }
    }

    isSDKReady() {
        return this.isReady;
    }
}

// Create a singleton instance
export const discordSDK = new DiscordSDKManager(); 
