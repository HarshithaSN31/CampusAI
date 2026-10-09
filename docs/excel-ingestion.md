# Excel Ingestion & Timetable Parsing Specification

## Source Workbook Overview
- **File Name**: `V Final TimeTable 17th Sept 2026.xlsx`
- **Worksheets Inventory**:
  1. `TIME TABLE 15-09-2026`: 2,162 rows, 26 columns, 2,119 merged cells. Represents the initial timetable draft.
  2. `TIME TABLE`: 2,162 rows, 26 columns, 2,160 merged cells. Represents the authoritative published timetable.
  3. `ELECTIVE`: 43 rows, 15 columns, 88 merged cells. Contains elective group assignments and section breakdowns.

## Extracted Structure
- **Academic Year**: 2026–2027
- **Semester**: Semester V
- **Department**: Computer Science and Engineering
- **Sections**: 42 sections (`5CSE01` through `5CSE42`)
- **Total Blocks Extracted**: 84 section blocks across both sheets
- **Total Timetable Records Extracted**: 2,297 entries

## Period Timing Matrix
| Period | Start Time | End Time | Interval Type |
|---|---|---|---|
| Period 1 | 09:00 | 10:00 | Academic Lecture |
| Period 2 | 10:00 | 11:00 | Academic Lecture |
| Tea Break | 11:00 | 11:15 | Scheduled Recess |
| Period 3 | 11:15 | 12:15 | Academic Lecture |
| Period 4 | 12:15 | 13:15 | Academic Lecture |
| Lunch Break | 13:15 | 14:15 | Scheduled Recess |
| Period 6 | 14:15 | 15:10 | Academic Lecture |
| Period 7 | 15:10 | 16:05 | Academic Lecture |
| Period 8 | 16:05 | 17:00 | Academic Lecture |

## Complex Patterns Handled
1. **Parallel Laboratory Sessions**: e.g., `CCTL(B1)A405 / BDTL(B2)A625` is parsed into Batch B1 occupying lab A405 and Batch B2 occupying lab A625.
2. **Combined Lab Blocks**: e.g., `MLL B1/B2 (A222)` is parsed as a unified session for both batches occupying Machine Learning Lab A222.
3. **Elective Room Dispersal**: e.g., `A202, ST-A203, FOD-A202` resolves default room allocations and subject-specific rooms for parallel elective groups.
4. **Discrepancy Identification**: 251 discrepancies detected between the 15-Sept and 17-Sept sheets, primarily reflecting elective and CTVA realignments.
