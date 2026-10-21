import {
  StockBatch,
  StockInwardConsignment,
  FPSDispatchRequisition,
  DeliveryChallan,
  StockMovement,
  FIFOExceptionRecord,
  QualityStatus,
  Commodity,
  UserProfile,
} from '../types';

export const COMMODITIES: Commodity[] = [
  {
    id: 'wheat',
    name: 'Wheat (Grade A - Sharbati)',
    hindi_name: 'गेहूं (ग्रेड ए - शरबती)',
    specification: 'Standard Burlap Jute Bags (50kg) • MSP ₹2,275/Qtl',
    package_type: '50kg Gunny Burlap Bag',
    package_weight_kg: 50,
    critical_age_days: 60,
    max_safe_moisture_pct: 12.0,
  },
  {
    id: 'rice',
    name: 'Rice (Fortified Sona Masoori)',
    hindi_name: 'चावल (फोर्टिफाइड सोना मसूरी)',
    specification: 'HDPE Woven Sacks • FRK Blended 1:100 Ratio',
    package_type: '50kg HDPE Woven Bag',
    package_weight_kg: 50,
    critical_age_days: 90,
    max_safe_moisture_pct: 13.0,
  },
  {
    id: 'sugar',
    name: 'Sugar (Refined S-30)',
    hindi_name: 'चीनी (रिफाइंड एस-30)',
    specification: '50kg Polylined Bags • Moisture Guard Sealed',
    package_type: '50kg Polylined Bag',
    package_weight_kg: 50,
    critical_age_days: 120,
    max_safe_moisture_pct: 5.0,
  },
  {
    id: 'chana',
    name: 'Chana Whole (Desi Chickpeas)',
    hindi_name: 'चना साबुत (देसी चना)',
    specification: 'Standard Burlap Jute Bags • Fumigated Safe',
    package_type: '50kg Jute Bag',
    package_weight_kg: 50,
    critical_age_days: 75,
    max_safe_moisture_pct: 11.0,
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'USR-DL-4491',
  name: 'R. Sharma',
  email: 'r.sharma@anajbahi.gov.in',
  badge_no: 'DL-FCS-4491',
  role: 'GODOWN_MANAGER',
  godown_id: 'WH-DEL-04',
  godown_name: 'Central Grain Store — Demo',
  district_name: 'North West Division',
  state_code: 'DL',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
};

const SEED_BATCHES: StockBatch[] = [
  {
    id: 'W-101',
    batch_number: 'BATCH-W-101-2026Q3',
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    crop_season: 'RMS 2026-27 (Active Intake)',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 01',
    bay: 'Bay 1',
    stack_id: 'Stack A-4 (Layer 1-14)',
    source_agency: 'Northern Grain Suppliers',
    intake_challan: 'CH-2026-9012',
    intake_date: '2026-10-01',
    intake_timestamp: '2026-10-01T08:30:00Z',
    initial_quantity_qtl: 2400.0,
    on_hand_qtl: 1000.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 11.2,
      permissible_max_moisture: 12.0,
      grain_density_kghl: 78.0,
      foreign_matter_pct: 0.42,
      weevilled_grain_pct: 0.0,
      test_date: '2026-10-01',
      inspector_name: 'P. Rawat (Tally Insp.)',
      lab_slip_no: 'LAB-2026-4401',
    },
    checksum: 'SHA-256 Valid #LGR-2026-9912-7A9F-B43E',
    moisture_trend: [11.4, 11.3, 11.2, 11.2, 11.2],
  },
  {
    id: 'W-102',
    batch_number: 'BATCH-W-102-2026Q3',
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    crop_season: 'RMS 2026-27 (Active Intake)',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 01',
    bay: 'Bay 1',
    stack_id: 'Stack B-2 (Dry Floor)',
    source_agency: 'Punjab Agro State Agency',
    intake_challan: 'CH-2026-9044',
    intake_date: '2026-10-05',
    intake_timestamp: '2026-10-05T09:15:00Z',
    initial_quantity_qtl: 1200.0,
    on_hand_qtl: 800.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 11.5,
      permissible_max_moisture: 12.0,
      grain_density_kghl: 77.8,
      foreign_matter_pct: 0.48,
      weevilled_grain_pct: 0.0,
      test_date: '2026-10-05',
      inspector_name: 'Inspector Verma',
      lab_slip_no: 'LAB-2026-4422',
    },
    checksum: 'SHA-256 Valid #LGR-2026-9044-8B2E',
    moisture_trend: [11.6, 11.5, 11.5, 11.5],
  },
  {
    id: 'W-103',
    batch_number: 'BATCH-W-103-2026Q3',
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Standard Gr-B)',
    crop_season: 'RMS 2026-27 (Active Intake)',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 02',
    bay: 'Bay 2',
    stack_id: 'Stack C-1 (Quarantine Stack)',
    source_agency: 'Central Pool Transfer',
    intake_challan: 'FCI-DL-8819',
    intake_date: '2026-10-08',
    intake_timestamp: '2026-10-08T11:00:00Z',
    initial_quantity_qtl: 600.0,
    on_hand_qtl: 600.0,
    reserved_qtl: 0.0,
    quality_status: 'QUALITY_HOLD',
    quality_hold_reason: 'Moisture content recorded at 13.8% (Permissible Max: 12.0%). Sealed by Inspector Verma.',
    quality_metrics: {
      moisture_pct: 13.8,
      permissible_max_moisture: 12.0,
      grain_density_kghl: 75.2,
      foreign_matter_pct: 0.85,
      weevilled_grain_pct: 0.02,
      test_date: '2026-10-08',
      inspector_name: 'Inspector Verma',
      lab_slip_no: 'LAB-2026-4467',
    },
    checksum: 'SHA-256 Valid #LGR-2026-8819-HOLD',
    moisture_trend: [14.0, 13.9, 13.8],
  },
  {
    id: 'W-094',
    batch_number: 'BATCH-W-094-2026Q2',
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Sharbati Gr-A)',
    crop_season: 'RMS 2026-27 (Active Intake)',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 01',
    bay: 'Bay 1',
    stack_id: 'Stack A-1 (Shed 1 Corner)',
    source_agency: 'Haryana Warehousing Corp',
    intake_challan: 'HWC-ST-1102',
    intake_date: '2026-07-30',
    intake_timestamp: '2026-07-30T07:45:00Z',
    initial_quantity_qtl: 2000.0,
    on_hand_qtl: 1500.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 11.8,
      permissible_max_moisture: 12.0,
      grain_density_kghl: 77.0,
      foreign_matter_pct: 0.5,
      weevilled_grain_pct: 0.0,
      test_date: '2026-07-30',
      inspector_name: 'K. S. Tanwar',
      lab_slip_no: 'LAB-2026-3891',
    },
    checksum: 'SHA-256 Valid #LGR-2026-1102-CRIT',
    moisture_trend: [12.0, 11.9, 11.8],
  },
  {
    id: 'R-079',
    batch_number: 'BATCH-R-079-2026Q3',
    commodity_id: 'rice',
    commodity_name: 'Rice (Fortified Sona Masoori)',
    crop_season: 'Kharif Intake 2026-27',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 03',
    bay: 'Bay 3',
    stack_id: 'Stack D-5 (Ventilated Plinth)',
    source_agency: 'Andhra Rice Millers Corp',
    intake_challan: 'ARM-FR-5501',
    intake_date: '2026-09-18',
    intake_timestamp: '2026-09-18T10:00:00Z',
    initial_quantity_qtl: 2400.0,
    on_hand_qtl: 1200.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 12.4,
      permissible_max_moisture: 13.0,
      grain_density_kghl: 81.0,
      foreign_matter_pct: 0.2,
      weevilled_grain_pct: 0.0,
      test_date: '2026-09-18',
      inspector_name: 'M. P. Rao',
      lab_slip_no: 'LAB-2026-4190',
    },
    checksum: 'SHA-256 Valid #LGR-2026-5501-RICE',
    moisture_trend: [12.6, 12.5, 12.4],
  },
  {
    id: 'R-088',
    batch_number: 'BATCH-R-088-2026Q4',
    commodity_id: 'rice',
    commodity_name: 'Rice (Parboiled Gr-A)',
    crop_season: 'Kharif Intake 2026-27',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 03',
    bay: 'Bay 3',
    stack_id: 'Stack E-2 (Shed 3 Ventilated)',
    source_agency: 'FCI Inter-Depot Move',
    intake_challan: 'FCI-RA-9912',
    intake_date: '2026-10-12',
    intake_timestamp: '2026-10-12T09:30:00Z',
    initial_quantity_qtl: 1600.0,
    on_hand_qtl: 1200.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 12.1,
      permissible_max_moisture: 13.0,
      grain_density_kghl: 82.5,
      foreign_matter_pct: 0.15,
      weevilled_grain_pct: 0.0,
      test_date: '2026-10-12',
      inspector_name: 'P. Rawat',
      lab_slip_no: 'LAB-2026-4512',
    },
    checksum: 'SHA-256 Valid #LGR-2026-9912-PARB',
    moisture_trend: [12.2, 12.1],
  },
  {
    id: 'S-042',
    batch_number: 'BATCH-S-042-2026Q3',
    commodity_id: 'sugar',
    commodity_name: 'Sugar (Refined S-30)',
    crop_season: 'Sugar Year 2025-26',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 04',
    bay: 'Bay 4',
    stack_id: 'Stack G-1 (Moisture Proof Plinth)',
    source_agency: 'Maharashtra Sugar Fed',
    intake_challan: 'MSF-KOP-401',
    intake_date: '2026-08-28',
    intake_timestamp: '2026-08-28T14:20:00Z',
    initial_quantity_qtl: 1000.0,
    on_hand_qtl: 880.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 3.8,
      permissible_max_moisture: 5.0,
      grain_density_kghl: 88.0,
      foreign_matter_pct: 0.02,
      weevilled_grain_pct: 0.0,
      test_date: '2026-08-28',
      inspector_name: 'K. S. Tanwar',
      lab_slip_no: 'LAB-2026-3988',
    },
    checksum: 'SHA-256 Valid #LGR-2026-401-SUG',
    moisture_trend: [3.9, 3.8, 3.8],
  },
  {
    id: 'C-012',
    batch_number: 'BATCH-C-012-2026Q3',
    commodity_id: 'chana',
    commodity_name: 'Chana Whole (Gram Desi)',
    crop_season: 'Rabi Pulses 2026',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    shed: 'Shed 02',
    bay: 'Bay 2',
    stack_id: 'Stack F-3 (Shed 2 Dry Fumigated)',
    source_agency: 'Nafed Cooperative Branch',
    intake_challan: 'NFD-IND-7781',
    intake_date: '2026-08-12',
    intake_timestamp: '2026-08-12T11:10:00Z',
    initial_quantity_qtl: 850.0,
    on_hand_qtl: 550.0,
    reserved_qtl: 0.0,
    quality_status: 'ELIGIBLE',
    quality_metrics: {
      moisture_pct: 10.4,
      permissible_max_moisture: 11.0,
      grain_density_kghl: 76.5,
      foreign_matter_pct: 0.35,
      weevilled_grain_pct: 0.0,
      test_date: '2026-08-12',
      inspector_name: 'Inspector Verma',
      lab_slip_no: 'LAB-2026-3841',
    },
    checksum: 'SHA-256 Valid #LGR-2026-7781-CHANA',
    moisture_trend: [10.5, 10.4, 10.4],
  },
];

