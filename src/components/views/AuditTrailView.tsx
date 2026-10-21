import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface AuditEvent {
  id: string;
  timestamp: string;
  category: 'AUTH' | 'INVENTORY' | 'QUALITY' | 'FIFO' | 'DISPATCH' | 'SECURITY';
  severity: 'INFO' | 'AUDIT' | 'WARNING' | 'SECURITY';
  action: string;
  actor: string;
  badge: string;
  terminal_ip: string;
  sha256: string;
  details: string;
}

const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-2026-9912',
    timestamp: '2026-10-21T10:45:19Z',
    category: 'DISPATCH',
    severity: 'AUDIT',
    action: 'CONFIRM_GATE_OUTWARD',
    actor: 'R. Sharma',
    badge: 'DL-FCS-4491',
    terminal_ip: '10.14.22.8 (Weighbridge Gate #02)',
    sha256: '9f83a210bc8742d19e09f7a834b92c4d619082bc',
    details: 'Challan #CH-2026-8821 confirmed outward. Physical deduction: 150.0 Qtl from Batch W-101. Running balance: 850.0 Qtl.',
  },
  {
    id: 'AUD-2026-9908',
    timestamp: '2026-10-21T09:30:44Z',
    category: 'INVENTORY',
    severity: 'INFO',
    action: 'POST_STOCK_INWARD',
    actor: 'P. Rawat',
    badge: 'DL-OPS-3301',
    terminal_ip: '10.14.22.4 (Platform Weighbridge #01)',
    sha256: 'c4e8201a9dfb61034f71a9e320874bf81920ac34',
    details: 'Inward Consignment #INW-2026-DEL-0482 verified and posted. Batch W-104 (480 Bags, 240.0 Qtl) created in Shed 04-B.',
  },
  {
    id: 'AUD-2026-9895',
    timestamp: '2026-10-21T08:15:20Z',
    category: 'QUALITY',
    severity: 'WARNING',
    action: 'QUALITY_HOLD_IMPOSED',
    actor: 'Inspector Verma',
    badge: 'DL-QC-8812',
    terminal_ip: '10.14.22.12 (Depot QC Laboratory)',
    sha256: '7b204e8912cd3412aa89104bf7621cba5021e901',
    details: 'Batch W-103 (600.0 Qtl Wheat) flagged for moisture re-test at 13.8% (Permissible max 12.0%). Status locked to QUALITY_HOLD.',
  },
  {
    id: 'AUD-2026-9880',
    timestamp: '2026-10-21T08:00:10Z',
    category: 'FIFO',
    severity: 'WARNING',
    action: 'FIFO_BYPASS_REQUESTED',
    actor: 'M. Singh',
    badge: 'DL-DISP-2219',
    terminal_ip: '10.14.22.6 (Dispatch Desk #01)',
    sha256: '38ea9012bc4f552199b012ca7845ef20194bc891',
    details: 'Operator submitted FIFO bypass request #EXC-FPS-2048 for requisition #FPS-2048-CHAL. Reason: Temporary stack obstruction in Shed 04.',
  },
  {
    id: 'AUD-2026-9850',
    timestamp: '2026-10-21T07:45:00Z',
    category: 'AUTH',
    severity: 'INFO',
    action: 'USER_LOGIN_MFA',
    actor: 'R. Sharma',
    badge: 'DL-FCS-4491',
    terminal_ip: '10.14.22.2 (Depot Manager Cabin)',
    sha256: '881023ba7791fe201cba90123ef8902bc45012ab',
    details: 'Aadhaar / PDS Biometric Token authentication successful. Session established with GODOWN_MANAGER permissions.',
  },
  {
    id: 'AUD-2026-9810',
    timestamp: '2026-10-20T18:00:00Z',
    category: 'SECURITY',
    severity: 'AUDIT',
    action: 'END_OF_DAY_RECONCILIATION',
    actor: 'A. K. Mathur',
    badge: 'DL-DSO-0104',
    terminal_ip: '10.14.10.1 (District Supply Office HQ)',
    sha256: 'aa1940bc77123efb90812ac44192083bc99102ef',
    details: 'Monthly stock reconciliation audit finalized. Cryptographic hash verified against central civil supplies state ledger. Discrepancy: 0.00%.',
  },
];

