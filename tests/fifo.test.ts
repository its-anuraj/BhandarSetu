import { describe, it, expect } from 'vitest';
import { calculateFIFOAllocation, calculateBatchAgeDays } from '../src/services/fifoEngine';
import { StockBatch } from '../src/types';

describe('Rule 14-B Deterministic FIFO Engine Tests', () => {
  const mockBatches: StockBatch[] = [
    {
      id: 'W-101',
      batch_number: 'BATCH-W-101-2026Q3',
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_season: 'RMS 2026-27',
      godown_id: 'WH-DEL-04',
      godown_name: 'Central Grain Store — Demo',
      shed: 'Shed 01',
      bay: 'Bay 1',
      stack_id: 'Stack A-4',
      source_agency: 'Northern Grain Suppliers',
      intake_challan: 'CH-2026-9012',
      intake_date: '2026-10-01',
      intake_timestamp: '2026-10-01T08:30:00Z',
      initial_quantity_qtl: 2400.0,
      on_hand_qtl: 1000.0,
      reserved_qtl: 0.0,
      quality_status: 'ELIGIBLE',
      quality_metrics: {
        moisture_pct: 11.2,
        permissible_max_moisture: 12.0,
        grain_density_kghl: 78.0,
        foreign_matter_pct: 0.42,
        weevilled_grain_pct: 0.0,
        test_date: '2026-10-01',
        inspector_name: 'P. Rawat',
        lab_slip_no: 'LAB-4401',
      },
      checksum: 'VALID-SHA256',
      moisture_trend: [11.2, 11.2],
    },
    {
      id: 'W-102',
      batch_number: 'BATCH-W-102-2026Q3',
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_season: 'RMS 2026-27',
      godown_id: 'WH-DEL-04',
      godown_name: 'Central Grain Store — Demo',
      shed: 'Shed 01',
      bay: 'Bay 1',
      stack_id: 'Stack B-2',
      source_agency: 'Punjab Agro State Agency',
      intake_challan: 'CH-2026-9044',
      intake_date: '2026-10-05',
      intake_timestamp: '2026-10-05T09:15:00Z',
      initial_quantity_qtl: 1200.0,
      on_hand_qtl: 800.0,
      reserved_qtl: 0.0,
      quality_status: 'ELIGIBLE',
      quality_metrics: {
        moisture_pct: 11.4,
        permissible_max_moisture: 12.0,
        grain_density_kghl: 77.8,
        foreign_matter_pct: 0.45,
        weevilled_grain_pct: 0.0,
        test_date: '2026-10-05',
        inspector_name: 'P. Rawat',
        lab_slip_no: 'LAB-4402',
      },
      checksum: 'VALID-SHA256',
      moisture_trend: [11.4, 11.4],
    },
    {
      id: 'W-103',
      batch_number: 'BATCH-W-103-2026Q3',
      commodity_id: 'wheat',
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_season: 'RMS 2026-27',
      godown_id: 'WH-DEL-04',
      godown_name: 'Central Grain Store — Demo',
      shed: 'Shed 02',
      bay: 'Bay 2',
      stack_id: 'Stack C-1 (Quarantine)',
      source_agency: 'Central Pool Transfer',
      intake_challan: 'CH-2026-9088',
      intake_date: '2026-10-08',
      intake_timestamp: '2026-10-08T11:00:00Z',
      initial_quantity_qtl: 600.0,
      on_hand_qtl: 600.0,
      reserved_qtl: 0.0,
      quality_status: 'QUALITY_HOLD', // LOCKED
      quality_metrics: {
        moisture_pct: 13.8,
        permissible_max_moisture: 12.0,
        grain_density_kghl: 75.2,
        foreign_matter_pct: 0.85,
        weevilled_grain_pct: 0.0,
        test_date: '2026-10-08',
        inspector_name: 'Inspector Verma',
        lab_slip_no: 'LAB-4409',
      },
      checksum: 'VALID-SHA256',
      moisture_trend: [13.8, 13.8],
    },
  ];

  it('1. Oldest eligible batch is chosen first (Rule 14-B strict chronological sequence)', () => {
    const result = calculateFIFOAllocation(mockBatches, 'wheat', 500);

    expect(result.allocations.length).toBeGreaterThan(0);
    const primaryAlloc = result.allocations[0];
    expect(primaryAlloc.batch_id).toBe('W-101');
    expect(primaryAlloc.fifo_draw_qtl).toBe(500);
    expect(result.totalAllocatedQtl).toBe(500);
    expect(result.shortageDeficitQtl).toBe(0);
    expect(result.isFullyFulfilled).toBe(true);
  });

  it('2. Multi-batch splitting: 1,500 Qtl demand allocates 1,000 Qtl from W-101 and 500 Qtl from W-102', () => {
    const result = calculateFIFOAllocation(mockBatches, 'wheat', 1500);

    expect(result.allocations.length).toBe(3); // W-101 (draw), W-102 (draw), W-103 (bypassed due to quality hold)

    const w101 = result.allocations.find((a) => a.batch_id === 'W-101');
    const w102 = result.allocations.find((a) => a.batch_id === 'W-102');
    const w103 = result.allocations.find((a) => a.batch_id === 'W-103');

    expect(w101).toBeDefined();
    expect(w101?.fifo_draw_qtl).toBe(1000);
    expect(w101?.post_dispatch_bal_qtl).toBe(0); // Fully liquidated

    expect(w102).toBeDefined();
    expect(w102?.fifo_draw_qtl).toBe(500);
    expect(w102?.post_dispatch_bal_qtl).toBe(300); // 800 - 500 = 300 remaining

    expect(w103).toBeDefined();
    expect(w103?.fifo_draw_qtl).toBe(0);
    expect(w103?.is_bypassed).toBe(true);
    expect(w103?.bypass_reason).toContain('Quality');

    expect(result.totalAllocatedQtl).toBe(1500);
    expect(result.shortageDeficitQtl).toBe(0);
    expect(result.isFullyFulfilled).toBe(true);
  });

  it('3. Quality-held batches (W-103) are strictly excluded from allocation draw', () => {
    // Demand 2,000 Qtl: W-101 (1,000) + W-102 (800) = 1,800 Qtl total available eligible
    const result = calculateFIFOAllocation(mockBatches, 'wheat', 2000);

    const w103 = result.allocations.find((a) => a.batch_id === 'W-103');
    expect(w103?.fifo_draw_qtl).toBe(0);
    expect(result.totalAllocatedQtl).toBe(1800);
    expect(result.shortageDeficitQtl).toBe(200);
    expect(result.isFullyFulfilled).toBe(false);
  });

  it('4. Rejects zero and negative demands gracefully', () => {
    const zeroResult = calculateFIFOAllocation(mockBatches, 'wheat', 0);
    expect(zeroResult.totalAllocatedQtl).toBe(0);
    expect(zeroResult.allocations.length).toBe(0);

    const negativeResult = calculateFIFOAllocation(mockBatches, 'wheat', -50);
    expect(negativeResult.totalAllocatedQtl).toBe(0);
    expect(negativeResult.allocations.length).toBe(0);
  });

  it('5. Existing reservations are accounted for (available = on_hand - reserved)', () => {
    const batchesWithReservation: StockBatch[] = [
      {
        ...mockBatches[0],
        on_hand_qtl: 1000.0,
        reserved_qtl: 700.0, // Only 300 Qtl available
      },
      mockBatches[1], // 800 Qtl available
    ];

    const result = calculateFIFOAllocation(batchesWithReservation, 'wheat', 600);

    const w101 = result.allocations.find((a) => a.batch_id === 'W-101');
    const w102 = result.allocations.find((a) => a.batch_id === 'W-102');

    expect(w101?.fifo_draw_qtl).toBe(300); // 1,000 - 700 reserved
    expect(w102?.fifo_draw_qtl).toBe(300); // Remaining 300 from W-102
    expect(result.totalAllocatedQtl).toBe(600);
  });

  it('6. Deterministic tie-breaking for equal intake dates (intake_timestamp ASC followed by id ASC)', () => {
    const tieBatches: StockBatch[] = [
      {
        ...mockBatches[0],
        id: 'W-B',
        intake_date: '2026-10-01',
        intake_timestamp: '2026-10-01T12:00:00Z',
        on_hand_qtl: 500,
      },
      {
        ...mockBatches[0],
        id: 'W-A',
        intake_date: '2026-10-01',
        intake_timestamp: '2026-10-01T08:00:00Z', // Earlier timestamp
        on_hand_qtl: 500,
      },
    ];

    const result = calculateFIFOAllocation(tieBatches, 'wheat', 400);
    // W-A must be chosen first because its timestamp 08:00 is earlier than 12:00
    expect(result.allocations[0].batch_id).toBe('W-A');
    expect(result.allocations[0].fifo_draw_qtl).toBe(400);
  });

  it('7. Operator FIFO exception bypass allows skipping older batch with warning and audit trace', () => {
    const result = calculateFIFOAllocation(mockBatches, 'wheat', 500, {
      bypassBatchId: 'W-101', // Requesting bypass of W-101
    });

    expect(result.isExceptionApplied).toBe(true);
    expect(result.exceptionWarning).toBeDefined();

    const w101 = result.allocations.find((a) => a.batch_id === 'W-101');
    const w102 = result.allocations.find((a) => a.batch_id === 'W-102');

    expect(w101?.is_bypassed).toBe(true);
    expect(w101?.fifo_draw_qtl).toBe(0);

    expect(w102?.fifo_draw_qtl).toBe(500); // Sourced from W-102 instead!
    expect(result.totalAllocatedQtl).toBe(500);
  });

  it('8. Correctly computes batch age relative to reference date', () => {
    const age = calculateBatchAgeDays('2026-10-01', '2026-10-21');
    expect(age).toBe(20);

    const sameDayAge = calculateBatchAgeDays('2026-10-21', '2026-10-21');
    expect(sameDayAge).toBe(0);
  });
});
