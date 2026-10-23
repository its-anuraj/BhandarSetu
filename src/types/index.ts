export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'STATE_ADMIN'
  | 'DISTRICT_SUPPLY_OFFICER'
  | 'GODOWN_MANAGER'
  | 'STOCK_INWARD_OPERATOR'
  | 'QUALITY_INSPECTOR'
  | 'DISPATCH_OPERATOR'
  | 'AUTHORIZED_APPROVER'
  | 'AUDITOR'
  | 'FPS_RECIPIENT';

export interface UserScope {
  organization_id: string;
  state_code: string;
  district_id: string;
  district_name: string;
  godown_id: string;
  godown_name: string;
  assigned_godown_ids: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  badge_no: string;
  phone?: string;
  role: UserRole;
  organization_id?: string;
  godown_id: string;
  godown_name: string;
  district_id?: string;
  district_name: string;
  state_code: string;
  assigned_godown_ids?: string[];
  is_active?: boolean;
  avatar_url?: string;
  created_at?: string;
  last_login_at?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expires_at: number;
}

export type PermissionAction =
  | 'VIEW_DASHBOARD'
  | 'VIEW_INVENTORY'
  | 'ADJUST_STOCK'
  | 'EXPORT_INVENTORY'
  | 'CREATE_INWARD_DRAFT'
  | 'EDIT_INWARD_DRAFT'
  | 'POST_INWARD_LEDGER'
  | 'REJECT_INWARD'
  | 'CONDUCT_QUALITY_INSPECTION'
  | 'MANAGE_QUALITY_HOLD'
  | 'CREATE_DISPATCH_REQUISITION'
  | 'APPROVE_DISPATCH_REQUISITION'
  | 'OVERRIDE_FIFO_EXCEPTION'
  | 'APPROVE_FIFO_EXCEPTION'
  | 'REJECT_FIFO_EXCEPTION'
  | 'GENERATE_CHALLAN'
  | 'CONFIRM_GATE_DISPATCH'
  | 'VIEW_LEDGER'
  | 'EXPORT_LEDGER'
  | 'VIEW_REPORTS'
  | 'EXPORT_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_AUDIT_LOGS'
  | 'MANAGE_USERS'
  | 'SYSTEM_SETTINGS';

export type QualityStatus =
  | 'ELIGIBLE'
  | 'AWAITING_INSPECTION'
  | 'QUALITY_HOLD'
  | 'REJECTED'
  | 'DEPLETED';

export type CommodityId = 'wheat' | 'rice' | 'sugar' | 'chana';

export interface Commodity {
  id: CommodityId;
  name: string;
  hindi_name: string;
  specification: string;
  msp_rate?: string;
  package_type: string;
  package_weight_kg: number;
  critical_age_days: number;
  max_safe_moisture_pct: number;
}

export interface QualityMetrics {
  moisture_pct: number;
  permissible_max_moisture: number;
  grain_density_kghl: number;
  foreign_matter_pct: number;
  weevilled_grain_pct: number;
  test_date: string;
  inspector_name: string;
  lab_slip_no: string;
}

export interface StockBatch {
  id: string; // e.g., 'W-101'
  batch_number: string;
  commodity_id: CommodityId;
  commodity_name: string;
  crop_season: string;
  godown_id: string;
  godown_name: string;
  shed: string;
  bay: string;
  stack_id: string;
  source_agency: string;
  intake_challan: string;
  intake_date: string;
  intake_timestamp: string; // ISO string for deterministic tie-breaker
  initial_quantity_qtl: number;
  on_hand_qtl: number;
  reserved_qtl: number;
  quality_status: QualityStatus;
  quality_hold_reason?: string;
  quality_metrics: QualityMetrics;
  checksum: string;
  moisture_trend?: number[];
}

export type InwardStatus =
  | 'DRAFT'
  | 'DRAFT_AT_GATE'
  | 'AWAITING_QC'
  | 'INSPECTION_PENDING'
  | 'POSTED_TO_LEDGER'
  | 'REJECTED';