const SEED_MOVEMENTS: StockMovement[] = [
  {
    id: 'MOV-2026-8821',
    timestamp: '2026-10-21T10:45:00Z',
    time_label: '10:45 AM',
    event_type: 'DISPATCH',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    batch_id: 'W-101',
    godown: 'Central Grain Store — Demo',
    debit_qtl: 150.0,
    credit_qtl: 0.0,
    resulting_balance_qtl: 1000.0,
    reference_id: '#CH-8821',
    actor_name: 'R. Sharma (Godown Manager)',
    notes: 'Shakti Nagar FPS (Store #092). Dispatched 150 Qtl Wheat from priority Batch W-101 (FIFO compliant).',
  },
  {
    id: 'MOV-2026-4410',
    timestamp: '2026-10-21T09:30:00Z',
    time_label: '09:30 AM',
    event_type: 'INWARD',
    commodity_name: 'Chana Whole (Gram Desi)',
    batch_id: 'C-012',
    godown: 'Central Grain Store — Demo',
    debit_qtl: 0.0,
    credit_qtl: 350.0,
    resulting_balance_qtl: 550.0,
    reference_id: '#INW-4410',
    actor_name: 'P. Rawat (Tally Clerk)',
    notes: 'Inward Weighment Confirmed #INW-4410. Received from Nafed Demo Co-op, Assigned to Shed 03, Bay Stack 03-D.',
  },
  {
    id: 'MOV-2026-0870',
    timestamp: '2026-10-21T08:15:00Z',
    time_label: '08:15 AM',
    event_type: 'QC_RELEASE',
    commodity_name: 'Rice (Fortified Sona Masoori)',
    batch_id: 'R-079',
    godown: 'Central Grain Store — Demo',
    debit_qtl: 0.0,
    credit_qtl: 0.0,
    resulting_balance_qtl: 1200.0,
    reference_id: '#QC-PASS-R079',
    actor_name: 'Inspector Verma (QC Lab)',
    notes: 'Quality Inspection Cleared: Batch R-079 (Moisture 11.2%, Broken Grains < 4%). Transferred to Eligible Stock.',
  },
  {
    id: 'MOV-2026-0001',
    timestamp: '2026-10-20T17:00:00Z',
    time_label: 'Yesterday',
    event_type: 'ADJUSTMENT',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    batch_id: 'W-094',
    godown: 'Central Grain Store — Demo',
    debit_qtl: 0.0,
    credit_qtl: 0.0,
    resulting_balance_qtl: 1500.0,
    reference_id: '#AUDIT-2026-Q3',
    actor_name: 'A. K. Mathur (District Supply Officer)',
    notes: 'Stock Reconciliation Audit Finalized. District Supply Officer signed monthly balance sheet. Discrepancy: 0.00%.',
  },
];

