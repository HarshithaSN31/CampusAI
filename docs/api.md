# CampusAI REST API Specification

Base URL: `http://localhost:8000/api` (Production: `https://<service-url>/api`)

## System Endpoints
### `GET /api/health`
Returns health status, active academic term, database mode, and loaded section count.

## Timetable Endpoints
### `GET /api/timetable/sections`
Returns list of all 42 available CSE sections (`5CSE01` - `5CSE42`).

### `GET /api/timetable`
Query parameters:
- `section` (string, default: `5CSE01`)
- `version` (string, default: `VERSION_17_SEPT_2026_PUBLISHED`)

Returns section metadata, course allocation map, and all weekly entries.

### `GET /api/timetable/classes`
Query parameters:
- `section` (optional)
- `weekday` (optional: MON, TUE, WED, THUR, FRI)
- `room` (optional)
- `faculty` (optional)

Returns filtered array of timetable entries.

### `GET /api/timetable/versions`
Returns available timetable source versions and publication status.

## Analytics & Facilities
### `GET /api/rooms`
Returns directory of 87 monitored classrooms with capacity, room type, scheduled load, and sensor telemetry status.

### `GET /api/analytics/utilization`
Returns campus-wide utilization percentage (34.8%), hourly load distribution, weekly matrix heatmap, and estimated energy savings metrics.

### `GET /api/conflicts`
Returns summary counts and full review queue of 304 flagged conflicts and version differences.

### `POST /api/conflicts/{id}/resolve`
Payload:
```json
{
  "reviewer": "Department Administrator",
  "resolution_note": "Reallocated to A209",
  "action": "REALLOCATE_ROOM"
}
```

## AI Assistant
### `POST /api/ai/chat`
Payload:
```json
{
  "message": "What is my next class?",
  "role": "Student",
  "section": "5CSE01"
}
```
Returns grounded natural-language answer with cited source sheets, rows, and uncertainty flags.

## Maintenance
### `GET /api/maintenance`
Returns all maintenance tickets.

### `POST /api/maintenance`
Creates a new maintenance ticket with automatic AI category suggestion.

### `PATCH /api/maintenance/{id}`
Updates ticket status, assigned technician, or resolution notes.
