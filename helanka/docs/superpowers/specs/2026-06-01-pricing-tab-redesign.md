# Pricing Tab UI Redesign

## Overview

Redesign the admin Pricing page from a monolithic tabbed table into a **dashboard + drill-in** pattern with slide-out drawers for editing. The current 1,390-line `pricing-client.tsx` will be decomposed into focused components.

## Problem

The current pricing UI has three pain points:
1. **Data density** -- all rate cards, distances, and excursions shown in dense tables with too many columns
2. **Poor sub-section navigation** -- horizontal tab bar gives no overview of what each section contains
3. **Awkward editing workflow** -- inline row editing is cramped; add forms are full-width panels bolted onto the table

## Architecture

### Two-Level Navigation

**Level 1: Dashboard Landing** (`/admin/pricing`)
- Three summary cards: Rate Cards, Distances, Excursions
- Each card shows: icon (SVG, not emoji), title, description, key stats (count, type breakdown), drill-in link
- Global actions in page header: Export All (downloads rate cards Excel, the primary bulk action), Import Excel (rate card import)
- Section-specific export buttons appear in each detail view toolbar (distances export, excursions export)
- Clicking a card sets a `view` state to drill into that section

**Level 2: Detail View** (same route, client-side state)
- Breadcrumb: `← Pricing / {Section Name}`
- Section-specific toolbar: filter chips, export, import, add button
- Simplified table with fewer columns (merged Type/Tier column for rate cards)
- Click any row to open the slide-out edit drawer

This is entirely client-side navigation (no sub-routes). A single `view` state toggles between `"dashboard"`, `"rate-cards"`, `"distances"`, and `"excursions"`.

### Slide-Out Edit Drawer

- Slides in from the right edge, width ~400px
- Semi-transparent backdrop dims the table but keeps it visible
- Header: "Edit {Item Type}" with close button
- Read-only identity fields shown for context (type, tier for rate cards; from/to for distances)
- Editable fields in a vertical form layout with proper labels
- Save / Cancel buttons
- Danger zone at bottom: delete action with confirmation
- Transition: `transform translateX` with 200ms ease-out

### Component Decomposition

The current monolith `pricing-client.tsx` (1,390 lines) splits into:

| Component | Responsibility |
|-----------|---------------|
| `pricing-client.tsx` | Root component, manages `view` state, renders dashboard or detail view |
| `pricing-dashboard.tsx` | Three summary cards with stats |
| `rate-cards-view.tsx` | Rate cards table, filters, toolbar |
| `distances-view.tsx` | Colombo distances + pairwise distances tables |
| `excursions-view.tsx` | Excursions table, filters, toolbar |
| `edit-drawer.tsx` | Generic slide-out drawer shell (open/close, backdrop, animation) |
| `rate-card-form.tsx` | Form fields for rate card editing inside the drawer |
| `distance-form.tsx` | Form fields for distance editing |
| `excursion-form.tsx` | Form fields for excursion editing |

All components remain in `src/app/admin/pricing/`. No new routes needed.

## Visual Design

### Design System Alignment

The pricing redesign stays consistent with the existing admin shell:
- **Primary**: slate-800 (`#1e293b`) for buttons and active states
- **Background**: gradient `from-slate-100 via-slate-50 to-white`
- **Cards**: `bg-white/70 backdrop-blur-xl border border-white/80` (glassmorphism pattern from admin-shell)
- **Typography**: system font stack (already used throughout admin)
- **Border radius**: `rounded-2xl` for cards, `rounded-xl` for inputs/buttons (existing pattern)

### UI/UX Pro Max Refinements

Based on the Data-Dense Dashboard style guidelines:

| Guideline | Application |
|-----------|------------|
| No emoji icons | Summary cards use SVG icons from the existing `NavIcon` pattern (dollar sign, map pin, compass) |
| cursor-pointer | All clickable cards, rows, and action buttons |
| Row hover states | `hover:bg-slate-50/50 transition-colors duration-150` |
| Skeleton loading | Pulse skeleton placeholders during data fetches |
| Filter animations | Smooth `transition-all duration-200` on filter chip state changes |
| Heading clarity | Clear size/weight hierarchy: page title 22px/700, card title 15px/600, table header 11px/600 uppercase |
| Touch targets | All interactive elements minimum 44px tall |

### Summary Card Design

Each card contains:
1. **Icon** -- 40x40px rounded-xl gradient background with SVG icon
2. **Status badge** -- top-right, e.g. "Active", "132 active", "Configured"
3. **Title + description** -- 15px semibold + 12px muted
4. **Stats grid** -- 2-column grid showing key numbers (total count, type/destination count)
5. **Type breakdown** -- colored pill badges showing per-type counts
6. **Drill-in link** -- "View rate cards →" in blue, bottom of card

Cards use a 3-column CSS grid (`grid-template-columns: repeat(3, 1fr)`) with 16px gap.

### Table Design

Tables use a simplified column layout:

**Rate Cards table:**
| Column | Content |
|--------|---------|
| Type / Tier | Badge + tier name merged into one column |
| Season | Text |
| Destination | Text or "---" |
| Price Range | "$min -- $max" in one column |
| Per Km | Transport only, "---" for others |
| Actions | "Edit →" link |

**Filter toolbar:**
- Filter chips (pill buttons) instead of dropdown selects
- Active filter: `bg-slate-800 text-white`
- Inactive filter: `bg-white border border-slate-200 text-slate-600`
- Chips animate between states with `transition-all duration-200`

### Drawer Design

- Width: 400px fixed
- Background: white with left blue border accent (2px solid blue-500)
- Backdrop: `bg-slate-900/20 backdrop-blur-sm`
- Form fields: vertical stack, 16px gap
- Labels: 10px uppercase tracking-wider slate-400
- Inputs: existing `inputCls` pattern (rounded-xl, border-slate-200)
- Read-only fields: `bg-slate-50 border-slate-200` (visually muted)

### Accessibility

- Focus ring on all interactive elements (`focus:ring-2 focus:ring-slate-800/20`)
- Drawer traps focus when open (tab cycles within drawer)
- Escape key closes drawer
- `aria-label` on icon-only buttons
- Table has proper `<thead>` and `<th>` with `scope="col"`
- `prefers-reduced-motion`: disable slide animation, use instant show/hide

### Responsive Behavior

- **Desktop (1024px+)**: 3-column card grid, full table, 400px drawer
- **Tablet (768-1023px)**: 2-column card grid, table scrolls horizontally, drawer overlays full width
- **Mobile (< 768px)**: 1-column card stack, table uses horizontal scroll, drawer becomes full-screen modal

## Data Flow

No changes to server actions or data fetching. The existing `page.tsx` server component fetches all data upfront and passes it to `PricingClient`. The dashboard stats are computed client-side from the same props.

Summary card stats derived from props:
- Rate cards count: `initialRateCards.length`
- Type breakdown: `groupBy(initialRateCards, 'itemType')`
- Destinations count: `destinations.length`
- Pairwise routes: `initialDistances.length`
- Excursions count: `initialExcursions.length`
- Excursion type breakdown: `groupBy(initialExcursions, 'type')`

## Error Handling

- Save failures show an inline error message below the Save button in the drawer (red text, not a toast)
- Delete shows a native `window.confirm` dialog (existing pattern, no change)
- Import diff preview modal remains unchanged

## Testing Strategy

- Visual regression: manually verify dashboard layout, card stats, table rendering, drawer open/close
- Functional: verify CRUD operations still work through the new drawer UI
- Responsive: test at 375px, 768px, 1024px, 1440px breakpoints
- Keyboard: verify drawer focus trap and escape-to-close
