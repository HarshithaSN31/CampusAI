import openpyxl
import re
import json
import os

wb = openpyxl.load_workbook("data/V Final TimeTable 17th Sept 2026.xlsx", data_only=True)
sheet = wb["TIME TABLE"]

# We will scan all 42 section blocks in the published sheet
section_starts = []
for r in range(1, sheet.max_row + 1):
    for c in range(1, 12):
        val = str(sheet.cell(r, c).value or "")
        if "5CSE" in val:
            m = re.search(r'5CSE\d{2}', val)
            if m:
                section_starts.append((r, m.group(0)))
                break

section_starts.sort(key=lambda x: x[0])

PERIOD_COL_MAP = {
    2: 1, # Period 1
    3: 2, # Period 2
    5: 3, # Period 3
    6: 4, # Period 4
    8: 6, # Period 5 (2:15 - 3:10)
    9: 7, # Period 6 (3:10 - 4:05)
    10: 8 # Period 7 (4:05 - 5:00)
}

DAYS = ["MON", "TUE", "WED", "THUR", "FRI"]

# room_schedule: key = (DAY, PERIOD_NUM, ROOM) -> list of occupancy entries
room_schedule = {}

for idx, (s_row, sec_id) in enumerate(section_starts):
    end_row = section_starts[idx + 1][0] - 1 if idx + 1 < len(section_starts) else sheet.max_row
    
    # Locate days
    day_rows = {}
    for r in range(s_row - 4, min(s_row + 16, end_row)):
        d_val = str(sheet.cell(r, 1).value or "").strip().upper()
        if d_val in DAYS:
            day_rows[d_val] = r

    for day, r in day_rows.items():
        # Column 11 has default room allocation for this day
        alloc_col = str(sheet.cell(r, 11).value or "").strip().upper()
        # Parse default room e.g. 'A202, ST-A203, FOD-A202' or 'A203/A209'
        default_room = ""
        elective_rooms = {}
        for part in alloc_col.replace(";", ",").split(","):
            p = part.strip()
            if "-" in p:
                sp = p.split("-", 1)
                elective_rooms[sp[0].strip()] = sp[1].strip()
            elif not default_room and p.startswith("A"):
                default_room = p.split("/")[0].strip()

        for c_idx, p_num in PERIOD_COL_MAP.items():
            cell_val = str(sheet.cell(r, c_idx).value or "").strip()
            if not cell_val or any(b in cell_val.upper() for b in ["BREAK", "TEA", "LUNCH"]):
                continue

            # Detect room for this cell
            # 1. Embedded room in parens e.g. 'PEHV 2(A212)', 'MLLB1/B2 (A222)', 'ML(A203)', 'BDT(A209)', 'CCTL(B1)A405 / BDTL(B2)A625'
            rooms_found = []
            
            # Check parallel lab pattern e.g. CCTL(B1)A405 / BDTL(B2)A625
            if "/" in cell_val and ("(B1)" in cell_val or "(B2)" in cell_val):
                for sub in cell_val.split("/"):
                    m_rm = re.search(r'A\d{3}', sub)
                    if m_rm:
                        rooms_found.append((m_rm.group(0), sub.strip()))
            else:
                m_rm = re.search(r'\(?(A\d{3})\)?', cell_val)
                if m_rm and ("A" in cell_val):
                    rooms_found.append((m_rm.group(1), cell_val))

            if not rooms_found:
                # Check elective room map
                subj_clean = cell_val.upper().split()[0]
                if subj_clean in elective_rooms:
                    rooms_found.append((elective_rooms[subj_clean], cell_val))
                elif default_room:
                    rooms_found.append((default_room, cell_val))

            for rm, label in rooms_found:
                if rm.startswith("A") and len(rm) <= 5:
                    k = f"{day}_{p_num}_{rm}"
                    room_schedule[k] = {
                        "room": rm,
                        "subject": cell_val,
                        "section": sec_id,
                        "day": day,
                        "period": p_num
                    }

with open("data/live_room_schedule.json", "w", encoding="utf-8") as f:
    json.dump(room_schedule, f, indent=2)

print(f"Generated data/live_room_schedule.json with {len(room_schedule)} room-time allocations!")
for test_r in ["A202", "A203", "A209", "A210", "A212", "A219", "A222", "A225", "A301", "A303", "A304", "A308", "A310", "A312", "A319", "A321", "A322", "A325", "A401", "A403"]:
    k = f"THUR_6_{test_r}"
    entry = room_schedule.get(k)
    print(f"THUR Period 5 (2:15 - 3:10) | {test_r}:", f"{entry['subject']} · {entry['section']}" if entry else "Available")
