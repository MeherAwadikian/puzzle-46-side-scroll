# Puzzle #46 — side-scrolling effect with direction change

Brief (Task Forge puzzle tracker): side-scrolling effect with direction change — none/generic.

Vertical scrolling drives **horizontal** motion through pinned panels — and the
horizontal direction **reverses** from one panel to the next.

## How it works

- Each `.hscroll` section is tall (`320vh`) and contains a `position: sticky`,
  viewport-height stage. While that section passes, JS computes how far through
  it you are (`progress = -rect.top / (offsetHeight - innerHeight)`, 0→1) and
  translates the inner `.track` horizontally.
- `data-dir="left"` slides the track `0 → -maxOverflow` as you scroll down
  (visual motion **leftward**); `data-dir="right"` starts pre-shifted and moves
  `-maxOverflow → 0` (**rightward**). Consecutive sections alternate, so the
  direction changes. A live readout shows the current direction.
- Driven off `scroll` + `requestAnimationFrame` (no layout thrash). Respects
  `prefers-reduced-motion` — then it does nothing and CSS lays the cards out as
  a normal vertical list (no scroll-jacking).

## Verified live (in a real browser)

Driven via claude-in-chrome:

- **Section 0 (left)**: at scroll-progress 0.50 the track is at exactly
  `translateX(-601px)` = `-maxOverflow × 0.50` (perfect linear mapping), readout
  "← left"; endpoints go `0 → -1202px` (leftward).
- **Section 1 (right)**: monotonic `-902 → -601 → -301 px` as you scroll down
  (toward 0 = rightward), readout "right →" throughout; endpoints `-1202 → 0`.
- **Direction change confirmed**: section 0 moves left, section 1 moves right.
- Visually confirmed mid-section-0: the card track is shifted left (01 scrolled
  off, 02–04 visible) with the "direction: ← left" readout.

(Note: intermediate samples briefly looked non-monotonic — a scroll-settling
race in the automation harness between when `update()` fired and when the test
read `rect.top`; with proper settling the mapping is exactly linear, and
section 1's identical code path was clean throughout.)

## Deploy
`wrangler.jsonc` included (static Worker). Public deploy pending the same
one-time `wrangler login` as #35/#39/#40/#43/#44.
