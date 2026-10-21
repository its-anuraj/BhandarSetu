import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COMMODITIES } from '../../services/storage';

export const ReportsView: React.FC = () => {
  const { batches, dispatches, challans, showToast } = useApp();
  const [activeReportTab, setActiveReportTab] = useState<'BATCH' | 'COMMODITY' | 'AGEING' | 'FPS'>('BATCH');

  // Calculations for Commodity Report
  const commodityReport = COMMODITIES.map((c) => {
    const cBatches = batches.filter((b) => b.commodity_id === c.id);
    const totalPhysical = cBatches.reduce((sum, b) => sum + b.on_hand_qtl, 0);
    const totalReserved = cBatches.reduce((sum, b) => sum + b.reserved_qtl, 0);
    const onHold = cBatches
      .filter((b) => b.quality_status === 'QUALITY_HOLD' || b.quality_status === 'AWAITING_INSPECTION')
      .reduce((sum, b) => sum + b.on_hand_qtl, 0);
    const usable = Math.max(0, totalPhysical - totalReserved - onHold);

    // Oldest eligible batch
    const eligibleBatches = cBatches
      .filter((b) => b.quality_status === 'ELIGIBLE' && b.on_hand_qtl > b.reserved_qtl)
      .sort((a, b) => new Date(a.intake_date).getTime() - new Date(b.intake_date).getTime());
    const oldest = eligibleBatches[0];

    const today = new Date('2026-10-21');
    const oldestAge = oldest
      ? Math.floor((today.getTime() - new Date(oldest.intake_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      commodity: c,
      totalPhysical,
      totalReserved,
      onHold,
      usable,
      oldestBatchId: oldest ? oldest.id : 'None',
      oldestAge,
    };
  });

  // Critical Ageing Batches (> 50 days)
  const today = new Date('2026-10-21');
  const ageingBatches = batches
    .map((b) => {
      const age = Math.floor((today.getTime() - new Date(b.intake_date).getTime()) / (1000 * 60 * 60 * 24));
      return { ...b, ageDays: age };
    })
    .filter((b) => b.ageDays >= 40 && b.on_hand_qtl > 0)
    .sort((a, b) => b.ageDays - a.ageDays);

  const exportCurrentReportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = 'Report.csv';

    if (activeReportTab === 'BATCH') {
      headers = [
        'Batch ID',
        'Commodity',
        'Intake Date',
        'Source Agency',
        'Stack Location',
        'On Hand (Qtl)',
        'Reserved (Qtl)',
        'Quality Status',
        'Moisture %',
      ];
      rows = batches.map((b) => [
        `"${b.id}"`,
        `"${b.commodity_name}"`,
        `"${b.intake_date}"`,
        `"${b.source_agency}"`,
        `"${b.shed} ${b.stack_id}"`,
        b.on_hand_qtl,
        b.reserved_qtl,
        `"${b.quality_status}"`,
        b.quality_metrics.moisture_pct,
      ]);
      filename = `Batch_Wise_Stock_Register_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeReportTab === 'COMMODITY') {
      headers = [
        'Commodity',
        'Physical Stored (Qtl)',
        'Usable (Qtl)',
        'Reserved (Qtl)',
        'On Hold (Qtl)',
        'Oldest Batch',
        'Batch Age (Days)',
      ];
      rows = commodityReport.map((r) => [
        `"${r.commodity.name}"`,
        r.totalPhysical,
        r.usable,
        r.totalReserved,
        r.onHold,
        `"${r.oldestBatchId}"`,
        r.oldestAge,
      ]);
      filename = `Commodity_Stock_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeReportTab === 'AGEING') {
      headers = [
        'Batch ID',
        'Commodity',
        'Age (Days)',
        'Intake Date',
        'On Hand (Qtl)',
        'Shed Location',
        'Moisture %',
        'Status',
      ];
      rows = ageingBatches.map((b) => [
        `"${b.id}"`,
        `"${b.commodity_name}"`,
        b.ageDays,
        `"${b.intake_date}"`,
        b.on_hand_qtl,
        `"${b.shed} ${b.bay}"`,
        b.quality_metrics.moisture_pct,
        `"${b.quality_status}"`,
      ]);
      filename = `Grain_Ageing_Alert_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = [
        'Challan No',
        'Date',
        'FPS Name',
        'Licensee',
        'Commodity',
        'Quantity (Qtl)',
        'Vehicle No',
        'Status',
      ];
      rows = challans.map((c) => [
        `"${c.challan_no}"`,
        `"${c.date}"`,
        `"${c.fps_name}"`,
        `"${c.licensee_name}"`,
        `"${c.commodity_name}"`,
        c.total_quantity_qtl,
        `"${c.carrier_vehicle_no}"`,
        `"${c.status}"`,
      ]);
      filename = `FPS_Distribution_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${rows.length} rows to ${filename}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              CIVIL SUPPLIES LOGISTICS • SECTION 11
            </span>
            <span className="text-xs bg-[#e8f0e9] text-[#214e3d] font-semibold px-2 py-0.5 rounded border border-[#214e3d]/30">
              Departmental Statutory Registers
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            Reports & Statutory Stock Registers
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Official NFSA compliance statements, FIFO compliance audit sheets, and grain ageing liquidation tallies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCurrentReportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e3e2d9] text-[#252d29] text-xs font-semibold rounded hover:bg-[#f6f5f0] transition shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-[#214e3d]">download</span>
            Export Active Report (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Register
          </button>
        </div>
      </div>

      {/* Depot Capacity Utilization Overview */}
      <div className="bg-[#f6f5f0] p-4 rounded-lg border border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#214e3d] text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">warehouse</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#252d29] uppercase tracking-wider">
              Central Grain Store (Demo WH-DEL-04) • Total Capacity 50,000 Qtl
            </h4>
            <p className="text-xs text-[#69736b] mt-0.5">
              Current Depot Aggregate: <span className="font-bold text-[#252d29]">40,500.00 Qtl (4,050.0 MT)</span> Physical Stored •{' '}
              <span className="text-[#214e3d] font-semibold">9,500 Qtl Available Storage Space</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#214e3d]">81.6% Full</span>
            <div className="w-32 bg-[#e3e2d9] h-2 rounded-full mt-1 overflow-hidden">
              <div className="bg-[#214e3d] h-full rounded-full" style={{ width: '81.6%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#f6f5f0] p-1 rounded-lg border border-[#e3e2d9] overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('BATCH')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded transition whitespace-nowrap ${
            activeReportTab === 'BATCH'
              ? 'bg-white text-[#214e3d] shadow-xs border border-[#e3e2d9]'
              : 'text-[#69736b] hover:text-[#252d29]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
          1. Batch-Wise Stock Register
        </button>

        <button
          onClick={() => setActiveReportTab('COMMODITY')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded transition whitespace-nowrap ${
            activeReportTab === 'COMMODITY'
              ? 'bg-white text-[#214e3d] shadow-xs border border-[#e3e2d9]'
              : 'text-[#69736b] hover:text-[#252d29]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">pie_chart</span>
          2. Commodity Stock Statement
        </button>

        <button
          onClick={() => setActiveReportTab('AGEING')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded transition whitespace-nowrap ${
            activeReportTab === 'AGEING'
              ? 'bg-white text-[#214e3d] shadow-xs border border-[#e3e2d9]'
              : 'text-[#69736b] hover:text-[#252d29]'
          }`}
        >
          <span className="material-symbols-outlined text-sm text-[#9b641b]">history</span>
          3. Grain Ageing & Liquidation Priority ({ageingBatches.length})
        </button>

        <button
          onClick={() => setActiveReportTab('FPS')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded transition whitespace-nowrap ${
            activeReportTab === 'FPS'
              ? 'bg-white text-[#214e3d] shadow-xs border border-[#e3e2d9]'
              : 'text-[#69736b] hover:text-[#252d29]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">local_shipping</span>
          4. FPS Distribution Statement ({challans.length})
        </button>
      </div>

      {/* Tab 1: Batch-Wise Stock Register */}
      {activeReportTab === 'BATCH' && (
        <div className="bg-white rounded-lg border border-[#e3e2d9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f5f0] border-b border-[#e3e2d9] text-[10px] font-mono uppercase text-[#69736b]">
                  <th className="py-2.5 px-4 font-semibold">Batch ID</th>
                  <th className="py-2.5 px-4 font-semibold">Commodity Specification</th>
                  <th className="py-2.5 px-4 font-semibold">Intake Date</th>
                  <th className="py-2.5 px-4 font-semibold">Source Agency</th>
                  <th className="py-2.5 px-4 font-semibold">Shed & Stack</th>
                  <th className="py-2.5 px-4 font-semibold text-right">On Hand (Qtl)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Reserved</th>
                  <th className="py-2.5 px-4 font-semibold">Quality Status</th>
                  <th className="py-2.5 px-4 font-semibold">Lab Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e2d9]">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f6f5f0]/60 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#214e3d]">{b.id}</td>
                    <td className="py-2.5 px-4 text-[#252d29] font-medium">{b.commodity_name}</td>
                    <td className="py-2.5 px-4 font-mono text-[#69736b]">{b.intake_date}</td>
                    <td className="py-2.5 px-4 text-[#252d29]">{b.source_agency}</td>
                    <td className="py-2.5 px-4 text-[#69736b] font-mono">
                      {b.shed} ({b.stack_id})
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#252d29]">
                      {b.on_hand_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#9b641b]">
                      {b.reserved_qtl > 0 ? `${b.reserved_qtl} Qtl` : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          b.quality_status === 'ELIGIBLE'
                            ? 'bg-[#e8f0e9] text-[#214e3d]'
                            : b.quality_status === 'QUALITY_HOLD'
                            ? 'bg-[#fbeae9] text-[#a43f36]'
                            : 'bg-[#fef3c7] text-[#9b641b]'
                        }`}
                      >
                        {b.quality_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#69736b]">
                      {b.quality_metrics.lab_slip_no}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Commodity Stock Statement */}
      {activeReportTab === 'COMMODITY' && (
        <div className="bg-white rounded-lg border border-[#e3e2d9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f5f0] border-b border-[#e3e2d9] text-[10px] font-mono uppercase text-[#69736b]">
                  <th className="py-2.5 px-4 font-semibold">Commodity</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Physical Stored</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Usable Stock</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Reserved (FPS)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">On Hold</th>
                  <th className="py-2.5 px-4 font-semibold">Oldest Eligible Batch</th>
                  <th className="py-2.5 px-4 font-semibold">Batch Age</th>
                  <th className="py-2.5 px-4 font-semibold">FIFO Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e2d9]">
                {commodityReport.map((r) => (
                  <tr key={r.commodity.id} className="hover:bg-[#f6f5f0]/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#214e3d] block">{r.commodity.name}</span>
                      <span className="text-[10px] text-[#69736b]">{r.commodity.specification}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#252d29]">
                      {r.totalPhysical.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#214e3d]">
                      {r.usable.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#9b641b]">
                      {r.totalReserved.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#a43f36]">
                      {r.onHold > 0 ? `${r.onHold.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl` : '0.00 Qtl'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#214e3d]">{r.oldestBatchId}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#252d29]">
                      {r.oldestAge > 0 ? `${r.oldestAge} Days` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-[#e8f0e9] text-[#214e3d] font-bold px-2 py-0.5 rounded">
                        FIFO ENFORCED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Grain Ageing & Liquidation */}
      {activeReportTab === 'AGEING' && (
        <div className="space-y-4">
          <div className="bg-[#fffdf8] p-3 rounded border border-[#b48643]/30 text-xs text-[#9b641b]">
            <p className="font-bold uppercase tracking-wider text-[10px]">
              ⚠️ Departmental Ageing Alert Thresholds (Wheat & Pulses: &gt; 60 Days, Rice: &gt; 90 Days)
            </p>
            <p className="mt-0.5">
              The batches listed below have exceeded standard holding thresholds. Per PDS Rule 14-B, these stacks must
              be scheduled for immediate liquidation to prevent moisture re-absorption and weevil infestation.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#e3e2d9] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f6f5f0] border-b border-[#e3e2d9] text-[10px] font-mono uppercase text-[#69736b]">
                    <th className="py-2.5 px-4 font-semibold">Batch ID</th>
                    <th className="py-2.5 px-4 font-semibold">Commodity</th>
                    <th className="py-2.5 px-4 font-semibold">Age (Days in Depot)</th>
                    <th className="py-2.5 px-4 font-semibold">Intake Date</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Available Qtl</th>
                    <th className="py-2.5 px-4 font-semibold">Stack Location</th>
                    <th className="py-2.5 px-4 font-semibold">Moisture</th>
                    <th className="py-2.5 px-4 font-semibold">Statutory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e2d9]">
                  {ageingBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f6f5f0]/60 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#214e3d]">{b.id}</td>
                      <td className="py-2.5 px-4 font-medium text-[#252d29]">{b.commodity_name}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-bold text-sm text-[#9b641b]">{b.ageDays} Days</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#69736b]">{b.intake_date}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#252d29]">
                        {b.on_hand_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#69736b]">
                        {b.shed} ({b.bay})
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#252d29]">
                        {b.quality_metrics.moisture_pct}%
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-bold uppercase bg-[#fef3c7] text-[#9b641b] px-2 py-0.5 rounded border border-[#f59e0b]/40">
                          Mandatory Clearance
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: FPS Distribution Statement */}
      {activeReportTab === 'FPS' && (
        <div className="bg-white rounded-lg border border-[#e3e2d9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f5f0] border-b border-[#e3e2d9] text-[10px] font-mono uppercase text-[#69736b]">
                  <th className="py-2.5 px-4 font-semibold">Challan No</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Consignee FPS</th>
                  <th className="py-2.5 px-4 font-semibold">Commodity</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Dispatched Qtl</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Bags (50kg)</th>
                  <th className="py-2.5 px-4 font-semibold">Carrier Truck</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e2d9]">
                {challans.map((c) => (
                  <tr key={c.challan_no} className="hover:bg-[#f6f5f0]/60 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#214e3d]">#{c.challan_no}</td>
                    <td className="py-2.5 px-4 font-mono text-[#69736b]">{c.date}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-[#252d29] block">{c.fps_name}</span>
                      <span className="text-[10px] text-[#69736b] font-mono">Code: {c.fps_code}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[#252d29]">{c.commodity_name}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#252d29]">
                      {c.total_quantity_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#69736b]">{c.total_bags}</td>
                    <td className="py-2.5 px-4 font-mono text-[#252d29]">{c.carrier_vehicle_no}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          c.status === 'DISPATCHED'
                            ? 'bg-[#e8f0e9] text-[#214e3d]'
                            : 'bg-[#fef3c7] text-[#9b641b]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
