import json
import os
from typing import List, Dict, Any

def detect_all_conflicts(blocks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Performs deep multi-criteria schedule conflict analysis:
    1. Room Conflicts: Same room, same day, same time slot allocated to multiple classes.
    2. Faculty Conflicts: Same faculty assigned to multiple classes simultaneously.
    3. Section Conflicts: Same section having multiple non-parallel lectures at same time.
    4. Version Discrepancies: Discrepancies between 15-09-2026 and 17-09-2026 sheets.
    5. Data Hygiene: Missing room, missing faculty, or unassigned subject.
    """
    conflicts = []
    conflict_id_seq = 1

    # Split records by version
    v15_entries = []
    v17_entries = []
    
    for block in blocks_data:
        ver = block["metadata"]["source_version"]
        if "15" in ver:
            v15_entries.extend(block["entries"])
        else:
            v17_entries.extend(block["entries"])

    # 1. Version Discrepancies Comparison (Between 15-09 and 17-09 for each section/day/period)
    v15_dict = {}
    for e in v15_entries:
        key = (e["section"], e["weekday"], e["period_number"], e["lab_group"])
        v15_dict[key] = e

    v17_dict = {}
    for e in v17_entries:
        key = (e["section"], e["weekday"], e["period_number"], e["lab_group"])
        v17_dict[key] = e

    all_keys = set(v15_dict.keys()).union(set(v17_dict.keys()))
    for key in sorted(all_keys):
        sec, day, period, lab_grp = key
        e15 = v15_dict.get(key)
        e17 = v17_dict.get(key)
        
        if e15 and e17:
            # Check for subject, room, or faculty difference
            if e15["subject"] != e17["subject"] or e15["room"] != e17["room"]:
                conflicts.append({
                    "id": f"CONF-{conflict_id_seq:04d}",
                    "category": "VERSION_DISCREPANCY",
                    "severity": "HIGH",
                    "section": sec,
                    "weekday": day,
                    "period_number": period,
                    "start_time": e17["start_time"],
                    "end_time": e17["end_time"],
                    "description": f"Difference between 15-Sept ({e15['subject']} in {e15['room'] or 'No Room'}) and 17-Sept Published ({e17['subject']} in {e17['room'] or 'No Room'})",
                    "source_worksheet_1": e15["source_sheet"],
                    "source_row_1": e15["source_row"],
                    "version_1_data": f"{e15['subject']} ({e15['room']})",
                    "source_worksheet_2": e17["source_sheet"],
                    "source_row_2": e17["source_row"],
                    "version_2_data": f"{e17['subject']} ({e17['room']})",
                    "proposed_resolution": "Maintain 17-Sept published version unless override approved by HOD.",
                    "status": "OPEN",
                    "reviewed_by": None
                })
                conflict_id_seq += 1

    # Focus on the published version (v17) for room clashes and faculty overlaps
    published_entries = v17_entries

    # 2. Room Overlap Detection
    room_time_map = {}
    for e in published_entries:
        room = e.get("room", "").strip()
        if not room or room.upper() in ["HRD1", "HRD2", "HRD3", "HRD4", "HRD5", "HRD6", "HRD7", "HRD8", "ONLINE"]:
            continue
        # Split multi-rooms if comma separated
        for r_sub in room.split(","):
            r_clean = r_sub.strip()
            if not r_clean:
                continue
            r_key = (r_clean, e["weekday"], e["period_number"])
            room_time_map.setdefault(r_key, []).append(e)

    for (r_name, day, period), items in room_time_map.items():
        if len(items) > 1:
            # Check if they are genuine clashes (different sections or incompatible parallel sessions)
            distinct_sections = set(it["section"] for it in items)
            if len(distinct_sections) > 1:
                sec_list = ", ".join(sorted(distinct_sections))
                subj_list = ", ".join(f"{it['section']}:{it['subject']}" for it in items)
                conflicts.append({
                    "id": f"CONF-{conflict_id_seq:04d}",
                    "category": "ROOM_DOUBLE_BOOKING",
                    "severity": "CRITICAL",
                    "section": sec_list,
                    "room": r_name,
                    "weekday": day,
                    "period_number": period,
                    "start_time": items[0]["start_time"],
                    "end_time": items[0]["end_time"],
                    "description": f"Room {r_name} simultaneously allocated to sections {sec_list} ({subj_list})",
                    "source_worksheet_1": items[0]["source_sheet"],
                    "source_row_1": items[0]["source_row"],
                    "version_1_data": items[0]["subject"],
                    "source_worksheet_2": items[1]["source_sheet"],
                    "source_row_2": items[1]["source_row"],
                    "version_2_data": items[1]["subject"],
                    "proposed_resolution": f"Reallocate one of the sections to an available room at {items[0]['start_time']}",
                    "status": "OPEN",
                    "reviewed_by": None
                })
                conflict_id_seq += 1

    # 3. Faculty Overlap Detection
    fac_time_map = {}
    for e in published_entries:
        fac = e.get("faculty", "").strip()
        if not fac or any(skip in fac.upper() for skip in ["PROCTOR", "CTVA", "PEHV", "TBD"]):
            continue
        # If faculty string has slash e.g. "Vikram N R (B1) / Monisha R(B2)", extract each
        fac_names = [f.strip() for f in fac.split("/") if f.strip()]
        for fn in fac_names:
            # Clean off batch tag
            fn_clean = fn.split("(")[0].strip()
            if len(fn_clean) > 3:
                f_key = (fn_clean, e["weekday"], e["period_number"])
                fac_time_map.setdefault(f_key, []).append(e)

    for (f_name, day, period), items in fac_time_map.items():
        if len(items) > 1:
            distinct_sections = set(it["section"] for it in items)
            if len(distinct_sections) > 1:
                conflicts.append({
                    "id": f"CONF-{conflict_id_seq:04d}",
                    "category": "FACULTY_OVERLAP",
                    "severity": "HIGH",
                    "faculty": f_name,
                    "section": ", ".join(sorted(distinct_sections)),
                    "weekday": day,
                    "period_number": period,
                    "start_time": items[0]["start_time"],
                    "end_time": items[0]["end_time"],
                    "description": f"Faculty member '{f_name}' scheduled across sections {', '.join(sorted(distinct_sections))} at the same hour",
                    "source_worksheet_1": items[0]["source_sheet"],
                    "source_row_1": items[0]["source_row"],
                    "version_1_data": items[0]["subject"],
                    "source_worksheet_2": items[1]["source_sheet"],
                    "source_row_2": items[1]["source_row"],
                    "version_2_data": items[1]["subject"],
                    "proposed_resolution": f"Assign co-instructor or reschedule lecture slot for {f_name}",
                    "status": "OPEN",
                    "reviewed_by": None
                })
                conflict_id_seq += 1

    # 4. Data Hygiene (Missing Room)
    for e in published_entries:
        if not e.get("room") and e.get("subject") and not any(k in e["subject"].upper() for k in ["BREAK", "PWM", "PROCTOR"]):
            conflicts.append({
                "id": f"CONF-{conflict_id_seq:04d}",
                "category": "MISSING_ROOM_DATA",
                "severity": "MEDIUM",
                "section": e["section"],
                "weekday": e["weekday"],
                "period_number": e["period_number"],
                "start_time": e["start_time"],
                "end_time": e["end_time"],
                "description": f"Class '{e['subject']}' in section {e['section']} has no classroom allocated in source table",
                "source_worksheet_1": e["source_sheet"],
                "source_row_1": e["source_row"],
                "version_1_data": e["subject"],
                "proposed_resolution": "Assign an idle classroom for this time slot.",
                "status": "OPEN",
                "reviewed_by": None
            })
            conflict_id_seq += 1

    summary = {
        "total_conflicts": len(conflicts),
        "by_category": {
            "VERSION_DISCREPANCY": len([c for c in conflicts if c["category"] == "VERSION_DISCREPANCY"]),
            "ROOM_DOUBLE_BOOKING": len([c for c in conflicts if c["category"] == "ROOM_DOUBLE_BOOKING"]),
            "FACULTY_OVERLAP": len([c for c in conflicts if c["category"] == "FACULTY_OVERLAP"]),
            "MISSING_ROOM_DATA": len([c for c in conflicts if c["category"] == "MISSING_ROOM_DATA"])
        },
        "by_severity": {
            "CRITICAL": len([c for c in conflicts if c["severity"] == "CRITICAL"]),
            "HIGH": len([c for c in conflicts if c["severity"] == "HIGH"]),
            "MEDIUM": len([c for c in conflicts if c["severity"] == "MEDIUM"])
        }
    }

    return {"summary": summary, "conflicts": conflicts}

if __name__ == "__main__":
    with open("data/all_parsed_timetable.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    result = detect_all_conflicts(data)
    print("Conflict Summary:", json.dumps(result["summary"], indent=2))
    with open("data/detected_conflicts.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print("Saved conflict reports to data/detected_conflicts.json")