const SEED_EXCEPTIONS: FIFOExceptionRecord[] = [
  {
    id: 'EXC-2026-001',
    requisition_id: 'FPS-2048-CHAL',
    requested_by: 'Operator M. Singh',
    requested_at: '2026-10-21T09:15:00Z',
    commodity: 'Wheat (Grade A - Sharbati)',
    quantity_qtl: 1500.0,
    bypassed_batch_id: 'W-101',
    selected_batch_id: 'W-102',
    reason_code: 'STACK_ACCESS_OBSTRUCTION',
    justification_text:
      'Temporary forklift access obstruction in Shed 04 runway. Stacking gear maintenance scheduled until 14:00 PM. Requested permission to pull next eligible batch W-102.',
    status: 'PENDING_SIGN_OFF',
    audit_note: 'Requires Godown Manager & District Supply Officer sign-off under Rule 14-B.',
  },
];

const SEED_INWARDS: StockInwardConsignment[] = [
  {
    id: 'INW-2026-DEL-0482',
    gate_entry_no: 'GATE-INW-0482',
    vehicle_truck_no: 'HR-38-AF-9921',
    transporter_name: 'Haryana Logistics Freight Lines',
    driver_name: 'Baldev Singh',
    driver_mobile: '+91 98110-XXXXX',
    weighbridge_slip_ref: 'WB-88192',
    weighbridge_gross_kg: 32450,
    weighbridge_tare_kg: 8450,
    net_received_kg: 24000,
    net_received_qtl: 240.0,
    supplier_name: 'Northern Grain Suppliers',
    supplier_code: 'SUP-092',
    scheme_pool: 'Central Pool NFSA (National Food Security)',
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    crop_year: '2026-27 (Kharif Intake)',
    packing_spec: 'Standard 50kg Burlap Gunny Bags',
    bag_count: 480,
    supplier_billed_weight_mt: 24.0,
    transit_variance_kg: 0.0,
    transit_variance_pct: 0.0,
    target_shed: 'Shed 04 (Wheat & Buffer)',
    stack_allotment_id: 'Stack 04-B (Bay 2)',
    sampling_protocol_verified: true,
    initial_moisture_pct: 11.4,
    sample_custody_bag_no: '#SMP-9912',
    created_at: '2026-10-21T09:41:00Z',
    status: 'DRAFT',
  },
];

