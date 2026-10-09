import openpyxl
import re
import os
import json
from typing import List, Dict, Any, Optional

PERIOD_TIMINGS = {
    1: {"start": "09:00", "end": "10:00"},
    2: {"start": "10:00", "end": "11:00"},
    3: {"start": "11:15", "end": "12:15"},
    4: {"start": "12:15", "end": "13:15"},
    6: {"start": "14:15", "end": "15:10"},
    7: {"start": "15:10", "end": "16:05"},
    8: {"start": "16:05", "end": "17:00"}
}

COL_PERIOD_MAP = {
    2: 1,
    3: 2,
    5: 3,
    6: 4,
    8: 6,
    9: 7,
    10: 8
}

def clean_str(val: Any) -> str:
    if val is None:
        return ""
    return str(val).strip().replace("\n", " ")

def parse_room_allocation_col(alloc_str: str) -> Dict[str, str]:
    """
    Parses strings like 'A202, ST-A203, FOD-A202' or 'A203/A209'
    Returns default room and mapping of course short codes to rooms.
    """
    mapping = {}
    if not alloc_str:
        return mapping
    
    parts = [p.strip() for p in alloc_str.replace(";", ",").split(",") if p.strip()]
    default_room = ""
    for p in parts:
        if "-" in p:
            sub_parts = p.split("-", 1)
            mapping[sub_parts[0].strip().upper()] = sub_parts[1].strip().upper()
        else:
            if not default_room:
                default_room = p.strip().upper()
    
    if default_room:
        mapping["DEFAULT"] = default_room
    return mapping

def extract_room_and_batch_from_cell(cell_text: str, default_room: str = "") -> List[Dict[str, str]]:
    """
    Parses cell text like:
    - 'CCTL(B1)A405 / BDTL(B2)A625'
    - 'MLL B1/B2 (A222)'
    - 'ML(A203)'
    - 'BDT(A209)'
    - 'CTVA 1(HRD1) CTVA 2 (HRD5)'
    - 'PEHV 1' or 'FLAT'
    """
    results = []
    text = clean_str(cell_text)
    if not text:
        return results
    
    # Check for slash-separated parallel labs e.g. CCTL(B1)A405 / BDTL(B2)A625
    if "/" in text and ("(B1)" in text or "(B2)" in text or "B1/" in text or "B2/" in text):
        sub_items = [s.strip() for s in text.split("/") if s.strip()]
        for sub in sub_items:
            m = re.search(r'([A-Za-z0-9\-]+)\s*(\(B[12]\))\s*([A-Za-z0-9]+)?', sub)
            if m:
                subj = m.group(1).strip()
                batch = m.group(2).replace("(", "").replace(")", "").strip()
                room = m.group(3).strip() if m.group(3) else default_room
                results.append({"subject": subj, "batch": batch, "room": room, "raw": sub})
            else:
                results.append({"subject": sub, "batch": "ALL", "room": default_room, "raw": sub})
        return results
    
    # Check for MLL B1/B2 (A222)
    m_combined_lab = re.search(r'([A-Za-z0-9\-]+)\s*(?:B1/B2|\(B1/B2\)|B1\s*B2)\s*(?:\((A[0-9]+|[0-9]+)\)|(A[0-9]+))?', text)
    if m_combined_lab and ("MLL" in text or "LAB" in text.upper()):
        subj = m_combined_lab.group(1).strip()
        room = m_combined_lab.group(2) or m_combined_lab.group(3) or default_room
        results.append({"subject": subj, "batch": "B1 & B2", "room": room, "raw": text})
        return results

    # Check for subject with room in parens e.g. ML(A203) or FLAT(A203) or CTVA 1(A210)
    m_with_room = re.search(r'([A-Za-z0-9\-\s]+?)\s*\(([A-Za-z0-9]+)\)', text)
    if m_with_room:
        subj = m_with_room.group(1).strip()
        room = m_with_room.group(2).strip()
        results.append({"subject": subj, "batch": "ALL", "room": room, "raw": text})
        return results

    # Regular single entry
    results.append({"subject": text, "batch": "ALL", "room": default_room, "raw": text})
    return results

