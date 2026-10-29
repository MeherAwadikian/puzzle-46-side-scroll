// Side-scroll with direction change.
//
// Each .hscroll section is tall and contains a sticky, viewport-height stage.
// While that section is scrolling past, we compute how far through it we are
// (progress 0→1) and translate the inner .track horizontally by that fraction
// of its overflow width. data-dir="left" slides the track leftward as you
// scroll down; data-dir="right" slides it rightward (starting pre-shifted),
// so the horizontal direction REVERSES between consecutive sections.
//
// Driven off scroll + rAF (no layout thrash). Respects reduced-motion (then it
// does nothing and CSS lays everything out vertically).

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sections = Array.from(document.querySelectorAll('.hscroll'))
  if (reduce || !sections.length) return

  let ticking = false

  function overflow(track) {
    // How far the track can move horizontally beyond the viewport.
    return Math.max(0, track.scrollWidth - window.innerWidth)
  }

  function update() {
    ticking = false
    for (const section of sections) {
      const track = section.querySelector('.track')
      const label = section.querySelector('[data-dir-label]')
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      // progress through this section's scroll distance, clamped 0..1
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      const max = overflow(track)
      const dir = section.dataset.dir

      let x, moving
      if (dir === 'right') {
        // start fully shifted left (-max) and move toward 0 → visual motion is rightward
        x = -max * (1 - progress)
        moving = 'right →'
      } else {
        // start at 0 and move to -max → visual motion is leftward
        x = -max * progress
        moving = '← left'
      }
      track.style.transform = `translateX(${x}px)`

      // Only call it "moving" while the section is actually engaged (0<p<1).
      if (label) {
        label.textContent = (progress > 0.001 && progress < 0.999)
          ? moving
          : (progress <= 0.001 ? 'idle (before)' : 'idle (after)')
      }
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update) }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  update()

  // Expose current track transforms for testing.
  window.__sideScrollState = () => sections.map((s) => ({
    dir: s.dataset.dir,
    tx: s.querySelector('.track').style.transform,
    label: s.querySelector('[data-dir-label]').textContent,
  }))
})()
