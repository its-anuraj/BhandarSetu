import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../common/Toast';
import { PrintChallanModal } from '../common/PrintChallanModal';
import { LoginView } from '../auth/LoginView';
import { UnauthorizedView } from '../auth/UnauthorizedView';

// Views
import { DashboardView } from '../views/DashboardView';
import { InventoryBatchView } from '../views/InventoryBatchView';
import { StockInwardView } from '../views/StockInwardView';
import { QualityInspectionView } from '../views/QualityInspectionView';
import { FIFOAllocationView } from '../views/FIFOAllocationView';
import { DeliveryChallansView } from '../views/DeliveryChallansView';
import { FIFOExceptionsView } from '../views/FIFOExceptionsView';
import { StockLedgerView } from '../views/StockLedgerView';
import { ReportsView } from '../views/ReportsView';
import { AuditTrailView } from '../views/AuditTrailView';
import { UserManagementView } from '../views/UserManagementView';
import { SettingsView } from '../views/SettingsView';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isAuthLoading, activePath, canAccess } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Loading state during session rehydration
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-bold text-xl flex items-center justify-center shadow-md animate-pulse">
          भ
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-outline">
          <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Verifying BhandarSetu Session &amp; Statutory Scopes...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated visitors are directed to LoginView
  if (!isAuthenticated) {
    return (
      <>
        <Toast />
        <LoginView />
      </>
    );
  }

  // 3. Render Active View with RBAC Route Guard
  const renderActiveView = () => {
    // Route-level authorization check
    if (!canAccess(activePath)) {
      return <UnauthorizedView attemptedPath={activePath} />;
    }

    switch (activePath) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory-and-batches':
        return <InventoryBatchView />;
      case 'stock-inward':
        return <StockInwardView />;
      case 'quality-inspection':
        return <QualityInspectionView />;
      case 'fps-dispatch-and-fifo':
        return <FIFOAllocationView />;
      case 'delivery-challans':
        return <DeliveryChallansView />;
      case 'fifo-exceptions':
        return <FIFOExceptionsView />;
      case 'stock-movement-ledger':
        return <StockLedgerView />;
      case 'reports-and-register':
        return <ReportsView />;
      case 'audit-trail':
        return <AuditTrailView />;
      case 'users':
        return <UserManagementView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased select-auto">
      {/* Toast Notification Container */}
      <Toast />

      {/* Printable Challan Modal */}
      <PrintChallanModal />

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-surface-container-low h-full shadow-2xl flex flex-col z-50">
            <div className="p-3 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-primary">BhandarSetu Operations</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area offset by Sidebar & Header */}
      <div className="pl-0 lg:pl-72 min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

        {/* Scrollable View Content */}
        <main className="relative pt-16 bg-background min-h-screen flex-1 p-space-md lg:p-margin-desktop">
          <div className="max-w-[1400px] mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};
