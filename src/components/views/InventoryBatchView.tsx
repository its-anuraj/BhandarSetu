import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockBatch } from '../../types';
import { storage } from '../../services/storage';

export const InventoryBatchView: React.FC = () => {
  const { batches, selectedBatchId, setSelectedBatchId, setActivePath, showToast, refreshData, currentUser } = useApp();

  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shedFilter, setShedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('Physical stock count moisture refraction adjustment');

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const filteredBatches = batches.filter((b) => {
    if (commodityFilter !== 'all' && b.commodity_id !== commodityFilter) return false;
    if (statusFilter !== 'all' && b.quality_status !== statusFilter) return false;
    if (shedFilter !== 'all' && !b.shed.toLowerCase().includes(shedFilter.toLowerCase())) return false;
    return true;
  });

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    const qty = parseFloat(adjustmentQty);
    if (isNaN(qty)) {
      showToast('Please enter a valid adjustment quantity.', 'error');
      return;
    }

    const success = storage.adjustStock(selectedBatch.id, qty, adjustmentReason, currentUser);
    if (success) {
      showToast(`Stock on Batch ${selectedBatch.id} adjusted by ${qty > 0 ? '+' : ''}${qty} Qtl. Traceable ledger movement committed.`, 'success');
      setShowAdjustmentModal(false);
      setAdjustmentQty('');
      refreshData();
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Operational Banner & KPI Plinth */}
      <div className="px-margin-desktop py-space-sm bg-surface-container-low flex flex-col gap-space-sm border-b border-outline-variant shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-baseline gap-space-sm">
            <span className="font-numeric-data text-numeric-data uppercase tracking-wider text-outline font-semibold">
              Ledger Register 03
            </span>
            <span className="text-outline">/</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Physical Batch Ledger &amp; Commodity Stock Tally
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-numeric-data text-label-sm font-semibold">
              124 Registered Batches Active
            </span>
          </div>

          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-numeric-data text-label-sm shadow-sm border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              KMS 2026-27 (Active Intake)
            </span>
            <div className="h-4 w-px bg-outline-variant mx-1"></div>
            <button
              onClick={() => {
                setActivePath('reports-and-register');
                showToast('Exporting Batch Ledger Register...', 'info');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container transition-colors border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">file_download</span>
              Export Register (PDF/XLS)
            </button>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              + Manual Stock Adjustment
            </button>
          </div>
        </div>

        {/* Macro Grain Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-space-xs">
          <div className="p-space-sm rounded bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Wheat Pool Stock</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold text-on-surface">32,450.00</span>
              <span className="font-numeric-data text-label-sm text-outline font-semibold">Qtl</span>
            </div>
            <div className="w-full bg-surface-container h-1 rounded mt-2 overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div className="p-space-sm rounded bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Rice (Paddy/Parboiled)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold text-on-surface">48,120.50</span>
              <span className="font-numeric-data text-label-sm text-outline font-semibold">Qtl</span>
            </div>
            <div className="w-full bg-surface-container h-1 rounded mt-2 overflow-hidden">
              <div className="bg-secondary h-full" style={{ width: '62%' }}></div>
            </div>
          </div>

          <div className="p-space-sm rounded bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Chana / Pulses</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold text-on-surface">4,890.00</span>
              <span className="font-numeric-data text-label-sm text-outline font-semibold">Qtl</span>
            </div>
            <div className="w-full bg-surface-container h-1 rounded mt-2 overflow-hidden">
              <div className="bg-tertiary h-full" style={{ width: '44%' }}></div>
            </div>
          </div>

          <div className="p-space-sm rounded bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Sugar (S-30)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold text-on-surface">2,150.00</span>
              <span className="font-numeric-data text-label-sm text-outline font-semibold">Qtl</span>
            </div>
            <div className="w-full bg-surface-container h-1 rounded mt-2 overflow-hidden">
              <div className="bg-outline h-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="p-space-sm rounded bg-secondary-container text-on-secondary-container shadow-sm flex flex-col justify-between border border-secondary">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase font-semibold">FIFO Critical Batches</span>
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold">06</span>
              <span className="font-label-sm text-label-sm font-semibold">&gt;60 Days Intake</span>
            </div>
            <span className="font-numeric-data text-[10px] mt-1 opacity-90 font-medium">Immediate FPS Pull Required</span>
          </div>

          <div className="p-space-sm rounded bg-error-container text-on-error-container shadow-sm flex flex-col justify-between border border-error">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase font-semibold">Under Lab Lock</span>
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-numeric-metric text-headline-sm font-bold">03</span>
              <span className="font-numeric-data text-label-sm font-semibold">1,800 Qtl</span>
            </div>
            <span className="font-numeric-data text-[10px] mt-1 opacity-90 font-medium">Pending Moisture/Refraction</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="px-margin-desktop py-space-sm bg-surface-container flex flex-wrap items-center justify-between gap-space-xs shadow-sm border-b border-outline-variant">
        <div className="flex flex-wrap items-center gap-space-xs flex-1">
          {/* Commodity Dropdown */}
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none shadow-sm"
          >
            <option value="all">All Commodities (Wheat, Rice, Sugar, Pulses)</option>
            <option value="wheat">Wheat (Grade A)</option>
            <option value="rice">Rice (Fortified/Parboiled)</option>
            <option value="sugar">Sugar (Refined S-30)</option>
            <option value="chana">Chana Whole</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none shadow-sm"
          >
            <option value="all">All Statuses (Eligible, Hold, Pending)</option>
            <option value="ELIGIBLE">Eligible (Ready for FIFO)</option>
            <option value="QUALITY_HOLD">Under Quality Hold</option>
            <option value="DEPLETED">Depleted / Liquidated</option>
          </select>

          {/* Shed Filter */}
          <select
            value={shedFilter}
            onChange={(e) => setShedFilter(e.target.value)}
            className="h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none shadow-sm"
          >
            <option value="all">All Godown Stacks (Shed 1-4)</option>
            <option value="Shed 01">Shed 01 (Dry Floor)</option>
            <option value="Shed 02">Shed 02 (Fumigated Safe)</option>
            <option value="Shed 03">Shed 03 (Ventilated)</option>
            <option value="Shed 04">Shed 04 (Buffer Plinth)</option>
          </select>
        </div>

        {/* View Mode Toggle: Grid vs Shed Bay Map */}
        <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded border border-outline-variant">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
            Ledger Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewMode === 'map' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">map</span>
            Shed Bay Map
          </button>
        </div>
      </div>

      {/* Main Content Layout: Active Batch Table (Col 8) + Summary Panel (Col 4) */}
      <div className="p-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left Column: Active Batches Table (Col 8) */}
        <div className="lg:col-span-8 space-y-space-md">
          <div className="bg-surface-container-lowest rounded border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-space-md py-space-xs border-b border-outline-variant bg-surface-container-low flex items-center justify-between text-xs text-on-surface-variant font-medium">
              <span>Showing {filteredBatches.length} Registered Batches</span>
              <span className="text-secondary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">sort</span> Sorted by FIFO Sequence (Oldest First)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container text-outline font-label-sm text-[11px] uppercase tracking-wider border-b border-outline-variant font-semibold">
                    <th className="p-space-sm pl-space-md">Batch ID &amp; Crop</th>
                    <th className="p-space-sm">Intake &amp; Age</th>
                    <th className="p-space-sm">Source / Agency</th>
                    <th className="p-space-sm">Godown Stack</th>
                    <th className="p-space-sm text-right">Physical Bal</th>
                    <th className="p-space-sm text-center">Status</th>
                    <th className="p-space-sm text-center pr-space-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredBatches.map((batch) => {
                    const isSelected = selectedBatch?.id === batch.id;
                    const isHeld = batch.quality_status === 'QUALITY_HOLD';
                    const isEligible = batch.quality_status === 'ELIGIBLE';

                    return (
                      <tr
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-l-4 border-l-primary'
                            : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <td className="p-space-sm pl-space-md">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-on-surface font-mono">{batch.id}</span>
                            {isEligible && (
                              <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                            )}
                            {isHeld && (
                              <span className="material-symbols-outlined text-error text-[14px]">lock</span>
                            )}
                          </div>
                          <div className="text-outline text-[11px] truncate max-w-[150px]">{batch.commodity_name}</div>
                        </td>

                        <td className="p-space-sm font-numeric-data">
                          <div>{batch.intake_date}</div>
                          <div className={`text-[10px] font-semibold ${isHeld ? 'text-error' : 'text-primary'}`}>
                            {batch.id === 'W-094' ? '83 days (Critical FIFO)' : 'Active Age'}
                          </div>
                        </td>

                        <td className="p-space-sm">
                          <div className="text-on-surface font-medium truncate max-w-[140px]">{batch.source_agency}</div>
                          <div className="text-outline text-[10px] font-numeric-data">{batch.intake_challan}</div>
                        </td>

                        <td className="p-space-sm">
                          <div className="text-on-surface font-medium">{batch.shed}</div>
                          <div className={`text-[10px] font-mono ${isHeld ? 'text-error font-bold' : 'text-outline'}`}>
                            {batch.stack_id}
                          </div>
                        </td>

                        <td className="p-space-sm text-right font-numeric-metric font-bold text-on-surface">
                          {batch.on_hand_qtl.toFixed(2)} <span className="text-[10px] font-normal text-outline">Qtl</span>
                        </td>

                        <td className="p-space-sm text-center">
                          {isEligible && (
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-[10px] font-bold">
                              ELIGIBLE
                            </span>
                          )}
                          {isHeld && (
                            <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                              HOLD
                            </span>
                          )}
                          {batch.quality_status === 'DEPLETED' && (
                            <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-[10px] font-medium">
                              DEPLETED
                            </span>
                          )}
                        </td>

                        <td className="p-space-sm text-center pr-space-md">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBatchId(batch.id);
                              setActivePath('fps-dispatch-and-fifo');
                            }}
                            className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] transition-colors"
                          >
                            Allocate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Physical Stack Bay Overview Map - Shed 01 & 02 */}
          <div className="bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">view_module</span>
                <span className="font-title text-sm text-on-surface font-bold">
                  Physical Stack Bay Overview • Shed 01 &amp; 02
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> Wheat Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-secondary"></span> Rice / Sugar
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-error"></span> Hold / Lock
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-surface-container border border-outline-variant"></span> Free Bay
                </span>
              </div>
            </div>

            {/* Interactive Bay Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 font-numeric-data text-[10px]">
              <div
                onClick={() => setSelectedBatchId('W-094')}
                className="p-1.5 rounded bg-primary text-on-primary text-center cursor-pointer hover:opacity-90 shadow-sm"
                title="Bay A-1 (Batch W-094) 1,500 Qtl"
              >
                <div className="font-bold">A-1</div>
                <div>1500 Q</div>
              </div>
              <div className="p-1.5 rounded bg-primary text-on-primary text-center">
                <div className="font-bold">A-2</div>
                <div>950 Q</div>
              </div>
              <div className="p-1.5 rounded bg-primary text-on-primary text-center">
                <div className="font-bold">A-3</div>
                <div>820 Q</div>
              </div>
              <div
                onClick={() => setSelectedBatchId('W-101')}
                className={`p-1.5 rounded bg-primary text-on-primary text-center cursor-pointer ring-2 ${
                  selectedBatch?.id === 'W-101' ? 'ring-secondary' : 'ring-transparent'
                }`}
                title="Bay A-4 (Batch W-101) 1,000 Qtl - Selected"
              >
                <div className="font-bold">A-4</div>
                <div className="font-bold">1000 Q</div>
              </div>
              <div className="p-1.5 rounded bg-primary text-on-primary text-center">
                <div className="font-bold">B-1</div>
                <div>600 Q</div>
              </div>
              <div
                onClick={() => setSelectedBatchId('W-102')}
                className="p-1.5 rounded bg-primary text-on-primary text-center cursor-pointer hover:opacity-90"
                title="Bay B-2 (Batch W-102) 800 Qtl"
              >
                <div className="font-bold">B-2</div>
                <div>800 Q</div>
              </div>
              <div
                onClick={() => setSelectedBatchId('W-103')}
                className="p-1.5 rounded bg-error text-on-error text-center cursor-pointer hover:opacity-90 font-bold"
                title="Bay C-1 (Batch W-103) 600 Qtl - QUALITY HOLD"
              >
                <div>C-1</div>
                <div>600 Q</div>
              </div>
              <div className="p-1.5 rounded bg-surface-container text-outline text-center border border-outline-variant">
                <div>C-2</div>
                <div>EMPTY</div>
              </div>
              <div
                onClick={() => setSelectedBatchId('R-079')}
                className="p-1.5 rounded bg-secondary text-on-secondary text-center cursor-pointer hover:opacity-90"
              >
                <div>D-5</div>
                <div>1050 Q</div>
              </div>
              <div className="p-1.5 rounded bg-surface-container text-outline text-center border border-outline-variant">
                <div>D-6</div>
                <div>EMPTY</div>
              </div>
              <div className="p-1.5 rounded bg-secondary text-on-secondary text-center">
                <div>E-1</div>
                <div>450 Q</div>
              </div>
              <div
                onClick={() => setSelectedBatchId('C-012')}
                className="p-1.5 rounded bg-tertiary text-on-tertiary text-center cursor-pointer hover:opacity-90"
              >
                <div>F-3</div>
                <div>320 Q</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Batch Summary Panel (Col 4) */}
        {selectedBatch && (
          <div className="lg:col-span-4 space-y-space-sm">
            <div className="bg-surface-container-lowest rounded border border-outline-variant p-space-md shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-title text-base text-on-surface font-bold">
                      Batch {selectedBatch.id} Summary
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-mono text-[10px] font-bold">
                      FIFO #1
                    </span>
                  </div>
                  <div className="text-[11px] text-outline">Central Grain Register Record</div>
                </div>
                <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
              </div>

              {/* Quality Parameters Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-surface-container-low border border-outline-variant">
                  <div className="text-[10px] text-outline font-semibold uppercase">Moisture Level</div>
                  <div className="font-numeric-metric font-bold text-on-surface mt-0.5">
                    {selectedBatch.quality_metrics.moisture_pct}%{' '}
                    <span className="text-[10px] text-primary font-normal">Pass (&lt;12%)</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container-low border border-outline-variant">
                  <div className="text-[10px] text-outline font-semibold uppercase">Grain Density</div>
                  <div className="font-numeric-metric font-bold text-on-surface mt-0.5">
                    {selectedBatch.quality_metrics.grain_density_kghl} <span className="text-[10px] text-outline">kg/hl</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container-low border border-outline-variant">
                  <div className="text-[10px] text-outline font-semibold uppercase">Foreign Matter</div>
                  <div className="font-numeric-metric font-bold text-on-surface mt-0.5">
                    {selectedBatch.quality_metrics.foreign_matter_pct}%{' '}
                    <span className="text-[10px] text-primary font-normal">Pass</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container-low border border-outline-variant">
                  <div className="text-[10px] text-outline font-semibold uppercase">Weevilled Grain</div>
                  <div className="font-numeric-metric font-bold text-on-surface mt-0.5">
                    {selectedBatch.quality_metrics.weevilled_grain_pct}%{' '}
                    <span className="text-[10px] text-primary font-normal">Nil</span>
                  </div>
                </div>
              </div>

              {/* FIFO Priority Card */}
              <div className="p-2.5 rounded bg-primary/10 border border-primary/20 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">FIFO Priority Index</span>
                  <span className="font-bold text-primary font-numeric-data">100% Eligible</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  <strong>Rank #1 in Wheat Queue.</strong> Stored for 20 days. Mandatory dispatch mandate under NFSA before Batch W-102.
                </p>
                <div className="text-[10px] text-primary flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Zero open complaints or moisture alerts
                </div>
              </div>

              {/* Physical Bay Location */}
              <div className="text-xs space-y-1.5 border-t border-outline-variant pt-2">
                <div className="font-bold text-on-surface text-[11px] uppercase text-outline">Physical Godown Bay Details</div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-outline">Shed &amp; Bay:</span>
                  <span className="font-semibold text-on-surface text-right">{selectedBatch.shed} - {selectedBatch.bay}</span>
                  <span className="text-outline">Stack Matrix ID:</span>
                  <span className="font-semibold text-on-surface text-right">{selectedBatch.stack_id}</span>
                  <span className="text-outline">Intake Inspector:</span>
                  <span className="font-semibold text-on-surface text-right">{selectedBatch.quality_metrics.inspector_name}</span>
                  <span className="text-outline">Intake Challan:</span>
                  <span className="font-mono text-on-surface text-right">{selectedBatch.intake_challan}</span>
                </div>
              </div>

              {/* Checksum Audit Block */}
              <div className="p-2 rounded bg-surface-container font-numeric-data text-[10px] space-y-0.5">
                <div className="flex justify-between text-outline">
                  <span>AUDIT CHECKSUM</span>
                  <span className="text-primary font-bold">SHA-256 Valid</span>
                </div>
                <div className="text-on-surface truncate">{selectedBatch.checksum}</div>
                <div className="text-[9px] text-outline">Cryptographically sealed at Weighbridge #02</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => setActivePath('fps-dispatch-and-fifo')}
                  className="w-full py-2 rounded bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  <span>Create FPS Outward Release Memo</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setActivePath('quality-inspection');
                      showToast(`Viewing Lab QC for Batch ${selectedBatch.id}`, 'info');
                    }}
                    className="py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">science</span>
                    <span>View Lab QC</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePath('stock-movement-ledger');
                      showToast(`Opening Movement Ledger for Batch ${selectedBatch.id}`, 'info');
                    }}
                    className="py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                    <span>Ledger Log</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustmentModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded border border-outline-variant shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <span className="font-title text-sm text-on-surface font-bold">Manual Stock Count Adjustment</span>
              </div>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-3 text-xs">
              <div className="p-2 rounded bg-surface-container-low text-on-surface space-y-1">
                <div>Target Batch: <strong className="font-mono">{selectedBatch.id}</strong> ({selectedBatch.commodity_name})</div>
                <div>Current Book Balance: <strong className="font-mono">{selectedBatch.on_hand_qtl} Qtl</strong></div>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  Adjustment Variance in Quintals (e.g. -20 for deficit, +15 for surplus)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="-10.50"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className="w-full h-8 px-2 bg-surface-container border border-outline-variant rounded font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Mandatory Physical Verification Reason</label>
                <textarea
                  required
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full p-2 bg-surface-container border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-2 rounded bg-secondary-container/40 text-on-secondary-container text-[11px]">
                Note: Under Rule 14-B, all manual adjustments append immutable double-entry ledger rows and notify the District Supply Officer.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-3 py-1.5 rounded bg-surface-container text-on-surface font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-primary text-on-primary font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Post Adjustment Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
