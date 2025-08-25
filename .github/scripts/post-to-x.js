#!/usr/bin/env node

/**
 * X (Twitter) API Posting Script for The Public Trust
 * Posts new articles automatically using your X API credentials
 */

// Node.js 18+ has built-in fetch, no need for node-fetch

class XPoster {
    constructor() {
        this.apiKey = process.env.X_API_KEY;
        this.apiSecret = process.env.X_API_SECRET;
        this.accessToken = process.env.X_ACCESS_TOKEN;
        this.accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
        this.bearerToken = process.env.X_BEARER_TOKEN;
    }

    async postTweet(tweetContent) {
        try {
            console.log('Posting tweet to X...');
            console.log('Content:', tweetContent);
            
            // Use the X API v2 endpoint
            const response = await this.makeTweetRequest(tweetContent);
            
            if (response.success) {
                console.log('✅ Tweet posted successfully!');
                console.log('Tweet ID:', response.data.id);
                console.log('Tweet URL:', `https://twitter.com/user/status/${response.data.id}`);
            } else {
                console.error('❌ Failed to post tweet:', response.error);
            }
            
        } catch (error) {
            console.error('Error posting tweet:', error.message);
        }
    }

    async makeTweetRequest(text) {
        try {
            // Using X API v2 endpoint
            const response = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text
                })
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data: data.data };
            } else {
                const error = await response.text();
                return { success: false, error: error };
            }
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    validateCredentials() {
        if (!this.bearerToken) {
            console.error('❌ X_BEARER_TOKEN not found in environment variables');
            return false;
        }
        
        console.log('✅ X API credentials validated');
        return true;
    }
}

// Main execution
async function main() {
    const tweetContent = process.argv[2];
    
    if (!tweetContent) {
        console.error('❌ No tweet content provided');
        process.exit(1);
    }

    const poster = new XPoster();
    
    if (!poster.validateCredentials()) {
        console.error('❌ Cannot post without valid X API credentials');
        process.exit(1);
    }

    await poster.postTweet(tweetContent);
}

// Run the script
main().catch(console.error);
