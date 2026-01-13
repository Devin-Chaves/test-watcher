# Project Notes

## ⚠️ S3 Sync - DO NOT USE AGAIN

**ISSUE:** S3 sync is unreliable and slow (12+ minute delays observed)
- Code gets pushed to GitHub instantly
- S3 takes 5-15 minutes to sync (unpredictable)
- Browser cache makes it even worse
- Very frustrating for rapid testing/debugging

**SOLUTION:** Use GitHub Pages directly or host directly from GitHub raw content instead.
- GitHub Pages deploys in seconds
- No S3 intermediary needed
- Much faster feedback loop for testing

**Action:** Set up GitHub Pages for watcher-test.html before next session

## Workflow for Every Commit

1. Make code changes
2. **Put the GitHub commit hash + message + EST timestamp in the console**
3. Commit and push to GitHub

Example console message:
```javascript
console.log('%c[NAV]%c 69c6c78 | Implement full off-canvas sliding panels | 2026-01-13 14:05:31 EST', 'color: #4CAF50; font-weight: bold', 'color: inherit');
```

This lets you instantly verify which version is deployed (especially important when using S3 or any CDN with cache delays)
