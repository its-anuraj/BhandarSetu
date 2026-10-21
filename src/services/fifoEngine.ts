import { StockBatch, BatchAllocationProposal, CommodityId } from '../types';

export interface FIFOCalculationResult {
  allocations: BatchAllocationProposal[];
  totalAllocatedQtl: number;
  shortageDeficitQtl: number;
  fulfillmentPct: number;
  isFullyFulfilled: boolean;
  bypassedDueToQuality: StockBatch[];
  eligibleCandidateCount: number;
  isExceptionApplied: boolean;
  exceptionWarning?: string;
}

/**
 * Calculates batch age in days from intake date relative to reference date (defaulting to 2026-10-21).
 */
export function calculateBatchAgeDays(intakeDateStr: string, referenceDateStr = '2026-10-21'): number {
  const intake = new Date(intakeDateStr).getTime();
  const ref = new Date(referenceDateStr).getTime();
  const diffTime = Math.max(0, ref - intake);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Deterministic FIFO Allocation Engine implementing PDS Rule 14-B.
 * Selects oldest eligible batches first, splits multi-batch requirements,
 * excludes quality-locked or depleted batches, and enforces strict auditability.
 */
export function calculateFIFOAllocation(
  allBatches: StockBatch[],
  commodityId: CommodityId,
  demandedQuantityQtl: number,
  options?: {
    bypassBatchId?: string; // If an authorized operator requested an exception
    referenceDate?: string;
  }
): FIFOCalculationResult {
  if (demandedQuantityQtl <= 0) {
    return {
      allocations: [],
      totalAllocatedQtl: 0,
      shortageDeficitQtl: 0,
      fulfillmentPct: 0,
      isFullyFulfilled: true,
      bypassedDueToQuality: [],
      eligibleCandidateCount: 0,
      isExceptionApplied: false,
    };
  }

  const refDate = options?.referenceDate || '2026-10-21';
  const bypassBatchId = options?.bypassBatchId;

  // 1. Filter by commodity
  const commodityBatches = allBatches.filter((b) => b.commodity_id === commodityId);

  // 2. Separate eligible and quality-held/ineligible batches
  const qualityHeldBatches: StockBatch[] = [];
  const eligibleCandidates: StockBatch[] = [];

  for (const batch of commodityBatches) {
    const available = Math.max(0, batch.on_hand_qtl - batch.reserved_qtl);
    if (batch.quality_status !== 'ELIGIBLE') {
      qualityHeldBatches.push(batch);
    } else if (available > 0) {
      eligibleCandidates.push(batch);
    }
  }

  // 3. Sort eligible candidates strictly deterministically:
  //    Primary: intake_date ASC
  //    Secondary: intake_timestamp ASC
  //    Tertiary: id ASC
  eligibleCandidates.sort((a, b) => {
    const dateComp = a.intake_date.localeCompare(b.intake_date);
    if (dateComp !== 0) return dateComp;
    const timeComp = a.intake_timestamp.localeCompare(b.intake_timestamp);
    if (timeComp !== 0) return timeComp;
    return a.id.localeCompare(b.id);
  });

  // Sort quality-held batches chronologically for reporting in the liquidation breakdown
  qualityHeldBatches.sort((a, b) => a.intake_date.localeCompare(b.intake_date));

  // 4. Sequential Allocation Loop
  let remainingDemand = demandedQuantityQtl;
  const allocations: BatchAllocationProposal[] = [];
  let isExceptionApplied = false;
  let rankCounter = 1;

  for (const batch of eligibleCandidates) {
    const available = Math.max(0, batch.on_hand_qtl - batch.reserved_qtl);
    const ageDays = calculateBatchAgeDays(batch.intake_date, refDate);

    // Check if operator intentionally requested bypass on this batch
    if (bypassBatchId && batch.id === bypassBatchId) {
      isExceptionApplied = true;
      allocations.push({
        rank: rankCounter++,
        batch_id: batch.id,
        receipt_date: batch.intake_date,
        age_days: ageDays,
        shed: batch.shed,
        bay: batch.bay,
        stack_id: batch.stack_id,
        total_balance_qtl: batch.on_hand_qtl,
        quality_status: batch.quality_status,
        fifo_draw_qtl: 0,
        post_dispatch_bal_qtl: batch.on_hand_qtl,
        percentage_of_batch: 0,
        reason: 'Bypassed by Operator Exception (Bay obstruction / Handling limit)',
        is_bypassed: true,
        bypass_reason: 'Operator Exception Requested',
      });
      continue;
    }

    if (remainingDemand <= 0) {
      break;
    }

    const draw = Math.min(available, remainingDemand);
    const postDispatch = Math.max(0, batch.on_hand_qtl - draw);
    const pctOfBatch = batch.on_hand_qtl > 0 ? (draw / batch.on_hand_qtl) * 100 : 0;

    let reasonNote = '';
    if (rankCounter === 1) {
      reasonNote = 'Primary FIFO allocation candidate';
    } else if (draw === available) {
      reasonNote = `Fully liquidates available balance (${draw.toFixed(2)} Qtl)`;
    } else {
      reasonNote = `Satisfies remaining ${draw.toFixed(2)} Qtl demand (Retains ${(available - draw).toFixed(2)} Qtl for next indent)`;
    }

    allocations.push({
      rank: rankCounter++,
      batch_id: batch.id,
      receipt_date: batch.intake_date,
      age_days: ageDays,
      shed: batch.shed,
      bay: batch.bay,
      stack_id: batch.stack_id,
      total_balance_qtl: batch.on_hand_qtl,
      quality_status: batch.quality_status,
      fifo_draw_qtl: Math.round(draw * 100) / 100,
      post_dispatch_bal_qtl: Math.round(postDispatch * 100) / 100,
      percentage_of_batch: Math.round(pctOfBatch * 10) / 10,
      reason: reasonNote,
      is_bypassed: false,
    });

    remainingDemand -= draw;
  }

  // 5. Append quality held batches that fall within the evaluated timeline so the user
  //    sees why an older or adjacent stack was bypassed (Rule 14-B transparency)
  for (const heldBatch of qualityHeldBatches) {
    const ageDays = calculateBatchAgeDays(heldBatch.intake_date, refDate);
    allocations.push({
      rank: rankCounter++,
      batch_id: heldBatch.id,
      receipt_date: heldBatch.intake_date,
      age_days: ageDays,
      shed: heldBatch.shed,
      bay: heldBatch.bay,
      stack_id: heldBatch.stack_id,
      total_balance_qtl: heldBatch.on_hand_qtl,
      quality_status: heldBatch.quality_status,
      fifo_draw_qtl: 0,
      post_dispatch_bal_qtl: heldBatch.on_hand_qtl,
      percentage_of_batch: 0,
      reason: `Bypassed: ${heldBatch.quality_hold_reason || 'Quality testing or moisture hold pending'}`,
      is_bypassed: true,
      bypass_reason: heldBatch.quality_hold_reason || 'Under Quality Lock',
    });
  }

  const totalAllocated = demandedQuantityQtl - Math.max(0, remainingDemand);
  const shortage = Math.max(0, remainingDemand);
  const fulfillmentPct = (totalAllocated / demandedQuantityQtl) * 100;

  let exceptionWarning: string | undefined;
  if (isExceptionApplied) {
    exceptionWarning =
      'Warning: Statutory Audit Trigger. Bypassing priority batch requires Godown In-Charge written justification and District Supply Officer digital sign-off.';
  }

  return {
    allocations,
    totalAllocatedQtl: Math.round(totalAllocated * 100) / 100,
    shortageDeficitQtl: Math.round(shortage * 100) / 100,
    fulfillmentPct: Math.round(fulfillmentPct * 10) / 10,
    isFullyFulfilled: shortage <= 0.001,
    bypassedDueToQuality: qualityHeldBatches,
    eligibleCandidateCount: eligibleCandidates.length,
    isExceptionApplied,
    exceptionWarning,
  };
}
