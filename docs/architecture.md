# CampusAI Architecture Documentation

## System Overview
**CampusAI — Smart Campus Intelligence Platform** is an enterprise solution designed to solve timetable accessibility, classroom utilization, schedule conflict detection, energy efficiency modeling, and facility maintenance reporting for real university environments.

```
+-----------------------------------------------------------------------------------+
|                                 CAMPUSAI CLIENT                                   |
|   React + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts              |
|   (Dark Glassmorphism UI - Midnight Navy #070b14, Cyan/Teal Accents #06b6d4)       |
+-----------------------------------------------------------------------------------+
                                         │  HTTPS / JSON
                                         ▼
+-----------------------------------------------------------------------------------+
|                                FASTAPI BACKEND                                    |
|   - Timetable Query Engine                                                        |
|   - Reconciled Schedule Conflict Detector                                         |
|   - Classroom Scheduled Utilization Engine                                        |
|   - Timetable-Driven Energy Opportunity Modeler                                   |
|   - Maintenance Ticket Tracker                                                    |
|   - 7-Stage Excel Import & Validation Pipeline                                    |
|   - Grounded RAG Assistant Service                                                |
+-----------------------------------------------------------------------------------+
           │                                 │                             │
           ▼                                 ▼                             ▼
+-----------------------+       +------------------------+       +------------------+
|   LOCAL / CLOUD DB    |       | GOOGLE CLOUD STORAGE   |       |  VERTEX AI /     |
| Reconciled Timetable  |       | Private Excel Source   |       |  GEMINI PRO      |
| & Audit Store (SQLite |       | Workbooks & Validation |       | Evidence-based   |
| / Cloud SQL Postgres) |       | Reports                |       | Natural Language |
+-----------------------+       +------------------------+       +------------------+
```

## Architectural Highlights
1. **Deterministic Schedule Core**: Exact timetable lookups, room capacity checks, and conflict detections are computed deterministically via Python services rather than asking a language model to guess from memory.
2. **Evidence-Grounded AI Assistant**: Vertex AI / Gemini operates over structured timetable evidence payloads passed by the query engine. All responses cite exact source sheets, rows, classrooms, and times.
3. **Honest Data Grounding**: Timetable gaps are labeled strictly as *Scheduled Utilization*. Sensor vacancy is marked as *Unmetered* unless verified by connected IoT hardware. Energy calculations transparently expose assumptions ($0.14/kWh, 1.8 kW load, 75% setback factor).
4. **Multi-Version Integrity**: Discrepancies between draft workbooks (15-Sept) and published workbooks (17-Sept) are preserved and surfaced in a structured audit queue with reviewer accountability.