def parse_section_block(sheet, start_row: int, end_row: int, section_id: str, version_name: str) -> Dict[str, Any]:
    metadata = {
        "section": section_id,
        "academic_year": "2026-2027",
        "semester": "V",
        "department": "Computer Science and Engineering",
        "class_advisor": "",
        "source_version": version_name,
        "source_sheet": sheet.title,
        "start_row": start_row,
        "end_row": end_row
    }
    
    # 1. Extract advisor & academic year from header rows
    for r in range(start_row, min(start_row + 10, end_row)):
        for c in range(1, 15):
            val = clean_str(sheet.cell(r, c).value)
            if "Class Advisor" in val:
                # Advisor name is typically next cell
                advisor_val = clean_str(sheet.cell(r, c + 1).value or sheet.cell(r, c + 2).value)
                if advisor_val:
                    metadata["class_advisor"] = advisor_val
            if "Academic Year" in val:
                ay = clean_str(sheet.cell(r, c + 1).value or sheet.cell(r, c + 2).value)
                if ay and "20" in ay:
                    metadata["academic_year"] = ay

    # 2. Locate Timetable Grid (Days MON to FRI)
    day_rows = {}
    for r in range(start_row, min(start_row + 18, end_row)):
        day_val = clean_str(sheet.cell(r, 1).value).upper()
        if day_val in ["MON", "TUE", "WED", "THUR", "FRI"]:
            day_rows[day_val] = r

    # 3. Locate Course Allocation table
    course_alloc_header_row = None
    for r in range(start_row + 10, end_row):
        val = clean_str(sheet.cell(r, 1).value).upper()
        if "COURSE ALLOCATION" in val or "SL. NO." in val:
            course_alloc_header_row = r
            break

    courses = {}
    if course_alloc_header_row:
        # Scan subsequent rows for courses
        for r in range(course_alloc_header_row + 1, end_row + 1):
            sl = clean_str(sheet.cell(r, 1).value)
            code = clean_str(sheet.cell(r, 2).value)
            name = clean_str(sheet.cell(r, 3).value)
            short_code = clean_str(sheet.cell(r, 6).value)
            faculty = clean_str(sheet.cell(r, 7).value)
            
            if not short_code and code:
                # Sometimes short code is in col 5 or col 6
                for c in range(4, 7):
                    test_sc = clean_str(sheet.cell(r, c).value)
                    if test_sc and len(test_sc) <= 8 and test_sc.isupper():
                        short_code = test_sc
                        break

            if code or name or short_code:
                key = short_code if short_code else code
                courses[key] = {
                    "sl_no": sl,
                    "course_code": code,
                    "course_name": name,
                    "short_code": short_code,
                    "faculty": faculty,
                    "source_row": r
                }

    # 4. Parse Schedule entries
    timetable_entries = []
    for day, r in day_rows.items():
        alloc_col_str = clean_str(sheet.cell(r, 11).value)
        room_alloc_map = parse_room_allocation_col(alloc_col_str)
        default_room = room_alloc_map.get("DEFAULT", "")
        
        for col_idx, period_num in COL_PERIOD_MAP.items():
            cell_val = clean_str(sheet.cell(r, col_idx).value)
            if not cell_val:
                continue
            
            # Check if it's a break
            if any(b in cell_val.upper() for b in ["BREAK", "LUNCH", "TEA"]):
                continue

            parsed_sub_items = extract_room_and_batch_from_cell(cell_val, default_room)
            for item in parsed_sub_items:
                subj = item["subject"]
                batch = item["batch"]
                room = item["room"]
                
                # If room not found from cell, check room_alloc_map by subject
                if not room:
                    clean_subj_key = subj.upper().split()[0]
                    room = room_alloc_map.get(clean_subj_key, default_room)

                # Determine session type
                is_lab = any(lab_kw in subj.upper() for lab_kw in ["LAB", "CCTL", "BDTL", "MLL", "VAP"])
                is_elective = any(elec_kw in subj.upper() for elec_kw in ["PE-", "ELECTIVE", "DWM", "ST", "FOD", "SDD", "DOM"])
                session_type = "LAB" if is_lab else ("ELECTIVE" if is_elective else "REGULAR")
                
                # Match faculty
                matched_faculty = ""
                matched_course_code = ""
                matched_course_name = ""
                for ck, cd in courses.items():
                    if ck and (ck.upper() == subj.upper() or ck.upper() in subj.upper() or subj.upper() in cd.get("course_name", "").upper()):
                        matched_faculty = cd.get("faculty", "")
                        matched_course_code = cd.get("course_code", "")
                        matched_course_name = cd.get("course_name", "")
                        break

                timings = PERIOD_TIMINGS[period_num]
                entry = {
                    "academic_year": metadata["academic_year"],
                    "semester": metadata["semester"],
                    "department": metadata["department"],
                    "section": section_id,
                    "class_advisor": metadata["class_advisor"],
                    "weekday": day,
                    "period_number": period_num,
                    "start_time": timings["start"],
                    "end_time": timings["end"],
                    "raw_cell": cell_val,
                    "subject": subj,
                    "subject_code": matched_course_code,
                    "subject_name": matched_course_name or subj,
                    "faculty": matched_faculty,
                    "room": room,
                    "lab_group": batch,
                    "session_type": session_type,
                    "source_sheet": sheet.title,
                    "source_row": r,
                    "source_version": version_name,
                    "validation_status": "VALID" if (room and subj) else ("WARNING_MISSING_ROOM" if not room else "WARNING")
                }
                timetable_entries.append(entry)

    return {
        "metadata": metadata,
        "courses": courses,
        "entries": timetable_entries
    }

