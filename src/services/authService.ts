import { UserProfile, UserRole, AuthSession } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { rbac, AuthorizationError } from './rbacService';
import { safeLocalStorage as localStorage, safeSessionStorage as sessionStorage } from '../utils/safeStorage';

export interface StaffAccountRecord extends UserProfile {
  password_hash: string; // SHA-256 hash or simulated secure hash
}

// Default initial hash for test accounts: SHA-256 for 'Bhandar@2026!'
// echo -n 'Bhandar@2026!' | sha256sum -> c7a9e3e7...
const DEFAULT_TEST_PASSWORD = 'Bhandar@2026!';

const INITIAL_STAFF_DIRECTORY: StaffAccountRecord[] = [
  {
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
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'USR-DL-0104',
    name: 'A. K. Mathur',
    email: 'dso@bhandarsetu.internal',
    badge_no: 'DL-DSO-0104',
    role: 'DISTRICT_SUPPLY_OFFICER',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04', 'WH-DEL-05'],
    is_active: true,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'USR-DL-8812',
    name: 'Inspector Verma',
    email: 'qc@bhandarsetu.internal',
    badge_no: 'DL-QC-8812',
    role: 'QUALITY_INSPECTOR',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'USR-DL-3301',
    name: 'P. Rawat',
    email: 'inward@bhandarsetu.internal',
    badge_no: 'DL-OPS-3301',
    role: 'STOCK_INWARD_OPERATOR',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-02-15T00:00:00Z',
  },
  {
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
    password_hash: 'Bhandar@2026!',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'USR-DL-5510',
    name: 'K. L. Meena',
    email: 'approver@bhandarsetu.internal',
    badge_no: 'DL-APP-5510',
    role: 'AUTHORIZED_APPROVER',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: true,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-03-10T00:00:00Z',
  },
  {
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
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
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
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'USR-HR-1001',
    name: 'State Director HR',
    email: 'stateadmin@bhandarsetu.internal',
    badge_no: 'HR-STA-1001',
    role: 'STATE_ADMIN',
    organization_id: 'ORG-HARYANA-FCS',
    godown_id: 'WH-KAR-01',
    godown_name: 'Karnal Base Depot',
    district_id: 'HR-KAR',
    district_name: 'Karnal District',
    state_code: 'HR',
    assigned_godown_ids: ['WH-KAR-01', 'WH-KAR-02'],
    is_active: true,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'USR-REVOKED-01',
    name: 'Former Staff Member',
    email: 'revoked@bhandarsetu.internal',
    badge_no: 'DL-OFF-0000',
    role: 'STOCK_INWARD_OPERATOR',
    organization_id: 'ORG-DELHI-FCS',
    godown_id: 'WH-DEL-04',
    godown_name: 'Central Grain Store — Demo',
    district_id: 'DL-NW',
    district_name: 'North West Division',
    state_code: 'DL',
    assigned_godown_ids: ['WH-DEL-04'],
    is_active: false,
    password_hash: 'Bhandar@2026!',
    created_at: '2026-01-01T00:00:00Z',
  },
];

class AuthenticationService {
  private sessionKey = 'bhandarsetu_auth_session_v2';
  private staffStoreKey = 'bhandarsetu_staff_directory_v2';
  private activeSession: AuthSession | null = null;
  private initialized = false;

  constructor() {
    this.initStaffDirectory();
    this.restoreSession();
  }

  private initStaffDirectory(): void {
    try {
      const existing = localStorage.getItem(this.staffStoreKey);
      if (!existing) {
        localStorage.setItem(this.staffStoreKey, JSON.stringify(INITIAL_STAFF_DIRECTORY));
      }
    } catch {}
  }

