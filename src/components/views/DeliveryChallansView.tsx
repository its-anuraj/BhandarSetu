import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { DeliveryChallan } from '../../types';

export const DeliveryChallansView: React.FC = () => {
  const { challans, currentUser, showToast, refreshData, setActiveChallanToPrint, setActivePath } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingChallanNo, setConfirmingChallanNo] = useState<string | null>(null);

  // Statistics
  const totalChallans = challans.length;
  const pendingExit = challans.filter((c) => c.status !== 'DISPATCHED').length;
  const dispatchedCount = challans.filter((c) => c.status === 'DISPATCHED').length;
  const totalQuantityDispatched = challans
    .filter((c) => c.status === 'DISPATCHED')
    .reduce((sum, c) => sum + c.total_quantity_qtl, 0);

  const filteredChallans = challans.filter((c) => {
    if (filterStatus === 'PENDING' && c.status === 'DISPATCHED') return false;
    if (filterStatus === 'DISPATCHED' && c.status !== 'DISPATCHED') return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.challan_no.toLowerCase().includes(term) ||
        c.fps_name.toLowerCase().includes(term) ||
        c.carrier_vehicle_no.toLowerCase().includes(term) ||
        c.commodity_name.toLowerCase().includes(term) ||
        c.fps_code.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleConfirmGateExit = (challan: DeliveryChallan) => {
    const success = storage.confirmGateDispatch(challan.challan_no, currentUser);
    if (success) {
      refreshData();
      showToast(
        `Gate Outward Confirmed for Challan #${challan.challan_no}! ${challan.total_quantity_qtl} Qtl deducted from physical inventory.`,
        'success'
      );
      setConfirmingChallanNo(null);
    } else {
      showToast(`Failed to confirm gate exit for #${challan.challan_no}.`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              CIVIL SUPPLIES LOGISTICS • DISPATCH SECTION 07
            </span>
            <span className="text-xs bg-[#e8f0e9] text-[#214e3d] font-semibold px-2 py-0.5 rounded">
              PDS Rule 14-B Compliant
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            Delivery Challans & Gate Outward Passes
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Cryptographically sealed foodgrain release documentation and live weighbridge outward tally.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePath('fps-dispatch-and-fifo')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            New FPS Dispatch
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#69736b]">Total Challans Issued</p>
          <p className="text-2xl font-bold font-mono text-[#252d29] mt-1">{totalChallans}</p>
          <p className="text-[11px] text-[#69736b] mt-0.5">RMS 2026-27 Marketing Season</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#9b641b]">Pending Gate Exit</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono text-[#9b641b]">{pendingExit}</p>
            <span className="text-[10px] bg-[#fef3c7] text-[#9b641b] font-medium px-1.5 py-0.5 rounded">At Platform</span>
          </div>
          <p className="text-[11px] text-[#69736b] mt-0.5">Awaiting weighbridge outward tare</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#214e3d]">Confirmed Gate Exits</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono text-[#214e3d]">{dispatchedCount}</p>
            <span className="text-[10px] bg-[#e8f0e9] text-[#214e3d] font-medium px-1.5 py-0.5 rounded">Completed</span>
          </div>
          <p className="text-[11px] text-[#69736b] mt-0.5">Deducted from batch registers</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#69736b]">Total Dispatched Tally</p>
          <p className="text-2xl font-bold font-mono text-[#252d29] mt-1">
            {totalQuantityDispatched.toLocaleString('en-IN', { minimumFractionDigits: 1 })}{' '}
            <span className="text-xs font-normal text-[#69736b]">Qtl</span>
          </p>
          <p className="text-[11px] text-[#69736b] mt-0.5">
            {(totalQuantityDispatched / 10).toFixed(1)} Metric Tonnes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#252d29]">Filter Status:</span>
          <div className="flex items-center gap-1 bg-[#f6f5f0] p-0.5 rounded border border-[#e3e2d9]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                filterStatus === 'ALL'
                  ? 'bg-[#214e3d] text-white shadow-xs'
                  : 'text-[#69736b] hover:text-[#252d29]'
              }`}
            >
              All ({challans.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                filterStatus === 'PENDING'
                  ? 'bg-[#214e3d] text-white shadow-xs'
                  : 'text-[#69736b] hover:text-[#252d29]'
              }`}
            >
              Awaiting Gate Exit ({pendingExit})
            </button>
            <button
              onClick={() => setFilterStatus('DISPATCHED')}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                filterStatus === 'DISPATCHED'
                  ? 'bg-[#214e3d] text-white shadow-xs'
                  : 'text-[#69736b] hover:text-[#252d29]'
              }`}
            >
              Gate Outward Done ({dispatchedCount})
            </button>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#69736b] text-base">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Challan No, FPS Name, Vehicle No, Commodity..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded focus:bg-white focus:outline-none focus:border-[#214e3d] transition"
          />
        </div>
      </div>

      {/* Challans List */}
      <div className="space-y-4">
        {filteredChallans.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e3e2d9] p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-[#69736b]">receipt_long</span>
            <p className="text-sm font-semibold text-[#252d29] mt-2">No Delivery Challans Found</p>
            <p className="text-xs text-[#69736b] mt-1">
              No challans match the current filter criteria or search query.
            </p>
          </div>
        ) : (
          filteredChallans.map((challan) => {
            const isDispatched = challan.status === 'DISPATCHED';

            return (
              <div
                key={challan.challan_no}
                className="bg-white rounded-lg border border-[#e3e2d9] hover:border-[#214e3d]/40 transition shadow-xs overflow-hidden"
              >
                {/* Header row */}
                <div className="bg-[#f6f5f0] px-4 py-3 border-b border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#214e3d] bg-white px-2 py-0.5 rounded border border-[#e3e2d9]">
                      #{challan.challan_no}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        isDispatched
                          ? 'bg-[#e8f0e9] text-[#214e3d] border border-[#214e3d]/30'
                          : 'bg-[#fef3c7] text-[#9b641b] border border-[#f59e0b]/40 animate-pulse'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isDispatched ? 'check_circle' : 'pending_actions'}
                      </span>
                      {isDispatched ? 'Gate Outward Confirmed' : 'Pending Gate Weighment & Exit'}
                    </span>
                    <span className="text-xs text-[#69736b]">
                      Date: <span className="font-mono font-medium text-[#252d29]">{challan.date}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveChallanToPrint(challan)}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-[#e3e2d9] text-[#252d29] text-xs font-semibold rounded hover:bg-[#f6f5f0] transition shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-sm text-[#214e3d]">print</span>
                      Print Official Challan
                    </button>

                    {!isDispatched && (
                      <button
                        onClick={() => setConfirmingChallanNo(challan.challan_no)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        Confirm Gate Exit & Deduct Stock
                      </button>
                    )}
                  </div>
                </div>

                {/* Details body */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Col 1: Consignee FPS */}
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#69736b]">Consignee FPS & Licensee</p>
                    <p className="text-sm font-bold text-[#252d29] mt-0.5">{challan.fps_name}</p>
                    <p className="text-xs text-[#69736b] font-mono">Code: {challan.fps_code}</p>
                    <p className="text-xs text-[#69736b] mt-1">Licensee: {challan.licensee_name}</p>
                  </div>

                  {/* Col 2: Transport & Vehicle */}
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#69736b]">Carrier Vehicle & Driver</p>
                    <p className="text-sm font-bold font-mono text-[#252d29] mt-0.5">
                      {challan.carrier_vehicle_no}
                    </p>
                    <p className="text-xs text-[#69736b]">Driver: {challan.driver_name}</p>
                    <p className="text-xs text-[#69736b] font-mono mt-1">
                      Issuer: <span className="text-[#252d29]">{challan.issued_by}</span>
                    </p>
                  </div>

                  {/* Col 3: Commodity & Quantity */}
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#69736b]">Commodity & Total Load</p>
                    <p className="text-sm font-bold text-[#214e3d] mt-0.5">{challan.commodity_name}</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-mono font-bold text-base text-[#252d29]">
                        {challan.total_quantity_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl
                      </span>
                      <span className="text-xs text-[#69736b] font-mono">
                        ({challan.total_bags} standard bags)
                      </span>
                    </div>
                  </div>

                  {/* Col 4: Batch Breakdown */}
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#69736b]">FIFO Batch Breakdown</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {challan.batches_breakdown.map((b) => (
                        <div
                          key={b.batch_id}
                          className="bg-[#f6f5f0] border border-[#e3e2d9] rounded px-2 py-1 text-xs"
                        >
                          <span className="font-mono font-bold text-[#214e3d]">{b.batch_id}:</span>{' '}
                          <span className="font-mono font-medium text-[#252d29]">{b.draw_qtl} Qtl</span>{' '}
                          <span className="text-[10px] text-[#69736b]">({b.shed})</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-[#69736b] truncate">
                      SHA: <span className="text-[#252d29]">{challan.sha256_hash}</span>
                    </div>
                  </div>
                </div>

                {/* Gate Confirmation Modal / Panel if active */}
                {confirmingChallanNo === challan.challan_no && (
                  <div className="bg-[#fffdf8] border-t border-[#b48643]/30 p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#9b641b] text-2xl">warning</span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-[#9b641b] uppercase tracking-wider">
                          Confirm Physical Gate Exit & Stock Deduction
                        </h4>
                        <p className="text-xs text-[#252d29] mt-1">
                          You are recording that vehicle <span className="font-bold">{challan.carrier_vehicle_no}</span> carrying{' '}
                          <span className="font-bold">{challan.total_quantity_qtl} Qtl</span> has successfully cleared
                          Weighbridge #02 tare check and departed Gate #01.
                        </p>
                        <p className="text-xs text-[#a43f36] font-semibold mt-1">
                          ⚠️ This action will immediately and irreversibly deduct{' '}
                          {challan.total_quantity_qtl} Qtl from physical batches (
                          {challan.batches_breakdown.map((b) => `${b.batch_id}: ${b.draw_qtl} Qtl`).join(', ')})
                          and append immutable debit entries to the Departmental Movement Ledger.
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleConfirmGateExit(challan)}
                            className="px-3 py-1.5 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Yes, Confirm Gate Exit & Deduct Stock
                          </button>
                          <button
                            onClick={() => setConfirmingChallanNo(null)}
                            className="px-3 py-1.5 bg-white border border-[#e3e2d9] text-[#69736b] text-xs font-medium rounded hover:bg-[#f6f5f0] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
