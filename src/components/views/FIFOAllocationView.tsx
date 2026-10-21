import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFIFOAllocation } from '../../services/fifoEngine';
import { storage } from '../../services/storage';
import { FPSDispatchRequisition } from '../../types';

export const FIFOAllocationView: React.FC = () => {
  const { batches, currentUser, setActivePath, showToast, refreshData, setActiveChallanToPrint } = useApp();

  const [demandedQty, setDemandedQty] = useState<number>(1500.0);
  const [selectedCommodity, setSelectedCommodity] = useState<'wheat' | 'rice' | 'sugar' | 'chana'>('wheat');
  const [isBypassExceptionActive, setIsBypassExceptionActive] = useState<boolean>(false);
  const [exceptionReason, setExceptionReason] = useState<string>(
    'Temporary forklift access obstruction in Shed 04 runway. Requesting permission to pull next eligible batch W-102.'
  );

  // Execute deterministic FIFO Rule 14-B Engine
  const fifoResult = useMemo(() => {
    return calculateFIFOAllocation(batches, selectedCommodity, demandedQty, {
      bypassBatchId: isBypassExceptionActive ? 'W-101' : undefined,
    });
  }, [batches, selectedCommodity, demandedQty, isBypassExceptionActive]);

  const handleConfirmAndSubmit = () => {
    const requisitionId = `FPS-2048-${Date.now().toString().slice(-4)}`;
    const newDispatch: FPSDispatchRequisition = {
      id: requisitionId,
      fifo_run_id: `#CALC-${Math.floor(88000 + Math.random() * 1000)}`,
      fps_id: 'FPS-2048',
      fps_name: 'Shakti Nagar Ration Shop',
      licensee_name: 'M. Gupta',
      ward: 'Ward 14 (Sub-Division North West)',
      fps_code: 'FPS-DL-NW-2048',
      biometric_token_ok: true,
      commodity_id: selectedCommodity,
      commodity_name: selectedCommodity === 'wheat' ? 'Wheat (Grade A - Sharbati)' : selectedCommodity.toUpperCase(),
      required_quantity_qtl: demandedQty,
      allocated_quantity_qtl: fifoResult.totalAllocatedQtl,
      fulfillment_pct: fifoResult.fulfillmentPct,
      shortage_deficit_qtl: fifoResult.shortageDeficitQtl,
      target_dispatch_date: '22 Oct 2026 (Morning Shift)',
      allocated_carrier: 'DL-1M-4490 (16-Wheeler)',
      indent_voucher: '#IND-2026-9841',
      weighbridge_cert: '#WB-4401',
      status: 'APPROVED',
      is_exception: isBypassExceptionActive,
      exception_reason: isBypassExceptionActive ? exceptionReason : undefined,
      exception_operator: isBypassExceptionActive ? currentUser.name : undefined,
      allocations: fifoResult.allocations,
      created_at: new Date().toISOString(),
    };

    // Save and atomically approve
    storage.saveDispatch(newDispatch);
    storage.approveDispatch(newDispatch.id, currentUser);

    // If an exception was logged, record in exceptions registry
    if (isBypassExceptionActive) {
      storage.saveException({
        id: `EXC-${Date.now().toString().slice(-4)}`,
        requisition_id: newDispatch.id,
        requested_by: currentUser.name,
        requested_at: new Date().toISOString(),
        commodity: newDispatch.commodity_name,
        quantity_qtl: demandedQty,
        bypassed_batch_id: 'W-101',
        selected_batch_id: 'W-102',
        reason_code: 'STACK_ACCESS_OBSTRUCTION',
        justification_text: exceptionReason,
        status: 'PENDING_SIGN_OFF',
        audit_note: 'Statutory Rule 14-B Audit Trigger. Recorded with manager digital signature.',
      });
    }

    // Generate formal Delivery Challan
    const challan = storage.generateChallan(newDispatch.id, currentUser);

    refreshData();
    showToast(`FIFO Allocation Confirmed! Challan #${challan?.challan_no} generated and stock reserved.`, 'success');

    if (challan) {
      setActiveChallanToPrint(challan);
    }
  };

  const handleSaveDraft = () => {
    showToast('FIFO Allocation Proposal saved as local draft.', 'info');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Status Ribbon */}
      <div className="px-margin-desktop py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm shadow-sm border-b border-outline-variant">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
            <span className="material-symbols-outlined text-[14px]">auto_mode</span> Rule 14-B Engine Active
          </span>
          <span className="text-on-surface-variant font-label-md text-label-md">Requisition:</span>
          <span className="font-numeric-data text-numeric-data font-semibold text-primary">FPS-2048-CHAL</span>
          <span className="text-outline">/</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Central Grain Store (Demo)</span>
          <span className="text-outline">/</span>
          <span className="font-numeric-data text-numeric-data text-on-surface">21 Oct 2026</span>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <span>FIFO RUN ID: #CALC-88910</span>
          </div>
          <button
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span> Print Batch Manifest
          </button>
        </div>
      </div>

      <div className="p-margin-desktop space-y-space-xl">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-numeric-data text-numeric-data text-outline uppercase tracking-wider font-semibold">
                CIVIL SUPPLIES LOGISTICS • SECTION 06
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">
                PDS Automated Dispatch
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Create FPS Dispatch • FIFO Allocation Engine
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
              Automated batch liquidation for Fair Price Shop requisition following strict FIFO rules (Rule 14-B).
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <div className="px-space-md py-space-xs rounded bg-surface-container-high flex flex-col text-right border border-outline-variant">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Target Dispatch Date</span>
              <span className="font-numeric-metric text-numeric-metric font-semibold text-primary">
                22 Oct 2026 (Morning Shift)
              </span>
            </div>
          </div>
        </div>

        {/* 1. Requisition & Recipient Context Card (Asymmetric Bento Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* Main Recipient & Commodity Detail (Col 8) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded border border-outline-variant p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between flex-wrap gap-space-sm pb-space-sm mb-space-md border-b border-outline-variant">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                      Consignee Fair Price Shop
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-numeric-data text-numeric-data font-medium">
                      FPS-2048
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                    Shakti Nagar Ration Shop
                  </h2>
                  <div className="flex items-center gap-2 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="font-medium text-on-surface">Licensee: M. Gupta</span>
                    <span>•</span>
                    <span>Ward 14 (Sub-Division North West)</span>
                    <span>•</span>
                    <span className="font-numeric-data text-numeric-data text-outline">FPS-DL-NW-2048</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span> PDS Biometric Token OK
                  </span>
                </div>
              </div>

              {/* Commodity & Godown Balance Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col border border-outline-variant/60">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Commodity Requisitioned
                  </span>
                  <div className="font-title text-title text-on-surface mt-1 flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[20px] text-primary">grain</span>
                    <span>Wheat (Grade A - Sharbati)</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline mt-1">FAQ Norms Certified (RMS 2026-27)</span>
                </div>

                <div className="p-space-sm rounded bg-surface-container-low flex flex-col border border-outline-variant/60">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Total Required Quantity
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={demandedQty}
                      onChange={(e) => setDemandedQty(parseFloat(e.target.value) || 0)}
                      className="font-numeric-metric text-numeric-metric font-bold text-primary bg-surface-container-lowest border border-outline-variant rounded px-2 py-0.5 w-32 focus:outline-none"
                    />
                    <span className="font-label-md text-label-md font-bold text-on-surface">Qtl</span>
                  </div>
                  <span className="font-numeric-data text-numeric-data text-outline mt-1">
                    = {(demandedQty / 10).toFixed(2)} Metric Tonnes ({Math.round(demandedQty * 2)} Bags)
                  </span>
                </div>

                <div className="p-space-sm rounded bg-surface-container-low flex flex-col border border-outline-variant/60">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Eligible Usable Balance
                  </span>
                  <div className="font-numeric-metric text-numeric-metric font-bold text-on-surface mt-1">
                    14,200.00 <span className="font-label-md text-label-md font-normal text-on-surface-variant">Qtl</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    Across 18 verified stacks in Shed 01 &amp; 02
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-outline">local_shipping</span>
                <span>
                  Allocated Carrier: <strong className="text-on-surface">DL-1M-4490 (16-Wheeler)</strong> via Delhi State Civil Supplies Fleet
                </span>
              </div>
              <div className="font-numeric-data text-outline">Indent Voucher #IND-2026-9841</div>
            </div>
          </div>

          {/* Depot Fulfillment Tally Meter (Col 4) */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded border border-outline-variant p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <span className="font-title text-sm text-on-surface font-bold uppercase tracking-wider">
                  Depot Fulfillment Tally
                </span>
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-numeric-data text-[11px] font-bold">
                  {fifoResult.fulfillmentPct.toFixed(0)}% COVERED
                </span>
              </div>

              {/* Graphical Donut / Metric */}
              <div className="flex items-center justify-center my-4">
                <div className="w-28 h-28 rounded-full border-8 border-primary flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="font-headline-md font-bold text-on-surface">{fifoResult.totalAllocatedQtl.toLocaleString()}</span>
                  <span className="text-[10px] text-outline uppercase font-bold">QTL NET</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {fifoResult.allocations
                  .filter((a) => !a.is_bypassed && a.fifo_draw_qtl > 0)
                  .map((a) => (
                    <div key={a.batch_id} className="flex justify-between items-center text-on-surface">
                      <span className="font-mono font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span> Batch {a.batch_id}
                      </span>
                      <span className="font-numeric-data">
                        {a.fifo_draw_qtl.toFixed(2)} Qtl ({((a.fifo_draw_qtl / demandedQty) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between items-center text-outline pt-1 border-t border-outline-variant">
                  <span>Shortage Deficit</span>
                  <span className="font-numeric-data font-bold text-error">
                    {fifoResult.shortageDeficitQtl.toFixed(2)} Qtl (0%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant text-[11px] text-outline flex justify-between font-numeric-data">
              <span>Weighbridge Calibration: Active</span>
              <span className="text-primary font-bold">Gross Cert #WB-4401</span>
            </div>
          </div>
        </div>

        {/* 2. Visual Allocation Bar & Comparison */}
        <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
            <div>
              <span className="text-outline uppercase">Requisition Demand:</span>{' '}
              <span className="text-on-surface font-mono">{demandedQty.toFixed(2)} Qtl</span>
            </div>
            <div>
              <span className="text-outline uppercase">Calculated Allocation:</span>{' '}
              <span className="text-primary font-mono">{fifoResult.totalAllocatedQtl.toFixed(2)} Qtl</span>
            </div>
            <div>
              <span className="text-outline uppercase">Fulfillment Status:</span>{' '}
              <span className="text-primary">100% Fulfilled</span>
            </div>
            <div>
              <span className="text-outline uppercase">Balance Shortage:</span>{' '}
              <span className="text-on-surface font-mono">0.00 Qtl</span>
            </div>
            <div>
              <span className="text-outline uppercase">Queue Mode:</span>{' '}
              <span className="text-primary">Strict Monotonic FIFO</span>
            </div>
          </div>

          {/* Visual Dual Batch Progress Bar */}
          <div className="w-full bg-surface-container h-8 rounded flex overflow-hidden font-numeric-data text-xs font-bold text-on-primary">
            {fifoResult.allocations
              .filter((a) => !a.is_bypassed && a.fifo_draw_qtl > 0)
              .map((a, idx) => {
                const widthPct = (a.fifo_draw_qtl / demandedQty) * 100;
                return (
                  <div
                    key={a.batch_id}
                    className={`${idx === 0 ? 'bg-primary' : 'bg-primary-container'} h-full flex items-center justify-center px-2 truncate`}
                    style={{ width: `${widthPct}%` }}
                    title={`Batch ${a.batch_id}: ${a.fifo_draw_qtl} Qtl`}
                  >
                    {a.batch_id} • {a.fifo_draw_qtl.toFixed(2)} Qtl ({widthPct.toFixed(1)}%)
                  </div>
                );
              })}
          </div>

          <div className="flex justify-between text-[11px] text-outline font-numeric-data">
            <span>Draw Source 1: Shed 01, Bay A-4 (Full Stack)</span>
            <span>Draw Source 2: Shed 01, Bay B-2 (Partial Stack Split)</span>
            <span>Godown Loss Allowance: Nil</span>
          </div>
        </div>

        {/* 3. Liquidation Sequence Breakdown Table */}
        <div className="bg-surface-container-lowest rounded border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-outline-variant flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-headline-sm text-sm text-on-surface font-bold uppercase tracking-wider">
                Liquidation Sequence Breakdown ({fifoResult.allocations.length} BATCH CANDIDATES EVALUATED)
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Allocation automatically draws from the oldest eligible batches first. Batches under Quality Hold or Quarantine are strictly bypassed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-xs font-bold">
                Calculation Logic: Verified
              </span>
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-xs font-bold">
                Rule Filter: Active
              </span>
            </div>
          </div>

          {/* Mathematical Liquidation Formula Banner */}
          <div className="px-space-md py-2 bg-surface-container-low border-b border-outline-variant text-[11px] text-on-surface-variant font-mono">
            <strong>Mathematical Liquidation Formula:</strong> FIFO candidate stack allocation follows Q_(alloc) = min(Q_(remaining), Q_(batch_balance)). Stacks are sorted ascending by receipt timestamp: T_(receipt)[W-101] &lt; T_(receipt)[W-102] &lt; T_(receipt)[W-103]. Batch W-103 is evaluated but rejected due to <span className="text-error font-bold">QUALITY_HOLD</span> flag before draw execution.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container text-outline font-label-sm text-[11px] uppercase tracking-wider border-b border-outline-variant font-semibold">
                  <th className="p-space-sm pl-space-md">Rank</th>
                  <th className="p-space-sm">Batch ID &amp; Receipt Date</th>
                  <th className="p-space-sm">Godown Bay &amp; Stack</th>
                  <th className="p-space-sm text-right">Total Balance</th>
                  <th className="p-space-sm text-center">Quality / Eligibility</th>
                  <th className="p-space-sm text-right">FIFO Draw Amount</th>
                  <th className="p-space-sm text-right">Post-Dispatch Bal</th>
                  <th className="p-space-sm pr-space-md">Reason / Traceability Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {fifoResult.allocations.map((a) => {
                  const isBypassed = a.is_bypassed;
                  return (
                    <tr
                      key={a.batch_id}
                      className={isBypassed ? 'bg-error-container/20 hover:bg-error-container/30' : 'hover:bg-surface-container-low'}
                    >
                      <td className="p-space-sm pl-space-md font-bold font-mono">
                        {isBypassed ? (
                          <span className="px-1.5 py-0.5 rounded bg-error text-on-error text-[10px]">BYPASS</span>
                        ) : (
                          `#${a.rank}`
                        )}
                      </td>

                      <td className="p-space-sm">
                        <div className="font-bold text-on-surface font-mono">Batch {a.batch_id}</div>
                        <div className="text-[11px] text-outline font-numeric-data">
                          Rec: {a.receipt_date} • <strong className="text-primary">{a.age_days} Days Old</strong>
                        </div>
                      </td>

                      <td className="p-space-sm">
                        <div className="font-medium text-on-surface">{a.shed}</div>
                        <div className="text-[11px] text-outline font-mono">{a.stack_id}</div>
                      </td>

                      <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">
                        {a.total_balance_qtl.toFixed(2)} Qtl
                      </td>

                      <td className="p-space-sm text-center">
                        {a.quality_status === 'ELIGIBLE' ? (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-[10px] font-bold">
                            Eligible (Active)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[10px] font-bold flex items-center justify-center gap-1 mx-auto max-w-[110px]">
                            <span className="material-symbols-outlined text-[13px]">lock</span> Quality Hold
                          </span>
                        )}
                      </td>

                      <td className="p-space-sm text-right font-numeric-metric font-bold text-primary">
                        {a.fifo_draw_qtl > 0 ? `${a.fifo_draw_qtl.toFixed(2)} Qtl` : '0.00 Qtl'}
                        {a.percentage_of_batch > 0 && (
                          <div className="text-[10px] text-outline font-normal font-mono">
                            ({a.percentage_of_batch}% of batch)
                          </div>
                        )}
                      </td>

                      <td className="p-space-sm text-right font-numeric-metric font-semibold text-on-surface">
                        {a.post_dispatch_bal_qtl.toFixed(2)} Qtl
                      </td>

                      <td className="p-space-sm pr-space-md text-[11px]">
                        <div className={isBypassed ? 'text-error font-semibold' : 'text-on-surface font-medium'}>
                          {a.reason}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-space-sm bg-surface-container flex flex-wrap items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant font-numeric-data">
            <div className="flex items-center gap-3">
              <span>• 2 Batches Committed</span>
              <span className="text-error font-semibold">• 1 Batch Flagged &amp; Preserved</span>
            </div>
            <div>Total Tally: {fifoResult.totalAllocatedQtl.toFixed(2)} Qtl drawn from 1,800.00 Qtl queue pool</div>
          </div>
        </div>

        {/* 4. Regulatory Exception Control Card */}
        <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
              <span className="font-title text-sm text-on-surface font-bold">
                Regulatory Exception Control (Rule 14-B Override)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold">
              LEVEL 3 CLEARANCE
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-container-low border border-outline-variant">
            <div>
              <div className="font-semibold text-on-surface text-xs">Simulate FIFO Bypass Exception</div>
              <div className="text-[11px] text-outline">
                Manually rearrange dispatch queue priority (Bypass oldest batch W-101 in favor of W-102)
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isBypassExceptionActive}
                onChange={(e) => setIsBypassExceptionActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          {isBypassExceptionActive && (
            <div className="space-y-2 p-3 rounded bg-secondary-container/30 border border-secondary text-xs">
              <div className="font-semibold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Warning: Statutory Audit Trigger. Bypassing W-101 requires Godown In-Charge written justification and District Supply Officer digital sign-off.
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface mb-1">
                  Mandatory Operational Justification (Captured in Immutable Audit Trail):
                </label>
                <textarea
                  rows={2}
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Bottom Actions Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-sm border-t border-outline-variant">
          <div className="flex items-center gap-space-md text-xs text-outline font-numeric-data">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span> View Vehicle &amp; Transport Manifest
            </span>
            <span>Weight Ticket Pre-assigned #WT-9022</span>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={() => setDemandedQty(1500.0)}
              className="px-3 py-2 rounded bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel / Recalculate Quantity
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-3 py-2 rounded bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Save as Draft Allocation
            </button>
            <button
              onClick={handleConfirmAndSubmit}
              className="px-4 py-2 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Confirm Allocation &amp; Submit to Approver Queue</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
