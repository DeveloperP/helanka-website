# Travel Programme Generator

Generate polished, detailed travel itinerary documents for confirmed Helanka bookings. Specialists generate programmes from the admin dashboard after a client accepts a quote. The programme is served as a branded web page (public URL with unique token) and downloadable as a PDF. All data is resolved deterministically from the existing booking, destination, and excursion records with no LLM dependency.

## Data Model

### New Prisma Model: Programme

```prisma
enum ProgrammeStatus {
  DRAFT
  PUBLISHED
}

model Programme {
  id          String           @id @default(cuid())
  bookingId   String           @unique
  booking     Booking          @relation(fields: [bookingId], references: [id])
  token       String           @unique
  content     Json
  status      ProgrammeStatus  @default(DRAFT)
  publishedAt DateTime?
  createdById String
  createdBy   User             @relation(fields: [createdById], references: [id])
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@map("programmes")
}
```

Add reverse relations on `Booking` (`programme Programme?`) and `User` (`programmes Programme[]`).

### Content JSON Schema

The `content` field stores the fully resolved itinerary. Once generated, the programme is self-contained and does not re-query the database for rendering.

```typescript
interface ProgrammeContent {
  clientName: string
  arrivalDate: string                 // ISO date "2026-08-15"
  departureDate: string
  numTravelers: number
  tripTitle: string                   // package name or "Custom Sri Lanka Tour"
  specialistName: string
  specialistEmail: string

  days: ProgrammeDay[]

  totalDistanceKm: number
  inclusions: string[]
  exclusions: string[]
  notes: string                       // specialist's custom notes to the client
}

interface ProgrammeDay {
  dayNumber: number
  date: string                        // ISO date
  title: string                       // "Arrival & Colombo", "Ella to Kandy"
  destination: {
    name: string
    slug: string
    region: string
    description: string
    heroImage: string                 // path: /images/destinations/dest-{slug}.webp
    highlights: string[]
    facts: { label: string; value: string }[]
  }
  items: ProgrammeDayItem[]
  overnightAt: string | null          // hotel or location name
}

interface ProgrammeDayItem {
  type: "ACCOMMODATION" | "TRANSPORT" | "ACTIVITY" | "ADDON"
  description: string
  time: string | null                 // "06:30" 24h format, or null
  durationHours: number | null
  distanceKm: number | null
  notes: string | null
  hotelName: string | null            // for ACCOMMODATION items
}
```

## Generation Pipeline

Triggered by a server action when a specialist clicks "Generate Programme" on a confirmed booking. Deterministic, no LLM.

### Step 1: Resolve Booking Data

- Load `Booking` with all `BookingItem` records and their detail joins (AccommodationDetail, TransportDetail, ExcursionDetail)
- Load the associated `TripSession` for trip type and session state (destination slugs, excursion IDs)
- Load the customer `User` for client name
- Load the specialist `User` (the current authenticated user) for contact info

### Step 2: Build Day-by-Day Structure

- Sort BookingItems by `sortOrder`
- Group items by destination using the `dates` and `nights` fields on BookingItems
- Assign day numbers sequentially, distributing nights across destinations as recorded in the booking. If `dates`/`nights` fields are null on BookingItems (edge case for bookings created before these fields were populated), fall back to distributing the total trip duration (departureDate - arrivalDate) evenly across destinations in sortOrder
- For each destination day:
  - Resolve destination data from static `destinations.ts` (for heroImage, tagline, facts, highlights). Fall back to DB `Destination` record for destinations not in the static set (use a generic placeholder image path)
  - For ACTIVITY items: match to static `ALL_EXCURSIONS` by name/description for `durationHours`, and to DB `Excursion` for `distanceKm`
  - For TRANSPORT items: pull `distanceKm` from `TransportDetail` or compute from `DestinationDistance` for the route segment
  - For ACCOMMODATION items: pull `hotelName` from `AccommodationDetail`
