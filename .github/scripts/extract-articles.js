#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Article Extraction Script for The Public Trust
 * Detects new articles by comparing current and previous HTML versions
 */

class ArticleExtractor {
    constructor() {
        this.currentHtml = '';
        this.previousHtml = '';
        this.articleRegex = /<article[^>]*>[\s\S]*?<h4><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h4>[\s\S]*?<\/article>/g;
    }

    async extractNewArticles() {
        try {
            // Read current HTML
            this.currentHtml = fs.readFileSync('index.html', 'utf8');
            
            // Try to read previous version from git
            this.previousHtml = await this.getPreviousHtml();
            
            // Extract articles from both versions
            const currentArticles = this.extractArticles(this.currentHtml);
            const previousArticles = this.previousHtml ? this.extractArticles(this.previousHtml) : [];
            
            // Find new articles
            const newArticles = this.findNewArticles(currentArticles, previousArticles);
            
            if (newArticles.length > 0) {
                const article = newArticles[0]; // Tweet the first new article
                this.setOutput('has_new_articles', 'true');
                this.setOutput('headline', article.headline);
                this.setOutput('link', article.link);
                this.setOutput('hashtags', this.generateHashtags(article.category));
                
                console.log(`New article detected: ${article.headline}`);
                return true;
            } else {
                this.setOutput('has_new_articles', 'false');
                console.log('No new articles detected');
                return false;
            }
            
        } catch (error) {
            console.error('Error extracting articles:', error);
            this.setOutput('has_new_articles', 'false');
            return false;
        }
    }

    extractArticles(html) {
        const articles = [];
        let match;
        
        while ((match = this.articleRegex.exec(html)) !== null) {
            const fullArticle = match[0];
            const link = match[1];
            const headline = match[2].trim();
            
            articles.push({
                headline: headline,
                link: link,
                category: this.detectCategory(fullArticle),
                fullText: fullArticle
            });
        }
        
        return articles;
    }

    detectCategory(articleHtml) {
        // Detect category based on content and classes
        if (articleHtml.includes('conservation')) return 'conservation';
        if (articleHtml.includes('policy') || articleHtml.includes('Policy')) return 'policy';
        if (articleHtml.includes('energy')) return 'energy';
        if (articleHtml.includes('public-lands')) return 'public-lands';
        if (articleHtml.includes('wildlife')) return 'wildlife';
        return 'general';
    }

    findNewArticles(currentArticles, previousArticles) {
        if (!previousArticles.length) return currentArticles.slice(0, 1); // First run
        
        const newArticles = [];
        
        for (const current of currentArticles) {
            const isNew = !previousArticles.some(prev => 
                prev.headline === current.headline && prev.link === current.link
            );
            
            if (isNew) {
                newArticles.push(current);
            }
        }
        
        return newArticles;
    }

    generateHashtags(category) {
        const hashtagMap = {
            'conservation': '#Conservation #Wildlife',
            'policy': '#Policy #PublicLands',
            'energy': '#EnergyPolicy #PublicLands',
            'public-lands': '#PublicLands #Outdoors',
            'wildlife': '#Wildlife #Conservation',
            'general': '#PublicLands #Conservation'
        };
        
        return hashtagMap[category] || '#PublicLands #Conservation';
    }

    async getPreviousHtml() {
        try {
            const { execSync } = require('child_process');
            return execSync('git show HEAD~1:index.html', { encoding: 'utf8' });
        } catch (error) {
            console.log('No previous version available (first commit)');
            return '';
        }
    }

    setOutput(name, value) {
        // GitHub Actions output format
        console.log(`::set-output name=${name}::${value}`);
    }
}

// Run the extractor
const extractor = new ArticleExtractor();
extractor.extractNewArticles().catch(console.error);
