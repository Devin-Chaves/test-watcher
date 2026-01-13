# Mobile Navigation Sliding Panels - Implementation Context

## Summary
Successfully implemented full off-canvas sliding panel animations for mobile navigation with both incoming and outgoing panels animating simultaneously. The solution uses a two-phase RequestAnimationFrame pattern to ensure smooth, coordinated transitions.

**Latest Commit:** `4426ea6` - Fix ghostly first navigation by keeping outgoing panel active during phase 1
**Deployed:** https://devin-chaves.github.io/test-watcher/watcher-test.html
**Test URL:** https://felix-2-0.webflow.io/testing (480x800 mobile viewport)

---

## The Problem

Originally, mobile nav panels were animating sequentially rather than simultaneously:
- **Old behavior:** Incoming slides in (0-200ms) → Outgoing fades out (200-400ms) ❌
- **Needed behavior:** Both slide AND fade together (0-200ms) ✅

Additionally, on first navigation, there was a "ghostly effect" where the outgoing panel would snap to `opacity: 0` before the exit animation could play.

---

## The Solution: Two-Phase RAF Pattern with Active Panel Management

### High-Level Approach

**Phase 1 (First RequestAnimationFrame):**
- Remove directional classes from all panels (cleanup)
- Apply `ff-nav-mobile__panel--enter-right` or `ff-nav-mobile__panel--enter-left` to incoming panel
- Apply `ff-nav-mobile__panel--exit-left` or `ff-nav-mobile__panel--exit-right` to outgoing panel
- **Keep outgoing panel's active class for now** (this prevents the ghostly snap)

