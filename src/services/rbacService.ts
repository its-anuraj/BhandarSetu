import { UserProfile, UserRole, PermissionAction } from '../types';

export class AuthorizationError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code = 'FORBIDDEN', details?: unknown) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Deterministic Role Permission Matrix matching Section 10 of BhandarSetu Specification
 */
const ROLE_PERMISSIONS: Record<UserRole, Set<PermissionAction>> = {
  PLATFORM_SUPER_ADMIN: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'EXPORT_INVENTORY',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
    'MANAGE_USERS',
    'SYSTEM_SETTINGS',
    'APPROVE_FIFO_EXCEPTION',
    'REJECT_FIFO_EXCEPTION',
  ]),

  STATE_ADMIN: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'EXPORT_INVENTORY',
    'CREATE_INWARD_DRAFT',
    'EDIT_INWARD_DRAFT',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
    'MANAGE_USERS',
    'SYSTEM_SETTINGS',
    'APPROVE_FIFO_EXCEPTION',
    'REJECT_FIFO_EXCEPTION',
  ]),

  DISTRICT_SUPPLY_OFFICER: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'EXPORT_INVENTORY',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
    'APPROVE_DISPATCH_REQUISITION',
    'APPROVE_FIFO_EXCEPTION',
    'REJECT_FIFO_EXCEPTION',
  ]),

  GODOWN_MANAGER: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'ADJUST_STOCK',
    'EXPORT_INVENTORY',
    'CREATE_INWARD_DRAFT',
    'EDIT_INWARD_DRAFT',
    'POST_INWARD_LEDGER',
    'REJECT_INWARD',
    'CONDUCT_QUALITY_INSPECTION',
    'MANAGE_QUALITY_HOLD',
    'CREATE_DISPATCH_REQUISITION',
    'APPROVE_DISPATCH_REQUISITION',
    'APPROVE_FIFO_EXCEPTION',
    'REJECT_FIFO_EXCEPTION',
    'GENERATE_CHALLAN',
    'CONFIRM_GATE_DISPATCH',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'SYSTEM_SETTINGS',
  ]),

  STOCK_INWARD_OPERATOR: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'CREATE_INWARD_DRAFT',
    'EDIT_INWARD_DRAFT',
    'VIEW_REPORTS',
  ]),

  QUALITY_INSPECTOR: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'CONDUCT_QUALITY_INSPECTION',
    'MANAGE_QUALITY_HOLD',
    'VIEW_REPORTS',
  ]),

  DISPATCH_OPERATOR: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'CREATE_DISPATCH_REQUISITION',
    'OVERRIDE_FIFO_EXCEPTION',
    'GENERATE_CHALLAN',
    'CONFIRM_GATE_DISPATCH',
    'VIEW_REPORTS',
  ]),

  AUTHORIZED_APPROVER: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'POST_INWARD_LEDGER',
    'REJECT_INWARD',
    'APPROVE_DISPATCH_REQUISITION',
    'APPROVE_FIFO_EXCEPTION',
    'REJECT_FIFO_EXCEPTION',
    'CONFIRM_GATE_DISPATCH',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
  ]),

  AUDITOR: new Set([
    'VIEW_DASHBOARD',
    'VIEW_INVENTORY',
    'EXPORT_INVENTORY',
    'VIEW_LEDGER',
    'EXPORT_LEDGER',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
  ]),

  FPS_RECIPIENT: new Set([
    'VIEW_DASHBOARD',
    'VIEW_REPORTS',
  ]),
};

/**
 * Role Route Access Rules
 */
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  'dashboard': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'QUALITY_INSPECTOR',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
    'FPS_RECIPIENT',
  ],
  'inventory-and-batches': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'QUALITY_INSPECTOR',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'stock-inward': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'quality-inspection': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'QUALITY_INSPECTOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'fps-dispatch-and-fifo': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'delivery-challans': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'fifo-exceptions': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'stock-movement-ledger': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'reports-and-register': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'QUALITY_INSPECTOR',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'audit-trail': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
  'users': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
  ],
  'settings': [
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'QUALITY_INSPECTOR',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
  ],
};

export interface AuthorizationContext {
  godownId?: string;
  districtId?: string;
  stateCode?: string;
  createdBy?: string;
}

export class RBACService {
  /**
   * Evaluates whether a user role has permission to access a specified route
   */
  public canAccessRoute(user: UserProfile | null | undefined, route: string): boolean {
    if (!user || user.is_active === false) return false;
    const allowedRoles = ROUTE_PERMISSIONS[route];
    if (!allowedRoles) return false;
    return allowedRoles.includes(user.role);
  }

