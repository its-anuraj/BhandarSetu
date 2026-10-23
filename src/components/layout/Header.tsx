import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfileModal } from '../auth/UserProfileModal';

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, searchQuery, setSearchQuery, isOnline, logout, setActivePath } = useApp();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!currentUser) return null;

  const roleDisplayNames: Record<string, string> = {
    PLATFORM_SUPER_ADMIN: 'Platform Super Admin',
    STATE_ADMIN: 'State Administrator',
    DISTRICT_SUPPLY_OFFICER: 'District Supply Officer',
    GODOWN_MANAGER: 'Godown Manager',
    STOCK_INWARD_OPERATOR: 'Stock Inward Operator',
    QUALITY_INSPECTOR: 'Quality Inspector',
    DISPATCH_OPERATOR: 'Dispatch Operator',
    AUTHORIZED_APPROVER: 'Authorized Approver',
    AUDITOR: 'Auditor / Inspector',
    FPS_RECIPIENT: 'FPS Recipient',
  };

  const humanRole = roleDisplayNames[currentUser.role] || currentUser.role.replace(/_/g, ' ');

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-space-md shadow-[0_1px_2px_rgba(37,45,41,0.04)] select-none">
        {/* Depot Breadcrumb & Status */}
        <div className="flex items-center gap-space-md">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded"
              title="Open navigation menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
          )}
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Depot</span>
            <span className="text-outline">/</span>
            <span className="font-semibold text-on-surface truncate max-w-[160px] sm:max-w-none">
              {currentUser.godown_name}
            </span>
            <span className="font-numeric-data text-numeric-data text-outline hidden sm:inline">
              ({currentUser.godown_id})
            </span>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 px-space-xs py-0.5 rounded border border-outline-variant bg-surface-container font-label-sm text-label-sm text-primary">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-secondary'}`} />
            <span>{isOnline ? 'Connected • Local Cache Sync OK' : 'Offline Storage Active'}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-space-md">
          {/* Verified Official Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded font-body-sm text-xs text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span className="font-semibold text-primary">{humanRole}</span>
          </div>

          {/* Date Pill */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-surface-container-low border border-outline-variant rounded font-numeric-data text-numeric-data text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
            <span>21 Oct 2026</span>
          </div>

          {/* Global Search Input */}
          <div className="relative hidden sm:flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-[18px] text-outline">search</span>
            <input
              className="h-8 pl-8 pr-8 w-48 lg:w-60 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Search Batch, Truck, FPS..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="absolute right-2 px-1 py-0.2 bg-surface-container border border-outline-variant rounded font-numeric-data text-[10px] text-outline">
              /
            </kbd>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationModal(!showNotificationModal)}
              className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
              title="Departmental Alerts"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-numeric-data text-[10px] rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {showNotificationModal && (
              <div className="absolute right-0 mt-1 w-80 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg p-3 z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-outline-variant pb-1.5">
                  <span className="font-title text-sm text-on-surface">Depot Alerts (3 Active)</span>
                  <span className="font-label-sm text-xs text-error font-semibold">Priority P1</span>
                </div>
                <div className="text-xs space-y-2 max-h-64 overflow-y-auto pt-1">
                  <div className="p-2 rounded bg-error-container/30 border border-error/20">
                    <div className="font-semibold text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Quality Hold: Batch W-103
                    </div>
                    <div className="text-on-surface-variant mt-0.5 text-[11px]">
                      Moisture 13.8% exceeds 12.0% maximum threshold.
                    </div>
                  </div>
                  <div className="p-2 rounded bg-secondary-container/30 border border-secondary/20">
                    <div className="font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">priority_high</span> FIFO Ageing: Batch W-094
                    </div>
                    <div className="text-on-surface-variant mt-0.5 text-[11px]">
                      83 days in storage. Requires mandatory priority clearance.
                    </div>
                  </div>
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <div className="font-semibold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> Gate Arrival: HR-38-AF-9921
                    </div>
                    <div className="text-on-surface-variant mt-0.5 text-[11px]">
                      24 MT Rice unladen at Platform 2. Tare weighment pending.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-outline-variant" />

          {/* Authenticated User Account Menu (Replaces Fake Role Switcher) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded hover:bg-surface-container transition-colors text-left"
              title="Official Account &amp; Jurisdiction Menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center border border-outline-variant text-xs shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="font-title text-[13px] text-on-surface font-semibold truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="font-numeric-data text-numeric-data text-outline text-[11px]">
                  {currentUser.badge_no}
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline">expand_more</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-2 z-50 animate-fadeIn">
                {/* User Identity Header */}
                <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low">
                  <div className="font-semibold text-sm text-on-surface">{currentUser.name}</div>
                  <div className="text-xs text-outline font-mono truncate">{currentUser.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">
                    {currentUser.godown_name} ({currentUser.godown_id})
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-outline">manage_accounts</span>
                    <span>My Profile &amp; Security</span>
                  </button>

                  {(currentUser.role === 'PLATFORM_SUPER_ADMIN' || currentUser.role === 'STATE_ADMIN') && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActivePath('users');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors font-medium text-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <span>Staff &amp; Role Management</span>
                    </button>
                  )}
                </div>

                {/* Sign Out */}
                <div className="border-t border-outline-variant pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error-container/30 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px] text-error">logout</span>
                    <span>Sign Out of BhandarSetu</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile & Password Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
