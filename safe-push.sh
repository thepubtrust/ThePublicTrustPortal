#!/bin/bash

# Safe push script with validation
# Usage: ./safe-push.sh [git push arguments]

echo "🛡️  Safe Push - Validating before pushing..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check if remote is configured
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote 'origin' configured"
    echo "💡 Run: git remote add origin <repository-url>"
    exit 1
fi

# Run the pre-push check
echo "🔍 Running pre-push validation..."
if ! ./scripts/pre-push-check.sh "$@"; then
    echo "❌ Pre-push validation failed"
    exit 1
fi

echo "✅ Safe push completed successfully!"
