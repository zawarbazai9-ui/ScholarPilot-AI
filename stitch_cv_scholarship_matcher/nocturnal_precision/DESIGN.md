---
name: Nocturnal Precision
colors:
  surface: '#0d1322'
  surface-dim: '#0d1322'
  surface-bright: '#33394a'
  surface-container-lowest: '#080e1d'
  surface-container-low: '#151b2b'
  surface-container: '#191f2f'
  surface-container-high: '#242a3a'
  surface-container-highest: '#2f3445'
  on-surface: '#dde2f8'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dde2f8'
  inverse-on-surface: '#2a3040'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#c2cde5'
  on-tertiary: '#263143'
  tertiary-container: '#a7b2c9'
  on-tertiary-container: '#394458'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#0d1322'
  on-background: '#dde2f8'
  surface-variant: '#2f3445'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
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
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system focuses on a high-fidelity, premium dark mode aesthetic tailored for technical platforms and AI-integrated SaaS. The personality is authoritative yet visionary, evoking the feeling of a sophisticated command center. 

The style utilizes a **Corporate Modern** foundation infused with **Glassmorphism** and **Tonal Layering**. It prioritizes deep, immersive backgrounds to reduce eye strain while using vibrant accents to direct focus. The interface relies on precise geometry, subtle luminosity, and high-contrast typography to ensure clarity in low-light environments.

## Colors
This design system employs a deep, layered palette to create architectural depth. 

- **Primary (#38bdf8):** A vibrant sky blue reserved exclusively for primary actions, progress indicators, and active states.
- **Secondary/AI (#a855f7):** A royal purple used to denote AI-generated content, intelligence-driven features, and special highlights.
- **Background (#0b1120):** A deep charcoal-navy serving as the foundation for the entire application.
- **Surface:** Surfaces are constructed using #161e2e for cards and #111827 for sidebars, ensuring a clear hierarchy of information.
- **Foreground:** Pure white (#ffffff) is used for high-importance text, while cool-toned grays (#94a3b8) are used for secondary content.

## Typography
The typography system balances technical precision with high readability. 

**Hanken Grotesk** provides a sharp, contemporary look for headlines, utilizing tight letter-spacing and bold weights to command attention. **Inter** handles the bulk of the body content for its exceptional legibility on digital displays. For technical data, metadata, and labels, **Geist** is used to provide a "developer-friendly" and precise monospaced feel without sacrificing accessibility. 

Contrast is the primary driver of hierarchy: headings use high-contrast white, while body text uses a softened gray to prevent visual fatigue.

## Layout & Spacing
The design system operates on a rigorous **8px grid**. All padding, margins, and component heights must be multiples of 8.

- **Grid Model:** A 12-column fluid grid is used for desktop (breakpoint: 1280px+), transitioning to an 8-column grid for tablets (768px - 1279px) and a 4-column grid for mobile (<767px).
- **Desktop:** 40px outer margins with 24px gutters.
- **Mobile:** 16px outer margins with 16px gutters.
- **Containerization:** Main content areas should be capped at 1440px wide to maintain line-length readability on ultrawide monitors.

## Elevation & Depth
Elevation in this system is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** #0b1120.
- **Level 1 (Sidebars/Nav):** #111827.
- **Level 2 (Cards/Content):** #161e2e.
- **Borders:** Surfaces are defined by 1px solid borders using #1e293b (or #334155 for interactive hover states). 
- **Overlays:** Modals and dropdowns use #1f2937 with a subtle background blur (8px) to separate them from the content below, creating a glass-like depth. Shadows, when used, are ultra-diffused, 20% opacity black with a 16px blur.

## Shapes
The shape language is approachable yet structured, utilizing a consistent **16px (1rem)** corner radius for all major containers and cards.

- **Base Radius:** 8px for small components like inputs and buttons.
- **Large Radius:** 16px for cards, sections, and modals.
- **Full Radius:** 9999px for tags, chips, and pill-shaped toggle switches.

Consistent rounding across elements ensures the UI feels cohesive despite the high-contrast dark environment.

## Components
- **Buttons:** Primary buttons use a solid Sky Blue (#38bdf8) with black text for maximum contrast. Secondary buttons use a ghost style with a Sky Blue border and text. AI-specific actions use a gradient background (Purple to Blue).
- **Cards:** Defined by #161e2e background, a 16px corner radius, and a 1px border (#1e293b). On hover, the border color shifts to #334155.
- **Input Fields:** Darker than the surface (#0f172a), 8px radius, with a subtle #1e293b border. Focus states use a 2px Sky Blue ring.
- **Chips/Tags:** Use a low-opacity fill of the primary or secondary color (e.g., Purple at 10% opacity) with a solid text color of the same hue.
- **Lists:** Items are separated by 1px dividers (#1e293b). Hover states use a subtle background shift to #1e293b.
- **AI Highlights:** Use a 1px Purple (#a855f7) glow or border to signify intelligence-augmented sections.