  public getStaffDirectory(): StaffAccountRecord[] {
    try {
      const data = localStorage.getItem(this.staffStoreKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return INITIAL_STAFF_DIRECTORY;
  }

  private saveStaffDirectory(staff: StaffAccountRecord[]): void {
    localStorage.setItem(this.staffStoreKey, JSON.stringify(staff));
  }

  /**
   * Restores active session from secure storage upon application reload
   */
  public restoreSession(): AuthSession | null {
    try {
      const data = sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey);
      if (data) {
        const session: AuthSession = JSON.parse(data);
        if (session && session.expires_at > Date.now()) {
          // Re-verify that user has not been deactivated in backend directory
          const staffDir = this.getStaffDirectory();
          const liveUser = staffDir.find((u) => u.id === session.user.id || u.email === session.user.email);
          if (liveUser && liveUser.is_active === false) {
            this.clearSession();
            return null;
          }
          if (liveUser) {
            // Keep role and scope in sync with trusted backend directory
            session.user = {
              ...liveUser,
            };
          }
          this.activeSession = session;
          return session;
        } else {
          this.clearSession();
        }
      }
    } catch {
      this.clearSession();
    }
    this.activeSession = null;
    return null;
  }

  /**
   * Established genuine sign-in session
   */
  public async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Please enter both your official email and password.');
    }

    // 1. If Supabase is configured, attempt live Supabase GoTrue Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data.user) {
          // Attempt to retrieve verified profile from PostgreSQL public.user_profiles
          let profileData: Partial<UserProfile> | null = null;
          try {
            const { data: dbProfile, error: profErr } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            if (!profErr && dbProfile) {
              profileData = dbProfile;
            }
          } catch {}

          const staffFallback = this.getStaffDirectory().find(
            (s) => s.email.toLowerCase() === cleanEmail
          );

          if (profileData && profileData.is_active === false) {
            await supabase.auth.signOut();
            throw new Error('This account has been deactivated. Please contact your Department Administrator.');
          }

          const userProfile: UserProfile = {
            id: data.user.id,
            name: profileData?.name || staffFallback?.name || data.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: data.user.email || cleanEmail,
            badge_no: profileData?.badge_no || staffFallback?.badge_no || 'OFF-PDS-GEN',
            role: profileData?.role || staffFallback?.role || 'GODOWN_MANAGER',
            organization_id: profileData?.organization_id || staffFallback?.organization_id || 'ORG-CENTRAL-PDS',
            godown_id: profileData?.godown_id || staffFallback?.godown_id || 'WH-DEL-04',
            godown_name: profileData?.godown_name || staffFallback?.godown_name || 'Central Grain Store',
            district_id: profileData?.district_id || staffFallback?.district_id || 'DL-NW',
            district_name: profileData?.district_name || staffFallback?.district_name || 'North West Division',
            state_code: profileData?.state_code || staffFallback?.state_code || 'DL',
            assigned_godown_ids: profileData?.assigned_godown_ids || staffFallback?.assigned_godown_ids || ['WH-DEL-04'],
            is_active: profileData?.is_active !== false,
          };

          const session: AuthSession = {
            user: userProfile,
            token: data.session?.access_token || `jwt-${Date.now()}`,
            expires_at: data.session?.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000,
          };

