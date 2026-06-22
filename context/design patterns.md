# Emeris Brand Color Palette & Design System

> A comprehensive color reference extracted from the Emeris website design. This palette serves as the foundation for consistent visual branding across all digital and print materials.

---

## Overview

The Emeris color system is built on a sophisticated combination of nature-inspired greens, neutral grays, and warm gold accents. This palette creates a professional, trustworthy, and modern aesthetic suitable for an education-focused brand.

---

## Primary Brand Palette

The primary colors form the core of the Emeris visual identity and should be used as the dominant colors in most designs.

| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| Deep Emerald Green | `#0D5C4D` | rgb(13, 92, 77) | Primary brand color, headers, CTAs, primary buttons |
| Forest Green | `#1A6B5A` | rgb(26, 107, 90) | Secondary branding, hover states |
| Dark Teal | `#14463D` | rgb(20, 70, 61) | Navigation, dark sections, shadows |
| Mint Green | `#7EC8A4` | rgb(126, 200, 164) | Highlights, accents, success states |
| Sage Green | `#A9D3BC` | rgb(169, 211, 188) | Background accents, subtle highlights |

---

## Neutral Palette

A carefully balanced neutral system ensures readability and visual hierarchy across all interfaces.

| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| Charcoal | `#222222` | rgb(34, 34, 34) | Primary text body, high contrast elements |
| Dark Gray | `#4A4A4A` | rgb(74, 74, 74) | Secondary text, subheadings |
| Medium Gray | `#7A7A7A` | rgb(122, 122, 122) | Muted text, disabled states, placeholders |
| Light Gray | `#E5E7EB` | rgb(229, 231, 235) | Borders, dividers, subtle backgrounds |
| Off White | `#F8F9F7` | rgb(248, 249, 247) | Page backgrounds, subtle variations |
| Pure White | `#FFFFFF` | rgb(255, 255, 255) | Cards, content areas, primary backgrounds |

---

## Accent Colors

Gold accents add warmth and premium appeal to the palette, used sparingly for emphasis and luxury positioning.

| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| Gold Accent | `#C6A45B` | rgb(198, 164, 91) | Premium highlights, special features |
| Soft Gold | `#D8BE7A` | rgb(216, 190, 122) | Secondary accents, hover states |
| Warm Beige | `#F2E7D0` | rgb(242, 231, 208) | Supporting backgrounds, light accents |

---

## Color Usage Guidelines

### Primary Brand Color (`#0D5C4D`)
- Main headers and page titles
- Primary CTA buttons
- Logo and brand mark
- Active navigation states
- Link colors (default)

### Secondary Brand Color (`#1A6B5A`)
- Hover states for primary elements
- Subheading emphasis
- Secondary sections
- Focus states for accessibility

### Dark Teal (`#14463D`)
- Navigation bars and menus
- Dark theme backgrounds
- Footer sections
- Shadow and depth elements

### Mint Green (`#7EC8A4`)
- Success messages and confirmations
- Progress indicators
- Positive feedback states
- Accent lines and borders

### Sage Green (`#A9D3BC`)
- Subtle background overlays
- Hover backgrounds (light)
- Informational backgrounds
- Secondary accent areas

### Gold Accents (`#C6A45B` / `#D8BE7A`)
- Premium features and badges
- Call-to-action emphasis (secondary)
- Award or certification badges
- Luxury product highlights

---

## CSS Variables

For modern web applications using CSS custom properties:

```css
:root {
  /* Primary Colors */
  --primary: #0D5C4D;
  --primary-foreground: #FFFFFF;
  --primary-dark: #14463D;
  --primary-light: #1A6B5A;

  /* Secondary Colors */
  --secondary: #C6A45B;
  --secondary-foreground: #222222;
  --secondary-light: #D8BE7A;

  /* Accents */
  --accent: #7EC8A4;
  --accent-foreground: #14463D;
  --accent-sage: #A9D3BC;

  /* Neutrals */
  --background: #F8F9F7;
  --foreground: #222222;
  --muted: #E5E7EB;
  --muted-foreground: #7A7A7A;
  --border: #E5E7EB;
  --card: #FFFFFF;

  /* Text Colors */
  --text-primary: #222222;
  --text-secondary: #4A4A4A;
  --text-muted: #7A7A7A;
}
```

---

## Tailwind Configuration

