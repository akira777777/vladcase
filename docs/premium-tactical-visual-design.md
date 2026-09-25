# Premium Tactical visual refresh

## Understanding

- Improve the full VLADCASE visual system: buttons, effects, skin presentation, and game animations.
- Keep the existing local artwork, economy, persistence, odds, and transaction timing intact.
- Make the interface feel premium and tactical rather than uniformly neon.
- Cover desktop and mobile layouts, keyboard use, and reduced-motion preferences.
- Fix the event timer render loop and mobile case-opening controls discovered during the visual audit.

## Assumptions

- The existing Tailwind theme, CSS utilities, Framer Motion, and canvas-confetti remain the only visual dependencies.
- Decorative work must stay on transform and opacity where practical and must not delay committed game results.
- Violet is the brand color, cyan communicates technical/game state, gold communicates premium value, and rarity colors stay item-local.
- The existing English product copy and information architecture remain in scope but are not being rewritten.

## Design

### Surfaces and controls

Panels use layered graphite gradients, a restrained inner highlight, and a subtle tactical grid. Primary controls use a violet-to-cyan energy edge, a short light sweep on hover, a small lift, and a physical press state. Secondary, success, danger, and icon controls share the same geometry, focus treatment, and disabled behavior.

### Cases and skins

Case cards prioritize artwork, price, and a single clear action. Skin cards use a local rarity halo, top-edge energy line, specular sweep, deeper image shadow, and stronger information hierarchy. Classified, Covert, and Special items receive stronger ambient treatment without making low-tier items noisy.

### Motion

Ambient particles and glows remain slow. Hover feedback is fast. Roulette, reward, and upgrader motion carry the strongest emphasis because they communicate game state. Reduced-motion users receive opacity-based transitions without parallax, floating, sweeping, or large scaling effects.

### Responsive behavior

Mobile card density is reduced, controls retain touch-sized targets, and the fixed bottom navigation must never cover the primary opening controls. Desktop composition keeps the wide tactical dashboard character.

## Decision log

1. Premium Tactical was selected over Neon Casino and Clean CS Inventory because it retains the current identity while improving hierarchy and restraint.
2. Existing libraries and assets are reused to avoid a second styling system and additional runtime cost.
3. Rarity color remains contextual instead of becoming another global accent.
4. Economy writes remain independent of animation completion.
5. The visual refresh includes the timer loop and mobile overlap because both directly degrade the rendered experience.

## Verification

- Playwright regression coverage for the timer console failure and mobile navigation overlap.
- Desktop and mobile screenshots of the home, case, inventory, and upgrader experiences.
- Reduced-motion inspection.
- Typecheck, lint, unit tests, Playwright tests, and production build.
