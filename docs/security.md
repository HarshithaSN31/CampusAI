# CampusAI Security & Governance Architecture

## 1. Authentication & Role-Based Access Control (RBAC)
CampusAI enforces granular administrative authorization across 5 personas:
- **Student**: Read-only access to own timetable, classroom availability directory, and CampusAI assistant.
- **Faculty**: Read access to departmental timetables, personal teaching load, and classroom reporting.
- **Department Administrator**: Authorized to review and resolve schedule conflicts, approve elective adjustments, and sign off on timetable publications.
- **Facilities Staff**: Management and assignment of maintenance tickets, inspection notes, and HVAC schedule setbacks.
- **Super Administrator**: Access to raw workbook ingestion, audit trails, and version rollback controls.

## 2. Data Protection & File Ingestion Security
- **MIME & Extension Enforcement**: Only `.xlsx` and `.xls` files are accepted. Corrupted or executable attachments are rejected before parsing.
- **Path Traversal Protection**: Uploaded files are written with cryptographically sanitized filenames into isolated directories or Cloud Storage buckets.
- **Audit Logging**: Every conflict resolution, ticket status change, or schedule publication generates an immutable timestamped event record containing actor identity and justification.
- **No Secret Leakage**: No API keys, service account credentials, or database secrets are included in client bundles. All generative calls route securely through the backend.
