#!/bin/bash

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_FILE="${SCRIPT_DIR}/watcher-test.html"
S3_BUCKET="marketing-public-016360783291"
S3_PATH="marketing-site/test/"
S3_ENDPOINT="s3.us-east-1.amazonaws.com"
S3_URL="s3://${S3_ENDPOINT}/${S3_BUCKET}/${S3_PATH}"

# AWS Credentials from ~/.aws/credentials
AWS_CREDENTIALS_FILE="$HOME/.aws/credentials"
if [ -f "$AWS_CREDENTIALS_FILE" ]; then
    AWS_ACCESS_KEY_ID=$(grep -A2 "\[default\]" "$AWS_CREDENTIALS_FILE" | grep "aws_access_key_id" | cut -d'=' -f2 | tr -d ' ')
    AWS_SECRET_ACCESS_KEY=$(grep -A2 "\[default\]" "$AWS_CREDENTIALS_FILE" | grep "aws_secret_access_key" | cut -d'=' -f2 | tr -d ' ')
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Starting file watcher for: ${LOCAL_FILE}${NC}"
echo -e "${BLUE}📤 Will sync to: ${S3_URL}${NC}"
echo ""

# Check if file exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}❌ Error: File not found: ${LOCAL_FILE}${NC}"
    exit 1
fi

# Check if duck is installed
if ! command -v duck &> /dev/null; then
    echo -e "${RED}❌ Error: duck CLI not found${NC}"
    exit 1
fi

# Check if fswatch is installed, if not offer to install
if ! command -v fswatch &> /dev/null; then
    echo -e "${BLUE}📦 fswatch not found. Installing via homebrew...${NC}"
    brew install fswatch
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install fswatch${NC}"
        exit 1
    fi
fi

# Function to upload file
upload_file() {
    echo -e "${BLUE}📤 Uploading ${LOCAL_FILE} to S3...${NC}"

    # Check credentials
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo -e "${RED}❌ AWS credentials not found in ${AWS_CREDENTIALS_FILE}${NC}"
        echo -e "${RED}Please configure your credentials first${NC}"
        exit 1
    fi

    # Upload using duck CLI with credentials
    duck --upload "$S3_URL" "$LOCAL_FILE" \
        -u "$AWS_ACCESS_KEY_ID" \
        -p "$AWS_SECRET_ACCESS_KEY" \
        --existing overwrite

    if [ $? -eq 0 ]; then
        FILENAME=$(basename "$LOCAL_FILE")
        echo -e "${GREEN}✅ Successfully uploaded at $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo -e "${GREEN}🌐 Public URL: https://${S3_BUCKET}.s3.amazonaws.com/${S3_PATH}${FILENAME}${NC}"
    else
        echo -e "${RED}❌ Upload failed${NC}"
    fi
    echo ""
}

# Initial upload
echo -e "${BLUE}📤 Performing initial upload...${NC}"
upload_file

# Watch for changes
echo -e "${BLUE}👀 Watching for changes... (Press Ctrl+C to stop)${NC}"
echo ""

fswatch -0 -e ".*" -i "\\.html$" "$LOCAL_FILE" | while read -d "" event; do
    echo -e "${BLUE}🔔 Change detected!${NC}"
    sleep 0.5  # Brief delay to ensure file is fully written
    upload_file
done
