import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  StockBatch,
  StockMovement,
  StockInwardConsignment,
  FPSDispatchRequisition,
  DeliveryChallan,
  FIFOExceptionRecord,
} from '../types';
import { storage } from '../services/storage';

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
  | 'settings';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentRole: (role: UserRole) => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(storage.getCurrentUser());
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

  const refreshData = () => {
    setBatches(storage.getBatches());
    setMovements(storage.getMovements());
    setInwards(storage.getInwards());
    setDispatches(storage.getDispatches());
    setChallans(storage.getChallans());
    setExceptions(storage.getExceptions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const setCurrentRole = (role: UserRole) => {
    let roleName = 'R. Sharma';
    let badge = 'DL-FCS-4491';

    if (role === 'QUALITY_INSPECTOR') {
      roleName = 'Inspector Verma';
      badge = 'DL-QC-8812';
    } else if (role === 'DISTRICT_SUPPLY_OFFICER') {
      roleName = 'A. K. Mathur';
      badge = 'DL-DSO-0104';
    } else if (role === 'STOCK_INWARD_OPERATOR') {
      roleName = 'P. Rawat';
      badge = 'DL-OPS-3301';
    } else if (role === 'DISPATCH_OPERATOR') {
      roleName = 'M. Singh';
      badge = 'DL-DISP-2219';
    } else if (role === 'AUDITOR') {
      roleName = 'S. Chawla';
      badge = 'DL-AUD-9901';
    } else if (role === 'PLATFORM_SUPER_ADMIN') {
      roleName = 'Director Admin';
      badge = 'HQ-ADM-0001';
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      role,
      name: roleName,
      badge_no: badge,
    };
    storage.setCurrentUser(updatedUser);
    setCurrentUserState(updatedUser);
    showToast(`Switched active persona to ${role.replace(/_/g, ' ')} (${roleName})`, 'info');
  };

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

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentRole,
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
