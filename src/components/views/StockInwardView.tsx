import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StockInwardConsignment, CommodityId } from '../../types';

export const StockInwardView: React.FC = () => {
  const { currentUser, setActivePath, showToast, refreshData } = useApp();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [truckNo, setTruckNo] = useState('HR-38-AF-9921');
  const [transporter, setTransporter] = useState('Haryana Logistics Freight Lines');
  const [driverName, setDriverName] = useState('Baldev Singh');
  const [driverMobile, setDriverMobile] = useState('+91 98110-XXXXX');
  const [grossWeightKg, setGrossWeightKg] = useState(32450);
  const [tareWeightKg, setTareWeightKg] = useState(8450);
  const [billedWeightMt, setBilledWeightMt] = useState(24.0);
  const [commodity, setCommodity] = useState<CommodityId>('wheat');
  const [bagCount, setBagCount] = useState(480);
  const [targetShed, setTargetShed] = useState('Shed 04 (Wheat & Buffer)');
  const [targetStack, setTargetStack] = useState('Stack 04-B (Bay 2)');
  const [moisturePct, setMoisturePct] = useState(11.4);
  const [isSamplingVerified, setIsSamplingVerified] = useState(true);

  const netReceivedKg = Math.max(0, grossWeightKg - tareWeightKg);
  const netReceivedQtl = netReceivedKg / 100;
  const transitVarianceKg = Math.abs(billedWeightMt * 1000 - netReceivedKg);
  const transitVariancePct = (transitVarianceKg / (billedWeightMt * 1000)) * 100;

  const handleSubmitForQC = (e: React.FormEvent) => {
    e.preventDefault();

    const inwardId = `INW-2026-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInward: StockInwardConsignment = {
      id: inwardId,
      gate_entry_no: `GATE-${inwardId}`,
      vehicle_truck_no: truckNo,
      transporter_name: transporter,
      driver_name: driverName,
      driver_mobile: driverMobile,
      weighbridge_slip_ref: `WB-${Math.floor(88000 + Math.random() * 1000)}`,
      weighbridge_gross_kg: grossWeightKg,
      weighbridge_tare_kg: tareWeightKg,
      net_received_kg: netReceivedKg,
      net_received_qtl: netReceivedQtl,
      supplier_name: 'Northern Grain Suppliers',
      supplier_code: 'SUP-092',
      scheme_pool: 'Central Pool NFSA (National Food Security)',
      commodity_id: commodity,
      commodity_name: commodity === 'wheat' ? 'Wheat (Grade A - Sharbati)' : commodity.toUpperCase(),
      crop_year: '2026-27 (Kharif Intake)',
      packing_spec: 'Standard 50kg Burlap Gunny Bags',
      bag_count: bagCount,
      supplier_billed_weight_mt: billedWeightMt,
      transit_variance_kg: transitVarianceKg,
      transit_variance_pct: transitVariancePct,
      target_shed: targetShed,
      stack_allotment_id: targetStack,
      sampling_protocol_verified: isSamplingVerified,
      initial_moisture_pct: moisturePct,
      sample_custody_bag_no: `#SMP-${Math.floor(9000 + Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      status: 'AWAITING_QC',
    };

    storage.saveInward(newInward);
    refreshData();
    showToast(`Inward Consignment #${inwardId} saved and queued for Quality Testing!`, 'success');
    setActivePath('quality-inspection');
  };

  const handleSaveOfflineDraft = () => {
    const inwardId = `INW-DRAFT-${Date.now().toString().slice(-4)}`;
    const draftInward: StockInwardConsignment = {
      id: inwardId,
      gate_entry_no: `GATE-DRAFT`,
      vehicle_truck_no: truckNo,
      transporter_name: transporter,
      driver_name: driverName,
      driver_mobile: driverMobile,
      weighbridge_slip_ref: 'WB-PENDING',
      weighbridge_gross_kg: grossWeightKg,
      weighbridge_tare_kg: tareWeightKg,
      net_received_kg: netReceivedKg,
      net_received_qtl: netReceivedQtl,
      supplier_name: 'Northern Grain Suppliers',
      supplier_code: 'SUP-092',
      scheme_pool: 'Central Pool NFSA',
      commodity_id: commodity,
      commodity_name: 'Wheat (Grade A - Sharbati)',
      crop_year: '2026-27',
      packing_spec: '50kg Gunny',
      bag_count: bagCount,
      supplier_billed_weight_mt: billedWeightMt,
      transit_variance_kg: 0,
      transit_variance_pct: 0,
      target_shed: targetShed,
      stack_allotment_id: targetStack,
      sampling_protocol_verified: isSamplingVerified,
      initial_moisture_pct: moisturePct,
      sample_custody_bag_no: '#SMP-LOCAL',
      created_at: new Date().toISOString(),
      status: 'DRAFT',
      is_offline_draft: true,
    };

    storage.saveInward(draftInward);
    refreshData();
    showToast('Inward receipt stored as offline draft in IndexedDB.', 'info');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Operational Breadcrumb & Context Banner */}
      <div className="bg-surface-container-low px-margin-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-sm shadow-sm border-b border-outline-variant">
        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <span className="font-numeric-data text-numeric-data text-primary font-semibold">WH-DEL-04</span>
          <span>/</span>
          <span>Receiving Gate 02</span>
          <span>/</span>
          <span className="text-on-surface font-semibold">WB-2 Auto-Scale Feed</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold tracking-wide">
            SCALE ONLINE
          </span>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-outline">sync</span>
            <span>Telemetry Latency: <span className="font-numeric-data text-numeric-data font-semibold text-primary">42ms</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 rounded shadow-sm text-secondary font-label-sm text-label-sm font-semibold border border-outline-variant">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>Strict PDS Protocol Act 2026</span>
          </div>
        </div>
      </div>

      {/* Primary Page Header Section */}
      <div className="px-margin-desktop pt-space-lg pb-space-md bg-surface border-b border-outline-variant">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Inward Module
              </span>
              <span className="font-numeric-data text-numeric-data text-outline">SEC-OPS-04</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Stock Inward • New Consignment Entry
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Record incoming grain rake/truck consignments, weighbridge receipts, and supplier delivery notes.
            </p>
          </div>

          {/* Quick Telemetry Badge Card */}
          <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded shadow-sm border border-outline-variant">
            <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">scale</span>
            </div>
            <div className="pr-space-xs leading-tight">
              <div className="font-label-sm text-label-sm text-outline uppercase font-semibold">Weighbridge Platform</div>
              <div className="font-title text-title text-on-surface font-semibold">Weighbridge No. 2 (Gross In)</div>
              <div className="font-numeric-data text-numeric-data text-primary font-bold">
                LIVE: {grossWeightKg.toLocaleString()}.00 KG
              </div>
            </div>
          </div>
        </div>

        {/* Stepper / Workflow Lifecycle Tracker */}
        <div className="mt-space-lg bg-surface-container-lowest p-space-md rounded shadow-sm border border-outline-variant">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
            {/* Step 1 */}
            <div
              onClick={() => setActiveStep(1)}
              className="flex items-start gap-space-sm cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center font-numeric-data text-numeric-data font-bold shrink-0 shadow-sm">
                01
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-title text-title text-primary truncate font-semibold">
                  <span>Consignment &amp; Truck</span>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">Vehicle identification &amp; slips</p>
                <span className="inline-block mt-1 font-label-sm text-label-sm font-semibold text-primary">Active Entry</span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveStep(2)}
              className="flex items-start gap-space-sm cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-numeric-data text-numeric-data font-bold shrink-0">
                02
              </div>
              <div className="min-w-0">
                <div className="font-title text-title text-on-surface truncate font-semibold">Moisture &amp; Sampling</div>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">Probe assessment (5 spots)</p>
                <span className="inline-block mt-1 font-label-sm text-label-sm font-semibold text-secondary">Awaiting QC Handover</span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveStep(3)}
              className="flex items-start gap-space-sm cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-surface-container-high text-outline flex items-center justify-center font-numeric-data text-numeric-data font-bold shrink-0">
                03
              </div>
              <div className="min-w-0">
                <div className="font-title text-title text-on-surface-variant truncate font-semibold">Weighment &amp; Stacking</div>
                <p className="font-label-sm text-label-sm text-outline truncate">Gross/Tare net balance</p>
                <span className="inline-block mt-1 font-label-sm text-label-sm text-outline font-medium">Pending QC OK</span>
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveStep(4)}
              className="flex items-start gap-space-sm cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-surface-container-high text-outline flex items-center justify-center font-numeric-data text-numeric-data font-bold shrink-0">
                04
              </div>
              <div className="min-w-0">
                <div className="font-title text-title text-outline truncate font-semibold">Stock Ledger Posting</div>
                <p className="font-label-sm text-label-sm text-outline truncate">Final PDS inventory credit</p>
                <span className="inline-block mt-1 font-label-sm text-label-sm text-outline font-medium">Locked Until Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="p-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left Form (Col 8) */}
        <form onSubmit={handleSubmitForQC} className="lg:col-span-8 space-y-space-md">
          {/* SECTION A: Transport & Rake / Truck Identification */}
          <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <span className="font-title text-xs text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                Section A • Transport &amp; Rake / Truck Identification
              </span>
              <span className="font-numeric-data text-[10px] text-outline font-semibold">MANDATORY REQ-01</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Gate Inward Entry No. *</label>
                <div className="flex items-center bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 font-mono text-on-surface">
                  <span className="material-symbols-outlined text-outline text-[16px] mr-1.5">lock</span>
                  <span className="font-bold">INW-2026-DEL-0482</span>
                  <span className="ml-auto text-[10px] text-outline">Sequential</span>
                </div>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Vehicle / Truck Registration No. *</label>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded px-2.5 py-1 text-on-surface font-mono font-bold">
                  <input
                    type="text"
                    required
                    value={truckNo}
                    onChange={(e) => setTruckNo(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                  />
                  <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                </div>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Transporter Name *</label>
                <input
                  type="text"
                  required
                  value={transporter}
                  onChange={(e) => setTransporter(e.target.value)}
                  className="w-full h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Driver Name &amp; Mobile *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-on-surface focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={driverMobile}
                    onChange={(e) => setDriverMobile(e.target.value)}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-on-surface focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Supplier & Commodity Specification */}
          <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <span className="font-title text-xs text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">grain</span>
                Section B • Supplier &amp; Commodity Specification
              </span>
              <span className="font-numeric-data text-[10px] text-outline font-semibold">ALLOC-SPEC-08</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Supplier / Agency Entity *</label>
                <input
                  type="text"
                  readOnly
                  value="Northern Grain Suppliers (Demo Co-op ID: SUP-092)"
                  className="w-full h-8 px-2.5 bg-surface-container border border-outline-variant rounded font-medium text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Commodity &amp; Quality Grade *</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value as CommodityId)}
                  className="w-full h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded font-medium text-on-surface focus:outline-none"
                >
                  <option value="wheat">Wheat (Grade A - Sharbati)</option>
                  <option value="rice">Rice (Fortified Sona Masoori)</option>
                  <option value="sugar">Sugar (Refined S-30)</option>
                  <option value="chana">Chana Whole (Desi Chickpeas)</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Crop Year / Harvest Season *</label>
                <input
                  type="text"
                  readOnly
                  value="2026-27 (Kharif Intake)"
                  className="w-full h-8 px-2.5 bg-surface-container border border-outline-variant rounded font-medium text-on-surface"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Packing Specification *</label>
                <input
                  type="text"
                  readOnly
                  value="Standard 50kg Burlap Gunny Bags"
                  className="w-full h-8 px-2.5 bg-surface-container border border-outline-variant rounded font-medium text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: Weighment Reconciliation & Physical Tally */}
          <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <span className="font-title text-xs text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">balance</span>
                Section C • Weighment Reconciliation &amp; Physical Tally
              </span>
              <span className="font-numeric-data text-[10px] text-primary font-bold">TOLERANCE 0.5% APPLIED</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm text-xs">
              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant">
                <div className="text-[10px] text-outline font-semibold uppercase">Supplier Billed Wt</div>
                <div className="font-numeric-metric font-bold text-on-surface mt-1">
                  {billedWeightMt.toFixed(2)} MT
                </div>
                <div className="text-[10px] text-outline font-mono">({(billedWeightMt * 10).toFixed(2)} Qtl Challan)</div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant">
                <div className="text-[10px] text-outline font-semibold uppercase">Gross Vehicle Wt</div>
                <div className="font-numeric-metric font-bold text-on-surface mt-1">
                  {grossWeightKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] text-primary font-medium">Live Scale WB-2</div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant">
                <div className="text-[10px] text-outline font-semibold uppercase">Tare Weight (Empty)</div>
                <div className="font-numeric-metric font-bold text-on-surface mt-1">
                  {tareWeightKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] text-outline">Registered Tare OK</div>
              </div>

              <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
                <div className="text-[10px] text-primary font-semibold uppercase">Net Received Wt</div>
                <div className="font-numeric-metric font-bold text-primary mt-1">
                  {netReceivedKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] text-primary font-bold font-mono">({netReceivedQtl.toFixed(2)} Qtl Exact)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-1 text-xs">
              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Transit Variance Readout</div>
                  <div className="text-[11px] text-primary font-mono font-bold">
                    {transitVarianceKg.toFixed(2)} kg ({transitVariancePct.toFixed(2)}% Variance)
                  </div>
                  <div className="text-[10px] text-outline">Acceptable: Within Permissible 0.5% Tolerance</div>
                </div>
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Bag Count Physical Verification</div>
                  <div className="text-[11px] text-on-surface font-mono font-bold">
                    {bagCount} Bags (@ 50.00 kg gross/bag)
                  </div>
                  <div className="text-[10px] text-primary font-medium">Tally Sheet Match: 100% Reconciled</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-numeric-data text-[10px] font-bold">
                  COUNT OK
                </span>
              </div>
            </div>
          </div>

          {/* SECTION D & E: Storage Bay & Quality Sampling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Section D */}
            <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-2 text-xs">
              <span className="font-title text-xs text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[18px]">warehouse</span>
                Section D • Storage Bay Assignment
              </span>

              <div>
                <label className="block text-outline font-semibold mb-1">Target Godown Shed *</label>
                <input
                  type="text"
                  value={targetShed}
                  onChange={(e) => setTargetShed(e.target.value)}
                  className="w-full h-8 px-2 bg-surface-container border border-outline-variant rounded font-medium text-on-surface"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Stack Allotment ID *</label>
                <input
                  type="text"
                  value={targetStack}
                  onChange={(e) => setTargetStack(e.target.value)}
                  className="w-full h-8 px-2 bg-surface-container border border-outline-variant rounded font-medium text-on-surface"
                />
                <div className="text-[10px] text-outline mt-1 font-numeric-data">
                  Stack Capacity: 3,100 Qtl Space Available (38% post-intake)
                </div>
              </div>
            </div>

            {/* Section E */}
            <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-2 text-xs">
              <span className="font-title text-xs text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[18px]">science</span>
                Section E • Quality Sampling
              </span>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sampling-check"
                  checked={isSamplingVerified}
                  onChange={(e) => setIsSamplingVerified(e.target.checked)}
                  className="mt-0.5"
                />
                <label htmlFor="sampling-check" className="text-on-surface leading-tight text-[11px]">
                  <strong>Sampling Protocol Verified:</strong> Moisture probe sampled at 5 random points across 480 bags. Initial on-site reading: <strong className="text-primary font-mono">{moisturePct}%</strong> (Pass &lt;12.0%). Insect infestation: Nil.
                </label>
              </div>

              <div className="p-2 rounded bg-surface-container text-[11px] text-on-surface-variant font-numeric-data">
                Sample Handover: Custody Bag #SMP-9912 handed to Inspector Verma for statutory refraction assay.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSaveOfflineDraft}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Offline Draft</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-on-primary font-label-md text-xs font-bold hover:bg-primary-container transition-colors shadow-md"
            >
              <span>Submit for Quality Verification &amp; Stack Stowing</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Right Info Column: Digital Slip & Bay Matrix (Col 4) */}
        <div className="lg:col-span-4 space-y-space-md">
          {/* Digital Weighbridge Receipt */}
          <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-3 font-mono text-xs">
            <div className="text-center pb-2 border-b border-outline-variant space-y-0.5">
              <div className="text-[10px] text-outline font-bold">WEIGHBRIDGE RECEIPT • TKT-88192</div>
              <div className="font-bold text-on-surface text-sm">CENTRAL GRAIN STORE</div>
              <div className="text-[10px] text-outline">FOOD CORPORATION / WAREHOUSING DIV</div>
            </div>

            <div className="space-y-1 text-[11px] border-b border-outline-variant pb-2">
              <div className="flex justify-between">
                <span className="text-outline">Vehicle Reg:</span>
                <span className="font-bold text-on-surface">{truckNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Commodity:</span>
                <span className="font-semibold text-on-surface">{commodity.toUpperCase()} GR-A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Gross Weight:</span>
                <span className="text-on-surface">{grossWeightKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Tare Weight:</span>
                <span className="text-on-surface">{tareWeightKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between font-bold text-primary pt-1 border-t border-outline-variant/60">
                <span>NET QUANTITY:</span>
                <span>{netReceivedKg.toLocaleString()} kg ({netReceivedQtl.toFixed(2)} Qtl)</span>
              </div>
              <div className="flex justify-between text-outline">
                <span>Tally Bags:</span>
                <span>{bagCount} Burlap Bags</span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="pt-1 text-center">
              <div className="font-mono text-base font-bold tracking-widest text-on-surface py-1 bg-surface-container/40 rounded">
                ||| | ||||| || |||| ||||| |||
              </div>
              <div className="text-[10px] text-outline mt-0.5">*INW-2026-DEL-0482*</div>
            </div>
          </div>

          {/* Shed 04 Bay Matrix Occupancy */}
          <div className="bg-surface-container-lowest p-space-md rounded border border-outline-variant shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant font-bold">
              <span className="text-on-surface">Shed 04 Bay Matrix</span>
              <span className="text-primary font-mono">Target: Stack 04-B</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center font-numeric-data text-[11px]">
              <div className="p-2 rounded bg-surface-container-high border border-outline-variant">
                <div className="text-[10px] text-outline font-semibold">BAY 01</div>
                <div className="font-bold text-on-surface mt-1">Stack 04-A</div>
                <div className="text-[10px] text-primary font-semibold">88% Full</div>
              </div>

              <div className="p-2 rounded bg-primary text-on-primary border-2 border-secondary shadow-sm">
                <div className="text-[10px] uppercase font-bold text-secondary-fixed">TARGET BAY</div>
                <div className="font-bold mt-1">Stack 04-B</div>
                <div className="text-[10px] text-primary-fixed font-bold">38% Full</div>
              </div>

              <div className="p-2 rounded bg-surface-container text-outline border border-outline-variant">
                <div className="text-[10px] font-semibold">BAY 03</div>
                <div className="font-bold mt-1">Stack 04-C</div>
                <div className="text-[10px]">Empty</div>
              </div>
            </div>

            <div className="text-[10px] text-outline pt-1 flex justify-between">
              <span>Dunnage: Double Polythene</span>
              <span>Stack Height Limit: 18 Layers</span>
            </div>
          </div>

          {/* Status Alert Note */}
          <div className="p-3 rounded bg-secondary-container/40 border border-secondary/40 text-xs text-on-secondary-container space-y-1">
            <div className="font-bold flex items-center gap-1 uppercase tracking-wide text-[11px]">
              <span className="material-symbols-outlined text-[15px]">info</span> Status: Draft (Inventory Not Confirmed)
            </div>
            <p className="text-[11px] leading-tight">
              Saving this consignment records gate entry and weighment. Confirmed stock balance will <strong>NOT</strong> increase until Quality Inspection report is submitted and approved by Technical Officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
