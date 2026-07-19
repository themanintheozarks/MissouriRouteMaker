# Missouri Route Maker

## Project Overview

Missouri Route Maker is a personal, offline-first Progressive Web Application (PWA) for managing thousands of saved places and building optimized multi-stop driving routes.

The application is inspired by Circuit/Spoke's routing capabilities but intentionally excludes all commercial delivery functionality.

This is a personal travel planning application.

---

# Technology Stack

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Progressive Web App (PWA)
- IndexedDB
- MapLibre GL JS
- OpenStreetMap
- OSRM Routing
- Service Worker
- Responsive Design

---

# Design Philosophy

- Offline first
- Mobile first
- Optimized for OnePlus 9 Pro
- Simple interface
- No feature bloat
- Fast performance
- Local storage only

---

# Non-Negotiable Rules

- No login
- No user accounts
- No advertisements
- No subscriptions
- No analytics
- No telemetry
- No cloud sync
- Save immediately to IndexedDB
- Every destructive action requires confirmation
- No automatic pin status changes
- No pin clustering
- Progressive pin visibility only

---

# Map Features

- Missouri map
- OpenStreetMap
- MapLibre GL JS
- Street View
- Satellite View
- Day Mode
- Night Mode
- Auto Day/Night
- GPS Follow Me
- Zoom controls
- Progressive pin visibility
- Current GPS location displayed

---

# Place Status Colors

🟢 Green = Unvisited

🔵 Blue = Visited

🟠 Orange = Off Main Route

🔴 Red = Not Accessible

Status colors are global and shared across all routes.

---

# Place Data

Each place stores:

- Unique ID
- Name
- Latitude
- Longitude
- Address (when available)
- Status
- Notes
- Rating (1–5 gold stars)
- One or more categories
- Date Added

---

# Categories

- User editable
- User removable
- Unlimited categories
- Multiple categories per place

---

# Ratings

1–5 Gold Stars

---

# Arrival Detection

Default arrival radius:

200 feet

Configurable in Settings.

When entering radius:

- Play arrival chime
- Show popup
- Buttons:
  - Yes
  - Skip 15 Seconds

Only pressing Yes changes a Green pin to Blue.

---

# Routes

Routes are separate from Places.

Places may belong to multiple routes.

Each route stores:

- Name
- Ordered stops
- Distance
- ETA
- Optimization mode
- Notes

Optimization modes:

- Fastest
- Shortest
- Scenic
- Avoid Highways
- Round Trip
- One Way

Users manually choose when to optimize.

---

# Import

Supported formats:

- Google Takeout JSON
- CSV
- GPX
- KML

Import options:

- Replace Everything
- Add New Only
- Keep Existing
- Preview Duplicates

Show progress bar during import.

---

# Export

Formats:

- JSON
- CSV
- GPX
- KML

Sharing:

- Google Maps
- Google Earth
- OpenStreetMap
- X

---

# Places Log

Displays every place.

Sort by:

- Distance
- Status
- Rating
- Category
- Date Added

Editable.

Delete requires confirmation.

---

# Manual Place Creation

Tap map.

Create circular pin.

Enter:

- Name
- Categories
- Notes
- Rating
- Status

Save.

---

# Pin Interaction

Tap:

Small popup.

Buttons:

- Navigate
- Add/Remove Route
- Edit
- More

More opens a bottom sheet.

---

# Settings

- Street/Satellite
- Day/Night/Auto
- Follow Me
- Arrival Radius
- GPS Poll Rate
- Arrival Chime
- Arrival Popup
- Green Pin Toggle
- Blue Pin Toggle
- Orange Pin Toggle
- Red Pin Toggle
- Import
- Export
- Clear Places
- Clear Routes

---

# Performance Goals

Support:

20,000+ places

Offline capability

Fast startup

Responsive interface

Immediate local saves

---

# Project Status

This specification is the authoritative source for all future development of Missouri Route Maker.
