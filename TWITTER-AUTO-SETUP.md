# Twitter Automation Setup for The Public Trust

## 🚀 Quick Start

### 1. How It Works
The system automatically detects new articles when you update your website and prepares tweet content. Currently, it logs the tweet content for manual posting, but you can integrate with free Twitter automation tools.

### 2. Test the System
```bash
# Test article extraction locally
npm run test-extract

# Or run the script directly
node .github/scripts/extract-articles.js
```

## 📝 How It Works

### **Trigger Conditions**
The automation only runs when:
- You push to `main` branch
- You modify `index.html`
- Your commit message contains "article" or "Article"

### **Article Detection**
1. Compares current HTML with previous version
2. Identifies new articles by headline and link
3. Automatically categorizes content
4. Generates relevant hashtags

### **Current Output**
The system currently:
- ✅ Detects new articles automatically
- ✅ Formats tweet content with hashtags
- ✅ Logs everything for manual posting
- 🔄 **Next step**: Integrate with free Twitter tool

## 🔧 Integration Options

### **Option 1: Free Twitter Automation Services**
- **Buffer** - Free tier with 3 scheduled posts
- **Hootsuite** - Free tier with 2 social profiles
- **Later** - Free tier with 30 posts per month
- **TweetDeck** - Free Twitter-owned tool

### **Option 2: Browser Automation**
- Use GitHub Actions with Playwright
- Automatically posts via browser
- Completely free but more complex

### **Option 3: Manual Copy-Paste**
- Copy tweet content from GitHub Actions logs
- Paste into Twitter manually
- Free and gives you full control

## 📱 Tweet Format Examples

### **Policy News:**
```
New on The Public Trust: USDA Opens Public Comment on Department Reorganization Plan

https://www.usda.gov/about-usda/news/press-releases/2025/08/01/usda-opens-public-comment-period-department-reorganization-plan

#Policy #PublicLands

#PublicLands #Conservation #ThePublicTrust
```

### **Conservation Stories:**
```
New on The Public Trust: Feds Look to Divert Funds Used for Purchasing New Public Lands

https://www.fieldandstream.com/stories/conservation/public-lands-and-waters/feds-divert-land-water-conservation-funds

#Conservation #Wildlife

#PublicLands #Conservation #ThePublicTrust
```

## 🧪 Testing

### **Test with Sample Article**
1. **Add a test article** to your `index.html`
2. **Commit with "article" in message**:
   ```bash
   git add .
   git commit -m "Test article: Sample Conservation News"
   git push origin main
   ```
3. **Check GitHub Actions** tab for the workflow
4. **Review the logs** to see tweet content

## 🧹 Complete Removal

### **Option 1: Use Removal Script**
```bash
chmod +x remove-twitter-auto.sh
./remove-twitter-auto.sh
```

### **Option 2: Manual Removal**
```bash
rm -rf .github/workflows/twitter-auto.yml
rm -rf .github/scripts/
rm package.json
rm TWITTER-AUTO-SETUP.md
rm remove-twitter-auto.sh
```

## 📊 Monitoring

### **Check GitHub Actions**
1. Go to **Actions** tab in your repository
2. Look for "Auto-Tweet New Articles" workflow
3. Check logs for tweet content and any errors

### **Current Status**
- ✅ **Article detection** - Working
- ✅ **Tweet formatting** - Working
- 🔄 **Twitter posting** - Needs integration
- ✅ **Easy removal** - Available

## 🚨 Troubleshooting

### **Bot Not Running**
- Check commit message contains "article"
- Verify `index.html` was modified
- Check GitHub Actions tab for errors

### **No Articles Detected**
- Test extraction locally: `npm run test-extract`
- Check HTML structure matches expected format
- Verify articles are properly formatted in HTML

## 🔒 Security Notes

- **No API keys** - Uses free tools only
- **No external services** - Runs in GitHub Actions
- **Error handling** - Failures won't break your website
- **Isolation** - Runs separately from your main site

## 📈 Benefits

- **Fully Automated Detection** - No manual article checking
- **Professional Tweet Formatting** - Consistent branding
- **Relevant Hashtags** - Automatic categorization
- **Easy Removal** - Can be completely removed if ineffective
- **No Website Impact** - Runs separately from your main site
- **Free to Use** - No API costs or subscriptions

## 🎯 Next Steps

1. **Test the system** with a sample article
2. **Choose integration method** (free service, browser automation, or manual)
3. **Set up posting** to complete the automation
4. **Monitor performance** and refine as needed

---

**Need Help?** The automation is completely separate from your website and can be removed at any time without affecting your site's functionality.
