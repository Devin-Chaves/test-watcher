#!/bin/bash

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_FILE="${SCRIPT_DIR}/watcher-test.html"
COMMIT_MSG_PREFIX="Update watcher-test.html"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Starting file watcher for: ${LOCAL_FILE}${NC}"
echo -e "${BLUE}📤 Will push to GitHub on changes${NC}"
echo ""

# Check if file exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}❌ Error: File not found: ${LOCAL_FILE}${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
    echo -e "${BLUE}📦 fswatch not found. Installing via homebrew...${NC}"
    brew install fswatch
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install fswatch${NC}"
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Check for remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  No remote configured yet${NC}"
    echo -e "${YELLOW}   Please set up your GitHub repository first${NC}"
fi
echo ""

# Function to commit and push
commit_and_push() {
    echo -e "${BLUE}📝 Committing changes...${NC}"

    # Add the file
    git add "$LOCAL_FILE"

    # Check if there are changes to commit
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
        echo ""
        return
    fi

    # Commit with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "${COMMIT_MSG_PREFIX} - ${TIMESTAMP}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Committed successfully${NC}"

        # Push to remote (if configured)
        if git remote | grep -q "origin"; then
            echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
            git push origin "$CURRENT_BRANCH"

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Pushed to GitHub successfully${NC}"

                # Get the repository URL and construct GitHub Pages URL
                REPO_URL=$(git config --get remote.origin.url)
                if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
                    USERNAME="${BASH_REMATCH[1]}"
                    REPONAME="${BASH_REMATCH[2]}"
                    FILENAME=$(basename "$LOCAL_FILE")

                    echo -e "${GREEN}🌐 GitHub Pages URL: https://${USERNAME}.github.io/${REPONAME}/${FILENAME}${NC}"
                    echo -e "${BLUE}   (Enable GitHub Pages in Settings > Pages > Source: main branch)${NC}"
                fi
            else
                echo -e "${RED}❌ Push failed${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Commit failed${NC}"
    fi
    echo ""
}

# Initial commit and push
echo -e "${BLUE}📤 Performing initial commit and push...${NC}"
commit_and_push

# Watch for changes
echo -e "${BLUE}👀 Watching for changes... (Press Ctrl+C to stop)${NC}"
echo ""

fswatch -0 -e ".*" -i "\\.html$" "$LOCAL_FILE" | while read -d "" event; do
    echo -e "${BLUE}🔔 Change detected!${NC}"
    sleep 0.5  # Brief delay to ensure file is fully written
    commit_and_push
done
