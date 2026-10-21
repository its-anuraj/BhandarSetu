import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

export const QualityInspectionView: React.FC = () => {
  const { batches, inwards, currentUser, showToast, refreshData } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('W-103');
  const [moistureReading, setMoistureReading] = useState<number>(11.8);
  const [foreignMatter, setForeignMatter] = useState<number>(0.38);
  const [density, setDensity] = useState<number>(78.2);
  const [weevilCount, setWeevilCount] = useState<number>(0.0);
  const [qcNotes, setQcNotes] = useState<string>('Laboratory composite re-test assay completed. Moisture within permissible limits.');

  const targetBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const pendingInwards = inwards.filter((i) => i.status === 'AWAITING_QC');

  const handleReleaseBatch = () => {
    if (!targetBatch) return;
    const success = storage.updateBatchStatus(
      targetBatch.id,
      'ELIGIBLE',
      'Laboratory re-test passed. Released from hold.',
      currentUser.name
    );
    if (success) {
      showToast(`Batch ${targetBatch.id} Released to ELIGIBLE! Now available in FIFO allocation queue.`, 'success');
      refreshData();
    }
  };

  const handlePlaceOnHold = () => {
    if (!targetBatch) return;
    const reason = `Moisture content ${moistureReading}% exceeds limit. Sealed by ${currentUser.name}.`;
    const success = storage.updateBatchStatus(targetBatch.id, 'QUALITY_HOLD', reason, currentUser.name);
    if (success) {
      showToast(`Batch ${targetBatch.id} placed on QUALITY HOLD. Bypassed from FIFO allocations.`, 'warning');
      refreshData();
    }
  };

  const handleApproveInwardConsignment = (inwardId: string) => {
    const success = storage.postInwardToLedger(inwardId, currentUser);
    if (success) {
      showToast(`Consignment ${inwardId} cleared QC and posted to Godown Bahi Ledger! Inventory credited.`, 'success');
      refreshData();
    }
  };

  return (
    <div className="flex flex-col w-full p-margin-desktop space-y-space-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-outline-variant gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Quality Inspection &amp; Laboratory Gating
            </h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Statutory grain refraction testing, moisture analysis, and strict eligibility quarantine under Rule 14-B.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-semibold">
            Lab Platform: NABL Certified
          </span>
        </div>
      </div>

      {/* Pending Inward QC Queue */}
      {pendingInwards.length > 0 && (
        <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant">
            <span className="font-title text-sm text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">pending_actions</span>
              Incoming Consignments Awaiting Technical Clearance ({pendingInwards.length})
            </span>
            <span className="text-[11px] text-outline font-numeric-data">Shed 04 Intake</span>
          </div>

          <div className="space-y-2">
            {pendingInwards.map((inw) => (
              <div
                key={inw.id}
                className="p-3 rounded bg-surface-container-low border border-outline-variant flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-on-surface font-mono">
                    {inw.id} • Truck {inw.vehicle_truck_no}
                  </div>
                  <div className="text-on-surface-variant text-[11px]">
                    {inw.net_received_qtl} Qtl {inw.commodity_name} from {inw.supplier_name}
                  </div>
                  <div className="text-outline text-[10px] font-mono">
                    Sample Custody: {inw.sample_custody_bag_no} • Initial Probe: {inw.initial_moisture_pct}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveInwardConsignment(inw.id)}
                    className="px-3 py-1.5 rounded bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    Clear QC &amp; Post to Bahi Ledger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Batch Inspection Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left: Active Stacks & Hold Register (Col 7) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
            <span className="font-title text-sm text-on-surface font-bold">Godown Stacks &amp; Quality Status</span>
            <span className="text-outline font-label-sm text-xs font-semibold">Select Stack to Test</span>
          </div>

          <div className="space-y-2">
            {batches.map((batch) => {
              const isSelected = selectedBatchId === batch.id;
              const isHold = batch.quality_status === 'QUALITY_HOLD';
              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold font-mono">
                      <span>Batch {batch.id}</span>
                      <span className="text-outline font-normal">({batch.commodity_name})</span>
                      {isHold && (
                        <span className="px-1.5 py-0.2 rounded bg-error text-on-error font-mono text-[9px] font-bold">
                          QUALITY HOLD
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-outline font-mono mt-0.5">
                      {batch.shed} • {batch.stack_id} • Balance: {batch.on_hand_qtl} Qtl
                    </div>
                    {isHold && (
                      <div className="text-[11px] text-error font-medium mt-1">
                        Reason: {batch.quality_hold_reason}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                        isHold ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {batch.quality_status}
                    </span>
                    <div className="text-[10px] text-outline mt-1 font-mono">
                      Moisture: {batch.quality_metrics.moisture_pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Lab Testing Controls (Col 5) */}
        {targetBatch && (
          <div className="lg:col-span-5 bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm space-y-4 text-xs">
            <div className="pb-2 border-b border-outline-variant flex items-center justify-between">
              <div>
                <span className="font-title text-sm text-on-surface font-bold">
                  Lab Assay: Batch {targetBatch.id}
                </span>
                <div className="text-outline text-[11px]">{targetBatch.commodity_name}</div>
              </div>
              <span className="material-symbols-outlined text-primary text-[22px]">science</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-outline font-semibold mb-1">
                  Moisture Content % (Statutory Max: 12.0%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={moistureReading}
                  onChange={(e) => setMoistureReading(parseFloat(e.target.value) || 0)}
                  className={`w-full h-8 px-2.5 bg-surface-container-low border rounded font-mono font-bold focus:outline-none ${
                    moistureReading > 12.0 ? 'border-error text-error' : 'border-primary text-primary'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-outline font-semibold mb-1">Foreign Matter %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 bg-surface-container-low border border-outline-variant rounded font-mono text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-outline font-semibold mb-1">Grain Density (kg/hl)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={density}
                    onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 bg-surface-container-low border border-outline-variant rounded font-mono text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Weevilled Grains %</label>
                <input
                  type="number"
                  step="0.01"
                  value={weevilCount}
                  onChange={(e) => setWeevilCount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 bg-surface-container-low border border-outline-variant rounded font-mono text-on-surface"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Inspector Notes &amp; Custody Memo</label>
                <textarea
                  rows={2}
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none"
                />
              </div>
            </div>

            {/* Quality Gating Decision Buttons */}
            <div className="space-y-2 pt-2 border-t border-outline-variant">
              <button
                onClick={handleReleaseBatch}
                className="w-full py-2 rounded bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Release to Eligible (Pass Certification)</span>
              </button>

              <button
                onClick={handlePlaceOnHold}
                className="w-full py-2 rounded bg-error text-on-error font-semibold hover:bg-error-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Quarantine Under Quality Hold</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
