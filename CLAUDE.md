# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IP GeoAddress Generator - a Next.js web app that generates realistic random addresses based on IP geolocation. Uses multiple APIs to combine IP location data with random user identities.

## Tech Stack

- **Framework**: Next.js 15 with Turbopack, React 19
- **State Management**: @preact/signals-react (global reactive state) + @tanstack/react-query (server state)
- **UI**: Radix UI Themes + Tailwind CSS + Geist font
- **Email**: @cemalgnlts/mailjs for temporary email

## Development Commands

```bash
npm run dev     # Start dev server on 0.0.0.0:5000 with Turbopack
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint check
```

## Architecture

### Data Flow
```
IP Detection (ipify) → Coordinates (ipapi.co) → Address (OpenStreetMap) → User (randomuser.me)
```

### Key Files

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main page orchestrating all hooks and state |
| `signals/*.ts` | Global reactive state (ipSignal, addressSignal, userSignal) |
| `hooks/*.ts` | React Query hooks wrapping services |
| `services/*.ts` | API clients (ipService, addressService, userService) |
| `app/components/` | UI components (LeftCard, RightCard, Header, etc.) |

### State Architecture

- **Signals** (`signals/`): Cross-component reactive state using @preact/signals-react
  - `ipSignal`: detectedIpSignal (auto-detected), queryIpSignal (user-queried)
  - `addressSignal`: current address + coordinates
  - `userSignal`: current random user

- **React Query** (`hooks/`): Server state with caching
  - useIP → ipService → ipify API
  - useCoordinates → addressService → ipapi.co
  - useAddress → addressService → OpenStreetMap Nominatim
  - useUser → userService → randomuser.me
  - useMail → Mailjs SDK (temp email inbox)

- **Local State**: useHistory hook manages history in localStorage

### External APIs

| Service | Endpoint | Purpose |
|---------|----------|---------|
| ipify | `api.ipify.org` | Auto-detect user IP |
| ipapi.co | `ipapi.co/{ip}/json/` | IP to coordinates |
| Nominatim | `nominatim.openstreetmap.org` | Reverse geocoding |
| RandomUser | `randomuser.me/api/` | Fake user identity |

## Deployment

- **Cloudflare Pages**: Primary deployment target
- **Docker**: Multi-stage build with Node 20 Alpine, standalone output on port 3000

```bash
# Docker run
docker run -p 3000:3000 a139u/ip-geoaddress-generator:latest
```

## Project Structure

```
app/
├── page.tsx           # Main page
├── layout.tsx        # Root layout with providers
├── components/       # UI components
├── types/index.ts    # TypeScript interfaces
hooks/                # React Query hooks
services/             # API service classes
signals/              # Global reactive signals
public/data/
└── regionData.json   # Region selection data for address mode
```