export interface StockInwardConsignment {
  id: string; // e.g. 'INW-2026-DEL-0482'
  gate_entry_no: string;
  gate_pass_no?: string;
  vehicle_truck_no: string;
  transporter_name: string;
  driver_name: string;
  driver_mobile: string;
  weighbridge_slip_ref: string;
  weighbridge_gross_kg: number;
  weighbridge_tare_kg: number;
  net_received_kg: number;
  net_received_qtl: number;
  supplier_name: string;
  supplier_code: string;
  scheme_pool: string;
  commodity_id: CommodityId;
  commodity_name: string;
  crop_year: string;
  packing_spec: string;
  bag_count: number;
  supplier_billed_weight_mt: number;
  transit_variance_kg: number;
  transit_variance_pct: number;
  target_shed: string;
  stack_allotment_id: string;
  sampling_protocol_verified: boolean;
  initial_moisture_pct: number;
  sample_custody_bag_no: string;
  created_at: string;
  status: InwardStatus;
  is_offline_draft?: boolean;
}

export interface BatchAllocationProposal {
  rank: number;
  batch_id: string;
  receipt_date: string;
  age_days: number;
  shed: string;
  bay: string;
  stack_id: string;
  total_balance_qtl: number;
  quality_status: QualityStatus;
  fifo_draw_qtl: number;
  post_dispatch_bal_qtl: number;
  percentage_of_batch: number;
  reason: string;
  is_bypassed?: boolean;
  bypass_reason?: string;
}

export type DispatchStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CHALLAN_GENERATED'
  | 'DISPATCHED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'REVERSED';

export interface FPSDispatchRequisition {
  id: string; // e.g. 'FPS-2048-CHAL'
  requisition_no?: string;
  fifo_run_id: string;
  fps_id: string;
  fps_name: string;
  licensee_name: string;
  ward: string;
  fps_code: string;
  biometric_token_ok: boolean;
  commodity_id: CommodityId;
  commodity_name: string;
  required_quantity_qtl: number;
  allocated_quantity_qtl: number;
  fulfillment_pct: number;
  shortage_deficit_qtl: number;
  target_dispatch_date: string;
  shift?: string;
  allocated_carrier: string;
  indent_voucher: string;
  weighbridge_cert: string;
  allocations: BatchAllocationProposal[];
  is_exception: boolean;
  exception_reason?: string;
  exception_operator?: string;
  status: DispatchStatus;
  approved_by?: string;
  approved_at?: string;
  challan_no?: string;
  dispatched_at?: string;
  created_at: string;
}

export interface DeliveryChallan {
  challan_no: string;
  dispatch_id: string;
  date: string;
  godown_name: string;
  godown_code: string;
  fps_name: string;
  fps_code: string;
  licensee_name: string;
  carrier_vehicle_no: string;
  driver_name: string;
  commodity_name: string;
  total_quantity_qtl: number;
  total_bags: number;
  batches_breakdown: Array<{
    batch_id: string;
    shed: string;
    bay: string;
    draw_qtl: number;
    bags: number;
  }>;
  sha256_hash: string;
  verification_qr_text: string;
  status: 'DRAFT' | 'APPROVED' | 'DISPATCHED' | 'ACKNOWLEDGED';
  issued_by: string;
  dispatched_at?: string;
}

export type MovementEventType =
  | 'INWARD'
  | 'DISPATCH'
  | 'QC_HOLD'
  | 'QC_RELEASE'
  | 'ADJUSTMENT'
  | 'REVERSAL';

export interface StockMovement {
  id: string;
  timestamp: string;
  time_label: string;
  event_type: MovementEventType;
  commodity_name: string;
  batch_id: string;
  godown: string;
  debit_qtl: number;
  credit_qtl: number;
  resulting_balance_qtl: number;
  reference_id: string;
  actor_name: string;
  notes: string;
}

export interface FIFOExceptionRecord {
  id: string;
  requisition_id: string;
  requested_by: string;
  requested_at: string;
  commodity: string;
  quantity_qtl: number;
  bypassed_batch_id: string;
  selected_batch_id: string;
  reason_code: 'STACK_ACCESS_OBSTRUCTION' | 'INFESTATION_ISOLATION' | 'EMERGENCY_RELIEF_DIRECTIVE' | 'PACKAGING_DEFECT';
  justification_text: string;
  status: 'PENDING_SIGN_OFF' | 'AUTHORIZED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  audit_note?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ip_address: string;
}
