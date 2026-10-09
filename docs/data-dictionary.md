# CampusAI Data Dictionary & Domain Entities

## 1. Timetable Record (`TimetableEntry`)
- `academic_year`: (String) Academic session e.g. "2026-2027"
- `semester`: (String) Academic term e.g. "V"
- `department`: (String) School division e.g. "Computer Science and Engineering"
- `section`: (String) Cohort identifier e.g. "5CSE01" through "5CSE42"
- `class_advisor`: (String) Designated faculty advisor
- `weekday`: (Enum) `MON`, `TUE`, `WED`, `THUR`, `FRI`
- `period_number`: (Integer) Integer index `1`, `2`, `3`, `4`, `6`, `7`, `8`
- `start_time`: (String) Start boundary e.g. "09:00"
- `end_time`: (String) End boundary e.g. "10:00"
- `subject`: (String) Course short mnemonic e.g. "CCT", "BDT", "ML", "FLAT"
- `subject_code`: (String) Official catalog code e.g. "24BECSE501"
- `faculty`: (String) Allocated professor or lab instructors
- `room`: (String) Allocated instructional space e.g. "A203", "A405", "A222"
- `lab_group`: (String) Batch tag `B1`, `B2`, `B1 & B2`, `ALL`
- `session_type`: (Enum) `REGULAR`, `LAB`, `ELECTIVE`, `BREAK`
- `source_sheet`: (String) Name of origin Excel worksheet
- `source_row`: (Integer) Row number in source Excel workbook
- `source_version`: (String) Identifier of source dataset version
- `validation_status`: (Enum) `VALID`, `WARNING_MISSING_ROOM`, `CONFLICT_FLAGGED`

## 2. Schedule Conflict (`ConflictItem`)
- `id`: (String) Unique reference e.g. "CONF-0001"
- `category`: (Enum) `VERSION_DISCREPANCY`, `ROOM_DOUBLE_BOOKING`, `FACULTY_OVERLAP`, `MISSING_ROOM_DATA`
- `severity`: (Enum) `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `section`: (String) Affected cohort(s)
- `weekday`: (String) Day of collision
- `period_number`: (Integer) Time slot
- `description`: (String) Machine-readable summary
- `proposed_resolution`: (String) Recommended administrative fix
- `status`: (Enum) `OPEN`, `RESOLVED`
- `reviewed_by`: (String) Administrator or reviewer name
- `resolution_notes`: (String) Audit log justification

## 3. Classroom Specification (`RoomStat`)
- `room`: (String) Physical door label e.g. "A203"
- `building`: (String) Campus block e.g. "Academic Block A"
- `capacity`: (Integer) Maximum seated headcount
- `room_type`: (String) "Lecture Hall", "Computer Laboratory", "Auditorium"
- `scheduled_hours_per_week`: (Integer) Total hours scheduled in published timetable
- `utilization_rate`: (Float) Percentage of weekly 35-hour teaching capacity scheduled
- `sensor_status`: (String) "UNMETERED (Scheduled Only)" or "ONLINE (EcoNode-v2)"