const SEED_DISPATCHES: FPSDispatchRequisition[] = [
  {
    id: 'FPS-2048-CHAL',
    fifo_run_id: '#CALC-88910',
    fps_id: 'FPS-2048',
    fps_name: 'Shakti Nagar Ration Shop',
    licensee_name: 'M. Gupta',
    ward: 'Ward 14 (Sub-Division North West)',
    fps_code: 'FPS-DL-NW-2048',
    biometric_token_ok: true,
    commodity_id: 'wheat',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    required_quantity_qtl: 1500.0,
    allocated_quantity_qtl: 1500.0,
    fulfillment_pct: 100.0,
    shortage_deficit_qtl: 0.0,
    target_dispatch_date: '22 Oct 2026 (Morning Shift)',
    allocated_carrier: 'DL-1M-4490 (16-Wheeler)',
    indent_voucher: '#IND-2026-9841',
    weighbridge_cert: '#WB-4401',
    status: 'DRAFT',
    is_exception: false,
    created_at: '2026-10-21T10:15:00Z',
    allocations: [
      {
        rank: 1,
        batch_id: 'W-101',
        receipt_date: '2026-10-01',
        age_days: 20,
        shed: 'Shed 01',
        bay: 'Bay 1',
        stack_id: 'Stack A-4 (Layer 1-14)',
        total_balance_qtl: 1000.0,
        quality_status: 'ELIGIBLE',
        fifo_draw_qtl: 1000.0,
        post_dispatch_bal_qtl: 0.0,
        percentage_of_batch: 100.0,
        reason: 'Primary FIFO allocation candidate',
        is_bypassed: false,
      },
      {
        rank: 2,
        batch_id: 'W-102',
        receipt_date: '2026-10-05',
        age_days: 16,
        shed: 'Shed 01',
        bay: 'Bay 1',
        stack_id: 'Stack B-2 (Dry Floor)',
        total_balance_qtl: 800.0,
        quality_status: 'ELIGIBLE',
        fifo_draw_qtl: 500.0,
        post_dispatch_bal_qtl: 300.0,
        percentage_of_batch: 62.5,
        reason: 'Satisfies remaining 500 Qtl demand (Retains 300 Qtl for subsequent indents)',
        is_bypassed: false,
      },
      {
        rank: 3,
        batch_id: 'W-103',
        receipt_date: '2026-10-08',
        age_days: 13,
        shed: 'Shed 02',
        bay: 'Bay 2',
        stack_id: 'Stack C-1 (Quarantine Stack)',
        total_balance_qtl: 600.0,
        quality_status: 'QUALITY_HOLD',
        fifo_draw_qtl: 0.0,
        post_dispatch_bal_qtl: 600.0,
        percentage_of_batch: 0.0,
        reason: 'Bypassed: Moisture re-test pending (Lab Slip #L-409)',
        is_bypassed: true,
        bypass_reason: 'Quality Hold (LOCKED)',
      },
    ],
  },
];

