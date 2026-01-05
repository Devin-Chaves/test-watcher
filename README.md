# S3 Sync Test - Automatic File Watcher

This project automatically syncs `watcher-test.js` to AWS S3 whenever you save the file.

## Setup Instructions

### 1. Configure AWS Credentials

Edit your AWS credentials file:
```bash
nano ~/.aws/credentials
```

Add your credentials (uncomment and fill in):
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Save and exit (Ctrl+X, then Y, then Enter)

### 2. Install fswatch (if not already installed)

The script will automatically install fswatch via Homebrew if needed, but you can also install it manually:
```bash
brew install fswatch
```

### 3. Run the Watcher

Start the automatic sync:
```bash
./watch-and-sync.sh
```

The script will:
- Perform an initial upload of `watcher-test.js`
- Watch for file changes
- Automatically upload to S3 whenever you save

Press `Ctrl+C` to stop watching.

## Configuration

Edit `watch-and-sync.sh` to customize:
- `LOCAL_FILE`: The file to watch (currently: watcher-test.js)
- `S3_BUCKET`: Your S3 bucket name
- `S3_PATH`: The destination path in S3

## Current Settings

- **Local File**: `watcher-test.js`
- **S3 Bucket**: `marketing-public-016360783291`
- **S3 Path**: `marketing-site/utils/watcher-test.js`
- **Public URL**: `https://marketing-public-016360783291.s3.amazonaws.com/marketing-site/utils/watcher-test.js`
- **Region**: `us-east-1`

## Testing

1. Make sure AWS credentials are configured
2. Run `./watch-and-sync.sh`
3. Edit and save `watcher-test.js`
4. Watch the terminal for upload confirmation
5. Verify the file appears in S3

## Requirements

- Homebrew
- Cyberduck CLI (duck) - ✅ Installed
- fswatch - Auto-installed if needed
- AWS credentials with S3 write permissions
