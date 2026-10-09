# CampusAI — Smart Campus Intelligence Platform

A high-fidelity, responsive web application and backend intelligence platform built for real university environments. Built with **React**, **TypeScript**, **FastAPI**, **Tailwind CSS**, and **Google Vertex AI** integration.

---

## Key Features & Screen Implementations

- **Executive Dashboard**: Live schedule summary, classroom utilization rates, conflict alerts, pending maintenance, and estimated energy savings.
- **Interactive Timetable**: Complete weekly and daily timetable for all 42 sections (`5CSE01` to `5CSE42`), distinguishing lectures, labs, electives, and breaks with slide-over inspection drawers.
- **Ask CampusAI**: Evidence-grounded conversational assistant that answers queries about next classes, lab rooms, idle classrooms, and conflicts with cited worksheet rows.
- **Classroom Utilization**: 87 tracked classrooms, scheduled utilization heatmaps, capacity filters, and clear labels for unmetered vs IoT-sensed spaces.
- **Schedule Conflicts Review Queue**: Detection of 304 conflict items, 18 room double-bookings, 29 faculty overlaps, and 251 sheet discrepancies with reviewer resolution tools.
- **Energy Insights**: Timetable-driven energy setback model calculating potential weekly savings (~$375/week, 2,680 kWh) with interactive calculation parameters.
- **Maintenance Reporting**: Classroom fault ticket tracker with automated AI categorization suggestions and staff resolution logging.
- **Timetable Import Wizard**: 7-stage guided Excel upload, sheet detection, diff comparison, and administrative sign-off wizard.
- **Reports & Administration**: Department summaries, room audit reports, user directory, and immutable audit logs.

---

## Project Structure

```
CampusAI/
├── backend/
│   ├── app/
│   │   ├── ingestion/       # Excel parser (openpyxl / pandas)
│   │   ├── services/        # Conflict, analytics, AI, maintenance services
│   │   ├── api/             # API routes
│   │   └── main.py          # FastAPI application
│   ├── test_api.py          # Automated test suite
│   ├── Dockerfile           # Backend container image
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, UI components
│   │   ├── pages/           # All 9 core screens
│   │   ├── services/        # API client
│   │   └── types/           # Domain TypeScript definitions
│   ├── Dockerfile           # Frontend container image
│   └── package.json
├── data/                    # Reconciled datasets & parsed outputs
├── docs/                    # Complete architecture, API & deployment docs
├── docker-compose.yml       # Unified container execution
└── README.md
```

---

## Quickstart Guide (Windows PowerShell)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup & Run
Open a PowerShell terminal:
```powershell
# Navigate to backend and install requirements
cd "c:\Users\HP ZBOOK I7-9TH\OneDrive\Desktop\CampusAI"
python -m pip install -r backend/requirements.txt

# Run automated tests to verify ingestion and endpoints
python -m pytest backend/test_api.py -v

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup & Run
Open a second PowerShell terminal:
```powershell
cd "c:\Users\HP ZBOOK I7-9TH\OneDrive\Desktop\CampusAI\frontend"
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Docker Deployment
```powershell
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## Google Cloud Production Deployment
Refer to [`docs/google-cloud-deployment.md`](docs/google-cloud-deployment.md) for step-by-step instructions for Google Cloud Run, Cloud Storage, and Vertex AI.