const SEED_CHALLANS: DeliveryChallan[] = [
  {
    challan_no: 'CH-2026-8821',
    dispatch_id: 'DISP-PREV-092',
    date: '2026-10-21',
    godown_name: 'Central Grain Store — Demo',
    godown_code: 'WH-DEL-04',
    fps_name: 'Shakti Nagar Ration Shop',
    fps_code: 'FPS-DL-NW-2048',
    licensee_name: 'M. Gupta',
    carrier_vehicle_no: 'DL-1M-4490 (16-Wheeler)',
    driver_name: 'Harpreet Singh',
    commodity_name: 'Wheat (Grade A - Sharbati)',
    total_quantity_qtl: 150.0,
    total_bags: 300,
    batches_breakdown: [
      {
        batch_id: 'W-101',
        shed: 'Shed 01',
        bay: 'Bay 1',
        draw_qtl: 150.0,
        bags: 300,
      },
    ],
    sha256_hash: '8f4c82b79a29e414c11867e0e7a18bb7a2d67784ec8101490212f45ea011b02b',
    verification_qr_text: 'https://anajbahi.gov.in/verify/CH-2026-8821?hash=8f4c82b7',
    status: 'DISPATCHED',
    issued_by: 'R. Sharma (DL-FCS-4491)',
    dispatched_at: '2026-10-21T10:45:00Z',
  },
];

const memoryStorageMap = new Map<string, string>();
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return memoryStorageMap.get(key) ?? null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, val);
      }
    } catch {}
    memoryStorageMap.set(key, val);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {}
    memoryStorageMap.delete(key);
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.clear();
      }
    } catch {}
    memoryStorageMap.clear();
  },
};

const localStorage = safeStorage;