- Generate day titles from destination transitions: "Arrival & {first destination}", "{from} to {to}", "Day at {destination}", "Departure from {last destination}"

### Step 3: Calculate Totals

- Sum all transport segment distances and excursion distances for `totalDistanceKm`
- Populate `inclusions` from the package's `standardInclusions` (for package-based trips) or a default set for custom trips: Airport Pickup & Drop-off, Private Chauffeur, Multilingual National Guide
- Populate `exclusions` with standard items: International flights, Travel insurance, Visa fees, Personal expenses, Tipping

### Step 4: Create Programme Record

- Generate a 32-character cryptographically random URL-safe token using `crypto.randomBytes(24).toString('base64url')`
- Insert `Programme` with status DRAFT
- Return the programme ID to the admin UI

## Admin Editing Interface

### Route: `/admin/bookings/[bookingId]/programme`

Accessible to ADMIN and SPECIALIST roles (specialist must be assigned to the booking's trip session). Only available when booking status is CONFIRMED or later.

### Layout

Split-panel view:

**Left panel: Editor**
- Trip header fields: trip title, client name, dates (read-only from booking)
- Specialist notes: free-text textarea
- Day-by-day accordion:
  - Day title (editable text)
  - Overnight location (editable text)
  - Items list (reorderable):
    - Description (editable)
    - Time (editable, time picker)
    - Duration (editable number)
    - Distance (editable number)
    - Notes (editable text)
  - Cannot add/remove items (those come from the booking; go back to quote builder for structural changes)
- Inclusions/exclusions: editable list (add/remove items)

**Right panel: Live Preview**
- Renders the programme web page template inline using the current editor state
- Updates on every edit (debounced)

### Actions

- **Save Draft**: Persists the current content JSON. Programme stays in DRAFT status.
- **Preview as Client**: Opens `/programme/[token]` in a new tab. Shows a "DRAFT - NOT YET PUBLISHED" watermark when status is DRAFT.
- **Publish**: Sets status to PUBLISHED, records `publishedAt` timestamp. The public URL goes live. Button changes to "Unpublish" after publishing.

### Server Actions

```
generateProgramme(bookingId: string): Promise<{ programmeId: string; token: string }>
updateProgrammeContent(programmeId: string, content: ProgrammeContent): Promise<void>
publishProgramme(programmeId: string): Promise<void>
unpublishProgramme(programmeId: string): Promise<void>
getProgrammeByBookingId(bookingId: string): Promise<Programme | null>
getProgrammeByToken(token: string): Promise<Programme | null>
getProgrammePdf(token: string): Promise<Buffer>
```

## Client-Facing Web Page

### Route: `/programme/[token]`

Public route, no authentication required. Returns 404 for invalid tokens. DRAFT programmes are accessible but display a "DRAFT - NOT YET PUBLISHED" watermark banner at the top. This lets specialists preview without publishing. The watermark is a visible banner, not a security gate; the token itself is the access control (unguessable 32-char random string).

### Page Structure

Uses Helanka's design system (dark background, accent colors, font stack). Standalone layout, no site header/footer/nav.

1. **Header**
   - Helanka logo
   - Trip title (large display type)
   - Client name, dates, traveler count
   - "Download PDF" button
   - Specialist contact info (name, email)

2. **Day Cards** (one per day, full-width sections)
   - Day number badge and date
   - Destination hero image (full-width, 16:9 aspect, from `/images/destinations/dest-{slug}.webp`)
   - Destination name and region
   - Short destination description
   - Highlights list (bullet points)
   - Timeline of items:
     - TRANSPORT: vehicle icon, distance in km, route description
     - ACTIVITY: clock icon, duration in hours, excursion description
     - ACCOMMODATION: bed icon, hotel name, meal plan if noted
     - ADDON: tag icon, description
   - Each item shows time (if set), duration, and distance where applicable
   - "Overnight at {hotel/location}" footer

3. **Trip Summary**
   - Total distance traveled
   - Inclusions list (checkmarks)
   - Exclusions list (x marks)

4. **Footer**
   - Specialist notes (if any)
   - Helanka contact info and logo
   - "Crafted by Helanka Vacations" tagline

### Print Styles

`@media print` stylesheet applied for PDF generation:
- White background, dark text (inverted from the web dark theme)
- Page breaks between days (`break-before: page`)
- Download button and any interactive elements hidden
- Images sized for A4 proportions (210mm wide)
- Header on first page only
- Footer on last page only

## PDF Generation

### Route: `GET /api/programme/[token]/pdf`

Returns the programme as a downloadable PDF.

### Implementation

1. Validate the token and check programme status is PUBLISHED
2. Launch Puppeteer with headless Chromium
3. Navigate to the programme web page URL with a `?print=true` query param (triggers print styles and hides interactive elements via CSS/JS)
4. Wait for all images to load (`waitUntil: 'networkidle0'`)
5. Call `page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } })`
6. Return the PDF buffer with headers:
   - `Content-Type: application/pdf`
   - `Content-Disposition: attachment; filename="Helanka-Programme-{clientName}.pdf"`

### Puppeteer Deployment

- **Development/demo**: Run locally via the Next.js dev server. Full Chromium available on macOS.
- **Vercel production**: Use `@sparticuz/chromium` (serverless-optimized Chromium, ~50MB compressed) inside a Vercel Function. The 5GB package limit accommodates this. Set function `maxDuration` to 30s.
- **Fallback**: If Puppeteer proves too heavy for Vercel, move PDF generation to an external service or let the specialist generate PDFs locally via browser print.

### Dependencies

```
puppeteer-core    (headless Chrome control)
@sparticuz/chromium  (serverless Chromium binary, production only)
```

## Destination Hero Images

The programme requires one hero image per destination. Currently 10 of 30 destinations have images at `/public/images/destinations/dest-{slug}.webp`.

### Missing Images (20 destinations)

arugam-bay, anuradhapura, kitulgala, wilpattu, chilaw, kalpitiya, jaffna, trincomalee, passikudah, polonnaruwa, matale, mahiyangana, gal-oya, hatton, haputale, udawalawe, hambantota, hikkaduwa, sinharaja, belihuloya

### Resolution

Generate hero images for all 20 missing destinations using Higgsfield (GPT Image 2). Scenic landscape shots, 16:9 aspect ratio, consistent photographic style. Save as `dest-{slug}.webp` in `/public/images/destinations/`. This is a prerequisite task before the programme generator can render complete itineraries for all destinations.

## Integration Points

### Booking Detail Page Changes

Add to `/admin/bookings/[bookingId]/page.tsx`:
- When booking status is CONFIRMED or later: show a "Generate Programme" button (or "View Programme" / "Edit Programme" if one exists)
- Link navigates to `/admin/bookings/[bookingId]/programme`

### Prisma Schema Changes

- Add `Programme` model and `ProgrammeStatus` enum
- Add `programme` relation on `Booking` model
- Add `programmes` relation on `User` model
- Run `prisma migrate dev` to create the table

### New Files

```
prisma/schema.prisma                              (modified - add Programme model)
src/actions/programme-actions.ts                   (server actions for CRUD + generation)
src/lib/programme-generator.ts                     (deterministic pipeline: booking -> content JSON)
src/app/admin/bookings/[bookingId]/programme/page.tsx  (admin editor)
src/app/programme/[token]/page.tsx                 (client-facing web page)
src/app/api/programme/[token]/pdf/route.ts         (PDF generation endpoint)
```

### No Changes Needed

- The generation pipeline reads from existing data (Booking, BookingItem, Destination, Excursion, DestinationDistance) without modifying any of it
- No changes to the trip session flow, quote builder, or pricing engine
- No LLM, no external API calls during generation
