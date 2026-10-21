import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { FIFOExceptionRecord } from '../../types';

export const FIFOExceptionsView: React.FC = () => {
  const { exceptions, currentUser, showToast, refreshData } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const isAuthorizedApprover =
    currentUser.role === 'GODOWN_MANAGER' ||
    currentUser.role === 'DISTRICT_SUPPLY_OFFICER' ||
    currentUser.role === 'PLATFORM_SUPER_ADMIN';

  const pendingCount = exceptions.filter((e) => e.status === 'PENDING_SIGN_OFF').length;
  const authorizedCount = exceptions.filter((e) => e.status === 'AUTHORIZED').length;
  const rejectedCount = exceptions.filter((e) => e.status === 'REJECTED').length;

  const filteredExceptions = exceptions.filter((e) => {
    if (filterStatus === 'PENDING_SIGN_OFF') return e.status === 'PENDING_SIGN_OFF';
    if (filterStatus === 'AUTHORIZED') return e.status === 'AUTHORIZED';
    if (filterStatus === 'REJECTED') return e.status === 'REJECTED';
    return true;
  });

  const handleAuthorize = (exc: FIFOExceptionRecord) => {
    if (!isAuthorizedApprover) {
      showToast(
        `Access Denied: Only Godown Manager or District Supply Officer can authorize Rule 14-B exceptions.`,
        'error'
      );
      return;
    }

    const success = storage.authorizeException(exc.id, currentUser);
    if (success) {
      refreshData();
      showToast(
        `FIFO Exception #${exc.id} AUTHORIZED by ${currentUser.name} (${currentUser.badge_no}). Audit record logged.`,
        'success'
      );
    } else {
      showToast(`Failed to authorize exception #${exc.id}.`, 'error');
    }
  };

  const handleReject = (exc: FIFOExceptionRecord) => {
    if (!isAuthorizedApprover) {
      showToast(
        `Access Denied: Only Godown Manager or District Supply Officer can reject Rule 14-B exceptions.`,
        'error'
      );
      return;
    }
    if (!rejectReason.trim()) {
      showToast('Please provide a statutory rejection note explaining why strict FIFO was enforced.', 'warning');
      return;
    }

    const success = storage.rejectException(exc.id, currentUser, rejectReason);
    if (success) {
      refreshData();
      showToast(`FIFO Exception #${exc.id} REJECTED. Strict Rule 14-B enforced.`, 'info');
      setActiveRejectId(null);
      setRejectReason('');
    } else {
      showToast(`Failed to reject exception #${exc.id}.`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#69736b] bg-[#f6f5f0] px-2 py-0.5 rounded border border-[#e3e2d9]">
              CIVIL SUPPLIES LOGISTICS • SECTION 09
            </span>
            <span className="text-xs bg-[#fef3c7] text-[#9b641b] font-semibold px-2 py-0.5 rounded border border-[#f59e0b]/30">
              Statutory Dual Sign-Off
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-[#252d29] mt-1">
            FIFO Exceptions & Override Registry
          </h1>
          <p className="text-xs text-[#69736b] mt-0.5">
            Audit register of all operator requests to bypass older eligible foodgrain stacks under Rule 14-B.
          </p>
        </div>
      </div>

      {/* Statutory Notice */}
      <div className="bg-[#fffdf8] border-l-4 border-[#b48643] p-4 rounded-r-lg border border-[#e3e2d9] shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#9b641b] text-xl">gavel</span>
          <div>
            <h4 className="text-xs font-bold text-[#9b641b] uppercase tracking-wider">
              Statutory Mandate: Departmental FIFO Rule 14-B & NFSA Section 12(2)
            </h4>
            <p className="text-xs text-[#252d29] mt-1 leading-relaxed">
              Foodgrain consignments must be issued in strict chronological receipt sequence. Bypassing an older eligible
              batch in favor of newer stock is strictly prohibited unless authorized by the{' '}
              <span className="font-semibold">Godown Manager</span> or{' '}
              <span className="font-semibold">District Supply Officer (DSO)</span> with physical verification of operational
              obstruction or laboratory hold conditions.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#9b641b]">Pending Sign-Off</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono text-[#9b641b]">{pendingCount}</p>
            {pendingCount > 0 && (
              <span className="text-[10px] bg-[#fef3c7] text-[#9b641b] font-bold px-1.5 py-0.5 rounded animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#69736b] mt-0.5">Requires Manager/DSO review</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#214e3d]">Authorized Overrides</p>
          <p className="text-2xl font-bold font-mono text-[#214e3d] mt-1">{authorizedCount}</p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Signed off with operational justification</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e3e2d9] shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#a43f36]">Rejected Overrides</p>
          <p className="text-2xl font-bold font-mono text-[#a43f36] mt-1">{rejectedCount}</p>
          <p className="text-[11px] text-[#69736b] mt-0.5">Strict FIFO enforced by authority</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2.5 rounded-lg border border-[#e3e2d9] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#f6f5f0] p-0.5 rounded border border-[#e3e2d9]">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded transition ${
              filterStatus === 'ALL'
                ? 'bg-[#214e3d] text-white shadow-xs'
                : 'text-[#69736b] hover:text-[#252d29]'
            }`}
          >
            All Requests ({exceptions.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_SIGN_OFF')}
            className={`px-3 py-1 text-xs font-medium rounded transition ${
              filterStatus === 'PENDING_SIGN_OFF'
                ? 'bg-[#214e3d] text-white shadow-xs'
                : 'text-[#69736b] hover:text-[#252d29]'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('AUTHORIZED')}
            className={`px-3 py-1 text-xs font-medium rounded transition ${
              filterStatus === 'AUTHORIZED'
                ? 'bg-[#214e3d] text-white shadow-xs'
                : 'text-[#69736b] hover:text-[#252d29]'
            }`}
          >
            Authorized ({authorizedCount})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-3 py-1 text-xs font-medium rounded transition ${
              filterStatus === 'REJECTED'
                ? 'bg-[#214e3d] text-white shadow-xs'
                : 'text-[#69736b] hover:text-[#252d29]'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="text-xs text-[#69736b]">
          Active Persona: <span className="font-semibold text-[#252d29]">{currentUser.name}</span> (
          <span className="font-mono text-[#214e3d]">{currentUser.role}</span>)
        </div>
      </div>

      {/* Exception Records */}
      <div className="space-y-4">
        {filteredExceptions.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e3e2d9] p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-[#69736b]">fact_check</span>
            <p className="text-sm font-semibold text-[#252d29] mt-2">No Exception Records Found</p>
            <p className="text-xs text-[#69736b] mt-1">
              Zero FIFO bypass requests in this category. Strict FIFO Rule 14-B compliance intact.
            </p>
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const isPending = exc.status === 'PENDING_SIGN_OFF';
            const isAuthorized = exc.status === 'AUTHORIZED';

            return (
              <div
                key={exc.id}
                className="bg-white rounded-lg border border-[#e3e2d9] hover:border-[#b48643]/50 transition shadow-xs overflow-hidden"
              >
                {/* Header Row */}
                <div className="bg-[#f6f5f0] px-4 py-3 border-b border-[#e3e2d9] flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#214e3d] bg-white px-2 py-0.5 rounded border border-[#e3e2d9]">
                      #{exc.id}
                    </span>
                    <span className="text-xs text-[#69736b]">
                      Requisition Ref:{' '}
                      <span className="font-mono font-bold text-[#252d29]">{exc.requisition_id}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        isPending
                          ? 'bg-[#fef3c7] text-[#9b641b] border border-[#f59e0b]/40'
                          : isAuthorized
                          ? 'bg-[#e8f0e9] text-[#214e3d] border border-[#214e3d]/30'
                          : 'bg-[#fbeae9] text-[#a43f36] border border-[#a43f36]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isPending ? 'schedule' : isAuthorized ? 'verified' : 'cancel'}
                      </span>
                      {exc.status === 'PENDING_SIGN_OFF'
                        ? 'Pending Sign-Off'
                        : exc.status === 'AUTHORIZED'
                        ? 'Authorized by Management'
                        : 'Rejected (Strict FIFO Enforced)'}
                    </span>
                  </div>

                  <div className="text-xs text-[#69736b]">
                    Date: <span className="font-mono font-medium text-[#252d29]">{exc.requested_at.split('T')[0]}</span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-4">
                  {/* Stacks comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f6f5f0] p-3 rounded-lg border border-[#e3e2d9]">
                    <div className="border-r border-[#e3e2d9] pr-3">
                      <p className="text-[10px] font-mono uppercase text-[#a43f36] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">skip_next</span>
                        Skipped Priority Batch (Rule 14-B Target)
                      </p>
                      <p className="text-sm font-bold font-mono text-[#252d29] mt-1">{exc.bypassed_batch_id}</p>
                      <p className="text-xs text-[#69736b]">Commodity: {exc.commodity}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-mono uppercase text-[#214e3d] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">swap_horiz</span>
                        Proposed Substitute Batch
                      </p>
                      <p className="text-sm font-bold font-mono text-[#252d29] mt-1">{exc.selected_batch_id}</p>
                      <p className="text-xs text-[#69736b]">
                        Draw Quantity: <span className="font-mono font-bold text-[#252d29]">{exc.quantity_qtl} Qtl</span>
                      </p>
                    </div>
                  </div>

                  {/* Justification */}
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#69736b]">Operational Justification</p>
                    <p className="text-xs text-[#252d29] bg-[#fffdf8] p-3 rounded border border-[#e3e2d9] mt-1 leading-relaxed">
                      "{exc.justification_text}"
                    </p>
                    <p className="text-[11px] text-[#69736b] mt-1 font-mono">
                      Requested by: <span className="text-[#252d29] font-medium">{exc.requested_by}</span>
                    </p>
                  </div>

                  {/* Review / Decision Info */}
                  {exc.reviewed_by && (
                    <div className="bg-[#f6f5f0] p-3 rounded border border-[#e3e2d9] text-xs">
                      <p className="font-mono text-[10px] uppercase text-[#69736b]">Statutory Review Record</p>
                      <p className="text-[#252d29] font-semibold mt-0.5">
                        Reviewed by: <span className="text-[#214e3d]">{exc.reviewed_by}</span> at{' '}
                        <span className="font-mono">{exc.reviewed_at}</span>
                      </p>
                      {exc.audit_note && <p className="text-[#69736b] mt-1 italic">Note: {exc.audit_note}</p>}
                    </div>
                  )}

                  {/* Action buttons if Pending */}
                  {isPending && (
                    <div className="border-t border-[#e3e2d9] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {!isAuthorizedApprover ? (
                        <div className="text-xs text-[#9b641b] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Authorization requires Godown Manager or DSO role (Use Role Switcher in header).
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAuthorize(exc)}
                            className="px-3 py-1.5 bg-[#214e3d] text-white text-xs font-semibold rounded hover:bg-[#173b30] transition shadow-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">how_to_reg</span>
                            Authorize Exception
                          </button>
                          <button
                            onClick={() => {
                              setActiveRejectId(exc.id);
                              setRejectReason('Obstruction not severe; forklift clearance completed. Enforce strict Rule 14-B sequence.');
                            }}
                            className="px-3 py-1.5 bg-white border border-[#a43f36] text-[#a43f36] text-xs font-semibold rounded hover:bg-[#fbeae9] transition flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Reject (Enforce Rule 14-B)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection Modal / Prompt */}
                  {activeRejectId === exc.id && (
                    <div className="bg-[#fffdf8] p-3 rounded border border-[#a43f36]/40 space-y-2 animate-fadeIn">
                      <label className="text-xs font-bold text-[#a43f36] uppercase tracking-wider block">
                        Reason for Rejecting FIFO Bypass:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="State reason why priority stack cannot be skipped..."
                        className="w-full text-xs p-2 bg-white border border-[#e3e2d9] rounded focus:outline-none focus:border-[#a43f36]"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleReject(exc)}
                          className="px-3 py-1 bg-[#a43f36] text-white text-xs font-semibold rounded hover:bg-[#852f27] transition"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setActiveRejectId(null)}
                          className="px-3 py-1 bg-white border border-[#e3e2d9] text-[#69736b] text-xs rounded hover:bg-[#f6f5f0]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