  /**
   * Deterministic scope evaluation algorithm matching Section 11.2 of the Specification
   */
  public evaluateScope(
    user: UserProfile,
    target: { godownId?: string; districtId?: string; stateCode?: string }
  ): boolean {
    if (!user || user.is_active === false) return false;

    // Platform Super Admin has system-wide oversight
    if (user.role === 'PLATFORM_SUPER_ADMIN') {
      return true;
    }

    // State Administrator: must match state_code
    if (user.role === 'STATE_ADMIN') {
      if (target.stateCode && target.stateCode !== user.state_code) {
        return false;
      }
      return true;
    }

    // District Supply Officer & Auditor: must match district
    if (user.role === 'DISTRICT_SUPPLY_OFFICER' || user.role === 'AUDITOR') {
      if (target.districtId && user.district_id && target.districtId !== user.district_id) {
        return false;
      }
      return true;
    }

    // Depot-level operational roles: Godown Manager, Inward Operator, QC, Dispatch
    const permittedGodowns = new Set<string>();
    if (user.godown_id) permittedGodowns.add(user.godown_id);
    if (user.assigned_godown_ids) {
      user.assigned_godown_ids.forEach((id) => permittedGodowns.add(id));
    }

    if (target.godownId) {
      return permittedGodowns.has(target.godownId);
    }

    return true;
  }

  /**
   * Check whether a user can perform an action, including Four-Eyes Principle checks and scope
   */
  public canPerformAction(
    user: UserProfile | null | undefined,
    action: PermissionAction,
    context?: AuthorizationContext
  ): { allowed: boolean; reason?: string } {
    if (!user) {
      return { allowed: false, reason: 'Authentication required. User session is missing or invalid.' };
    }

    if (user.is_active === false) {
      return { allowed: false, reason: 'Account deactivated. Access to all operational functions is revoked.' };
    }

    const permittedActions = ROLE_PERMISSIONS[user.role];
    if (!permittedActions || !permittedActions.has(action)) {
      return {
        allowed: false,
        reason: `Role '${user.role}' is not authorized to perform '${action}'.`,
      };
    }

    // Auditor is strictly read-only: deny all mutation operations
    if (user.role === 'AUDITOR') {
      const isMutation = [
        'ADJUST_STOCK',
        'CREATE_INWARD_DRAFT',
        'EDIT_INWARD_DRAFT',
        'POST_INWARD_LEDGER',
        'REJECT_INWARD',
        'CONDUCT_QUALITY_INSPECTION',
        'MANAGE_QUALITY_HOLD',
        'CREATE_DISPATCH_REQUISITION',
        'APPROVE_DISPATCH_REQUISITION',
        'OVERRIDE_FIFO_EXCEPTION',
        'APPROVE_FIFO_EXCEPTION',
        'REJECT_FIFO_EXCEPTION',
        'GENERATE_CHALLAN',
        'CONFIRM_GATE_DISPATCH',
        'MANAGE_USERS',
      ].includes(action);

      if (isMutation) {
        return { allowed: false, reason: 'Auditors are strictly restricted to read-only oversight.' };
      }
    }

    // Separation of Duties (Four-Eyes Principle): Creator cannot approve their own requisition
    if (
      (action === 'APPROVE_DISPATCH_REQUISITION' || action === 'APPROVE_FIFO_EXCEPTION') &&
      context?.createdBy &&
      (context.createdBy === user.name || context.createdBy === user.id || context.createdBy === user.email)
    ) {
      return {
        allowed: false,
        reason: 'Separation of duties violation: An operator cannot approve their own transaction.',
      };
    }

    // Jurisdiction Scope Check
    if (context) {
      const isScopeValid = this.evaluateScope(user, {
        godownId: context.godownId,
        districtId: context.districtId,
        stateCode: context.stateCode,
      });

      if (!isScopeValid) {
        return {
          allowed: false,
          reason: `Access Denied: Record scope (${context.godownId || context.districtId || 'depot'}) is outside user's assigned jurisdiction.`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Asserts permission and throws an AuthorizationError if denied
   */
  public assertPermission(
    user: UserProfile | null | undefined,
    action: PermissionAction,
    context?: AuthorizationContext
  ): void {
    const result = this.canPerformAction(user, action, context);
    if (!result.allowed) {
      throw new AuthorizationError(result.reason || 'Operation denied by RBAC policy.', 'UNAUTHORIZED_ACTION', {
        action,
        userRole: user?.role,
        context,
      });
    }
  }
}

export const rbac = new RBACService();
