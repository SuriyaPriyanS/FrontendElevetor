// src/constants/constants.js
export const ELEVATOR_MODES = ["NORMAL", "IN_SERVICE", "INSPECTION", "FIRE_SERVICE", "EMERGENCY_POWER", "INDEPENDENT", "MAINTENANCE", "OUT_OF_SERVICE"];
export const DOOR_STATES = ["OPEN", "CLOSING", "CLOSED", "OPENING", "OBSTRUCTED"];
export const TRAVEL_DIRECTIONS = ["UP", "DOWN", "IDLE"];
export const VFD_STATES = ["READY", "RUN", "FAULT", "TRIP"];
export const POWER_MODES = ["NORMAL", "LIMITED", "ECO"];
export const LOAD_WEIGHING_STATUS = ["OK", "NEAR_OVERLOAD", "OVERLOAD"];

export const INITIAL_ELEVATOR_STATE = (id) => ({
  elevatorId: id,
  buildingId: "building-001",
  currentFloor: 0,
  targetFloor: 0,
  direction: TRAVEL_DIRECTIONS[2],
  doorState: DOOR_STATES[2],
  speed_mps: 0.0,
  acceleration_mps2: 0.0,
  car_load_kg: 0.0,
  car_occupancy_count: 0,
  car_overload: false,
  motor_temp_C: 25.0,
  vfd_state: VFD_STATES[0],
  power_mode: POWER_MODES[0],
  operationalStatus: "IDLE_NO_REQUEST",
  isBlocked: false,
  fault_active_codes: [],
  fault_history: [],
  predictive_health_score_pct: 100.0,
  maintenance_mode: ELEVATOR_MODES[0],
  usage_cycle_count: 0,
  usage_rope_runtime_hours: 0.0,
  wear_traction_rope_pct: 0.0,
  wear_brake_lining_pct: 0.0,
  hall_calls: [],
  car_calls: [],
  setpoints_speed_mps: 1.0,
  setpoints_accel_mps2: 0.5,
  doors_hold_open_ms: 3000,
  doors_speed_pct: 100,
  doors_reopen_sensitivity_pct: 80,
  ui_display_message: "Welcome",
  ui_gong: false,
  ui_voice_announce_text: "",
  ui_lighting_level_pct: 100,
  ui_fan_speed_pct: 50,
  safety_e_stop: false,
  safety_seismic_mode: false,
  fire_service_phase: "OFF",
  load_weighing_status: LOAD_WEIGHING_STATUS[0],
  position_m_above_pit: 0.0,
  lastUpdateTime: Date.now(),
});

export const NUM_FLOORS = 5;