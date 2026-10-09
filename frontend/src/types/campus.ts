export interface TimetableEntry {
  academic_year: string;
  semester: string;
  department: string;
  section: string;
  class_advisor: string;
  weekday: "MON" | "TUE" | "WED" | "THUR" | "FRI";
  period_number: number;
  start_time: string;
  end_time: string;
  raw_cell: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  faculty: string;
  room: string;
  lab_group: string;
  session_type: "REGULAR" | "LAB" | "ELECTIVE" | "BREAK";
  source_sheet: string;
  source_row: number;
  source_version: string;
  validation_status: string;
}

export interface SectionMetadata {
  section: string;
  academic_year: string;
  semester: string;
  department: string;
  class_advisor: string;
  source_version: string;
  source_sheet: string;
  start_row: number;
  end_row: number;
}

export interface CourseAllocation {
  sl_no: string;
  course_code: string;
  course_name: string;
  short_code: string;
  faculty: string;
  source_row: number;
}

export interface TimetableSectionGrid {
  metadata: SectionMetadata;
  courses: Record<string, CourseAllocation>;
  entries: TimetableEntry[];
}

export interface RoomStat {
  room: string;
  building: string;
  floor: string;
  capacity: number;
  room_type: string;
  scheduled_hours_per_week: number;
  available_hours_per_week: number;
  utilization_rate: number;
  idle_hours_per_week: number;
  has_iot_sensors: boolean;
  sensor_status: string;
}

export interface EnergyInsights {
  calculation_definition: string;
  verified_sensor_connected: boolean;
  is_demonstration_model: boolean;
  data_label: string;
  total_rooms_monitored: number;
  total_scheduled_room_hours: number;
  total_idle_room_hours: number;
  potential_kwh_saved_weekly: number;
  potential_cost_saved_weekly_usd: number;
  potential_co2_kg_saved_weekly: number;
  lighting_hvac_schedule_audits_recommended: number;
  assumptions: {
    equipment_load_kw: number;
    tariff_per_kwh_usd: number;
    setback_efficiency_factor: number;
    co2_factor_kg_per_kwh: number;
  };
}

export interface ConflictItem {
  id: string;
  category: "VERSION_DISCREPANCY" | "ROOM_DOUBLE_BOOKING" | "FACULTY_OVERLAP" | "MISSING_ROOM_DATA";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  section: string;
  room?: string;
  faculty?: string;
  weekday: string;
  period_number: number;
  start_time: string;
  end_time: string;
  description: string;
  source_worksheet_1?: string;
  source_row_1?: number;
  version_1_data?: string;
  source_worksheet_2?: string;
  source_row_2?: number;
  version_2_data?: string;
  proposed_resolution: string;
  status: "OPEN" | "RESOLVED";
  reviewed_by?: string | null;
  resolution_notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  building: string;
  room: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";
  description: string;
  reported_by: string;
  assigned_to: string;
  created_at: string;
  ai_suggested_category: string;
  resolution_notes: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "campus_ai";
  text: string;
  timestamp: string;
  sources?: any[];
  uncertainty?: string;
  warnings?: string[];
  suggested_followups?: string[];
}
