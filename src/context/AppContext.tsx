import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  StockBatch,
  StockMovement,
  StockInwardConsignment,
  FPSDispatchRequisition,
  DeliveryChallan,
  FIFOExceptionRecord,
  AuthSession,
  PermissionAction,
} from '../types';
import { storage } from '../services/storage';
import { authService } from '../services/authService';
import { rbac, AuthorizationContext } from '../services/rbacService';

export type NavPath =
  | 'dashboard'
  | 'inventory-and-batches'
  | 'stock-inward'
  | 'quality-inspection'
  | 'fps-dispatch-and-fifo'
  | 'delivery-challans'
  | 'fifo-exceptions'
  | 'stock-movement-ledger'
  | 'reports-and-register'
  | 'audit-trail'
  | 'users'
  | 'settings';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface AppContextType {
  currentUser: UserProfile;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  updateProfile: (updates: { name?: string; phone?: string; avatar_url?: string }) => void;
  // Disallowed fake role switcher: kept with alert to prevent runtime breakage if referenced
  setCurrentRole: (role: UserRole) => void;
  canAccess: (route: string) => boolean;
  canDo: (action: PermissionAction, ctx?: AuthorizationContext) => { allowed: boolean; reason?: string };

  activePath: NavPath;
  setActivePath: (path: NavPath) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOnline: boolean;
  toggleOnlineMode: () => void;
  pendingSyncCount: number;
  batches: StockBatch[];
  movements: StockMovement[];
  inwards: StockInwardConsignment[];
  dispatches: FPSDispatchRequisition[];
  challans: DeliveryChallan[];
  exceptions: FIFOExceptionRecord[];
  refreshData: () => void;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  hideToast: () => void;
  // Deep-link helper for quick navigation between related workflows
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  activeChallanToPrint: DeliveryChallan | null;
  setActiveChallanToPrint: (c: DeliveryChallan | null) => void;
}

const defaultFallbackUser: UserProfile = {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    () => authService.getCurrentUser() || defaultFallbackUser
  );
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [activePath, setActivePath] = useState<NavPath>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(12);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>('W-101');
  const [activeChallanToPrint, setActiveChallanToPrint] = useState<DeliveryChallan | null>(null);

  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [inwards, setInwards] = useState<StockInwardConsignment[]>([]);
  const [dispatches, setDispatches] = useState<FPSDispatchRequisition[]>([]);
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [exceptions, setExceptions] = useState<FIFOExceptionRecord[]>([]);

  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  const hideToast = () => setToast(null);

  const refreshData = useCallback(() => {
    setBatches(storage.getBatches());
    setMovements(storage.getMovements());
    setInwards(storage.getInwards());
    setDispatches(storage.getDispatches());
    setChallans(storage.getChallans());
    setExceptions(storage.getExceptions());
  }, []);

  useEffect(() => {
    // Initial session rehydration
    const active = authService.restoreSession();
    if (active) {
      setSession(active);
      setCurrentUser(active.user);
    }
    refreshData();
  }, [refreshData]);

  const login = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const user = await authService.signIn(email, pass);
      const newSession = authService.getSession();
      setCurrentUser(user);
      setSession(newSession);
      storage.setCurrentUser(user);
      refreshData();
      showToast(`Welcome, ${user.name} (${user.role.replace(/_/g, ' ')})`, 'success');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(defaultFallbackUser);
      setSession(null);
      setActivePath('dashboard');
      showToast('You have been securely signed out.', 'info');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    return authService.requestPasswordReset(email);
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await authService.changePassword(currentPass, newPass);
  };

  const updateProfile = (updates: { name?: string; phone?: string; avatar_url?: string }) => {
    if (!currentUser) return;
    const updated = authService.updateProfile(currentUser, updates);
    setCurrentUser(updated);
  };

  /**
   * Blocked fake role switcher: warns that role elevation cannot be self-performed
   */
  const setCurrentRole = (role: UserRole) => {
    showToast(
      `Access Denied: Self-assignment of role '${role}' is prohibited by RBAC policy. Role changes must be provisioned by an Administrator.`,
      'error'
    );
  };

  const canAccess = useCallback(
    (route: string): boolean => {
      return rbac.canAccessRoute(currentUser, route);
    },
    [currentUser]
  );

  const canDo = useCallback(
    (action: PermissionAction, ctx?: AuthorizationContext) => {
      return rbac.canPerformAction(currentUser, action, ctx);
    },
    [currentUser]
  );

  const toggleOnlineMode = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        showToast('Online Mode Re-established. Syncing queued drafts...', 'success');
        setPendingSyncCount(0);
      } else {
        showToast('Switched to Offline Mode. Drafts will store in local IndexedDB.', 'warning');
        setPendingSyncCount((c) => c + 1);
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        session,
        isAuthenticated: Boolean(currentUser && session && session.expires_at > Date.now()),
        isAuthLoading,
        login,
        logout,
        requestPasswordReset,
        changePassword,
        updateProfile,
        setCurrentRole,
        canAccess,
        canDo,

        activePath,
        setActivePath,
        searchQuery,
        setSearchQuery,
        isOnline,
        toggleOnlineMode,
        pendingSyncCount,
        batches,
        movements,
        inwards,
        dispatches,
        challans,
        exceptions,
        refreshData,
        toast,
        showToast,
        hideToast,
        selectedBatchId,
        setSelectedBatchId,
        activeChallanToPrint,
        setActiveChallanToPrint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
