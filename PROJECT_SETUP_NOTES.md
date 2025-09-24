# The Public Trust Portal - Project Setup Notes

## Important Project Structure

**CRITICAL:** This project has a nested structure that can cause confusion:

```
the-public-trust/
└── ThePublicTrustPortal/  ← This is the actual git repository
    ├── .git/
    ├── index.html
    ├── style.css
    ├── app.js
    └── ... other files
```

## GitHub Configuration

- **Repository URL:** https://github.com/thepubtrust/ThePublicTrustPortal.git
- **Remote Name:** origin
- **Branch:** main

## Key Commands for Future Reference

When working with this project, **always navigate to the ThePublicTrustPortal subdirectory** first:

```bash
cd ThePublicTrustPortal
git add .
git commit -m "Your commit message"
git push origin main
```

## Deployment

- Changes are automatically deployed when pushed to the main branch
- The project was set up via Cursor mobile app which configured the GitHub connection
- Local development server runs from the ThePublicTrustPortal directory: `python3 -m http.server 8000`

## Common Issues to Avoid

1. **Don't run git commands from the parent directory** - they won't work properly
2. **Always check `git remote -v`** to confirm the GitHub connection is configured
3. **The actual website files are in ThePublicTrustPortal/, not the parent directory**

## Live URLs

- **GitHub Repository:** https://github.com/thepubtrust/ThePublicTrustPortal
- **Live Website:** https://thepubtrust.github.io/ThePublicTrustPortal (if GitHub Pages enabled)

---
*Last Updated: September 20, 2025*



