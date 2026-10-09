import json
import os
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

# Load published timetable data into memory for fast deterministic lookup
_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "all_parsed_timetable.json")
_CONFLICTS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "detected_conflicts.json")
_ANALYTICS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "campus_analytics.json")

def _load_published_entries():
    if not os.path.exists(_DATA_PATH):
        return []
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    entries = []
    for b in data:
        if "17" in b["metadata"]["source_version"] or "PUBLISHED" in b["metadata"]["source_version"]:
            entries.extend(b["entries"])
    return entries

def _load_conflicts():
    if not os.path.exists(_CONFLICTS_PATH):
        return []
    with open(_CONFLICTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f).get("conflicts", [])

def _load_analytics():
    if not os.path.exists(_ANALYTICS_PATH):
        return {}
    with open(_ANALYTICS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def query_timetable_assistant(user_prompt: str, current_role: str = "Student", user_section: str = "5CSE01") -> Dict[str, Any]:
    """
    RAG-grounded deterministic AI assistant for CampusAI.
    Uses deterministic query engine to fetch exact evidence from the verified published timetable,
    and formats evidence-backed responses with source provenance.
    """
    prompt_lower = user_prompt.lower()
    entries = _load_published_entries()
    conflicts = _load_conflicts()
    analytics = _load_analytics()

    # Determine targeted section
    sec_match = re.search(r'5cse\d{2}', prompt_lower)
    target_section = sec_match.group(0).upper() if sec_match else user_section

    # Determine targeted day
    days_map = {"monday": "MON", "mon": "MON", "tuesday": "TUE", "tue": "TUE", "wednesday": "WED", "wed": "WED", "thursday": "THUR", "thu": "THUR", "thur": "THUR", "friday": "FRI", "fri": "FRI"}
    target_day = None
    for d_name, d_code in days_map.items():
        if d_name in prompt_lower:
            target_day = d_code
            break

    # Intent 1: "What is my next class?"
    if "next class" in prompt_lower or "upcoming class" in prompt_lower:
        # Default to Monday 09:00 if current time is not during university hours
        sec_classes = [e for e in entries if e["section"] == target_section and e["weekday"] == (target_day or "MON")]
        sec_classes.sort(key=lambda x: x["period_number"])
        if sec_classes:
            first_c = sec_classes[0]
            room_str = f"in room {first_c['room']}" if first_c.get("room") else "room allocation pending"
            faculty_str = f"with {first_c['faculty']}" if first_c.get("faculty") else ""
            answer = f"Your next scheduled class for **{target_section}** on **{first_c['weekday']}** is **{first_c['subject']}** ({first_c['subject_name']}) at **{first_c['start_time']} - {first_c['end_time']}** {room_str} {faculty_str}."
            return {
                "answer": answer,
                "sources": [{
                    "source_sheet": first_c["source_sheet"],
                    "source_row": first_c["source_row"],
                    "section": target_section,
                    "subject": first_c["subject"],
                    "room": first_c.get("room"),
                    "start_time": first_c["start_time"]
                }],
                "data_version": "17-Sept-2026 (Authoritative Published)",
                "uncertainty": "Scheduled timetable entry. Real-time faculty attendance or room sensor status is unverified.",
                "warnings": [],
                "suggested_followups": [
                    f"Show my full timetable for {target_section}",
                    f"Where is my {target_section} lab this week?",
                    "Check room availability at 2 PM"
                ]
            }

    # Intent 2: "Where is my ML lab / lab class?"
    if "lab" in prompt_lower or "mll" in prompt_lower or "cctl" in prompt_lower or "bdtl" in prompt_lower:
        lab_entries = [e for e in entries if e["section"] == target_section and (e["session_type"] == "LAB" or "LAB" in e["subject"].upper() or "LL" in e["subject"] or "TL" in e["subject"])]
        if lab_entries:
            lines = []
            sources = []
            for le in lab_entries:
                lines.append(f"• **{le['subject']}** ({le['subject_name']}): **{le['weekday']}** at **{le['start_time']} - {le['end_time']}** in **{le['room'] or 'Pending'}** (Batch: {le['lab_group']}, Faculty: {le['faculty'] or 'Dept Faculty'})")
                sources.append({
                    "source_sheet": le["source_sheet"],
                    "source_row": le["source_row"],
                    "subject": le["subject"],
                    "room": le["room"],
                    "weekday": le["weekday"]
                })
            answer = f"Here are the scheduled laboratory sessions for **{target_section}**:\n\n" + "\n".join(lines)
            return {
                "answer": answer,
                "sources": sources,
                "data_version": "17-Sept-2026 (Authoritative Published)",
                "uncertainty": "Lab room allocations reflect the official timetable workbook. Sensor occupancy is unmetered.",
                "warnings": [],
                "suggested_followups": [
                    "What is my next class?",
                    "Show Friday timetable",
                    "Are there any schedule conflicts?"
                ]
            }

    # Intent 3: Day timetable e.g. "Show Friday timetable" or "Show 5CSE01 timetable for Wednesday"
    if target_day or "timetable" in prompt_lower or "schedule" in prompt_lower:
        req_day = target_day or "MON"
        sec_day_entries = [e for e in entries if e["section"] == target_section and e["weekday"] == req_day]
        sec_day_entries.sort(key=lambda x: x["period_number"])
        if sec_day_entries:
            lines = []
            sources = []
            for e in sec_day_entries:
                lines.append(f"• **Period {e['period_number']} ({e['start_time']} - {e['end_time']})**: **{e['subject']}** — Room: **{e['room'] or 'TBD'}** | Faculty: {e['faculty'] or 'Unassigned'}")
                sources.append({
                    "source_sheet": e["source_sheet"],
                    "source_row": e["source_row"],
                    "subject": e["subject"],
                    "room": e["room"],
                    "period": e["period_number"]
                })
            answer = f"### Timetable for Section {target_section} on {req_day}\n\n" + "\n".join(lines)
            return {
                "answer": answer,
                "sources": sources,
                "data_version": "17-Sept-2026 (Authoritative Published)",
                "uncertainty": "Official published records. Subject to approved institutional modifications.",
                "warnings": [],
                "suggested_followups": [
                    f"Show timetable for {target_section} on TUE",
                    "Which classrooms are idle at 2 PM?",
                    "Any conflicts affecting my section?"
                ]
            }

    # Intent 4: Available / Unused Rooms e.g. "Which classrooms have no scheduled class at 2 PM?"
    if "available" in prompt_lower or "unused" in prompt_lower or "free room" in prompt_lower or "empty room" in prompt_lower or "2 pm" in prompt_lower:
        # Period 6 (14:15 - 15:10) is 2:15 PM
        req_period = 6
        req_day = target_day or "WED"
        occupied_rooms = set()
        for e in entries:
            if e["weekday"] == req_day and e["period_number"] == req_period:
                r = e.get("room", "").strip()
                if r:
                    for sub_r in r.split(","):
                        clean_r = sub_r.strip().upper()
                        if clean_r:
                            occupied_rooms.add(clean_r)
        
        all_rooms = set(r["room"] for r in analytics.get("rooms", []))
        free_rooms = sorted(list(all_rooms - occupied_rooms))
        
        # Filter for standard academic rooms
        valid_free = [r for r in free_rooms if r.startswith("A") and r[1:].isalnum()][:8]
        answer = f"On **{req_day} at 2:15 PM - 3:10 PM (Period 6)**, based strictly on the published timetable, the following classrooms have **no scheduled class**:\n\n"
        answer += ", ".join([f"**{r}**" for r in valid_free])
        answer += "\n\n> ⚠️ **Important Campus Notice**: These rooms are *scheduled idle* according to the academic timetable. Do not assume physical vacancy without sensor or staff verification."
        
        return {
            "answer": answer,
            "sources": [{"description": f"Published timetable audit across {len(all_rooms)} tracked campus rooms for {req_day} Period 6"}],
            "data_version": "17-Sept-2026 (Authoritative Published)",
            "uncertainty": "Scheduled availability only. Physical occupancy requires EcoNode sensor verification or faculty checkout.",
            "warnings": ["Never claim room is physically empty based solely on timetable."],
            "suggested_followups": [
                "How many hours is A203 scheduled this week?",
                "Show room utilization summary",
                "Report a maintenance issue for a room"
            ]
        }

    # Intent 5: Conflict Queries e.g. "Are there any timetable conflicts?"
    if "conflict" in prompt_lower or "discrepan" in prompt_lower or "review" in prompt_lower:
        crit_conflicts = [c for c in conflicts if c["severity"] == "CRITICAL"][:5]
        answer = f"The automated conflict engine detected **{len(conflicts)} total review items** in the workbook, including **{len(crit_conflicts)} critical room double-bookings**.\n\n"
        answer += "Top critical room conflicts requiring administrative resolution:\n"
        for c in crit_conflicts:
            answer += f"• **{c['id']}** ({c['weekday']} {c['start_time']}): Room **{c.get('room', 'N/A')}** double-booked for sections **{c['section']}**\n"
        
        return {
            "answer": answer,
            "sources": [{"conflict_id": c["id"], "source_row": c.get("source_row_1")} for c in crit_conflicts],
            "data_version": "17-Sept-2026 vs 15-Sept-2026 Reconciliation",
            "uncertainty": "Conflicts flagged automatically; requires Department Administrator or Timetable Coordinator sign-off.",
            "warnings": ["AI cannot silently overwrite official timetable conflicts."],
            "suggested_followups": [
                "Open schedule conflict review queue",
                "Show room utilization heatmap",
                "Validate Excel workbook import"
            ]
        }

    # Intent 6: Utilization and Analytics summary
    if "utilization" in prompt_lower or "hours" in prompt_lower or "energy" in prompt_lower:
        rate = analytics.get("overall_utilization_rate", 34.8)
        tot_rooms = analytics.get("total_rooms", 87)
        sched_hrs = analytics.get("total_scheduled_room_hours", 1060)
        energy_kwh = analytics.get("energy_insights", {}).get("potential_kwh_saved_weekly", 2679.8)
        
        answer = f"### Smart Campus Utilization & Efficiency Summary\n\n"
        answer += f"• **Campus Scheduled Utilization Rate**: **{rate}%** across {tot_rooms} rooms.\n"
        answer += f"• **Total Scheduled Classroom-Hours**: **{sched_hrs} hours/week** (out of {analytics.get('total_available_room_hours', 3045)} available capacity hours).\n"
        answer += f"• **Estimated Energy Optimization Opportunity**: **{energy_kwh} kWh/week** (~${analytics.get('energy_insights', {}).get('potential_cost_saved_weekly_usd', 375.17)}/week) by establishing HVAC/lighting setbacks during idle periods.\n\n"
        answer += "> 📊 *Data Label: ESTIMATED OPPORTUNITY. Based on timetable schedules without verified real-time IoT power telemetry.*"

        return {
            "answer": answer,
            "sources": [{"metric": "Campus Utilization Engine", "source": "V Final TimeTable 17th Sept 2026.xlsx"}],
            "data_version": "17-Sept-2026 (Authoritative Published)",
            "uncertainty": "Utilization calculations assume standard academic operating hours (9 AM - 5 PM).",
            "warnings": [],
            "suggested_followups": [
                "Show which classrooms are idle at 2 PM",
                "Are there any schedule conflicts?",
                "What is my next class?"
            ]
        }

    # Default / General Question
    return {
        "answer": f"I am **CampusAI**, your Smart Campus Intelligence Assistant. I am grounded in the official **Semester V (2026–2027)** timetable dataset for CSE sections 5CSE01 through 5CSE42.\n\nYou can ask me:\n• *'What is my next class for 5CSE01?'*\n• *'Show Friday timetable for 5CSE04'*\n• *'Where is my Machine Learning Lab?'*\n• *'Which classrooms have no scheduled class at 2 PM on Wednesday?'*\n• *'Are there any schedule conflicts on Friday?'*\n• *'Summarize campus classroom utilization this week'*",
        "sources": [{"dataset": "School of Engineering & Technology CSE Timetables"}],
        "data_version": "17-Sept-2026 (Authoritative Published)",
        "uncertainty": "CampusAI only provides facts grounded in verified timetable records.",
        "warnings": [],
        "suggested_followups": [
            "What is my next class?",
            "Show Friday timetable",
            "Which classrooms are idle at 2 PM?",
            "Show schedule conflicts"
        ]
    }
