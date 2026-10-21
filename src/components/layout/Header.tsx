import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, setCurrentRole, searchQuery, setSearchQuery, isOnline } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'GODOWN_MANAGER', label: 'Godown Manager', desc: 'Full depot operations & floor management' },
    { role: 'DISTRICT_SUPPLY_OFFICER', label: 'District Supply Officer (DSO)', desc: 'District oversight & high-tier approvals' },
    { role: 'QUALITY_INSPECTOR', label: 'Quality Inspector', desc: 'Moisture testing & laboratory locks' },
    { role: 'STOCK_INWARD_OPERATOR', label: 'Stock Inward Operator', desc: 'Truck arrivals & weighbridge entry' },
    { role: 'DISPATCH_OPERATOR', label: 'Dispatch Operator', desc: 'FPS requisitions & FIFO execution' },
    { role: 'AUTHORIZED_APPROVER', label: 'Authorized Approver', desc: 'Dual-sign-off & exception review' },
    { role: 'AUDITOR', label: 'Auditor / Inspector', desc: 'Read-only ledger & variance inspection' },
    { role: 'PLATFORM_SUPER_ADMIN', label: 'Platform Super Admin', desc: 'System configuration & tenant setup' },
  ];

  return (
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
          <span className="font-semibold text-on-surface">Central Grain Store — Demo</span>
          <span className="font-numeric-data text-numeric-data text-outline hidden sm:inline">(WH-DEL-04)</span>
        </div>
        <div className="hidden xl:flex items-center gap-1.5 px-space-xs py-0.5 rounded border border-outline-variant bg-surface-container font-label-sm text-label-sm text-primary">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></span>
          <span>{isOnline ? 'Connected • Local Cache Sync OK' : 'Offline Storage Active'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        {/* Date Pill */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-surface-container-low border border-outline-variant rounded font-numeric-data text-numeric-data text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
          <span>21 Oct 2026</span>
        </div>

        {/* Global Search Input */}
        <div className="relative hidden sm:flex items-center">
          <span className="material-symbols-outlined absolute left-2 text-[18px] text-outline">search</span>
          <input
            className="h-8 pl-8 pr-8 w-60 bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="Search Batch, Truck, FPS Code..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="absolute right-2 px-1 py-0.2 bg-surface-container border border-outline-variant rounded font-numeric-data text-[10px] text-outline">
            /
          </kbd>
        </div>

        {/* Dynamic Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center border border-outline-variant rounded bg-surface-container-low px-2 py-1 gap-1 text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors"
            title="Switch Persona to test role-specific workflows & permissions"
          >
            <span className="text-on-surface-variant font-label-sm text-label-sm">Role:</span>
            <span className="font-semibold text-primary truncate max-w-[150px]">
              {rolesList.find((r) => r.role === currentUser.role)?.label.split('(')[0] || currentUser.role}
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1 w-72 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 border-b border-outline-variant bg-surface-container font-label-sm text-label-sm font-semibold uppercase text-outline">
                Test Role-Based Permissions
              </div>
              <div className="max-h-80 overflow-y-auto">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-container-high transition-colors ${
                      currentUser.role === item.role ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'
                    }`}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-[11px] text-outline mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
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

        <div className="h-6 w-px bg-outline-variant"></div>

        {/* User Profile Information */}
        <div className="flex items-center gap-space-xs">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center border border-outline-variant text-xs shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="font-title text-[13px] text-on-surface font-semibold truncate max-w-[140px]">
              {currentUser.name}
            </div>
            <div className="font-numeric-data text-numeric-data text-outline text-[11px]">{currentUser.badge_no}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