def parse_full_workbook(file_path: str) -> Dict[str, Any]:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    all_sections_data = []
    
    # We parse both sheets as two distinct versions
    sheets_to_parse = [
        ("TIME TABLE 15-09-2026", "VERSION_15_SEPT_2026"),
        ("TIME TABLE", "VERSION_17_SEPT_2026_PUBLISHED")
    ]
    
    for sheet_name, version_label in sheets_to_parse:
        if sheet_name not in wb.sheetnames:
            continue
        sheet = wb[sheet_name]
        
        # Identify section boundaries
        section_starts = []
        for r in range(1, sheet.max_row + 1):
            for c in range(1, 12):
                val = clean_str(sheet.cell(r, c).value)
                if "5CSE" in val:
                    m = re.search(r'5CSE\d{2}', val)
                    if m:
                        section_starts.append((r, m.group(0)))
                        break
        
        # Sort by row
        section_starts.sort(key=lambda x: x[0])
        
        for idx, (s_row, sec_id) in enumerate(section_starts):
            # The block extends to the next section start or max_row
            next_row = section_starts[idx + 1][0] - 1 if idx + 1 < len(section_starts) else sheet.max_row
            parsed = parse_section_block(sheet, s_row - 4, next_row, sec_id, version_label)
            all_sections_data.append(parsed)

    return all_sections_data

if __name__ == "__main__":
    wb_file = os.path.join("data", "V Final TimeTable 17th Sept 2026.xlsx")
    parsed_data = parse_full_workbook(wb_file)
    print(f"Total section blocks parsed across sheets: {len(parsed_data)}")
    
    total_entries = sum(len(d["entries"]) for d in parsed_data)
    print(f"Total schedule entries extracted: {total_entries}")
    
    output_path = os.path.join("data", "all_parsed_timetable.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed_data, f, indent=2, ensure_ascii=False)
    print(f"Saved full parsed dataset to {output_path}")
