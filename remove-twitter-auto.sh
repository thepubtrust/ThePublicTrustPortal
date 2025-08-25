#!/bin/bash

# Twitter Automation Removal Script for The Public Trust
# This script completely removes the Twitter automation system

echo "🧹 Removing Twitter Automation from The Public Trust..."

# Remove GitHub Actions workflow
if [ -f ".github/workflows/twitter-auto.yml" ]; then
    rm ".github/workflows/twitter-auto.yml"
    echo "✅ Removed Twitter automation workflow"
fi

# Remove scripts directory
if [ -d ".github/scripts" ]; then
    rm -rf ".github/scripts"
    echo "✅ Removed scripts directory"
fi

# Remove package.json
if [ -f "package.json" ]; then
    rm "package.json"
    echo "✅ Removed package.json"
fi

# Remove this script
rm "$0"
echo "✅ Removed removal script"

# Clean up empty directories
if [ -d ".github/workflows" ] && [ -z "$(ls -A .github/workflows)" ]; then
    rmdir ".github/workflows"
    echo "✅ Cleaned up empty workflows directory"
fi

if [ -d ".github" ] && [ -z "$(ls -A .github)" ]; then
    rmdir ".github"
    echo "✅ Cleaned up empty .github directory"
fi

echo ""
echo "🎉 Twitter Automation completely removed!"
echo "Your website is back to its original state."
echo ""
echo "To reinstall later, just re-run the setup process."
