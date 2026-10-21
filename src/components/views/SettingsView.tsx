import React from 'react';
import { useApp } from '../../context/AppContext';
import { storage, COMMODITIES } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const { currentUser, showToast, refreshData, isOnline, toggleOnlineMode } = useApp();

  const handleResetData = () => {
    if (window.confirm('Reset all batches, challans, dispatches, and movements to default demonstration state?')) {
      storage.resetToSeedData();
      refreshData();
      showToast('System data successfully reset to official factory demonstration state!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              DEPOT MASTER CONFIGURATION • SECTION 13
            </span>
            <span className="text-xs bg-[#e8f0e9] text-[#214e3d] font-semibold px-2 py-0.5 rounded border border-[#214e3d]/30">
              PDS Rule 14-B Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            Depot Settings & Operational Parameters
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Configure godown physical shed allocations, Rule 14-B FIFO thresholds, quality standards, and offline PWA synchronization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Godown Master Data */}
        <div className="bg-white rounded-lg border border-[#e3e2d9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e3e2d9] pb-2">
            <span className="material-symbols-outlined text-[#214e3d]">warehouse</span>
            <h3 className="text-sm font-bold text-[#252d29] uppercase tracking-wider">
              Godown Depot Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">Godown / Depot Name</p>
              <p className="font-bold text-[#252d29] mt-0.5">{currentUser.godown_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">Depot Code</p>
              <p className="font-mono font-bold text-[#214e3d] mt-0.5">{currentUser.godown_id}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">Division / Zone</p>
              <p className="text-[#252d29] mt-0.5">{currentUser.district_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">State Department</p>
              <p className="text-[#252d29] mt-0.5">Delhi Civil Supplies & Consumer Affairs ({currentUser.state_code})</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">Total Storage Capacity</p>
              <p className="font-mono font-bold text-[#252d29] mt-0.5">50,000 Qtl (5,000 MT)</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#69736b]">Weighbridge Scales</p>
              <p className="font-mono text-[#252d29] mt-0.5">WB-01 (Gate 1), WB-02 (Gate 2)</p>
            </div>
          </div>

          <div className="bg-[#f6f5f0] p-3 rounded border border-[#e3e2d9] text-xs">
            <p className="text-[10px] font-mono uppercase font-bold text-[#69736b]">Active Godown Sheds:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#252d29]">
              <li><span className="font-semibold">Shed 01</span>: Wheat (Grade A - Sharbati) & Buffer Reserve (20,000 Qtl)</li>
              <li><span className="font-semibold">Shed 02</span>: Rice (Fortified Sona Masoori & Parboiled) (16,000 Qtl)</li>
              <li><span className="font-semibold">Shed 03</span>: Pulses & Refined Sugar (8,000 Qtl)</li>
              <li><span className="font-semibold">Shed 04</span>: Consignment Intake Platform & Weighbridge Staging (6,000 Qtl)</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Rule 14-B FIFO Configuration */}
        <div className="bg-white rounded-lg border border-[#e3e2d9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e3e2d9] pb-2">
            <span className="material-symbols-outlined text-[#214e3d]">rule</span>
            <h3 className="text-sm font-bold text-[#252d29] uppercase tracking-wider">
              Rule 14-B FIFO Allocation Rules
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#f6f5f0] rounded border border-[#e3e2d9]">
              <div>
                <p className="font-bold text-[#252d29]">Strict Monotonic FIFO</p>
                <p className="text-[11px] text-[#69736b]">Mandatory chronological liquidation under NFSA Section 12(2)</p>
              </div>
              <span className="bg-[#e8f0e9] text-[#214e3d] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                ENFORCED
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#f6f5f0] rounded border border-[#e3e2d9]">
              <div>
                <p className="font-bold text-[#252d29]">Deterministic Tie-Breaking Algorithm</p>
                <p className="text-[11px] text-[#69736b]">Intake Timestamp ASC → Internal Batch Identifier ASC</p>
              </div>
              <span className="bg-white text-[#252d29] text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-[#e3e2d9]">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#69736b] block">Ageing Alert Threshold</label>
                <input
                  type="text"
                  readOnly
                  value="60 Days (Warning)"
                  className="w-full bg-[#f6f5f0] border border-[#e3e2d9] rounded p-1.5 font-mono text-xs text-[#9b641b] font-semibold mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#69736b] block">Mandatory Liquidation Threshold</label>
                <input
                  type="text"
                  readOnly
                  value="80 Days (Critical)"
                  className="w-full bg-[#f6f5f0] border border-[#e3e2d9] rounded p-1.5 font-mono text-xs text-[#a43f36] font-semibold mt-0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Permissible Quality Limits */}
        <div className="bg-white rounded-lg border border-[#e3e2d9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e3e2d9] pb-2">
            <span className="material-symbols-outlined text-[#214e3d]">biotech</span>
            <h3 className="text-sm font-bold text-[#252d29] uppercase tracking-wider">
              NABL / FCI Quality Refraction Limits
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {COMMODITIES.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-[#f6f5f0] rounded border border-[#e3e2d9]">
                <div>
                  <p className="font-semibold text-[#252d29]">{c.name}</p>
                  <p className="text-[10px] text-[#69736b]">{c.specification}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#214e3d]">Max {c.max_safe_moisture_pct}% Moisture</span>
                  <p className="text-[10px] text-[#69736b]">Age Limit: {c.critical_age_days} Days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: PWA Offline & Data Management */}
        <div className="bg-white rounded-lg border border-[#e3e2d9] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e3e2d9] pb-2">
            <span className="material-symbols-outlined text-[#214e3d]">cloud_sync</span>
            <h3 className="text-sm font-bold text-[#252d29] uppercase tracking-wider">
              PWA Offline & Data Management
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#f6f5f0] rounded border border-[#e3e2d9]">
              <div>
                <p className="font-bold text-[#252d29]">Network Mode</p>
                <p className="text-[11px] text-[#69736b]">
                  {isOnline ? 'Online (Authoritative Storage Sync)' : 'Offline (Local IndexedDB Cache)'}
                </p>
              </div>
              <button
                onClick={toggleOnlineMode}
                className={`px-3 py-1 text-xs font-semibold rounded transition ${
                  isOnline
                    ? 'bg-[#e8f0e9] text-[#214e3d] border border-[#214e3d]/30'
                    : 'bg-[#fef3c7] text-[#9b641b] border border-[#f59e0b]/40'
                }`}
              >
                {isOnline ? '● Online Mode' : '○ Offline Mode'}
              </button>
            </div>

            <div className="p-3 bg-[#fffdf8] rounded border border-[#b48643]/30">
              <p className="font-bold text-[#9b641b]">Factory Seed Demonstration Data</p>
              <p className="text-[11px] text-[#69736b] mt-0.5">
                Reset batches, dispatches, inward consignments, and movements back to the initial reference state.
              </p>
              <button
                onClick={handleResetData}
                className="mt-3 px-3 py-1.5 bg-[#a43f36] text-white text-xs font-semibold rounded hover:bg-[#852f27] transition shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset to Demonstration Seed State
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
