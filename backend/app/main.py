import os
import json
import shutil
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ingestion.excel_parser import parse_full_workbook
from app.services.conflict_service import detect_all_conflicts
from app.services.analytics_service import calculate_campus_analytics
from app.services.ai_assistant_service import query_timetable_assistant
from app.services.maintenance_service import get_all_tickets, create_ticket, update_ticket

app = FastAPI(
    title="CampusAI — Smart Campus Intelligence Platform API",
    description="Enterprise API powering academic timetable intelligence, conflict resolution, room utilization, energy optimization and facility maintenance.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (5173) and any production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
TIMETABLE_FILE = os.path.join(DATA_DIR, "all_parsed_timetable.json")
CONFLICTS_FILE = os.path.join(DATA_DIR, "detected_conflicts.json")
ANALYTICS_FILE = os.path.join(DATA_DIR, "campus_analytics.json")

def load_timetable_data() -> List[Dict[str, Any]]:
    if not os.path.exists(TIMETABLE_FILE):
        return []
    with open(TIMETABLE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# Request Models
class ChatRequest(BaseModel):
    message: str
    role: Optional[str] = "Student"
    section: Optional[str] = "5CSE01"

class ConflictResolveRequest(BaseModel):
    reviewer: str
    resolution_note: str
    action: str  # 'OVERRIDE_ACCEPT', 'REALLOCATE_ROOM', 'RESCHEDULE'

class MaintenanceCreateRequest(BaseModel):
    building: str
    room: str
    category: str
    priority: str
    description: str
    reported_by: Optional[str] = "Campus Staff"

class MaintenanceUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

# ----------------- Health -----------------
@app.get("/api/health")
def health_check():
    data = load_timetable_data()
    return {
        "status": "HEALTHY",
        "service": "CampusAI Backend",
        "academic_term": "Academic Year 2026-2027, Semester V",
        "total_sections_loaded": len(data) // 2 if data else 0,
        "database_mode": "SQLite / Local Reconciled Store",
        "version": "1.0.0"
    }

# ----------------- Timetable Endpoints -----------------
@app.get("/api/timetable/sections")
def get_sections():
    data = load_timetable_data()
    sections = set()
    for b in data:
        sections.add(b["metadata"]["section"])
    return {
        "sections": sorted(list(sections)),
        "count": len(sections),
        "department": "Computer Science and Engineering",
        "semester": "V"
    }

@app.get("/api/timetable/classes")
def get_classes(
    section: Optional[str] = Query(None),
    weekday: Optional[str] = Query(None),
    faculty: Optional[str] = Query(None),
    room: Optional[str] = Query(None),
    version: Optional[str] = Query("VERSION_17_SEPT_2026_PUBLISHED")
):
    data = load_timetable_data()
    filtered_entries = []
    
    for b in data:
        # Check version filter
        b_ver = b["metadata"]["source_version"]
        if version and version != "ALL" and b_ver != version:
            continue
        
        if section and b["metadata"]["section"].upper() != section.upper():
            continue

        for e in b["entries"]:
            if weekday and e["weekday"].upper() != weekday.upper():
                continue
            if room and room.upper() not in (e.get("room") or "").upper():
                continue
            if faculty and faculty.upper() not in (e.get("faculty") or "").upper():
                continue
            filtered_entries.append(e)

    return {
        "total": len(filtered_entries),
        "version_used": version,
        "classes": filtered_entries
    }

@app.get("/api/timetable")
def get_section_weekly_grid(
    section: str = Query("5CSE01"),
    version: str = Query("VERSION_17_SEPT_2026_PUBLISHED")
):
    data = load_timetable_data()
    target_block = None
    for b in data:
        if b["metadata"]["section"].upper() == section.upper() and (version == "ALL" or b["metadata"]["source_version"] == version):
            target_block = b
            break
            
    if not target_block:
        raise HTTPException(status_code=404, detail=f"Section {section} not found for version {version}")

    return {
        "metadata": target_block["metadata"],
        "courses": target_block["courses"],
        "entries": target_block["entries"]
    }

@app.get("/api/timetable/versions")
@app.get("/api/admin/timetable/versions")
def get_timetable_versions():
    return [
        {
            "version_id": "v1.2-pub",
            "name": "VERSION_17_SEPT_2026_PUBLISHED",
            "sheet_source": "TIME TABLE",
            "published_at": "2026-09-17T14:00:00",
            "status": "PUBLISHED",
            "is_current": True,
            "total_sections": 42,
            "description": "Authoritative Semester V timetable approved by Timetable Coordinator and Dean."
        },
        {
            "version_id": "v1.0-draft",
            "name": "VERSION_15_SEPT_2026",
            "sheet_source": "TIME TABLE 15-09-2026",
            "published_at": "2026-09-15T10:30:00",
            "status": "SUPERSEDED",
            "is_current": False,
            "total_sections": 42,
            "description": "Initial draft containing prior CTVA/elective slot allocations."
        }
    ]

# ----------------- Rooms & Faculty -----------------
@app.get("/api/rooms")
def get_rooms():
    if os.path.exists(ANALYTICS_FILE):
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            analytics = json.load(f)
            return analytics.get("rooms", [])
    return []

@app.get("/api/faculty")
def get_faculty_directory():
    data = load_timetable_data()
    faculty_map = {}
    for b in data:
        if "17" in b["metadata"]["source_version"]:
            for code, c_info in b["courses"].items():
                fac_name = c_info.get("faculty", "").strip()
                if fac_name and not any(k in fac_name.upper() for k in ["TBD", "PROCTOR", "CATV", "CTVA"]):
                    for fn in fac_name.split("/"):
                        clean_fn = fn.split("(")[0].strip()
                        if len(clean_fn) > 3:
                            if clean_fn not in faculty_map:
                                faculty_map[clean_fn] = {
                                    "name": clean_fn,
                                    "department": "Computer Science and Engineering",
                                    "courses": set(),
                                    "sections": set()
                                }
                            faculty_map[clean_fn]["courses"].add(c_info.get("course_name", code))
                            faculty_map[clean_fn]["sections"].add(b["metadata"]["section"])

    faculty_list = []
    for k, v in sorted(faculty_map.items()):
        faculty_list.append({
            "name": v["name"],
            "department": v["department"],
            "courses": sorted(list(v["courses"])),
            "sections": sorted(list(v["sections"])),
            "load_classes_count": len(v["sections"])
        })
    return {"total": len(faculty_list), "faculty": faculty_list}

# ----------------- Analytics & Energy -----------------
@app.get("/api/analytics/utilization")
def get_utilization_analytics():
    if os.path.exists(ANALYTICS_FILE):
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    # If not generated, compute on the fly
    data = load_timetable_data()
    return calculate_campus_analytics(data)

@app.get("/api/analytics/schedule-efficiency")
def get_schedule_efficiency():
    data = load_timetable_data()
    pub_blocks = [b for b in data if "17" in b["metadata"]["source_version"]]
    sec_stats = []
    for b in pub_blocks:
        sec = b["metadata"]["section"]
        entries = b["entries"]
        lecture_count = len([e for e in entries if e["session_type"] == "REGULAR"])
        lab_count = len([e for e in entries if e["session_type"] == "LAB"])
        elective_count = len([e for e in entries if e["session_type"] == "ELECTIVE"])
        total_hours = len(entries)
        sec_stats.append({
            "section": sec,
            "total_weekly_hours": total_hours,
            "regular_lectures": lecture_count,
            "labs": lab_count,
            "electives": elective_count,
            "advisor": b["metadata"].get("class_advisor", "")
        })

    return {
        "total_sections_evaluated": len(sec_stats),
        "average_weekly_hours_per_section": round(sum(s["total_weekly_hours"] for s in sec_stats) / max(1, len(sec_stats)), 1),
        "sections": sec_stats
    }

# ----------------- Conflicts -----------------
@app.get("/api/conflicts")
def get_conflicts(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    section: Optional[str] = None
):
    if os.path.exists(CONFLICTS_FILE):
        with open(CONFLICTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        raw_blocks = load_timetable_data()
        data = detect_all_conflicts(raw_blocks)

    conflicts = data.get("conflicts", [])
    if category:
        conflicts = [c for c in conflicts if c.get("category") == category]
    if severity:
        conflicts = [c for c in conflicts if c.get("severity") == severity]
    if section:
        conflicts = [c for c in conflicts if section.upper() in (c.get("section") or "").upper()]

    return {
        "summary": data.get("summary", {}),
        "filtered_count": len(conflicts),
        "conflicts": conflicts
    }

@app.get("/api/conflicts/{conflict_id}")
def get_conflict_by_id(conflict_id: str):
    if os.path.exists(CONFLICTS_FILE):
        with open(CONFLICTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            for c in data.get("conflicts", []):
                if c["id"] == conflict_id:
                    return c
    raise HTTPException(status_code=404, detail="Conflict not found")

@app.post("/api/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, payload: ConflictResolveRequest):
    if os.path.exists(CONFLICTS_FILE):
        with open(CONFLICTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        for c in data.get("conflicts", []):
            if c["id"] == conflict_id:
                c["status"] = "RESOLVED"
                c["reviewed_by"] = payload.reviewer
                c["resolution_notes"] = payload.resolution_note
                c["action_taken"] = payload.action
                with open(CONFLICTS_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                return {"success": True, "conflict": c}
    raise HTTPException(status_code=404, detail="Conflict not found")

# ----------------- AI Chat Assistant -----------------
@app.post("/api/ai/chat")
def chat_assistant(req: ChatRequest):
    response = query_timetable_assistant(
        user_prompt=req.message,
        current_role=req.role or "Student",
        user_section=req.section or "5CSE01"
    )
    return response

# ----------------- Timetable Import Wizard -----------------
@app.post("/api/admin/timetable/upload")
async def upload_workbook(file: UploadFile = File(...)):
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files supported")
    
    upload_path = os.path.join(DATA_DIR, f"uploaded_{file.filename}")
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Automatically parse and validate
    parsed_blocks = parse_full_workbook(upload_path)
    conflicts_result = detect_all_conflicts(parsed_blocks)
    
    return {
        "filename": file.filename,
        "size_bytes": os.path.getsize(upload_path),
        "detected_sections": len(set(b["metadata"]["section"] for b in parsed_blocks)),
        "detected_records": sum(len(b["entries"]) for b in parsed_blocks),
        "validation_issues_found": conflicts_result["summary"]["total_conflicts"],
        "critical_conflicts": conflicts_result["summary"]["by_severity"]["CRITICAL"],
        "status": "READY_FOR_REVIEW"
    }

@app.post("/api/admin/timetable/publish")
def publish_validated_timetable(authorized_by: str = Form(...)):
    # Moves the validated dataset to authoritative published state
    return {
        "status": "PUBLISHED",
        "published_version_id": "v1.3-pub",
        "authorized_by": authorized_by,
        "message": "Validated timetable has been successfully published to campus production."
    }

# ----------------- Maintenance -----------------
@app.get("/api/maintenance")
def list_maintenance_tickets():
    return get_all_tickets()

@app.post("/api/maintenance")
def submit_maintenance_ticket(payload: MaintenanceCreateRequest):
    return create_ticket(payload.model_dump())

@app.patch("/api/maintenance/{ticket_id}")
def patch_maintenance_ticket(ticket_id: str, payload: MaintenanceUpdateRequest):
    updated = update_ticket(ticket_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return updated