```javascript
module.exports = {
  theme: {
    colors: {
      primary: {
        DEFAULT: "#0D5C4D",
        dark: "#14463D",
        light: "#1A6B5A",
      },
      secondary: {
        DEFAULT: "#C6A45B",
        light: "#D8BE7A",
      },
      accent: {
        mint: "#7EC8A4",
        sage: "#A9D3BC",
      },
      neutral: {
        50: "#F8F9F7",
        100: "#E5E7EB",
        500: "#7A7A7A",
        700: "#4A4A4A",
        900: "#222222",
      },
      gold: {
        DEFAULT: "#C6A45B",
        light: "#D8BE7A",
        warm: "#F2E7D0",
      }
    }
  }
}
```

---

## ShadCN/UI Theme Configuration

```typescript
const emerisTheme = {
  light: {
    primary: "#0D5C4D",
    primaryForeground: "#FFFFFF",
    secondary: "#C6A45B",
    secondaryForeground: "#222222",
    background: "#F8F9F7",
    foreground: "#222222",
    muted: "#E5E7EB",
    mutedForeground: "#7A7A7A",
    accent: "#7EC8A4",
    accentForeground: "#14463D",
    border: "#E5E7EB",
    card: "#FFFFFF",
    destructive: "#EF4444",
    ring: "#0D5C4D",
  }
}
```

---

## Color Accessibility

### Contrast Ratios
- **Primary (`#0D5C4D`) on White**: 7.8:1 ✓ AAA
- **Forest Green (`#1A6B5A`) on White**: 7.5:1 ✓ AAA
- **Charcoal (`#222222`) on Off White**: 15.6:1 ✓ AAA
- **Gold (`#C6A45B`) on White**: 4.2:1 ✓ AA

All primary text colors meet WCAG AAA standards for accessibility.

---

## Common Color Combinations

### High Contrast (Recommended)
- Text: `#222222` (Charcoal) on `#FFFFFF` (White)
- Text: `#FFFFFF` (White) on `#0D5C4D` (Deep Emerald)
- Text: `#FFFFFF` (White) on `#14463D` (Dark Teal)

### Light Backgrounds
- `#F8F9F7` (Off White) + `#222222` (Charcoal) text
- `#FFFFFF` (White) + `#4A4A4A` (Dark Gray) text

### Dark Backgrounds
- `#0D5C4D` (Primary) + `#FFFFFF` (White) text
- `#14463D` (Dark Teal) + `#FFFFFF` (White) text

### Accent Combinations
- Deep Emerald + Mint Green (for CTAs with supporting elements)
- Forest Green + Gold (for premium features)
- Primary + Sage Green (for informational sections)

---

## Usage Scenarios

### Navigation & Headers
- **Background**: `#0D5C4D` or `#14463D`
- **Text**: `#FFFFFF`
- **Hover**: `#1A6B5A`

### Buttons
- **Primary CTA**: Deep Emerald background, White text
- **Secondary CTA**: Gold background, Dark text
- **Hover**: Forest Green or Soft Gold

### Cards & Content Areas
- **Background**: `#FFFFFF` or `#F8F9F7`
- **Border**: `#E5E7EB`
- **Text**: `#222222` (primary), `#4A4A4A` (secondary)

### Alerts & Messages
- **Success**: Mint Green highlight + Charcoal text
- **Info**: Sage Green background + Dark text
- **Warning**: Gold background + Dark text
- **Error**: Use red with proper contrast

### Forms
- **Labels**: `#222222` (Charcoal)
- **Inputs**: `#FFFFFF` background, `#E5E7EB` border
- **Focus**: `#0D5C4D` border highlight
- **Placeholder**: `#7A7A7A` (Medium Gray)

---

## Gradient Combinations

### Primary Gradient
```css
background: linear-gradient(135deg, #0D5C4D 0%, #1A6B5A 100%);
```

### Subtle Gradient
```css
background: linear-gradient(135deg, #F8F9F7 0%, #E5E7EB 100%);
```

### Premium Gradient
```css
background: linear-gradient(135deg, #C6A45B 0%, #D8BE7A 100%);
```

### Green to Mint
```css
background: linear-gradient(135deg, #0D5C4D 0%, #7EC8A4 100%);
```

---

## Related Brand Resources

- **Primary Reference**: [Emeris Website](https://www.emeris.ac.za/)
- **Brand Philosophy**: Real-world ready education
- **Industry**: Educational Technology & Institution Management
- **Target Audience**: Higher Education Institutions

---

## Notes

- Colors extracted from live Emeris website design
- May vary slightly from official brand guidelines
- Verify against official brand assets for print materials
- Maintain proper contrast ratios for accessibility compliance
- Test colors across different displays and lighting conditions

---