import React from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

export const DashboardView: React.FC = () => {
  const { setActivePath, batches, movements, exceptions, refreshData, showToast, currentUser } = useApp();

  // Calculate dynamic tallies from batches
  const totalUsableQtl = batches
    .filter((b) => b.quality_status === 'ELIGIBLE')
    .reduce((sum, b) => sum + Math.max(0, b.on_hand_qtl - b.reserved_qtl), 0) + 29200; // Baseline godown pool

  const totalReservedQtl = batches.reduce((sum, b) => sum + b.reserved_qtl, 0) + 4800;
  const totalHoldQtl = batches
    .filter((b) => b.quality_status === 'QUALITY_HOLD')
    .reduce((sum, b) => sum + b.on_hand_qtl, 0) + 850;

  const totalPhysicalStoredQtl = totalUsableQtl + totalReservedQtl + totalHoldQtl;

  const handleAuthorizeException = (exceptionId: string) => {
    const success = storage.authorizeException(exceptionId, currentUser);
    if (success) {
      showToast('FIFO Exception #FPS-2048-CHAL Approved. Stack bypass authorized under Rule 14-B.', 'success');
      refreshData();
    }
  };

  const handleRejectException = (exceptionId: string) => {
    const success = storage.rejectException(exceptionId, currentUser, 'Bypass rejected. Enforce chronological FIFO on Stack W-101.');
    if (success) {
      showToast('FIFO Exception Rejected. Primary stack W-101 enforced.', 'warning');
      refreshData();
    }
  };

  const handleDispatchCommodity = (commodity: string) => {
    setActivePath('fps-dispatch-and-fifo');
    showToast(`Initiating FIFO Dispatch Planner for ${commodity}...`, 'info');
  };

  const pendingExceptions = exceptions.filter((e) => e.status === 'PENDING_SIGN_OFF');

  return (
    <div className="flex flex-col w-full">
      {/* Operational Sub-Header & Live Status Banner */}
      <div className="px-margin-desktop py-space-md bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-outline-variant">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            <span>खाता संख्या • KHATA-2026/Q3</span>
            <span>•</span>
            <span className="text-primary font-bold">DEPOT WH-DEL-04</span>
            <span>•</span>
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">FCI LINKED</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
            Godown Overview &amp; Daily Balance
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Live batch allocations, FIFO queue status, and pending movements for 4 scheduled commodities.
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-1.5 bg-surface-container px-space-sm py-1.5 rounded text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
            <span className="font-semibold text-on-surface">Today</span>
            <span className="font-numeric-data text-numeric-data text-outline">(21 Oct 2026)</span>
          </div>
          <button
            onClick={() => {
              setActivePath('reports-and-register');
              showToast('Opening Statutory PDS Registers...', 'info');
            }}
            className="flex items-center gap-1.5 bg-surface-container-lowest text-on-surface px-space-sm py-1.5 rounded shadow-sm hover:bg-surface-container font-label-md text-label-md transition-colors border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export Register (PDF/CSV)</span>
          </button>
          <button
            onClick={() => setActivePath('fps-dispatch-and-fifo')}
            className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-space-sm py-1.5 rounded font-label-md text-label-md font-semibold hover:bg-secondary-fixed transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span>Create FPS Dispatch</span>
          </button>
          <button
            onClick={() => setActivePath('stock-inward')}
            className="flex items-center gap-1.5 bg-primary text-on-primary px-space-md py-1.5 rounded font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ New Inward Receipt</span>
          </button>
        </div>
      </div>

      <div className="px-margin-desktop py-space-md space-y-space-md">
        {/* KPI Section: 6 Compact Ledger Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-sm">
          {/* Metric 1: Usable Stock */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">
                Total Usable Stock
              </span>
              <span className="w-2 h-2 rounded-full bg-primary" title="Status: Normal verified"></span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {totalUsableQtl.toLocaleString()}
                </span>
                <span className="font-label-md text-label-md text-outline font-semibold">Qtl</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-outline font-medium">
                ({(totalUsableQtl / 10).toFixed(1)} MT)
              </div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-surface-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> 48 active batches
              </span>
            </div>
          </div>

          {/* Metric 2: Reserved for FPS */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary-container"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">
                Reserved FPS Stock
              </span>
              <span className="w-2 h-2 rounded-full bg-secondary" title="Pending vehicle matching"></span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {totalReservedQtl.toLocaleString()}
                </span>
                <span className="font-label-md text-label-md text-outline font-semibold">Qtl</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-outline font-medium">
                ({(totalReservedQtl / 10).toFixed(1)} MT)
              </div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-surface-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pending_actions</span> 6 challans pending release
              </span>
            </div>
          </div>

          {/* Metric 3: Quality Hold */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-error"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">
                Under Inspection Hold
              </span>
              <span className="w-2 h-2 rounded-full bg-error" title="Locked by Lab"></span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-error">
                  {totalHoldQtl.toLocaleString()}
                </span>
                <span className="font-label-md text-label-md text-outline font-semibold">Qtl</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-outline font-medium">
                ({(totalHoldQtl / 10).toFixed(1)} MT)
              </div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-surface-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-error font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span> 3 batches locked by Lab
              </span>
            </div>
          </div>

          {/* Metric 4: Pending Inward Gate */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-outline"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">
                Gate Inward Receipts
              </span>
              <span className="w-2 h-2 rounded-full bg-tertiary" title="Active gate traffic"></span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">850</span>
                <span className="font-label-md text-label-md text-outline font-semibold">Qtl</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-outline font-medium">(2 Gate Slips)</div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-surface-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">scale</span> Gate #2 Weighment pend.
              </span>
            </div>
          </div>

          {/* Metric 5: FPS Dispatch Status */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">
                FPS Dispatch Status
              </span>
              <span className="w-2 h-2 rounded-full bg-primary" title="On schedule"></span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">9 Trips</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-outline font-medium">Scheduled Today</div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-surface-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-outline-variant/40">
              <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">local_shipping</span> 3 in transit • 6 loading
              </span>
            </div>
          </div>

          {/* Metric 6: Ageing Alert */}
          <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between relative overflow-hidden border border-secondary">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wide text-secondary font-bold">
                FIFO Ageing Alert
              </span>
              <span className="material-symbols-outlined text-[16px] text-secondary">priority_high</span>
            </div>
            <div className="pl-1.5 mt-space-xs">
              <div className="flex items-baseline gap-1">
                <span className="font-title text-title font-bold text-on-surface">Batch W-094</span>
              </div>
              <div className="font-numeric-data text-numeric-data text-secondary font-semibold">
                Wheat • 83 Days Old
              </div>
            </div>
            <div className="pl-1.5 pt-space-xs mt-space-xs bg-secondary-container/40 -mx-space-sm -mb-space-sm px-space-sm py-1 border-t border-secondary/30">
              <span className="font-label-sm text-label-sm text-on-secondary-container font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span> Mandatory clearance
              </span>
            </div>
          </div>
        </div>

        {/* Sensor & Telemetry Strip */}
        <div className="px-space-md py-space-xs rounded bg-surface-container-lowest border border-outline-variant flex flex-wrap items-center justify-between gap-space-sm text-xs shadow-sm">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-bold text-on-surface flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Godown Environment Sensors:
            </span>
            <span className="text-on-surface-variant">
              Avg Ambient Temp: <span className="font-numeric-data font-semibold text-primary">24.2°C</span>
            </span>
            <span className="text-on-surface-variant">
              Relative Humidity: <span className="font-numeric-data font-semibold text-primary">58% (Within Safe Limit)</span>
            </span>
            <span className="text-on-surface-variant">
              Active Godown Sheds: <span className="font-semibold text-on-surface">Shed-01, 02, 04 Operational</span>
            </span>
          </div>
          <div className="text-outline font-numeric-data">Last sensor tally: 11:00 AM (12 min ago)</div>
        </div>

        {/* Commodity Stock & FIFO Priority Register Table */}
        <div className="bg-surface-container-lowest rounded border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-outline-variant flex flex-wrap items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">table_chart</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Commodity Stock &amp; FIFO Priority Register
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Strict compliance with Departmental FIFO Dispatch Norms (Rule 14-B). Oldest eligible batch must be liquidated first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase font-semibold text-outline">Auto-Allocation:</span>
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold tracking-wide">
                • FIFO ENFORCED
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container text-outline font-label-sm text-[11px] uppercase tracking-wider border-b border-outline-variant font-semibold">
                  <th className="p-space-sm pl-space-md">Commodity Specification</th>
                  <th className="p-space-sm text-right">Usable Stock</th>
                  <th className="p-space-sm text-right">Reserved (FPS)</th>
                  <th className="p-space-sm text-right">On Hold</th>
                  <th className="p-space-sm text-right">Total Physical</th>
                  <th className="p-space-sm">Oldest Eligible Batch</th>
                  <th className="p-space-sm text-center">Batch Age</th>
                  <th className="p-space-sm">FIFO Priority Queue</th>
                  <th className="p-space-sm text-center pr-space-md">Ledger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {/* Wheat */}
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="p-space-sm pl-space-md">
                    <div className="font-title text-sm text-on-surface font-semibold">Wheat (Grade A - Sharbati)</div>
                    <div className="text-outline text-[11px]">Standard Burlap Jute Bags (50kg) • MSP ₹2,275/Qtl</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">14,200.00 Qtl</td>
                  <td className="p-space-sm text-right font-numeric-metric text-secondary font-medium">2,100.00 Qtl</td>
                  <td className="p-space-sm text-right">
                    <div className="font-numeric-metric font-bold text-error">600.00 Qtl</div>
                    <div className="text-[10px] text-error font-medium">[Batch W-103 Hold]</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-bold text-on-surface">16,900.00 Qtl</td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-numeric-data text-xs font-bold">W-101</span>
                      <span className="text-[11px] text-on-surface-variant font-numeric-data">(Stack 04-A)</span>
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Rec: 01 Oct 2026 • 2,400 Qtl Bal</div>
                  </td>
                  <td className="p-space-sm text-center">
                    <span className="px-2 py-1 rounded bg-surface-container text-primary font-numeric-data font-bold text-xs">
                      20 Days
                    </span>
                  </td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1 font-semibold text-primary text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      FIFO ACTIVE [W-101 FIRST]
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Next in queue: Batch W-102</div>
                  </td>
                  <td className="p-space-sm text-center pr-space-md">
                    <button
                      onClick={() => handleDispatchCommodity('Wheat')}
                      className="px-3 py-1 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Dispatch Wheat
                    </button>
                  </td>
                </tr>

                {/* Rice */}
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="p-space-sm pl-space-md">
                    <div className="font-title text-sm text-on-surface font-semibold">Rice (Fortified Sona Masoori)</div>
                    <div className="text-outline text-[11px]">HDPE Woven Sacks • FRK Blended 1:100 Ratio</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">11,500.00 Qtl</td>
                  <td className="p-space-sm text-right font-numeric-metric text-secondary font-medium">1,800.00 Qtl</td>
                  <td className="p-space-sm text-right">
                    <div className="font-numeric-metric font-bold text-error">450.00 Qtl</div>
                    <div className="text-[10px] text-error font-medium">[Batch R-088 Hold]</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-bold text-on-surface">13,750.00 Qtl</td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-numeric-data text-xs font-bold">R-079</span>
                      <span className="text-[11px] text-on-surface-variant font-numeric-data">(Stack 02-C)</span>
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Rec: 18 Sep 2026 • 1,200 Qtl Bal</div>
                  </td>
                  <td className="p-space-sm text-center">
                    <span className="px-2 py-1 rounded bg-surface-container text-primary font-numeric-data font-bold text-xs">
                      33 Days
                    </span>
                  </td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1 font-semibold text-primary text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      FIFO ACTIVE
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Next in queue: Batch R-081</div>
                  </td>
                  <td className="p-space-sm text-center pr-space-md">
                    <button
                      onClick={() => handleDispatchCommodity('Rice')}
                      className="px-3 py-1 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Dispatch Rice
                    </button>
                  </td>
                </tr>

                {/* Sugar */}
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="p-space-sm pl-space-md">
                    <div className="font-title text-sm text-on-surface font-semibold">Sugar (Refined S-30)</div>
                    <div className="text-outline text-[11px]">50kg Polylined Bags • Moisture Guard Sealed</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">4,800.00 Qtl</td>
                  <td className="p-space-sm text-right font-numeric-metric text-secondary font-medium">500.00 Qtl</td>
                  <td className="p-space-sm text-right">
                    <div className="font-numeric-metric font-medium text-outline">0.00 Qtl</div>
                    <div className="text-[10px] text-primary font-medium">Clean Record</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-bold text-on-surface">5,300.00 Qtl</td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-numeric-data text-xs font-bold">S-042</span>
                      <span className="text-[11px] text-on-surface-variant font-numeric-data">(Stack 01-A)</span>
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Rec: 28 Aug 2026 • 880 Qtl Bal</div>
                  </td>
                  <td className="p-space-sm text-center">
                    <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-numeric-data font-bold text-xs">
                      54 Days
                    </span>
                  </td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1 font-semibold text-primary text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      FIFO ACTIVE
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Next in queue: Batch S-045</div>
                  </td>
                  <td className="p-space-sm text-center pr-space-md">
                    <button
                      onClick={() => handleDispatchCommodity('Sugar')}
                      className="px-3 py-1 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Dispatch Sugar
                    </button>
                  </td>
                </tr>

                {/* Chana */}
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="p-space-sm pl-space-md">
                    <div className="font-title text-sm text-on-surface font-semibold">Chana Whole (Desi Chickpeas)</div>
                    <div className="text-outline text-[11px]">Standard Burlap Jute Bags • Fumigated Safe</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">3,750.00 Qtl</td>
                  <td className="p-space-sm text-right font-numeric-metric text-secondary font-medium">400.00 Qtl</td>
                  <td className="p-space-sm text-right">
                    <div className="font-numeric-metric font-bold text-error">400.00 Qtl</div>
                    <div className="text-[10px] text-error font-medium">[Batch C-019 Hold]</div>
                  </td>
                  <td className="p-space-sm text-right font-numeric-metric font-bold text-on-surface">4,550.00 Qtl</td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-numeric-data text-xs font-bold">C-012</span>
                      <span className="text-[11px] text-on-surface-variant font-numeric-data">(Stack 03-D)</span>
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Rec: 12 Aug 2026 • 550 Qtl Bal</div>
                  </td>
                  <td className="p-space-sm text-center">
                    <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-numeric-data font-bold text-xs">
                      70 Days
                    </span>
                  </td>
                  <td className="p-space-sm">
                    <div className="flex items-center gap-1 font-semibold text-secondary text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      ATTENTION (AGEING)
                    </div>
                    <div className="text-[10px] text-outline mt-0.5 font-numeric-data">Target liquidation by 30 Oct</div>
                  </td>
                  <td className="p-space-sm text-center pr-space-md">
                    <button
                      onClick={() => handleDispatchCommodity('Chana')}
                      className="px-3 py-1 rounded bg-secondary text-on-secondary font-label-md text-xs font-semibold hover:bg-secondary-fixed-variant transition-colors shadow-sm"
                    >
                      Dispatch Chana
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-space-sm bg-surface-container flex flex-wrap items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> Usable Stock: 34,250 Qtl
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary-container"></span> Reserved: 4,800 Qtl
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-error"></span> Quality Holds: 1,450 Qtl
              </span>
            </div>
            <div className="font-numeric-data font-semibold text-on-surface">
              Depot Aggregate: {totalPhysicalStoredQtl.toLocaleString()} Qtl ({(totalPhysicalStoredQtl / 10).toFixed(1)} MT) Physical Stored
            </div>
          </div>
        </div>

        {/* Lower Split Sections: Urgent Action (Col 8) & Live Feed / Occupancy (Col 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* Left Column: Urgent Actions & Quality Holds (Col 8) */}
          <div className="lg:col-span-8 space-y-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Urgent Action Required &amp; Quality Holds
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                3 Active Flags
              </span>
            </div>

            {/* Quality Hold Notice Card */}
            <div className="p-space-md rounded bg-surface-container-lowest border-l-4 border-l-error border border-outline-variant shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[22px]">lock</span>
                  <div>
                    <span className="font-title text-sm text-on-surface font-bold">Quality Hold Notice: Batch W-103</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-numeric-data font-semibold text-xs">
                      600 Qtl Wheat
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-[11px] font-bold tracking-wider uppercase">
                  LOCKED
                </span>
              </div>
              <div className="text-xs text-on-surface-variant font-numeric-data">
                Godown Shed 04 • Stack 04-B • Sealed by Inspector Verma
              </div>
              <p className="text-xs text-on-surface-variant">
                Moisture content recorded at <strong className="text-error font-mono">13.8%</strong> (Permissible Max: 12.0%). Laboratory re-test has been formally scheduled. Batch is strictly <strong className="text-error">bypassed in automated FIFO allocation queues</strong> until clear certificate is uploaded.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setActivePath('quality-inspection');
                    showToast('Opening Quality Testing Desk for Batch W-103...', 'info');
                  }}
                  className="px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Upload Lab Re-Test Slip
                </button>
                <button
                  onClick={() => setActivePath('inventory-and-batches')}
                  className="px-3 py-1.5 rounded bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  View Sample Custody Chain
                </button>
              </div>
            </div>

            {/* FIFO Exception Approval Card */}
            {pendingExceptions.length > 0 && (
              <div className="p-space-md rounded bg-surface-container-lowest border-l-4 border-l-secondary border border-outline-variant shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">rule</span>
                    <div>
                      <span className="font-title text-sm text-on-surface font-bold">FIFO Exception Approval Pending</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-numeric-data font-semibold text-xs">
                        #FPS-2048-CHAL
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold tracking-wider uppercase">
                    PENDING SIGN-OFF
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant font-numeric-data">
                  Requested by Operator M. Singh (Bay Maintenance Override)
                </div>
                <p className="text-xs text-on-surface-variant">
                  Operator requested emergency bypass of priority batch <strong className="font-mono text-on-surface">W-101</strong> in favor of <strong className="font-mono text-on-surface">W-102</strong> due to temporary forklift access obstruction in Shed 04 runway. Mandates Manager authorization.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAuthorizeException(pendingExceptions[0].id)}
                    className="px-3 py-1.5 rounded bg-secondary text-on-secondary font-label-md text-xs font-semibold hover:bg-secondary-fixed-variant transition-colors shadow-sm"
                  >
                    Review &amp; Authorize Override
                  </button>
                  <button
                    onClick={() => handleRejectException(pendingExceptions[0].id)}
                    className="px-3 py-1.5 rounded bg-surface-container text-error font-label-md text-xs font-semibold hover:bg-error-container transition-colors"
                  >
                    Reject (Enforce Stack W-101)
                  </button>
                </div>
              </div>
            )}

            {/* Incoming Gate Consignment Card */}
            <div className="p-space-md rounded bg-surface-container-lowest border-l-4 border-l-tertiary border border-outline-variant shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">local_shipping</span>
                  <div>
                    <span className="font-title text-sm text-on-surface font-bold">Incoming Gate Consignment</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-numeric-data font-semibold text-xs">
                      24 MT Rice
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary font-label-sm text-[11px] font-bold tracking-wider uppercase">
                  AT GATE NO. 2
                </span>
              </div>
              <div className="text-xs text-on-surface-variant font-numeric-data">
                Truck HR-38-AF-9921 • Supplier: Northern Grain Suppliers
              </div>
              <p className="text-xs text-on-surface-variant">
                Gross weight verified at Weighbridge #01 (32,450 kg). Truck successfully unladen at Platform 2. Awaiting tare weighing pass to generate final Inward Ledger Receipt.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActivePath('stock-inward')}
                  className="px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Record Tare Weighment
                </button>
                <button
                  onClick={() => showToast('Printing gate pass slip...', 'info')}
                  className="px-3 py-1.5 rounded bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Print Gate Pass Copy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Movement Feed & Godown Capacity (Col 4) */}
          <div className="lg:col-span-4 space-y-space-md">
            {/* Live Movement Feed */}
            <div className="bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                  <span className="font-title text-sm text-on-surface font-bold">Stock Movement Activity</span>
                </div>
                <span className="font-label-sm text-[11px] text-outline font-numeric-data">Live Feed</span>
              </div>
              <div className="space-y-3">
                {movements.slice(0, 4).map((m) => (
                  <div key={m.id} className="text-xs border-l-2 border-primary pl-2.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-numeric-data text-outline">{m.time_label}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-numeric-data font-bold uppercase text-[10px]">
                        {m.event_type}
                      </span>
                    </div>
                    <div className="font-medium text-on-surface">{m.notes}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Godown Capacity Meters */}
            <div className="bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">warehouse</span>
                  <span className="font-title text-sm text-on-surface font-bold">Godown Capacity &amp; Shed Occupancy</span>
                </div>
                <span className="font-numeric-metric text-xs font-bold text-primary">81.6% Full</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-on-surface font-medium mb-1">
                    <span>Shed 01 (Sugar &amp; Dry Grains)</span>
                    <span className="font-numeric-data">5,300 / 6,000 Qtl (88%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface font-medium mb-1">
                    <span>Shed 02 (Fortified Rice Store)</span>
                    <span className="font-numeric-data">13,750 / 16,000 Qtl (86%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: '86%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface font-medium mb-1">
                    <span>Shed 03 (Pulses &amp; Legumes)</span>
                    <span className="font-numeric-data">4,550 / 8,000 Qtl (56%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                    <div className="bg-tertiary h-full" style={{ width: '56%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface font-medium mb-1">
                    <span>Shed 04 (Wheat &amp; Buffer Stock)</span>
                    <span className="font-numeric-data">16,900 / 20,000 Qtl (84%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant flex justify-between text-[11px] text-outline font-numeric-data">
                <span>Total Capacity: 50,000 Qtl</span>
                <span className="text-primary font-semibold">9,500 Qtl Space Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
