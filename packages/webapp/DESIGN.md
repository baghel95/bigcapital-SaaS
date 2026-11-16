# Ganak design system — "Indigo Pro"

Chosen 2026-11-17. Calm, modern accounting UI: indigo primary on cool slate neutrals, light-first with a matching dark theme.
Implementation: `src/style/_ganak-theme.scss` overrides the app's CSS variables (`:root` and `body.bp4-dark`) and Blueprint's
SCSS variables. Components should use tokens, never raw hex values.

## Colour

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `primary` | `#4F46E5` | `#6366F1` | Primary buttons, active nav, focus ring, links |
| `primary-hover` | `#4338CA` | `#818CF8` | Hover and pressed |
| `primary-subtle` | `#EEF2FF` | `rgba(99,102,241,0.16)` | Selected rows, active nav background, info banners |
| `accent` | `#06B6D4` | `#22D3EE` | Charts, secondary highlights (sparingly) |
| `bg` | `#F8FAFC` | `#0B1120` | App background |
| `surface` | `#FFFFFF` | `#111827` | Cards, forms, tables, drawers |
| `surface-2` | `#F1F5F9` | `#1E293B` | Table headers, input add-ons, hover rows |
| `border` | `#E2E8F0` | `#1F2A3D` | Dividers, card and input borders |
| `border-strong` | `#CBD5E1` | `#334155` | Input borders, table outer border |
| `text` | `#0F172A` | `#F1F5F9` | Body text, amounts |
| `text-secondary` | `#475569` | `#CBD5E1` | Labels, secondary columns |
| `text-muted` | `#64748B` | `#94A3B8` | Hints, placeholders, captions |
| `success` | `#16A34A` | `#4ADE80` | Paid, active, positive amounts |
| `warning` | `#D97706` | `#FBBF24` | Due soon, partially paid |
| `danger` | `#DC2626` | `#F87171` | Overdue, errors, delete |
| `info` | `#0284C7` | `#38BDF8` | Neutral notices |

Sidebar: light surface (`#FFFFFF`) with a right border; active item uses `primary-subtle` background and `primary` text.
Dark sidebar: `#0F172A` with the same pattern.

## Typography

- Font: **Inter** (fallback: system UI stack). Noto Sans stays for Arabic and Indic fallbacks.
- Base size 14px, line height 1.5. Labels 13px/500. Captions 12px.
- Page titles 20px/600. Section titles 15px/600. Big amounts 28px/600.
- Amounts and table numbers use `font-variant-numeric: tabular-nums` so columns align.

## Shape and depth

- Radius: 10px cards and dialogs, 8px buttons and inputs, 6px tags and badges, full for status pills.
- Spacing: 4px grid (4, 8, 12, 16, 24, 32).
- Shadows: `sm` `0 1px 2px rgba(15,23,42,0.06)` for cards; `md` `0 4px 16px rgba(15,23,42,0.08)` for popovers and drawers. No gradients.

## Components

- **Buttons:** 36px tall. Primary is filled indigo with white text. Secondary is white with `border-strong`. Danger only for destructive actions.
- **Inputs:** 36px tall, `border-strong`, 8px radius, indigo focus ring (`0 0 0 3px primary-subtle`).
- **Tables:** 44px rows, header on `surface-2` in 12px/600 `text-secondary`, no zebra stripes, hover row `surface-2`, amounts right-aligned with tabular numbers.
- **Status pills:** Paid (success), Due (warning), Overdue (danger), Draft (muted), all on a 12% tint of their colour.
- **Cards:** `surface`, 1px `border`, 10px radius, `sm` shadow, 24px padding.

## Money and dates (India)

- Currency: `₹1,18,000.00` (Indian lakh/crore grouping), never `Rs`.
- Dates: `17 Nov 2026` in lists, `DD/MM/YYYY` in inputs.
