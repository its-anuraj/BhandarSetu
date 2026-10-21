import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COMMODITIES } from '../../services/storage';

export const StockLedgerView: React.FC = () => {
  const { movements, showToast } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCommodity, setFilterCommodity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalEvents = movements.length;
  const totalInwardCredits = movements.reduce((sum, m) => sum + (m.credit_qtl || 0), 0);
  const totalOutwardDebits = movements.reduce((sum, m) => sum + (m.debit_qtl || 0), 0);

  const filteredMovements = movements.filter((m) => {
    if (filterType !== 'ALL' && m.event_type !== filterType) return false;
    if (filterCommodity !== 'ALL' && m.commodity_name.toLowerCase().indexOf(filterCommodity.toLowerCase()) === -1) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        m.id.toLowerCase().includes(term) ||
        m.batch_id.toLowerCase().includes(term) ||
        m.reference_id.toLowerCase().includes(term) ||
        m.commodity_name.toLowerCase().includes(term) ||
        m.actor_name.toLowerCase().includes(term) ||
        (m.notes && m.notes.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Movement ID',
      'Timestamp',
      'Event Type',
      'Commodity',
      'Batch ID',
      'Godown',
      'Debit (Qtl)',
      'Credit (Qtl)',
      'Resulting Balance (Qtl)',
      'Reference ID',
      'Authorized Officer',
      'Notes',
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.id}"`,
      `"${m.timestamp}"`,
      `"${m.event_type}"`,
      `"${m.commodity_name}"`,
      `"${m.batch_id}"`,
      `"${m.godown}"`,
      m.debit_qtl || 0,
      m.credit_qtl || 0,
      m.resulting_balance_qtl || 0,
      `"${m.reference_id}"`,
      `"${m.actor_name}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Movement_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredMovements.length} ledger movement entries to CSV!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              CIVIL SUPPLIES DEPOT #04 • SECTION 10
            </span>
            <span className="text-xs bg-[#e8f0e9] text-[#214e3d] font-semibold px-2 py-0.5 rounded border border-[#214e3d]/30">
              Immutable Double-Entry Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            Stock Movement & Transaction Ledger
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Traceable chronological registry of all inward consignments, gate outward dispatches, and authorized adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e3e2d9] text-[#252d29] text-xs font-semibold rounded hover:bg-[#f6f5f0] transition shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-[#214e3d]">download</span>
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Ledger
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#69736b]">Total Movements</p>
          <p className="text-2xl font-bold font-mono text-[#252d29] mt-1">{totalEvents}</p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Audit-sealed transactions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#214e3d]">Total Inward Credits (+)</p>
          <p className="text-2xl font-bold font-mono text-[#214e3d] mt-1">
            +{totalInwardCredits.toLocaleString('en-IN', { minimumFractionDigits: 1 })}{' '}
            <span className="text-xs font-normal text-[#69736b]">Qtl</span>
          </p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Verified gate receipts posted</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#a43f36]">Total Outward Debits (-)</p>
          <p className="text-2xl font-bold font-mono text-[#a43f36] mt-1">
            -{totalOutwardDebits.toLocaleString('en-IN', { minimumFractionDigits: 1 })}{' '}
            <span className="text-xs font-normal text-[#69736b]">Qtl</span>
          </p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Challans confirmed outward</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#9b641b]">Net Physical Movement</p>
          <p className="text-2xl font-bold font-mono text-[#252d29] mt-1">
            {(totalInwardCredits - totalOutwardDebits).toLocaleString('en-IN', { minimumFractionDigits: 1 })}{' '}
            <span className="text-xs font-normal text-[#69736b]">Qtl</span>
          </p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Cumulative net grain inflow</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Event Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#252d29]">Event:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#214e3d]"
            >
              <option value="ALL">All Event Types</option>
              <option value="INWARD">Inward Receipts</option>
              <option value="DISPATCH">Outward Dispatches</option>
              <option value="ADJUSTMENT">Stock Adjustments</option>
              <option value="AUDIT">Audit Reconciliations</option>
            </select>
          </div>

          {/* Commodity Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#252d29]">Commodity:</span>
            <select
              value={filterCommodity}
              onChange={(e) => setFilterCommodity(e.target.value)}
              className="text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#214e3d]"
            >
              <option value="ALL">All Commodities</option>
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.name.split(' ')[0]}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#69736b] text-base">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Movement ID, Batch, Challan #, Officer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded focus:bg-white focus:outline-none focus:border-[#214e3d]"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-[#e3e2d9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f5f0] border-b border-[#e3e2d9] text-[10px] font-mono uppercase text-[#69736b]">
                <th className="py-2.5 px-4 font-semibold">Time & Date</th>
                <th className="py-2.5 px-4 font-semibold">Movement ID & Event</th>
                <th className="py-2.5 px-4 font-semibold">Batch & Commodity</th>
                <th className="py-2.5 px-4 font-semibold">Ref Document</th>
                <th className="py-2.5 px-4 font-semibold text-right">Debit (-)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Credit (+)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Resulting Bal</th>
                <th className="py-2.5 px-4 font-semibold">Authorized Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e2d9]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#69736b]">
                    No ledger entries match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isDebit = m.debit_qtl > 0;
                  const isCredit = m.credit_qtl > 0;

                  return (
                    <tr key={m.id} className="hover:bg-[#f6f5f0]/60 transition">
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[#252d29] block font-medium">
                          {m.time_label || m.timestamp.split('T')[1]?.slice(0, 5) || '10:00'}
                        </span>
                        <span className="text-[10px] text-[#69736b] font-mono">
                          {m.timestamp.split('T')[0]}
                        </span>
                      </td>

                      {/* Movement ID & Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-[#252d29] block">
                          {m.id}
                        </span>
                        <span
                          className={`inline-block text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                            m.event_type === 'INWARD'
                              ? 'bg-[#e8f0e9] text-[#214e3d]'
                              : m.event_type === 'DISPATCH'
                              ? 'bg-[#fef3c7] text-[#9b641b]'
                              : m.event_type === 'ADJUSTMENT'
                              ? 'bg-[#fbeae9] text-[#a43f36]'
                              : 'bg-[#f6f5f0] text-[#69736b] border border-[#e3e2d9]'
                          }`}
                        >
                          {m.event_type}
                        </span>
                      </td>

                      {/* Batch & Commodity */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#214e3d] block">{m.batch_id}</span>
                        <span className="text-[#69736b] text-[11px] block truncate max-w-xs">
                          {m.commodity_name}
                        </span>
                      </td>

                      {/* Ref Document */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-[#252d29] bg-[#f6f5f0] px-1.5 py-0.5 rounded border border-[#e3e2d9]">
                          {m.reference_id}
                        </span>
                      </td>

                      {/* Debit */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#a43f36] whitespace-nowrap">
                        {isDebit ? `-${m.debit_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl` : '—'}
                      </td>

                      {/* Credit */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#214e3d] whitespace-nowrap">
                        {isCredit ? `+${m.credit_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl` : '—'}
                      </td>

                      {/* Resulting Balance */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#252d29] whitespace-nowrap">
                        {m.resulting_balance_qtl !== undefined
                          ? `${m.resulting_balance_qtl.toLocaleString('en-IN', { minimumFractionDigits: 1 })} Qtl`
                          : '—'}
                      </td>

                      {/* Officer & Notes */}
                      <td className="py-3 px-4">
                        <span className="text-[#252d29] font-medium block truncate max-w-[180px]">
                          {m.actor_name}
                        </span>
                        {m.notes && (
                          <span className="text-[10px] text-[#69736b] block truncate max-w-[200px]" title={m.notes}>
                            {m.notes}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