class StorageService {
  private batchesKey = 'anajbahi_batches_v1';
  private movementsKey = 'anajbahi_movements_v1';
  private exceptionsKey = 'anajbahi_exceptions_v1';
  private inwardsKey = 'anajbahi_inwards_v1';
  private dispatchesKey = 'anajbahi_dispatches_v1';
  private challansKey = 'anajbahi_challans_v1';
  private currentUserKey = 'anajbahi_user_v1';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.batchesKey)) {
      this.resetToSeedData();
    }
  }

  public resetToSeedData() {
    localStorage.setItem(this.batchesKey, JSON.stringify(SEED_BATCHES));
    localStorage.setItem(this.movementsKey, JSON.stringify(SEED_MOVEMENTS));
    localStorage.setItem(this.exceptionsKey, JSON.stringify(SEED_EXCEPTIONS));
    localStorage.setItem(this.inwardsKey, JSON.stringify(SEED_INWARDS));
    localStorage.setItem(this.dispatchesKey, JSON.stringify(SEED_DISPATCHES));
    localStorage.setItem(this.challansKey, JSON.stringify(SEED_CHALLANS));
    localStorage.setItem(this.currentUserKey, JSON.stringify(INITIAL_USER));
  }

  // --- Users & Roles ---
  public getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(this.currentUserKey);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  }

  public setCurrentUser(user: UserProfile): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  // --- Batches ---
  public getBatches(): StockBatch[] {
    try {
      const data = localStorage.getItem(this.batchesKey);
      return data ? JSON.parse(data) : SEED_BATCHES;
    } catch {
      return SEED_BATCHES;
    }
  }

  public getBatchById(id: string): StockBatch | undefined {
    return this.getBatches().find((b) => b.id === id);
  }

  public saveBatches(batches: StockBatch[]): void {
    localStorage.setItem(this.batchesKey, JSON.stringify(batches));
  }

  public updateBatchStatus(
    batchId: string,
    newStatus: QualityStatus,
    reason?: string,
    inspectorName?: string
  ): boolean {
    const batches = this.getBatches();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return false;

    const oldStatus = batch.quality_status;
    batch.quality_status = newStatus;
    if (reason) batch.quality_hold_reason = reason;

    this.saveBatches(batches);

    // Record audit movement
    this.addMovement({
      id: `MOV-QC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event_type: newStatus === 'QUALITY_HOLD' ? 'QC_HOLD' : 'QC_RELEASE',
      commodity_name: batch.commodity_name,
      batch_id: batch.id,
      godown: batch.godown_name,
      debit_qtl: 0,
      credit_qtl: 0,
      resulting_balance_qtl: batch.on_hand_qtl,
      reference_id: `#QC-STAT-${batch.id}`,
      actor_name: inspectorName || 'Inspector Verma (QC Lab)',
      notes: `Batch ${batch.id} transitioned from ${oldStatus} to ${newStatus}. ${reason || ''}`,
    });

    return true;
  }

  // --- Inward Consignments ---
  public getInwards(): StockInwardConsignment[] {
    try {
      const data = localStorage.getItem(this.inwardsKey);
      return data ? JSON.parse(data) : SEED_INWARDS;
    } catch {
      return SEED_INWARDS;
    }
  }

  public saveInward(inward: StockInwardConsignment): void {
    const inwards = this.getInwards();
    const index = inwards.findIndex((i) => i.id === inward.id);
    if (index >= 0) {
      inwards[index] = inward;
    } else {
      inwards.unshift(inward);
    }
    localStorage.setItem(this.inwardsKey, JSON.stringify(inwards));
  }

  public postInward(inwardId: string, postedByUser: UserProfile): boolean {
    return this.postInwardToLedger(inwardId, postedByUser);
  }

  /**
   * Finalizes inward receipt and credits inventory to stock batches + appends to stock movements ledger.
   */
  public postInwardToLedger(inwardId: string, postedByUser: UserProfile): boolean {
    const inwards = this.getInwards();
    const inward = inwards.find((i) => i.id === inwardId);
    if (!inward || inward.status === 'POSTED_TO_LEDGER') return false;

    inward.status = 'POSTED_TO_LEDGER';
    this.saveInward(inward);

    // Create a new batch or increment stack
    const batches = this.getBatches();
    const newBatchId = `W-${Math.floor(104 + Math.random() * 20)}`;
    const newBatch: StockBatch = {
      id: newBatchId,
      batch_number: `BATCH-${newBatchId}-2026Q4`,
      commodity_id: inward.commodity_id,
      commodity_name: inward.commodity_name,
      crop_season: inward.crop_year,
      godown_id: postedByUser.godown_id,
      godown_name: postedByUser.godown_name,
      shed: inward.target_shed,
      bay: 'Bay 2',
      stack_id: inward.stack_allotment_id,
      source_agency: inward.supplier_name,
      intake_challan: inward.weighbridge_slip_ref,
      intake_date: new Date().toISOString().split('T')[0],
      intake_timestamp: new Date().toISOString(),
      initial_quantity_qtl: inward.net_received_qtl,
      on_hand_qtl: inward.net_received_qtl,
      reserved_qtl: 0.0,
      quality_status: 'ELIGIBLE',
      quality_metrics: {
        moisture_pct: inward.initial_moisture_pct,
        permissible_max_moisture: 12.0,
        grain_density_kghl: 78.5,
        foreign_matter_pct: 0.35,
        weevilled_grain_pct: 0.0,
        test_date: new Date().toISOString().split('T')[0],
        inspector_name: postedByUser.name,
        lab_slip_no: `LAB-${inward.weighbridge_slip_ref}`,
      },
      checksum: `SHA-256 Valid #LGR-${inward.id}`,
      moisture_trend: [inward.initial_moisture_pct],
    };

    batches.unshift(newBatch);
    this.saveBatches(batches);

    // Append to movement ledger
    this.addMovement({
      id: `MOV-INW-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event_type: 'INWARD',
      commodity_name: inward.commodity_name,
      batch_id: newBatchId,
      godown: postedByUser.godown_name,
      debit_qtl: 0,
      credit_qtl: inward.net_received_qtl,
      resulting_balance_qtl: inward.net_received_qtl,
      reference_id: `#${inward.id}`,
      actor_name: `${postedByUser.name} (${postedByUser.badge_no})`,
      notes: `Inward Consignment Posted: ${inward.net_received_qtl} Qtl ${inward.commodity_name} from ${inward.supplier_name}. Truck ${inward.vehicle_truck_no}.`,
    });

    return true;
  }

  // --- Dispatches ---
  public getDispatches(): FPSDispatchRequisition[] {
    try {
      const data = localStorage.getItem(this.dispatchesKey);
      return data ? JSON.parse(data) : SEED_DISPATCHES;
    } catch {
      return SEED_DISPATCHES;
    }
  }

  public getDispatchById(id: string): FPSDispatchRequisition | undefined {
    return this.getDispatches().find((d) => d.id === id);
  }

  public saveDispatch(dispatch: FPSDispatchRequisition): void {
    const dispatches = this.getDispatches();
    const index = dispatches.findIndex((d) => d.id === dispatch.id);
    if (index >= 0) {
      dispatches[index] = dispatch;
    } else {
      dispatches.unshift(dispatch);
    }
    localStorage.setItem(this.dispatchesKey, JSON.stringify(dispatches));
  }

  /**
   * Approves a dispatch requisition:
   * Sets status to APPROVED and atomically reserves inventory on the affected batches.
   */
  public approveDispatch(dispatchId: string, approverUser: UserProfile): boolean {
    const dispatches = this.getDispatches();
    const dispatch = dispatches.find((d) => d.id === dispatchId);
    if (!dispatch || dispatch.status === 'APPROVED' || dispatch.status === 'DISPATCHED') {
      return false;
    }

    dispatch.status = 'APPROVED';
    dispatch.approved_by = `${approverUser.name} (${approverUser.badge_no})`;
    dispatch.approved_at = new Date().toISOString();

    // Atomically increment reserved_qtl on allocated batches
    const batches = this.getBatches();
    for (const alloc of dispatch.allocations) {
      if (!alloc.is_bypassed && alloc.fifo_draw_qtl > 0) {
        const batch = batches.find((b) => b.id === alloc.batch_id);
        if (batch) {
          batch.reserved_qtl += alloc.fifo_draw_qtl;
        }
      }
    }

    this.saveBatches(batches);
    this.saveDispatch(dispatch);
    return true;
  }

  /**
   * Rejects a dispatch requisition.
   */
  public rejectDispatch(dispatchId: string, reviewerUser: UserProfile, reason: string): boolean {
    const dispatches = this.getDispatches();
    const dispatch = dispatches.find((d) => d.id === dispatchId);
    if (!dispatch) return false;

    dispatch.status = 'REJECTED';
    this.saveDispatch(dispatch);

    this.addMovement({
      id: `MOV-REJ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event_type: 'ADJUSTMENT',
      commodity_name: dispatch.commodity_name,
      batch_id: 'N/A',
      godown: reviewerUser.godown_name,
      debit_qtl: 0,
      credit_qtl: 0,
      resulting_balance_qtl: 0,
      reference_id: `#${dispatch.id}`,
      actor_name: `${reviewerUser.name} (${reviewerUser.badge_no})`,
      notes: `Dispatch Requisition #${dispatch.id} Rejected. Reason: ${reason}`,
    });

    return true;
  }

  /**
   * Generates a formal Delivery Challan from an approved dispatch requisition.
   */
  public generateChallan(dispatchId: string, issuedByUser: UserProfile): DeliveryChallan | null {
    const dispatch = this.getDispatchById(dispatchId);
    if (!dispatch) return null;

    const challanNo = `CH-2026-${Math.floor(8830 + Math.random() * 100)}`;
    dispatch.challan_no = challanNo;
    dispatch.status = 'CHALLAN_GENERATED';
    this.saveDispatch(dispatch);

    const challan: DeliveryChallan = {
      challan_no: challanNo,
      dispatch_id: dispatch.id,
      date: new Date().toISOString().split('T')[0],
      godown_name: issuedByUser.godown_name,
      godown_code: issuedByUser.godown_id,
      fps_name: dispatch.fps_name,
      fps_code: dispatch.fps_code,
      licensee_name: dispatch.licensee_name,
      carrier_vehicle_no: dispatch.allocated_carrier,
      driver_name: 'Baldev Singh (DL-Logistics)',
      commodity_name: dispatch.commodity_name,
      total_quantity_qtl: dispatch.allocated_quantity_qtl,
      total_bags: Math.round(dispatch.allocated_quantity_qtl * 2), // 50kg bags = 2 per Qtl
      batches_breakdown: dispatch.allocations
        .filter((a) => !a.is_bypassed && a.fifo_draw_qtl > 0)
        .map((a) => ({
          batch_id: a.batch_id,
          shed: a.shed,
          bay: a.bay,
          draw_qtl: a.fifo_draw_qtl,
          bags: Math.round(a.fifo_draw_qtl * 2),
        })),
      sha256_hash: `8f4c82b79a29e414c11867e0e7a18bb7${Math.floor(1000 + Math.random() * 9000)}b02b`,
      verification_qr_text: `https://anajbahi.gov.in/verify/${challanNo}?sec=sha256`,
      status: 'APPROVED',
      issued_by: `${issuedByUser.name} (${issuedByUser.badge_no})`,
    };

    const challans = this.getChallans();
    challans.unshift(challan);
    localStorage.setItem(this.challansKey, JSON.stringify(challans));

    return challan;
  }

  /**
   * Confirms truck gate exit:
   * 1. Physically deducts stock from on_hand_qtl
   * 2. Clears reserved_qtl
   * 3. Appends immutable debit ledger entries to stock movements
   * 4. Updates dispatch and challan statuses to DISPATCHED
   */
  public confirmGateDispatch(challanNo: string, gateOfficerUser: UserProfile): boolean {
    const challans = this.getChallans();
    const challan = challans.find((c) => c.challan_no === challanNo);
    if (!challan || challan.status === 'DISPATCHED') return false;

    const dispatch = this.getDispatchById(challan.dispatch_id);
    if (!dispatch) return false;

    challan.status = 'DISPATCHED';
    challan.dispatched_at = new Date().toISOString();
    localStorage.setItem(this.challansKey, JSON.stringify(challans));

    dispatch.status = 'DISPATCHED';
    dispatch.dispatched_at = new Date().toISOString();
    this.saveDispatch(dispatch);

    // Deduct physical inventory atomically
    const batches = this.getBatches();
    for (const alloc of dispatch.allocations) {
      if (!alloc.is_bypassed && alloc.fifo_draw_qtl > 0) {
        const batch = batches.find((b) => b.id === alloc.batch_id);
        if (batch) {
          batch.on_hand_qtl = Math.max(0, batch.on_hand_qtl - alloc.fifo_draw_qtl);
          batch.reserved_qtl = Math.max(0, batch.reserved_qtl - alloc.fifo_draw_qtl);
          if (batch.on_hand_qtl === 0) {
            batch.quality_status = 'DEPLETED';
          }

          // Ledger row for each physical batch draw
          this.addMovement({
            id: `MOV-DISP-${Date.now()}-${batch.id}`,
            timestamp: new Date().toISOString(),
            time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event_type: 'DISPATCH',
            commodity_name: dispatch.commodity_name,
            batch_id: batch.id,
            godown: gateOfficerUser.godown_name,
            debit_qtl: alloc.fifo_draw_qtl,
            credit_qtl: 0,
            resulting_balance_qtl: batch.on_hand_qtl,
            reference_id: `#${challan.challan_no}`,
            actor_name: `${gateOfficerUser.name} (${gateOfficerUser.badge_no})`,
            notes: `Gate Outward Confirmed: ${alloc.fifo_draw_qtl} Qtl dispatched to ${dispatch.fps_name} via truck ${dispatch.allocated_carrier}. Challan #${challan.challan_no}.`,
          });
        }
      }
    }

    this.saveBatches(batches);
    return true;
  }

  // --- Challans ---
  public getChallans(): DeliveryChallan[] {
    try {
      const data = localStorage.getItem(this.challansKey);
      return data ? JSON.parse(data) : SEED_CHALLANS;
    } catch {
      return SEED_CHALLANS;
    }
  }

  // --- Stock Movement Ledger ---
  public getMovements(): StockMovement[] {
    try {
      const data = localStorage.getItem(this.movementsKey);
      return data ? JSON.parse(data) : SEED_MOVEMENTS;
    } catch {
      return SEED_MOVEMENTS;
    }
  }

  public addMovement(movement: StockMovement): void {
    const movements = this.getMovements();
    movements.unshift(movement);
    localStorage.setItem(this.movementsKey, JSON.stringify(movements));
  }

  // --- FIFO Exceptions ---
  public getExceptions(): FIFOExceptionRecord[] {
    try {
      const data = localStorage.getItem(this.exceptionsKey);
      return data ? JSON.parse(data) : SEED_EXCEPTIONS;
    } catch {
      return SEED_EXCEPTIONS;
    }
  }

  public saveException(exc: FIFOExceptionRecord): void {
    const list = this.getExceptions();
    const idx = list.findIndex((e) => e.id === exc.id);
    if (idx >= 0) {
      list[idx] = exc;
    } else {
      list.unshift(exc);
    }
    localStorage.setItem(this.exceptionsKey, JSON.stringify(list));
  }

  public authorizeException(exceptionId: string, reviewerUser: UserProfile): boolean {
    const list = this.getExceptions();
    const exc = list.find((e) => e.id === exceptionId);
    if (!exc) return false;

    exc.status = 'AUTHORIZED';
    exc.reviewed_by = `${reviewerUser.name} (${reviewerUser.badge_no})`;
    exc.reviewed_at = new Date().toISOString();
    this.saveException(exc);
    return true;
  }

  public rejectException(exceptionId: string, reviewerUser: UserProfile, reason: string): boolean {
    const list = this.getExceptions();
    const exc = list.find((e) => e.id === exceptionId);
    if (!exc) return false;

    exc.status = 'REJECTED';
    exc.reviewed_by = `${reviewerUser.name} (${reviewerUser.badge_no})`;
    exc.reviewed_at = new Date().toISOString();
    exc.audit_note = `Rejected: ${reason}`;
    this.saveException(exc);
    return true;
  }

  // --- Manual Stock Adjustment ---
  public adjustStock(
    batchId: string,
    adjustmentQtl: number, // positive for surplus, negative for deficit
    reason: string,
    actorUser: UserProfile
  ): boolean {
    const batches = this.getBatches();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return false;

    batch.on_hand_qtl = Math.max(0, batch.on_hand_qtl + adjustmentQtl);
    this.saveBatches(batches);

    this.addMovement({
      id: `MOV-ADJ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event_type: 'ADJUSTMENT',
      commodity_name: batch.commodity_name,
      batch_id: batch.id,
      godown: actorUser.godown_name,
      debit_qtl: adjustmentQtl < 0 ? Math.abs(adjustmentQtl) : 0,
      credit_qtl: adjustmentQtl > 0 ? adjustmentQtl : 0,
      resulting_balance_qtl: batch.on_hand_qtl,
      reference_id: `#ADJ-${batch.id}`,
      actor_name: `${actorUser.name} (${actorUser.badge_no})`,
      notes: `Physical Stock Count Adjustment: ${adjustmentQtl > 0 ? '+' : ''}${adjustmentQtl} Qtl. Reason: ${reason}`,
    });

    return true;
  }
}

export const storage = new StorageService();
