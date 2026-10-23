import React from 'react';
import { useApp, NavPath } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activePath,
    setActivePath,
    isOnline,
    toggleOnlineMode,
    pendingSyncCount,
    exceptions,
    currentUser,
    canAccess,
    logout,
  } = useApp();

  const pendingExceptionsCount = exceptions.filter((e) => e.status === 'PENDING_SIGN_OFF').length;

  const navItemClass = (path: NavPath) => {
    const isActive = activePath === path;
    if (isActive) {
      return 'flex items-center justify-between px-space-sm py-1.5 rounded-sm transition-colors bg-primary-container text-on-primary font-medium border-l-2 border-primary';
    }
    return 'flex items-center justify-between px-space-sm py-1.5 rounded-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm';
  };

  const isAllowed = (path: string) => canAccess(path);

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col">
        {/* Brand & Depot Header */}
        <div className="p-space-md border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold shadow-sm">
              भ
            </div>
            <div>
              <div className="font-title text-title text-primary tracking-tight leading-none">BhandarSetu</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-medium">भंडारसेतु • v2.4 SEC</div>
            </div>
          </div>
          <div className="mt-space-sm p-space-xs bg-surface-container border border-outline-variant rounded">
            <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span className="font-semibold text-primary uppercase truncate max-w-[150px]">
                {currentUser?.district_name || 'North Division'}
              </span>
              <span className="font-numeric-data text-numeric-data text-secondary font-medium">
                {currentUser?.godown_id || 'DEPOT #04'}
              </span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface font-medium truncate mt-0.5">
              {currentUser?.godown_name || 'Central Grain Store'}
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 py-space-sm space-y-space-xs">
          {/* Operations Menu */}
          <div className="px-space-md pt-space-xs pb-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Operations
          </div>
          <div className="px-space-xs space-y-0.5">
            <button
              onClick={() => setActivePath('dashboard')}
              className={`w-full text-left ${navItemClass('dashboard')}`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Dashboard</span>
              </div>
              <span className="font-numeric-data text-numeric-data text-outline">01</span>
            </button>

            {isAllowed('inventory-and-batches') && (
              <button
                onClick={() => setActivePath('inventory-and-batches')}
                className={`w-full text-left ${navItemClass('inventory-and-batches')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  <span>Inventory &amp; Batches</span>
                </div>
              </button>
            )}

            {isAllowed('stock-inward') && (
              <button
                onClick={() => setActivePath('stock-inward')}
                className={`w-full text-left ${navItemClass('stock-inward')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">move_to_inbox</span>
                  <span>Stock Inward</span>
                </div>
                <span className="px-1.5 py-0.2 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded border border-outline-variant">
                  Challan
                </span>
              </button>
            )}

            {isAllowed('quality-inspection') && (
              <button
                onClick={() => setActivePath('quality-inspection')}
                className={`w-full text-left ${navItemClass('quality-inspection')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Quality Inspection</span>
                </div>
                <span className="px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm rounded font-medium">
                  2 Pending
                </span>
              </button>
            )}

            {isAllowed('fps-dispatch-and-fifo') && (
              <button
                onClick={() => setActivePath('fps-dispatch-and-fifo')}
                className={`w-full text-left ${navItemClass('fps-dispatch-and-fifo')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">outbox</span>
                  <span>FPS Dispatch &amp; FIFO</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              </button>
            )}

            {isAllowed('delivery-challans') && (
              <button
                onClick={() => setActivePath('delivery-challans')}
                className={`w-full text-left ${navItemClass('delivery-challans')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>Delivery Challans</span>
                </div>
              </button>
            )}
          </div>

          {/* Control & Compliance Menu */}
          <div className="px-space-md pt-space-sm pb-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Control &amp; Compliance
          </div>
          <div className="px-space-xs space-y-0.5">
            {isAllowed('fifo-exceptions') && (
              <button
                onClick={() => setActivePath('fifo-exceptions')}
                className={`w-full text-left ${navItemClass('fifo-exceptions')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                  <span>FIFO Exceptions</span>
                </div>
                {pendingExceptionsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-error-container text-on-error-container font-label-sm text-label-sm rounded font-medium">
                    {pendingExceptionsCount} Action
                  </span>
                )}
              </button>
            )}

            {isAllowed('stock-movement-ledger') && (
              <button
                onClick={() => setActivePath('stock-movement-ledger')}
                className={`w-full text-left ${navItemClass('stock-movement-ledger')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span>Stock Movement Ledger</span>
                </div>
              </button>
            )}

            {isAllowed('reports-and-register') && (
              <button
                onClick={() => setActivePath('reports-and-register')}
                className={`w-full text-left ${navItemClass('reports-and-register')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">assignment</span>
                  <span>Reports &amp; Register</span>
                </div>
              </button>
            )}

            {isAllowed('audit-trail') && (
              <button
                onClick={() => setActivePath('audit-trail')}
                className={`w-full text-left ${navItemClass('audit-trail')}`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">history_edu</span>
                  <span>Audit Trail</span>
                </div>
              </button>
            )}
          </div>

          {/* Administration Menu (Restricted to Authorized Admins) */}
          {(currentUser?.role === 'PLATFORM_SUPER_ADMIN' || currentUser?.role === 'STATE_ADMIN') && (
            <>
              <div className="px-space-md pt-space-sm pb-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Administration
              </div>
              <div className="px-space-xs space-y-0.5">
                <button
                  onClick={() => setActivePath('users')}
                  className={`w-full text-left ${navItemClass('users')}`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    <span>Staff &amp; Role Control</span>
                  </div>
                  <span className="px-1.5 py-0.2 bg-primary/10 text-primary font-mono text-[10px] rounded font-semibold">
                    Admin
                  </span>
                </button>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Footer Offline / Sync Status Card & Actions */}
      <div className="p-space-sm border-t border-outline-variant bg-surface-container">
        <div
          onClick={toggleOnlineMode}
          title="Click to toggle Online / Offline PWA mode"
          className="flex items-center justify-between p-space-xs rounded bg-surface-container-lowest border border-outline-variant mb-space-xs cursor-pointer hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-center gap-space-xs">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-secondary animate-ping'}`} />
            <span className="font-label-sm text-label-sm font-medium text-on-surface">
              {isOnline ? 'Online Mode' : 'Offline Mode (Local IDB)'}
            </span>
          </div>
          <span className="font-numeric-data text-numeric-data text-outline text-[11px]">
            {isOnline ? 'Local Cache OK' : `${pendingSyncCount} Sync Pending`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setActivePath('settings')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-on-surface-variant hover:text-error font-body-sm text-body-sm transition-colors"
            title="Sign out of BhandarSetu"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
