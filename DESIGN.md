# Design Guidelines

## Brand Direction

gamine.blog should feel fast, quiet, and deliberate.

The site should prioritize reading, scanning, and moving between pages without friction. Visual expression should support the content rather than announce itself.

## Color

Use the current main color and background color as the foundation of the design.

- Main color: `--brand`
- Background color: `--bg`
- Accent color: `--accent`

Avoid introducing strong new color themes unless they clearly support the existing brand. When adding UI, start from the existing CSS variables before adding new ones.

## Motion

Do not add unnecessary animation.

Motion should be rare, short, and functional. Avoid page-transition effects, decorative movement, loading theatrics, or animation that makes the site feel slower. When motion is used, respect `prefers-reduced-motion`.

## Interaction

Prefer simple, standards-based interactions, but do not treat "JavaScript-free" as a goal above the reading experience.

Small amounts of JavaScript are acceptable when they preserve a quieter, more deliberate interaction that fits the site, such as keeping the mobile table of contents visually tucked beneath the article instead of presenting it as a conventional overlay. In those cases, keep the script narrowly scoped to behavior that HTML and CSS cannot express cleanly.

Use this bar for interactive details:

- The interaction should support reading, scanning, or navigation.
- The visual behavior should feel calm and intentional, not showy.
- CSS and browser-native features should carry the layout and animation whenever possible.
- JavaScript should not grow beyond the minimum needed for the specific interaction.
- If an interaction starts requiring complex focus management, scroll locking, browser-specific fixes, or broad event handling, reconsider a simpler native pattern such as `popover`, `details`, or a regular link-based flow.

## Spacing

Use spacing based on multiples of `4px`.

Prefer values such as `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `56px`, and `64px`. If a different value is needed, there should be a clear visual or layout reason.

## Components

If the same code appears in two or more places, extract it into a component.

Keep components small and aligned with existing patterns. Prefer existing components and CSS variables before creating new abstractions.

## Implementation Notes

- Keep pages lightweight and readable.
- Favor stable layout over visual surprise.
- Avoid decorative effects that compete with article content.
- Keep interactions predictable and quiet.
- Let performance and restraint be part of the brand.
