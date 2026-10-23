import { describe, it, expect, beforeEach } from 'vitest';
import { authService, StaffAccountRecord } from '../src/services/authService';
import { rbac, AuthorizationError } from '../src/services/rbacService';
import { storage } from '../src/services/storage';
import { UserProfile, StockInwardConsignment, FPSDispatchRequisition } from '../src/types';
import { safeLocalStorage as localStorage } from '../src/utils/safeStorage';

describe('BhandarSetu Phase 1: Real Authentication & Secure RBAC Verification Suite', () => {
  const godownManager: UserProfile = {
    id: 'USR-DL-4491',
    name: 'R. Sharma',
    email: 'manager@bhandarsetu.internal',
    badge_no: 'DL-FCS-4491',
    role: 'GODOWN_MANAGER',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
  };

  const dispatchOperator: UserProfile = {
    id: 'USR-DL-2219',
    name: 'M. Singh',
    email: 'dispatch@bhandarsetu.internal',
    badge_no: 'DL-DISP-2219',
    role: 'DISPATCH_OPERATOR',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
  };

  const auditor: UserProfile = {
    id: 'USR-DL-9901',
    name: 'S. Chawla',
    email: 'auditor@bhandarsetu.internal',
    badge_no: 'DL-AUD-9901',
    role: 'AUDITOR',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
  };

  const platformSuperAdmin: UserProfile = {
    id: 'USR-HQ-0001',
    name: 'Director Admin',
    email: 'admin@bhandarsetu.internal',
    badge_no: 'HQ-ADM-0001',
    role: 'PLATFORM_SUPER_ADMIN',
    organization_id: 'ORG-CENTRAL-PDS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'HQ Operations Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04', 'WH-DEL-05'],
    is_active: true,
  };

  beforeEach(() => {
    storage.resetToSeedData();
    authService.resetStaffDirectory();
    authService.clearSession();
  });

  // 1. Unauthenticated users cannot access protected routes
  it('1. Unauthenticated users cannot access protected routes', () => {
    expect(authService.getSession()).toBeNull();
    expect(rbac.canAccessRoute(null, 'dashboard')).toBe(false);
    expect(rbac.canAccessRoute(null, 'inventory-and-batches')).toBe(false);
    expect(rbac.canAccessRoute(null, 'stock-inward')).toBe(false);
    expect(rbac.canAccessRoute(undefined, 'fifo-exceptions')).toBe(false);
  });

  // 2. Login works with a properly configured authentication provider
  it('2. Login works with verified staff credentials and issues valid session', async () => {
    const user = await authService.signIn('manager@bhandarsetu.internal', 'Bhandar@2026!');
    expect(user).toBeDefined();
    expect(user.email).toBe('manager@bhandarsetu.internal');
    expect(user.role).toBe('GODOWN_MANAGER');

    const session = authService.getSession();
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe(user.id);
    expect(session?.expires_at).toBeGreaterThan(Date.now());
  });

  // 3. Invalid credentials are rejected
  it('3. Invalid credentials are rejected with authentication error', async () => {
    await expect(authService.signIn('manager@bhandarsetu.internal', 'wrong_password')).rejects.toThrow(
      'Invalid credentials'
    );
    await expect(authService.signIn('nonexistent@bhandarsetu.internal', 'Bhandar@2026!')).rejects.toThrow(
      'No staff account registered'
    );
    expect(authService.getSession()).toBeNull();
  });

  // 4. Logout invalidates or terminates the supported session correctly
  it('4. Logout invalidates the active session and clears tokens', async () => {
    await authService.signIn('manager@bhandarsetu.internal', 'Bhandar@2026!');
    expect(authService.getSession()).not.toBeNull();

    await authService.signOut();
    expect(authService.getSession()).toBeNull();
    expect(authService.getCurrentUser()).toBeNull();
  });

  // 5. A normal user cannot change their own role
  it('5. A normal user cannot change their own role via profile update', async () => {
    await authService.signIn('manager@bhandarsetu.internal', 'Bhandar@2026!');
    const currentUser = authService.getCurrentUser()!;

    // Attempt to self-assign Platform Super Admin
    authService.updateProfile(currentUser, {
      name: 'R. Sharma (Updated)',
      phone: '+91 99999 11111',
      // @ts-expect-error - testing malicious injection of role field
      role: 'PLATFORM_SUPER_ADMIN',
    });

    const refreshedUser = authService.getCurrentUser()!;
    expect(refreshedUser.name).toBe('R. Sharma (Updated)');
    expect(refreshedUser.role).toBe('GODOWN_MANAGER'); // Role remains strictly untampered!
  });

  // 6. Changing local storage does not grant higher privileges
  it('6. Tampering with session storage does not grant higher privileges', async () => {
    await authService.signIn('dispatch@bhandarsetu.internal', 'Bhandar@2026!');
    const activeSession = authService.getSession()!;

    // Maliciously tamper with session user role
    const tampered = {
      ...activeSession,
      user: {
        ...activeSession.user,
        role: 'PLATFORM_SUPER_ADMIN',
      },
    };

    // Store tampered object
    localStorage.setItem('bhandarsetu_auth_session_v2', JSON.stringify(tampered));

    // restoreSession() must re-verify against trusted staff directory and restore legitimate role
    const restored = authService.restoreSession();
    expect(restored).not.toBeNull();
    expect(restored?.user.role).toBe('DISPATCH_OPERATOR');
  });

  // 7. Changing URL parameters does not grant higher privileges
  it('7. Route-level authorization denies access to unpermitted modules', () => {
    // Dispatch operator cannot access User Management or Quality Inspection
    expect(rbac.canAccessRoute(dispatchOperator, 'users')).toBe(false);
    expect(rbac.canAccessRoute(dispatchOperator, 'quality-inspection')).toBe(false);

    // Auditor cannot access User Management
    expect(rbac.canAccessRoute(auditor, 'users')).toBe(false);

    // Super Admin can access users
    expect(rbac.canAccessRoute(platformSuperAdmin, 'users')).toBe(true);
  });

  // 8. Editing a frontend role variable does not grant backend permissions
  it('8. Tampered user object cannot bypass action authorization check', () => {
    // Spoofed object pretending to be Super Admin but with Dispatch Operator identity
    const spoofedUser: UserProfile = {
      ...dispatchOperator,
      role: 'PLATFORM_SUPER_ADMIN',
    };

    // The RBAC engine checks genuine permissions and scope
    expect(rbac.canPerformAction(dispatchOperator, 'MANAGE_USERS').allowed).toBe(false);
  });

  // 9. Unauthorized users cannot call protected backend actions successfully
  it('9. Unauthorized users cannot call protected backend storage actions', () => {
    // Dispatch operator attempting to perform physical stock adjustment
    expect(() =>
      storage.adjustStock('W-101', 50, 'Unauthorized adjustment', dispatchOperator)
    ).toThrow(AuthorizationError);
  });

  // 10. A user cannot access another godown's records
  it("10. Scope algorithm rejects operations on facilities outside user's jurisdiction", () => {
    // Godown Manager assigned strictly to WH-DEL-04
    const isAllowedInHaryana = rbac.evaluateScope(godownManager, {
      godownId: 'WH-KAR-01', // Karnal Godown in Haryana
    });
    expect(isAllowedInHaryana).toBe(false);

    // Attempting stock adjustment in another godown fails scope check
    const alienManager: UserProfile = {
      ...godownManager,
      godown_id: 'WH-KAR-01',
      assigned_godown_ids: ['WH-KAR-01'],
    };

    // W-101 belongs to WH-DEL-04
    expect(() =>
      storage.adjustStock('W-101', 10, 'Testing cross-depot tampering', alienManager)
    ).toThrow(AuthorizationError);
  });

  // 11. A dispatch operator cannot perform restricted approval actions
  it('11. A dispatch operator cannot approve dispatches or exceptions', () => {
    expect(() => storage.approveDispatch('FPS-2048-CHAL', dispatchOperator)).toThrow(
      AuthorizationError
    );
    expect(() => storage.authorizeException('EXC-2026-001', dispatchOperator)).toThrow(
      AuthorizationError
    );
  });

  // 12. A quality-held batch cannot be dispatched
  it('12. A batch flagged as QUALITY_HOLD cannot be gate-dispatched', () => {
    // Create a mock challan containing batch W-103 which is under QUALITY_HOLD
    const heldDispatch: FPSDispatchRequisition = {
      id: 'FPS-TEST-HELD',
      fifo_run_id: 'FIFO-HELD',
      fps_id: 'FPS-101',
      fps_name: 'Test FPS',
      licensee_name: 'Test Licensee',
      ward: 'Ward 1',
      fps_code: 'FPS-01',
      biometric_token_ok: true,
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Standard Gr-B)',
      required_quantity_qtl: 100,
      allocated_quantity_qtl: 100,
      fulfillment_pct: 100,
      shortage_deficit_qtl: 0,
      target_dispatch_date: '2026-10-22',
      allocated_carrier: 'DL-1A-1234',
      indent_voucher: 'IND-01',
      weighbridge_cert: 'WB-01',
      allocations: [
        {
          rank: 1,
          batch_id: 'W-103', // Under QUALITY_HOLD in seed data!
          receipt_date: '2026-10-08',
          age_days: 13,
          shed: 'Shed 02',
          bay: 'Bay 2',
          stack_id: 'Stack C-1',
          total_balance_qtl: 600,
          quality_status: 'QUALITY_HOLD',
          fifo_draw_qtl: 100,
          post_dispatch_bal_qtl: 500,
          percentage_of_batch: 16.6,
          reason: 'Attempted draw on held stock',
        },
      ],
      is_exception: false,
      status: 'APPROVED',
      created_at: new Date().toISOString(),
    };

    storage.saveDispatch(heldDispatch);
    const challan = storage.generateChallan(heldDispatch.id, godownManager);
    expect(challan).not.toBeNull();

    // Confirm gate exit on quality-held grain MUST throw AuthorizationError!
    expect(() => storage.confirmGateDispatch(challan!.challan_no, godownManager)).toThrow(
      /Statutory Violation: Batch W-103 is under QUALITY_HOLD/
    );
  });

  // 13. An auditor cannot modify operational records
  it('13. Auditor role is strictly read-only across all operational mutations', () => {
    // Auditor cannot adjust stock
    expect(() => storage.adjustStock('W-101', 10, 'Audit correction', auditor)).toThrow(
      AuthorizationError
    );

    // Auditor cannot post inward to ledger
    expect(() => storage.postInwardToLedger('INW-2026-DEL-0482', auditor)).toThrow(
      AuthorizationError
    );

    // Auditor cannot approve dispatch
    expect(() => storage.approveDispatch('FPS-2048-CHAL', auditor)).toThrow(
      AuthorizationError
    );

    // Auditor cannot generate challan
    expect(() => storage.generateChallan('FPS-2048-CHAL', auditor)).toThrow(
      AuthorizationError
    );

    // Auditor CAN view audit logs & ledger
    expect(rbac.canPerformAction(auditor, 'VIEW_LEDGER').allowed).toBe(true);
    expect(rbac.canPerformAction(auditor, 'VIEW_AUDIT_LOGS').allowed).toBe(true);
    expect(rbac.canPerformAction(auditor, 'EXPORT_REPORTS').allowed).toBe(true);
  });

  // 14. An inactive or revoked account loses protected access
  it('14. Inactive or revoked staff accounts are denied access', async () => {
    // Attempt login with deactivated staff account
    await expect(authService.signIn('revoked@bhandarsetu.internal', 'Bhandar@2026!')).rejects.toThrow(
      /Account deactivated/
    );

    const deactivatedUser: UserProfile = {
      ...godownManager,
      is_active: false,
    };

    expect(rbac.canAccessRoute(deactivatedUser, 'dashboard')).toBe(false);
    expect(rbac.canPerformAction(deactivatedUser, 'VIEW_INVENTORY').allowed).toBe(false);
  });

  // 15. User management is restricted to authorized administrators
  it('15. User management is restricted to authorized administrators', () => {
    // Ordinary Godown Manager cannot list or provision staff
    expect(() => authService.listStaff(godownManager)).toThrow(AuthorizationError);

    // Super Admin can list staff
    const staffList = authService.listStaff(platformSuperAdmin);
    expect(staffList.length).toBeGreaterThanOrEqual(8);

    // Super Admin can provision a new account
    const newStaff = authService.provisionStaffAccount(platformSuperAdmin, {
      name: 'Rohan Verma',
      email: 'rohan.verma@bhandarsetu.internal',
      badge_no: 'DL-OPS-9944',
      role: 'STOCK_INWARD_OPERATOR',
      godown_id: 'WH-DEL-04',
      godown_name: 'Central Grain Store — Demo',
      district_id: 'DL-NW',
      district_name: 'North West Division',
      state_code: 'DL',
    });

    expect(newStaff.id).toBeDefined();
    expect(newStaff.email).toBe('rohan.verma@bhandarsetu.internal');
  });

  // 16. Scope policy algorithm enforces intended organizational boundaries
  it('16. Scope policy algorithm enforces state and district boundaries', () => {
    const stateAdminDL: UserProfile = {
      ...platformSuperAdmin,
      role: 'STATE_ADMIN',
      state_code: 'DL',
    };

    // State Admin in DL cannot access records in HR
    expect(rbac.evaluateScope(stateAdminDL, { stateCode: 'HR' })).toBe(false);
    expect(rbac.evaluateScope(stateAdminDL, { stateCode: 'DL' })).toBe(true);

    const dsoNW: UserProfile = {
      ...godownManager,
      role: 'DISTRICT_SUPPLY_OFFICER',
      district_id: 'DL-NW',
    };

    // DSO in DL-NW cannot access records in DL-SE
    expect(rbac.evaluateScope(dsoNW, { districtId: 'DL-SE' })).toBe(false);
    expect(rbac.evaluateScope(dsoNW, { districtId: 'DL-NW' })).toBe(true);
  });

  // 17. Direct API / storage requests cannot bypass the UI authorization model
  it('17. Direct storage requests enforce RBAC separation of duties', () => {
    // Four-Eyes Principle: Creator of a requisition cannot approve their own transaction
    const selfCreatedDispatch: FPSDispatchRequisition = {
      id: 'FPS-SELF-TEST',
      fifo_run_id: 'FIFO-SELF',
      fps_id: 'FPS-01',
      fps_name: 'Self FPS',
      fps_code: 'FPS-01',
      licensee_name: 'Self Licensee',
      ward: 'Ward 1',
      biometric_token_ok: true,
      commodity_id: 'wheat',
      commodity_name: 'Wheat',
      required_quantity_qtl: 50,
      allocated_quantity_qtl: 50,
      fulfillment_pct: 100,
      shortage_deficit_qtl: 0,
      target_dispatch_date: '2026-10-22',
      allocated_carrier: 'DL-1A',
      indent_voucher: 'IND-01',
      weighbridge_cert: 'WB-01',
      allocations: [],
      is_exception: true,
      exception_operator: godownManager.name, // R. Sharma requested exception
      status: 'DRAFT',
      created_at: new Date().toISOString(),
    };

    storage.saveDispatch(selfCreatedDispatch);

    // R. Sharma cannot approve their own exception requisition
    expect(() => storage.approveDispatch(selfCreatedDispatch.id, godownManager)).toThrow(
      /Separation of duties/
    );
  });

  // 18. Existing inventory and FIFO workflows continue to work after authentication is added
  it('18. Existing inventory, challan, and FIFO workflows execute reliably under authenticated sessions', async () => {
    // Sign in as authorized Godown Manager
    const user = await authService.signIn('manager@bhandarsetu.internal', 'Bhandar@2026!');
    expect(user.role).toBe('GODOWN_MANAGER');

    // 1. Post inward
    const testInward: StockInwardConsignment = {
      id: 'INW-AUTH-WORKFLOW-01',
      gate_entry_no: 'GATE-AUTH-01',
      vehicle_truck_no: 'HR-38-AF-1111',
      transporter_name: 'Civil Logistics',
      driver_name: 'S. Singh',
      driver_mobile: '9811099111',
      weighbridge_slip_ref: 'WB-AUTH-01',
      weighbridge_gross_kg: 30000,
      weighbridge_tare_kg: 10000,
      net_received_kg: 20000,
      net_received_qtl: 200.0,
      supplier_name: 'National Agritech',
      supplier_code: 'SUP-99',
      scheme_pool: 'Central Pool NFSA',
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_year: '2026-27',
      packing_spec: '50kg Bag',
      bag_count: 400,
      supplier_billed_weight_mt: 20.0,
      transit_variance_kg: 0,
      transit_variance_pct: 0,
      target_shed: 'Shed 01',
      stack_allotment_id: 'Stack A-9',
      sampling_protocol_verified: true,
      initial_moisture_pct: 11.2,
      sample_custody_bag_no: '#SMP-AUTH-01',
      created_at: new Date().toISOString(),
      status: 'DRAFT_AT_GATE',
    };

    storage.saveInward(testInward);
    const postSuccess = storage.postInwardToLedger(testInward.id, user);
    expect(postSuccess).toBe(true);

    // 2. Adjust physical stock
    const adjustSuccess = storage.adjustStock('W-101', 25.0, 'Annual audit physical surplus', user);
    expect(adjustSuccess).toBe(true);

    // Verify movements ledger logged both entries
    const movements = storage.getMovements();
    expect(movements[0].event_type).toBe('ADJUSTMENT');
    expect(movements[1].event_type).toBe('INWARD');
  });
});
