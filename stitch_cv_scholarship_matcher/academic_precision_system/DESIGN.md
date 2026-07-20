---
name: Academic Precision System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4e5f7e'
  primary: '#031632'
  on-primary: '#ffffff'
  primary-container: '#1a2b48'
  on-primary-container: '#8293b5'
  inverse-primary: '#b6c7eb'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#1f004e'
  on-tertiary: '#ffffff'
  tertiary-container: '#380081'
  on-tertiary-container: '#a579ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b6c7eb'
  on-primary-fixed: '#081b38'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is rooted in the intersection of academic rigor and high-velocity SaaS efficiency. It draws inspiration from the clarity of Notion and the technical precision of Linear to create a "High-Definition Minimalism" aesthetic. 

The personality is authoritative yet approachable, prioritizing content density without sacrificing legibility. The UI utilizes a "Focus-First" philosophy, where secondary actions are suppressed in favor of the primary task. The emotional response is one of organized calm, professional reliability, and intellectual empowerment.

## Colors

The palette relies on a stark high-contrast foundation. The background is pure white (#FFFFFF), providing the ultimate canvas for academic content. 

- **Primary Anchor:** Deep Blue (#1a2b48) is used for structural elements, navigation headers, and primary typography to establish authority.
- **Vibrant Accent:** Sky Blue (#0ea5e9) is reserved for interactive states, progress indicators, and call-to-action highlights.
- **Intelligence Accent:** Purple (#7c3aed) is exclusively applied to AI-driven features, insights, and automated summaries, creating a visual distinction for machine-augmented content.
- **Surface Tones:** `surface-dim` is used for subtle background shifts (e.g., sidebars), while `surface-container` is used for nested elements like card backgrounds and input fields.

## Typography

This design system uses **Hanken Grotesk** across all roles to ensure a cohesive, modern technical feel. 

Typography follows a strict hierarchy. Headlines use tighter letter spacing and heavier weights to feel "locked in." Body text utilizes generous line heights to ensure long-form academic papers and notes remain readable. Small labels and metadata should use the `label-sm` style with increased tracking to maintain clarity at reduced scales.

## Layout & Spacing

The system employs a rigid **8px grid** to govern all spatial relationships. 

- **Layout Model:** A 12-column fluid grid is used for desktop views, transitioning to a single-column layout for mobile. 
- **White Space:** Generous margins (40px+) are encouraged around primary content blocks to reduce cognitive load. 
- **Reflow Rules:** On mobile, horizontal padding scales down to 16px, and multi-column forms collapse into vertical stacks. All interactive targets must maintain a minimum 44px hit area regardless of the visual size of the component.

## Elevation & Depth

Hierarchy is established through subtle tonal layering and soft, ambient shadows rather than heavy borders.

- **Level 0 (Base):** Pure White (#FFFFFF) background.
- **Level 1 (Surface):** Used for cards and secondary navigation. Features a 1px border (#E2E8F0) and a soft shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.05)`.
- **Level 2 (Popovers/Modals):** High-priority floating elements. Features a more diffused shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.08)`.
- **AI Surfaces:** Elements powered by AI use a subtle Purple-tinted inner glow or a translucent purple backdrop-filter to signify "Machine Intelligence" depth.

## Shapes

The shape language is "Soft-Modern." All containers, buttons, and input fields utilize a base radius of **12px** (rounded-md) to create a friendly, approachable feel within a structured environment. Large cards or featured sections should scale up to **16px-24px** to emphasize their container status.

## Components

- **Buttons:** Primary buttons use a solid Deep Blue fill with white text. AI-action buttons use a Purple gradient. Hover states should involve a subtle shift in brightness rather than a color change.
- **Input Fields:** Use `surface-container` backgrounds with a 1px transparent border that turns Sky Blue on focus.
- **Cards:** White backgrounds with a subtle Level 1 shadow and 16px padding.
- **Chips/Tags:** Small, 12px rounded capsules with low-opacity backgrounds (e.g., 10% opacity of the category color) and high-contrast text.
- **Icons:** Use 1.5px or 1px stroke weights. Icons should never be filled unless they are in an "active" navigation state.
- **Academic Specifics:** Citation blocks should use a vertical Sky Blue border-left for emphasis. LaTeX or code blocks should use a `surface-dim` background with monospaced Hanken Grotesk.