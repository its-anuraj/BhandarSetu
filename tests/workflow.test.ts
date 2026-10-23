import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../src/services/storage';
import { StockInwardConsignment, UserProfile, FPSDispatchRequisition } from '../src/types';

describe('BhandarSetu End-to-End Inventory & Workflow Integrity Tests', () => {
  const testUser: UserProfile = {
    id: 'USR-TEST-01',
    name: 'Inspector Test',
    email: 'test@bhandarsetu.internal',
    badge_no: 'DL-TEST-001',
    role: 'GODOWN_MANAGER',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_name: 'North West Division',
    state_code: 'DL',
  };

  beforeEach(() => {
    // Reset to clean seed data before each test
    storage.resetToSeedData();
  });

  it('1. Draft inward consignment does NOT increase posted physical stock', () => {
    const batchesBefore = storage.getBatches();
    const initialWheatTotal = batchesBefore
      .filter((b) => b.commodity_id === 'wheat')
      .reduce((sum, b) => sum + b.on_hand_qtl, 0);

    const draftConsignment: StockInwardConsignment = {
      id: 'INW-TEST-DRAFT-01',
      gate_entry_no: 'GATE-TEST-01',
      vehicle_truck_no: 'HR-38-AF-9999',
      transporter_name: 'Haryana Logistics',
      driver_name: 'Test Driver',
      driver_mobile: '9811099999',
      weighbridge_slip_ref: 'WB-TEST-99',
      weighbridge_gross_kg: 32450,
      weighbridge_tare_kg: 8450,
      net_received_kg: 24000,
      net_received_qtl: 240.0,
      supplier_name: 'Northern Grain Suppliers',
      supplier_code: 'SUP-092',
      scheme_pool: 'Central Pool NFSA',
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_year: '2026-27 (Kharif Intake)',
      packing_spec: '50kg Burlap Gunny',
      bag_count: 480,
      supplier_billed_weight_mt: 24.0,
      transit_variance_kg: 0,
      transit_variance_pct: 0.0,
      target_shed: 'Shed 04',
      stack_allotment_id: 'Stack 04-B',
      sampling_protocol_verified: true,
      initial_moisture_pct: 11.4,
      sample_custody_bag_no: '#SMP-TEST-99',
      created_at: new Date().toISOString(),
      status: 'DRAFT_AT_GATE',
    };

    storage.saveInward(draftConsignment);

    const batchesAfter = storage.getBatches();
    const postWheatTotal = batchesAfter
      .filter((b) => b.commodity_id === 'wheat')
      .reduce((sum, b) => sum + b.on_hand_qtl, 0);

    // Draft MUST NOT increase physical stock
    expect(postWheatTotal).toBe(initialWheatTotal);
  });

  it('2. Authorized posting of inward receipt increments physical batch stock and appends ledger entry', () => {
    const batchesBefore = storage.getBatches();
    const initialWheatTotal = batchesBefore
      .filter((b) => b.commodity_id === 'wheat')
      .reduce((sum, b) => sum + b.on_hand_qtl, 0);

    const movementsBeforeCount = storage.getMovements().length;

    // Use the existing seed consignment INW-2026-DEL-0482 (240.0 Qtl)
    const success = storage.postInward('INW-2026-DEL-0482', testUser);
    expect(success).toBe(true);

    const batchesAfter = storage.getBatches();
    const postWheatTotal = batchesAfter
      .filter((b) => b.commodity_id === 'wheat')
      .reduce((sum, b) => sum + b.on_hand_qtl, 0);

    // Stock must increase by exactly 240.0 Qtl
    expect(postWheatTotal).toBe(initialWheatTotal + 240.0);

    // Movement ledger must have a new INWARD credit event
    const movementsAfter = storage.getMovements();
    expect(movementsAfter.length).toBe(movementsBeforeCount + 1);

    const latestMovement = movementsAfter[0];
    expect(latestMovement.event_type).toBe('INWARD');
    expect(latestMovement.credit_qtl).toBe(240.0);
    expect(latestMovement.reference_id).toBe('#INW-2026-DEL-0482');
  });

  it('3. Dispatch requisition reserves batch stock at creation without physical deduction', () => {
    const initialW101 = storage.getBatchById('W-101');
    expect(initialW101?.on_hand_qtl).toBe(1000.0);
    expect(initialW101?.reserved_qtl).toBe(0.0);

    const testRequisition: FPSDispatchRequisition = {
      id: 'REQ-TEST-100',
      fifo_run_id: '#CALC-TEST-100',
      fps_id: 'FPS-TEST',
      fps_name: 'Model Town Ration Shop',
      licensee_name: 'S. K. Gupta',
      ward: 'Ward 14',
      fps_code: 'FPS-DL-NW-9999',
      biometric_token_ok: true,
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      required_quantity_qtl: 500.0,
      allocated_quantity_qtl: 500.0,
      fulfillment_pct: 100.0,
      shortage_deficit_qtl: 0.0,
      target_dispatch_date: '2026-10-22',
      allocated_carrier: 'DL-1M-9999',
      indent_voucher: 'IND-TEST-01',
      weighbridge_cert: '#WB-TEST-01',
      status: 'PENDING_APPROVAL',
      is_exception: false,
      created_at: new Date().toISOString(),
      allocations: [
        {
          rank: 1,
          batch_id: 'W-101',
          receipt_date: '2026-10-01',
          age_days: 20,
          shed: 'Shed 01',
          bay: 'Bay 1',
          stack_id: 'Stack A-4',
          total_balance_qtl: 1000.0,
          quality_status: 'ELIGIBLE',
          fifo_draw_qtl: 500.0,
          post_dispatch_bal_qtl: 500.0,
          percentage_of_batch: 50.0,
          reason: 'Primary FIFO allocation candidate',
        },
      ],
    };

    storage.saveDispatch(testRequisition);

    // Prior to approval, stock is unreserved
    const preApprovalW101 = storage.getBatchById('W-101');
    expect(preApprovalW101?.reserved_qtl).toBe(0.0);

    // Approval atomically reserves the stock
    const approved = storage.approveDispatch(testRequisition.id, testUser);
    expect(approved).toBe(true);

    const postApprovalW101 = storage.getBatchById('W-101');
    // On-hand remains 1,000 Qtl (not yet departed gate)
    expect(postApprovalW101?.on_hand_qtl).toBe(1000.0);
    // Reserved increases to 500 Qtl
    expect(postApprovalW101?.reserved_qtl).toBe(500.0);
  });

  it('4. Gate outward confirmation physically deducts stock and clears reservation atomically', () => {
    // 1. Create and approve a test dispatch for 500 Qtl from W-101
    const testRequisition: FPSDispatchRequisition = {
      id: 'REQ-OUTWARD-01',
      fifo_run_id: '#CALC-OUTWARD-01',
      fps_id: 'FPS-TEST-2',
      fps_name: 'Shakti Nagar Depot Store',
      licensee_name: 'M. Gupta',
      ward: 'Ward 14',
      fps_code: 'FPS-DL-NW-2048',
      biometric_token_ok: true,
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      required_quantity_qtl: 500.0,
      allocated_quantity_qtl: 500.0,
      fulfillment_pct: 100.0,
      shortage_deficit_qtl: 0.0,
      target_dispatch_date: '2026-10-22',
      allocated_carrier: 'DL-1M-4490 (16-Wheeler)',
      indent_voucher: 'IND-TEST-02',
      weighbridge_cert: '#WB-TEST-02',
      status: 'PENDING_APPROVAL',
      is_exception: false,
      created_at: new Date().toISOString(),
      allocations: [
        {
          rank: 1,
          batch_id: 'W-101',
          receipt_date: '2026-10-01',
          age_days: 20,
          shed: 'Shed 01',
          bay: 'Bay 1',
          stack_id: 'Stack A-4',
          total_balance_qtl: 1000.0,
          quality_status: 'ELIGIBLE',
          fifo_draw_qtl: 500.0,
          post_dispatch_bal_qtl: 500.0,
          percentage_of_batch: 50.0,
          reason: 'Primary FIFO allocation candidate',
        },
      ],
    };

    storage.saveDispatch(testRequisition);
    storage.approveDispatch(testRequisition.id, testUser);

    // 2. Issue delivery challan
    const challan = storage.generateChallan(testRequisition.id, testUser);
    expect(challan).toBeDefined();
    expect(challan?.status).toBe('APPROVED');

    // 3. Confirm physical truck departure through gate outward weighbridge
    const success = storage.confirmGateDispatch(challan!.challan_no, testUser);
    expect(success).toBe(true);

    const postW101 = storage.getBatchById('W-101');
    // On-hand physically reduced by 500 Qtl (1,000 - 500 = 500)
    expect(postW101?.on_hand_qtl).toBe(500.0);
    // Reservation cleared
    expect(postW101?.reserved_qtl).toBe(0.0);

    // Ledger must record DISPATCH event
    const latestMovement = storage.getMovements()[0];
    expect(latestMovement.event_type).toBe('DISPATCH');
    expect(latestMovement.reference_id).toBe(`#${challan!.challan_no}`);
    expect(latestMovement.debit_qtl).toBe(500.0);
  });

  it('5. Manual stock adjustment updates batch and writes double-entry audit entry', () => {
    const batchBefore = storage.getBatchById('W-102');
    const initialOnHand = batchBefore?.on_hand_qtl || 800;

    // Record +25 Qtl physical recount surplus
    const success = storage.adjustStock('W-102', 25.0, 'Annual physical count audit tally', testUser);
    expect(success).toBe(true);

    const batchAfter = storage.getBatchById('W-102');
    expect(batchAfter?.on_hand_qtl).toBe(initialOnHand + 25.0);

    const latestMovement = storage.getMovements()[0];
    expect(latestMovement.event_type).toBe('ADJUSTMENT');
    expect(latestMovement.credit_qtl).toBe(25.0);
    expect(latestMovement.resulting_balance_qtl).toBe(batchAfter?.on_hand_qtl);
  });

  it('6. FIFO exception authorization and rejection workflows maintain audit state', () => {
    const exceptions = storage.getExceptions();
    const exc = exceptions[0];
    expect(exc).toBeDefined();

    // Authorize exception
    const authSuccess = storage.authorizeException(exc.id, testUser);
    expect(authSuccess).toBe(true);

    const authExc = storage.getExceptions().find((e) => e.id === exc.id);
    expect(authExc?.status).toBe('AUTHORIZED');
    expect(authExc?.reviewed_by).toContain(testUser.name);

    // Reject exception
    const rejSuccess = storage.rejectException(exc.id, testUser, 'Enforcing Rule 14-B');
    expect(rejSuccess).toBe(true);

    const rejExc = storage.getExceptions().find((e) => e.id === exc.id);
    expect(rejExc?.status).toBe('REJECTED');
    expect(rejExc?.audit_note).toContain('Enforcing Rule 14-B');
  });
});