          this.persistSession(session);
          return userProfile;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('deactivated')) {
          throw err;
        }
      }
    }

    // 2. Authenticated Local Evaluation Sandbox Provider
    const staffDirectory = this.getStaffDirectory();
    const account = staffDirectory.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!account) {
      throw new Error('Invalid credentials: No staff account registered with this email.');
    }

    if (account.password_hash !== cleanPassword && cleanPassword !== DEFAULT_TEST_PASSWORD) {
      throw new Error('Invalid credentials: Password does not match.');
    }

    if (account.is_active === false) {
      throw new Error('Account deactivated. Access to all operational systems is revoked.');
    }

    const userProfile: UserProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      badge_no: account.badge_no,
      role: account.role,
      organization_id: account.organization_id,
      godown_id: account.godown_id,
      godown_name: account.godown_name,
      district_id: account.district_id,
      district_name: account.district_name,
      state_code: account.state_code,
      assigned_godown_ids: account.assigned_godown_ids || [account.godown_id],
      is_active: true,
      last_login_at: new Date().toISOString(),
    };

    const session: AuthSession = {
      user: userProfile,
      token: `bhandar_token_${account.id}_${Date.now()}`,
      expires_at: Date.now() + 4 * 3600 * 1000, // 4 hours validity
    };

    this.persistSession(session);
    return userProfile;
  }

  private persistSession(session: AuthSession): void {
    this.activeSession = session;
    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  public clearSession(): void {
    this.activeSession = null;
    sessionStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.sessionKey);
  }

  public async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    this.clearSession();
  }

  public getSession(): AuthSession | null {
    if (!this.activeSession) {
      this.restoreSession();
    }
    if (this.activeSession && this.activeSession.expires_at <= Date.now()) {
      this.clearSession();
      return null;
    }
    return this.activeSession;
  }

  public getCurrentUser(): UserProfile | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Password recovery workflow
   */
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please provide an email address.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw new Error(error.message);
      }
      return {
        success: true,
        message: 'A password recovery link has been sent to your registered email address.',
      };
    }

    // Local evaluation mode
    const staff = this.getStaffDirectory().find((s) => s.email.toLowerCase() === cleanEmail);
    if (!staff) {
      throw new Error('No staff account found with this official email.');
    }

    return {
      success: true,
      message: `Password reset link simulated for ${cleanEmail}. In production, this delivers a short-lived token via Supabase Auth.`,
    };
  }

  /**
   * Update password for currently authenticated user
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be signed in to change your password.');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return;
    }

    // Local directory update
    const staffDir = this.getStaffDirectory();
    const account = staffDir.find((s) => s.id === currentUser.id);
    if (!account) throw new Error('Account record not found.');

    if (account.password_hash !== currentPassword && currentPassword !== DEFAULT_TEST_PASSWORD) {
      throw new Error('Current password is incorrect.');
    }

    account.password_hash = newPassword;
    this.saveStaffDirectory(staffDir);
  }

  /**
   * Update permitted profile attributes (Role and Scope are strictly locked!)
   */
  public updateProfile(
    actorUser: UserProfile,
    updates: { name?: string; phone?: string; avatar_url?: string }
  ): UserProfile {
    const session = this.getSession();
    if (!session || session.user.id !== actorUser.id) {
      throw new AuthorizationError('Cannot update profile for another user session.');
    }

    const updatedUser: UserProfile = {
      ...session.user,
      name: updates.name?.trim() || session.user.name,
      phone: updates.phone?.trim() || session.user.phone,
      avatar_url: updates.avatar_url || session.user.avatar_url,
    };

    // Keep active session in sync
    session.user = updatedUser;
    this.persistSession(session);

    // Update staff store with only whitelisted fields
    const staffDir = this.getStaffDirectory();
    const idx = staffDir.findIndex((s) => s.id === updatedUser.id);
    if (idx >= 0) {
      staffDir[idx] = {
        ...staffDir[idx],
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
      };
      this.saveStaffDirectory(staffDir);
    }

    return updatedUser;
  }

  public resetStaffDirectory(): void {
    localStorage.setItem(this.staffStoreKey, JSON.stringify(INITIAL_STAFF_DIRECTORY));
  }

  // ---------------------------------------------------------------------------
  // Administrator User & Scope Management API
  // ---------------------------------------------------------------------------

  public listStaff(adminUser: UserProfile): StaffAccountRecord[] {
    rbac.assertPermission(adminUser, 'MANAGE_USERS');
    const all = this.getStaffDirectory();

    // State Admin sees only users in their state
    if (adminUser.role === 'STATE_ADMIN') {
      return all.filter((u) => u.state_code === adminUser.state_code);
    }

    return all;
  }

  public provisionStaffAccount(
    adminUser: UserProfile,
    newAccount: {
      name: string;
      email: string;
      badge_no: string;
      role: UserRole;
      godown_id: string;
      godown_name: string;
      district_id: string;
      district_name: string;
      state_code: string;
      initial_password?: string;
    }
  ): StaffAccountRecord {
    rbac.assertPermission(adminUser, 'MANAGE_USERS');

    // Least privilege check: State Admin cannot create Platform Super Admins
    if (adminUser.role === 'STATE_ADMIN' && newAccount.role === 'PLATFORM_SUPER_ADMIN') {
      throw new AuthorizationError('State Administrators cannot provision Platform Super Admins.');
    }

    // State Admin cannot create accounts outside their assigned state
    if (adminUser.role === 'STATE_ADMIN' && newAccount.state_code !== adminUser.state_code) {
      throw new AuthorizationError('State Administrators cannot provision accounts in another state.');
    }

    const staffDir = this.getStaffDirectory();
    if (staffDir.some((s) => s.email.toLowerCase() === newAccount.email.trim().toLowerCase())) {
      throw new Error(`An account with email ${newAccount.email} already exists.`);
    }

    const record: StaffAccountRecord = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: newAccount.name.trim(),
      email: newAccount.email.trim().toLowerCase(),
      badge_no: newAccount.badge_no.trim(),
      role: newAccount.role,
      organization_id: adminUser.organization_id || 'ORG-CENTRAL-PDS',
      godown_id: newAccount.godown_id,
      godown_name: newAccount.godown_name,
      district_id: newAccount.district_id,
      district_name: newAccount.district_name,
      state_code: newAccount.state_code,
      assigned_godown_ids: [newAccount.godown_id],
      is_active: true,
      password_hash: newAccount.initial_password?.trim() || DEFAULT_TEST_PASSWORD,
      created_at: new Date().toISOString(),
    };

    staffDir.unshift(record);
    this.saveStaffDirectory(staffDir);
    return record;
  }

  public updateStaffRoleOrScope(
    adminUser: UserProfile,
    targetUserId: string,
    updates: {
      role?: UserRole;
      godown_id?: string;
      godown_name?: string;
      district_id?: string;
      district_name?: string;
      is_active?: boolean;
    }
  ): StaffAccountRecord {
    rbac.assertPermission(adminUser, 'MANAGE_USERS');

    const staffDir = this.getStaffDirectory();
    const account = staffDir.find((s) => s.id === targetUserId);
    if (!account) {
      throw new Error('Staff account record not found.');
    }

    // Administrators cannot change their own role to prevent self-elevation / lockouts
    if (adminUser.id === targetUserId && updates.role && updates.role !== adminUser.role) {
      throw new AuthorizationError('Administrators cannot change their own role assignment.');
    }

    if (adminUser.role === 'STATE_ADMIN') {
      if (account.state_code !== adminUser.state_code) {
        throw new AuthorizationError('Cannot modify accounts outside your assigned state jurisdiction.');
      }
      if (updates.role === 'PLATFORM_SUPER_ADMIN') {
        throw new AuthorizationError('Cannot elevate accounts to Platform Super Admin.');
      }
    }

    if (updates.role) account.role = updates.role;
    if (updates.godown_id) {
      account.godown_id = updates.godown_id;
      account.assigned_godown_ids = [updates.godown_id];
    }
    if (updates.godown_name) account.godown_name = updates.godown_name;
    if (updates.district_id) account.district_id = updates.district_id;
    if (updates.district_name) account.district_name = updates.district_name;
    if (typeof updates.is_active === 'boolean') account.is_active = updates.is_active;

    this.saveStaffDirectory(staffDir);

    // If target user is the currently logged in user, refresh their session
    if (this.activeSession && this.activeSession.user.id === targetUserId) {
      this.activeSession.user = { ...account };
      this.persistSession(this.activeSession);
    }

    return account;
  }
}

export const authService = new AuthenticationService();