export const AuditTrailView: React.FC = () => {
  const { showToast } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = SEED_AUDIT_EVENTS.filter((e) => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        e.id.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        e.actor.toLowerCase().includes(term) ||
        e.badge.toLowerCase().includes(term) ||
        e.details.toLowerCase().includes(term) ||
        e.sha256.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const exportAuditLogCSV = () => {
    const headers = ['Audit ID', 'Timestamp', 'Category', 'Severity', 'Action', 'Actor', 'Badge', 'IP', 'SHA-256', 'Details'];
    const rows = filteredEvents.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.category}"`,
      `"${e.severity}"`,
      `"${e.action}"`,
      `"${e.actor}"`,
      `"${e.badge}"`,
      `"${e.terminal_ip}"`,
      `"${e.sha256}"`,
      `"${e.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredEvents.length} audit records to CSV!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              SECURITY & COMPLIANCE • SECTION 12
            </span>
            <span className="text-xs bg-[#e8f0e9] text-[#214e3d] font-semibold px-2 py-0.5 rounded border border-[#214e3d]/30">
              SHA-256 Cryptographic Chain
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            System Audit Trail & Security Ledger
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Immutable, tamper-evident log of all authentication events, stock deductions, FIFO overrides, and lab holds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditLogCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e3e2d9] text-[#252d29] text-xs font-semibold rounded hover:bg-[#f6f5f0] transition shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-[#214e3d]">download</span>
            Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#252d29]">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#214e3d]"
            >
              <option value="ALL">All Severities</option>
              <option value="AUDIT">AUDIT</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#252d29]">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#214e3d]"
            >
              <option value="ALL">All Categories</option>
              <option value="DISPATCH">DISPATCH</option>
              <option value="FIFO">FIFO</option>
              <option value="QUALITY">QUALITY</option>
              <option value="INVENTORY">INVENTORY</option>
              <option value="AUTH">AUTH</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        </div>

        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#69736b] text-base">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, badge, SHA hash..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f6f5f0] border border-[#e3e2d9] rounded focus:bg-white focus:outline-none focus:border-[#214e3d]"
          />
        </div>
      </div>

      {/* Audit Events List */}
      <div className="space-y-3">
        {filteredEvents.map((e) => (
          <div
            key={e.id}
            className="bg-white rounded-lg border border-[#e3e2d9] p-4 hover:border-[#214e3d]/40 transition shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3e2d9] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#214e3d] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
                  #{e.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    e.severity === 'AUDIT'
                      ? 'bg-[#e8f0e9] text-[#214e3d]'
                      : e.severity === 'WARNING'
                      ? 'bg-[#fef3c7] text-[#9b641b]'
                      : e.severity === 'SECURITY'
                      ? 'bg-[#fbeae9] text-[#a43f36]'
                      : 'bg-[#f6f5f0] text-[#69736b]'
                  }`}
                >
                  {e.severity}
                </span>
                <span className="font-bold font-mono text-xs text-[#252d29]">{e.action}</span>
              </div>

              <div className="text-[11px] text-[#69736b] font-mono">
                {e.timestamp.replace('T', ' ').replace('Z', ' UTC')}
              </div>
            </div>

            <p className="text-xs text-[#252d29] mt-2 leading-relaxed">{e.details}</p>

            <div className="mt-3 pt-2 border-t border-[#f6f5f0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#69736b]">
              <div className="flex items-center gap-3">
                <span>
                  Actor: <span className="font-semibold text-[#252d29]">{e.actor}</span> (
                  <span className="font-mono text-[#214e3d]">{e.badge}</span>)
                </span>
                <span className="hidden md:inline">•</span>
                <span className="font-mono">{e.terminal_ip}</span>
              </div>

              <div className="font-mono text-[10px] text-[#69736b]">
                SHA-256: <span className="text-[#252d29]">{e.sha256}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