**Phase 2 (Second RequestAnimationFrame):**
- Deactivate all panels
- Activate incoming panel and remove its enter class to trigger the slide
- Outgoing panel animates out with its exit class while fading (because it's being deactivated)
- Both animations play simultaneously over 200ms

### Why This Works

1. **Prevents ghostly effect:** Outgoing panel stays visible (opacity: 1) during Phase 1, then fades out during Phase 2
2. **Simultaneous animation:** Both panels' transforms and opacity animate in the same CSS transition window (200ms)
3. **Proper stacking:** Enter classes set z-index to keep incoming panel above outgoing during animation

---

## Code Implementation

### Location: [watcher-test.html:559-621](watcher-test.html#L559-L621)

```javascript
// Two-phase slide + fade transition with simultaneous animation
requestAnimationFrame(() => {
    // Phase 1: Set up initial positions (no animation yet)
    // Remove any leftover directional classes from all panels
    panels.forEach(p => {
        p.classList.remove(
            'ff-nav-mobile__panel--enter-right',
            'ff-nav-mobile__panel--enter-left',
            'ff-nav-mobile__panel--exit-right',
            'ff-nav-mobile__panel--exit-left'
        );
    });

    // Position incoming panel at starting position based on direction
    if (direction === 'forward') {
        next.classList.add('ff-nav-mobile__panel--enter-right');
    } else if (direction === 'backward') {
        next.classList.add('ff-nav-mobile__panel--enter-left');
    }

    // Position outgoing panel for exit animation (but keep it active for now)
    if (prev && prev !== next) {
        if (direction === 'forward') {
            prev.classList.add('ff-nav-mobile__panel--exit-left');
        } else if (direction === 'backward') {
            prev.classList.add('ff-nav-mobile__panel--exit-right');
        }
    }

    // Phase 2: Trigger both animations simultaneously
    requestAnimationFrame(() => {
        // Deactivate all panels first
        panels.forEach(p => p.classList.remove('ff-nav-mobile__panel--active'));

        // Activate incoming panel and remove its enter class to trigger slide+fade in
        next.classList.add('ff-nav-mobile__panel--active');
        next.classList.remove('ff-nav-mobile__panel--enter-right', 'ff-nav-mobile__panel--enter-left');

        // Outgoing panel animates to exit with its exit class
        // Both slide and fade over 200ms simultaneously
    });
});
```

### CSS Classes: [watcher-test.html:343-360](watcher-test.html#L343-L360)

```css
/* Directional slide classes - 100% off-canvas */
.ff-nav-mobile__panel--enter-right {
    transform: translateX(100%);  /* Slides in from right */
    z-index: 2;
    opacity: 0;
}

.ff-nav-mobile__panel--enter-left {
    transform: translateX(-100%);  /* Slides in from left */
    z-index: 2;
    opacity: 0;
}

.ff-nav-mobile__panel--exit-left {
    transform: translateX(-100%);  /* Slides out to left */
}

.ff-nav-mobile__panel--exit-right {
    transform: translateX(100%);  /* Slides out to right */
}

/* Base panel transition */
.ff-nav-mobile__panel {
    transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* Active state */
.ff-nav-mobile__panel.ff-nav-mobile__panel--active {
    opacity: 1;
    transform: translateX(0);  /* Center position */
}
```

---

## Animation Flows

### Forward Navigation (e.g., Root → Treatments)
```
Incoming panel:
  Phase 1: translateX(100%) + opacity: 0 + position off-screen
  Phase 2: removes enter-right, adds active
  Result: slides from right (100% → 0) + fades in (0 → 1)

Outgoing panel:
  Phase 1: gets exit-left class (transform: translateX(-100%))
  Phase 2: deactivated (opacity: 0)
  Result: slides to left (0 → -100%) + fades out (1 → 0)

Timing: Both happen simultaneously over 200ms
```

### Backward Navigation (e.g., Treatments → Root)
```
Incoming panel:
  Phase 1: translateX(-100%) + opacity: 0 + position off-screen
  Phase 2: removes enter-left, adds active
  Result: slides from left (-100% → 0) + fades in (0 → 1)

Outgoing panel:
  Phase 1: gets exit-right class (transform: translateX(100%))
  Phase 2: deactivated (opacity: 0)
  Result: slides to right (0 → 100%) + fades out (1 → 0)

Timing: Both happen simultaneously over 200ms
```

### Menu Open (Root only)
```
Root panel:
  No direction specified, so simple opacity fade
  Result: just fades in (0 → 1), no slide
```

---

## Testing

### Manual Testing (480x800 mobile viewport)

1. Navigate to https://felix-2-0.webflow.io/testing
2. Resize to 480x800 (mobile viewport)
3. Click hamburger menu → Root panel fades in (no slide) ✓
4. Click "Treatments" → Incoming slides RIGHT, outgoing slides LEFT, simultaneous ✓
5. Click back arrow → Incoming slides LEFT, outgoing slides RIGHT, simultaneous ✓
6. Repeat for multiple levels (Root → Treatments → Everyday Health) ✓
7. Test rapid clicking → No state pollution, animations clean up properly ✓

### Console Verification

Open browser console and check for:
```
[NAV] 4426ea6 | Fix ghostly first navigation... | 2026-01-13 14:35:00 EST
```

This confirms you're running the latest deployed version.

---

## Critical Commits

| Commit | Message | Status |
|--------|---------|--------|
| 4426ea6 | Fix ghostly first navigation by keeping outgoing panel active during phase 1 | ✅ FINAL |
| 73bd422 | Simplify simultaneous animation - keep outgoing panel inactive | (replaced by 4426ea6) |
| 54218a0 | Fix simultaneous panel animations in mobile nav | (intermediate) |
| 07f42be | Update console message with latest commit | (intermediate) |

---

## Key Implementation Details

### Why Keep Outgoing Active During Phase 1?

Without this, the sequence was:
1. Phase 1: Remove active from outgoing → opacity snaps to 0
2. Phase 2: Apply exit class → tries to animate opacity but it's already 0

With outgoing active during Phase 1:
1. Phase 1: Outgoing stays active (opacity: 1), exit class adds transform
2. Phase 2: Deactivate outgoing → opacity animates to 0, transform already animating

This ensures both `opacity` and `transform` properties animate simultaneously in Phase 2.

### Why Two RAFs?

The first RAF ensures the browser sees the initial state (with directional classes) so the CSS transition knows what to animate *from*. Without it, the classes would be applied and removed in the same frame, causing no animation.

```
Phase 1 RAF:
  Apply directional classes
  Browser renders with new classes (off-screen, invisible)

Phase 2 RAF:
  Remove enter classes, deactivate/activate panels
  Browser sees this as a change from Phase 1, triggers CSS transition
  Animation plays from Phase 1 state to Phase 2 state
```

---

## Edge Cases Handled

✅ First navigation (no ghostly effect)
✅ Rapid clicking (no state pollution)
✅ Multiple nesting levels
✅ prefers-reduced-motion media query (disables slides, keeps fade)
✅ Menu close properly resets state

---

## Files Modified

- **[watcher-test.html](watcher-test.html)** - Main implementation
  - CSS: Lines 343-360 (directional classes with 100% translateX)
  - CSS: Lines 362-374 (prefers-reduced-motion)
  - JS: Lines 559-621 (setActive function with two-phase RAF)
  - Line 394 (console message with commit hash for deployment tracking)

---

## Deployment Notes

This file loads from GitHub Pages at: https://devin-chaves.github.io/test-watcher/watcher-test.html

The console message on line 394 includes the commit hash and timestamp, allowing instant verification of which version is deployed. Update this whenever pushing changes:

```javascript
console.log('%c[NAV]%c <HASH> | <MESSAGE> | <TIMESTAMP> EST', 'color: #4CAF50; font-weight: bold', 'color: inherit');
```

---

## For Next Session

If animations aren't working as expected:
1. Check console for deployment verification
2. Clear browser cache and reload
3. Verify viewport is 480x800 (mobile breakpoint)
4. Check that CSS transition property exists on `.ff-nav-mobile__panel`
5. Verify `direction` parameter is being passed correctly to `setActive()`

---

## Architecture Notes

- All panels use `position: absolute; inset: 0` so they stack perfectly
- Transitions are 200ms ease-out
- z-index: 2 on entering panels ensures proper layering during animation
- CSS handles all animation; JS only manages class state
- No jQuery or animation libraries; pure CSS transitions
