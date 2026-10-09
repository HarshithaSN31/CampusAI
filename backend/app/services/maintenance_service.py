import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

_MAINTENANCE_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "maintenance_tickets.json")

INITIAL_TICKETS = [
    {
        "id": "TICK-101",
        "building": "Academic Block A",
        "room": "A203",
        "category": "AV & Projector",
        "priority": "HIGH",
        "status": "IN_PROGRESS",
        "description": "HDMI ceiling projector displaying blue tint and intermittent flickering during lectures.",
        "reported_by": "Prof. Vikram N R",
        "assigned_to": "Karthik (AV Tech)",
        "created_at": "2026-10-08T09:30:00",
        "ai_suggested_category": "AV & Projector",
        "resolution_notes": "Replacement HDMI transceivers ordered."
    },
    {
        "id": "TICK-102",
        "building": "Academic Block A",
        "room": "A222",
        "category": "HVAC / Air Conditioning",
        "priority": "MEDIUM",
        "status": "SUBMITTED",
        "description": "Lab A222 AC unit 2 making clicking noise; temperature not regulating below 26C.",
        "reported_by": "A Ranjini",
        "assigned_to": "Unassigned",
        "created_at": "2026-10-08T14:15:00",
        "ai_suggested_category": "HVAC / Air Conditioning",
        "resolution_notes": ""
    },
    {
        "id": "TICK-103",
        "building": "Academic Block A",
        "room": "A405",
        "category": "Electrical & Lighting",
        "priority": "LOW",
        "status": "RESOLVED",
        "description": "Row 3 fluorescent tube lights unlit in Cloud Computing Lab.",
        "reported_by": "Kavya M",
        "assigned_to": "Suresh (Electrical)",
        "created_at": "2026-10-06T11:00:00",
        "ai_suggested_category": "Electrical & Lighting",
        "resolution_notes": "Replaced with standard LED tube fixtures. Verified operation."
    }
]

def _ensure_file():
    if not os.path.exists(_MAINTENANCE_FILE):
        with open(_MAINTENANCE_FILE, "w", encoding="utf-8") as f:
            json.dump(INITIAL_TICKETS, f, indent=2)

def get_all_tickets() -> List[Dict[str, Any]]:
    _ensure_file()
    with open(_MAINTENANCE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def create_ticket(data: Dict[str, Any]) -> Dict[str, Any]:
    tickets = get_all_tickets()
    new_id = f"TICK-{len(tickets) + 101}"
    
    # AI auto-classification helper
    desc = data.get("description", "").lower()
    cat = data.get("category")
    if not cat:
        if any(w in desc for w in ["projector", "screen", "mic", "speaker", "display", "hdmi"]):
            cat = "AV & Projector"
        elif any(w in desc for w in ["ac", "air condition", "cooling", "heat", "fan"]):
            cat = "HVAC / Air Conditioning"
        elif any(w in desc for w in ["light", "power", "socket", "switch", "wire"]):
            cat = "Electrical & Lighting"
        else:
            cat = "Furniture / General"

    new_ticket = {
        "id": new_id,
        "building": data.get("building", "Academic Block A"),
        "room": data.get("room", "A203"),
        "category": cat,
        "priority": data.get("priority", "MEDIUM"),
        "status": "SUBMITTED",
        "description": data.get("description", ""),
        "reported_by": data.get("reported_by", "Campus Staff"),
        "assigned_to": data.get("assigned_to", "Unassigned"),
        "created_at": datetime.now().isoformat(),
        "ai_suggested_category": cat,
        "resolution_notes": ""
    }
    tickets.insert(0, new_ticket)
    with open(_MAINTENANCE_FILE, "w", encoding="utf-8") as f:
        json.dump(tickets, f, indent=2)
    return new_ticket

def update_ticket(ticket_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    tickets = get_all_tickets()
    for t in tickets:
        if t["id"] == ticket_id:
            for k, v in updates.items():
                if v is not None:
                    t[k] = v
            with open(_MAINTENANCE_FILE, "w", encoding="utf-8") as f:
                json.dump(tickets, f, indent=2)
            return t
    return None
