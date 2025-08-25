# Twitter Bot Setup for The Public Trust

## 🚀 Quick Start

### 1. Get Twitter API Credentials
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Get these credentials:
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret

### 2. Add GitHub Secrets
In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_TOKEN_SECRET`

### 3. Test the System
```bash
# Test article extraction locally
npm run test-extract

# Or just run the script directly
node .github/scripts/extract-articles.js
```

## 📝 How It Works

### **Trigger Conditions**
The bot only runs when:
- You push to `main` branch
- You modify `index.html`
- Your commit message contains "article" or "Article"

### **Article Detection**
1. Compares current HTML with previous version
2. Identifies new articles by headline and link
3. Automatically categorizes content
4. Generates relevant hashtags

### **Tweet Format**
```
New on The Public Trust: [Article Headline]

[Article Link]

[Relevant Hashtags]

#PublicLands #Conservation #ThePublicTrust
```

## 🔧 Customization

### **Modify Tweet Content**
Edit `.github/workflows/twitter-bot.yml`:
```yaml
message: |
  Your custom tweet format here
  ${{ steps.extract.outputs.headline }}
  ${{ steps.extract.outputs.link }}
```

### **Add New Categories**
Edit `.github/scripts/extract-articles.js`:
```javascript
detectCategory(articleHtml) {
    if (articleHtml.includes('your-category')) return 'your-category';
    // ... existing categories
}

generateHashtags(category) {
    const hashtagMap = {
        'your-category': '#YourHashtag #PublicLands',
        // ... existing mappings
    };
}
```

### **Change Trigger Conditions**
Edit `.github/workflows/twitter-bot.yml`:
```yaml
if: "contains(github.event.head_commit.message, 'your-trigger')"
```

## 🧹 Complete Removal

### **Option 1: Use Removal Script**
```bash
chmod +x remove-twitter-bot.sh
./remove-twitter-bot.sh
```

### **Option 2: Manual Removal**
```bash
rm -rf .github/workflows/twitter-bot.yml
rm -rf .github/scripts/
rm package.json
rm TWITTER-BOT-SETUP.md
rm remove-twitter-bot.sh
```

### **Option 3: Git Reset**
```bash
git reset --hard HEAD~1  # If you just committed the bot
# Or manually remove files and commit
```

## 📊 Monitoring

### **Check GitHub Actions**
1. Go to **Actions** tab in your repository
2. Look for "Auto-Tweet New Articles" workflow
3. Check logs for any errors

### **Test with Sample Article**
1. Add a test article to `index.html`
2. Commit with message containing "article"
3. Push to trigger the workflow
4. Check Twitter for the tweet

## 🚨 Troubleshooting

### **Bot Not Running**
- Check commit message contains "article"
- Verify `index.html` was modified
- Check GitHub Actions tab for errors

### **Tweet Not Posting**
- Verify Twitter API credentials in GitHub secrets
- Check Twitter API rate limits
- Review workflow logs for errors

### **Wrong Article Detected**
- Check article extraction regex in script
- Verify HTML structure matches expected format
- Test extraction locally with `npm run test-extract`

## 🔒 Security Notes

- **API Keys**: Never commit Twitter credentials to Git
- **Rate Limits**: Bot respects Twitter's API limits
- **Error Handling**: Failures won't break your website
- **Isolation**: Bot runs in separate GitHub Actions environment

## 📈 Benefits

- **Fully Automated**: No manual social media work
- **Consistent Branding**: Professional tweets every time
- **Relevant Hashtags**: Automatic categorization and discovery
- **Easy Removal**: Can be completely removed if ineffective
- **No Website Impact**: Runs separately from your main site

## 🎯 Next Steps

1. **Set up Twitter API credentials**
2. **Add GitHub secrets**
3. **Test with a sample article**
4. **Monitor performance**
5. **Customize as needed**

---

**Need Help?** The bot is completely separate from your website and can be removed at any time without affecting your site's functionality.
