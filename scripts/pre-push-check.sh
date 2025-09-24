#!/bin/bash

# Pre-push validation script
# This script checks if the remote repository exists before pushing

echo "🔍 Checking remote repository..."

# Get the remote URL
REMOTE_URL=$(git remote get-url origin)
echo "Remote URL: $REMOTE_URL"

# Extract repository info from URL
if [[ $REMOTE_URL =~ github\.com[:/]([^/]+)/([^/]+)\.git ]]; then
    ORG_USER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
    echo "Organization/User: $ORG_USER"
    echo "Repository: $REPO_NAME"
    
    # Check if repository exists
    echo "🌐 Checking if repository exists..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://github.com/$ORG_USER/$REPO_NAME")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Repository exists and is accessible"
        echo "🚀 Proceeding with push..."
        git push "$@"
    elif [ "$HTTP_STATUS" = "404" ]; then
        echo "❌ Repository not found (404)"
        echo "💡 Please check:"
        echo "   - Repository name is correct"
        echo "   - Organization/username is correct"
        echo "   - Repository exists on GitHub"
        echo "   - You have access to the repository"
        exit 1
    else
        echo "⚠️  Unexpected response: HTTP $HTTP_STATUS"
        echo "🤔 Repository might be private or there's a network issue"
        read -p "Continue with push anyway? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push "$@"
        else
            echo "❌ Push cancelled"
            exit 1
        fi
    fi
else
    echo "❌ Could not parse remote URL"
    echo "💡 Expected format: https://github.com/user/repo.git"
    exit 1
fi
