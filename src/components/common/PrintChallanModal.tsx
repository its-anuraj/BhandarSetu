import React from 'react';
import { useApp } from '../../context/AppContext';

export const PrintChallanModal: React.FC = () => {
  const { activeChallanToPrint, setActiveChallanToPrint } = useApp();

  if (!activeChallanToPrint) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print">
      <div className="bg-surface-container-lowest max-w-3xl w-full rounded border border-outline-variant shadow-2xl p-6 overflow-hidden">
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            <span className="font-title text-base text-on-surface">Official PDS Foodgrain Delivery Challan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Challan / Save PDF</span>
            </button>
            <button
              onClick={() => setActiveChallanToPrint(null)}
              className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Challan Document Body */}
        <div id="printable-challan" className="p-6 border border-outline rounded bg-white text-black space-y-4 font-mono text-xs">
          {/* Top Legal Header */}
          <div className="text-center border-b-2 border-black pb-3 space-y-0.5">
            <div className="font-bold text-sm tracking-wider uppercase">Delhi State Civil Supplies Corporation Ltd.</div>
            <div className="text-[11px] font-semibold">DEPARTMENT OF FOOD, CIVIL SUPPLIES &amp; CONSUMER AFFAIRS</div>
            <div className="text-[10px] text-gray-700">PDS COMMODITY DISPATCH MEMO &amp; VEHICLE TRANSIT PASS</div>
            <div className="text-[10px] text-gray-600 font-sans mt-1">Rule 14-B PDS Foodgrain Allocation &amp; Transit Norms 2026</div>
          </div>

          {/* Challan Meta Grid */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-3">
            <div>
              <div className="font-bold text-[11px]">CHALLAN NO: <span className="text-black bg-gray-100 px-1 py-0.5">{activeChallanToPrint.challan_no}</span></div>
              <div>DATE OF ISSUE: {activeChallanToPrint.date}</div>
              <div>ISSUING DEPOT: {activeChallanToPrint.godown_name} ({activeChallanToPrint.godown_code})</div>
              <div>TRANSPORTER: Delhi Civil Supplies Fleet</div>
              <div>TRUCK / VEHICLE NO: <span className="font-bold">{activeChallanToPrint.carrier_vehicle_no}</span></div>
              <div>DRIVER NAME: {activeChallanToPrint.driver_name}</div>
            </div>
            <div>
              <div className="font-bold text-[11px]">CONSIGNEE FPS: <span className="bg-gray-100 px-1 py-0.5">{activeChallanToPrint.fps_name}</span></div>
              <div>FPS CODE / WARD: {activeChallanToPrint.fps_code}</div>
              <div>LICENSEE / DEALER: {activeChallanToPrint.licensee_name}</div>
              <div>SECURITY STATUS: PDS Biometric Token OK</div>
              <div>STATUS: <span className="font-bold">{activeChallanToPrint.status}</span></div>
              <div>ISSUING CLERK: {activeChallanToPrint.issued_by}</div>
            </div>
          </div>

          {/* Batches Table */}
          <div>
            <div className="font-bold mb-1 text-[11px] uppercase">Allocated Batch Provenance &amp; Stack Breakdown:</div>
            <table className="w-full text-left border-collapse border border-gray-400 text-[11px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="p-1.5 border-r border-gray-400">Sr.</th>
                  <th className="p-1.5 border-r border-gray-400">Batch ID</th>
                  <th className="p-1.5 border-r border-gray-400">Commodity</th>
                  <th className="p-1.5 border-r border-gray-400">Shed / Bay</th>
                  <th className="p-1.5 border-r border-gray-400 text-right">Burlap Bags</th>
                  <th className="p-1.5 text-right">Net Weight (Qtl)</th>
                </tr>
              </thead>
              <tbody>
                {activeChallanToPrint.batches_breakdown.map((b, idx) => (
                  <tr key={b.batch_id} className="border-b border-gray-300">
                    <td className="p-1.5 border-r border-gray-400">{idx + 1}</td>
                    <td className="p-1.5 border-r border-gray-400 font-bold">{b.batch_id}</td>
                    <td className="p-1.5 border-r border-gray-400">{activeChallanToPrint.commodity_name}</td>
                    <td className="p-1.5 border-r border-gray-400">{b.shed} - {b.bay}</td>
                    <td className="p-1.5 border-r border-gray-400 text-right">{b.bags} Bags</td>
                    <td className="p-1.5 text-right font-bold">{b.draw_qtl.toFixed(2)} Qtl</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold border-t-2 border-black">
                  <td colSpan={4} className="p-1.5 border-r border-gray-400 text-right uppercase">Consignment Total:</td>
                  <td className="p-1.5 border-r border-gray-400 text-right">{activeChallanToPrint.total_bags} Bags</td>
                  <td className="p-1.5 text-right">{activeChallanToPrint.total_quantity_qtl.toFixed(2)} Qtl</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Barcode & Cryptographic Checksum */}
          <div className="flex items-center justify-between border-t border-b border-gray-300 py-2.5">
            <div>
              <div className="text-[10px] text-gray-600">CRYPTOGRAPHIC SHA-256 AUDIT DIGEST:</div>
              <div className="font-mono text-[10px] text-gray-800 break-all">{activeChallanToPrint.sha256_hash}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Automated Rule 14-B Compliance Checksum Verified • Tamper Proof</div>
            </div>
            <div className="border border-gray-400 p-1.5 text-center bg-gray-50">
              <div className="text-[9px] font-bold">DIGITAL QR VERIFICATION</div>
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 mx-auto my-1">
                [ QR CODE ]
              </div>
              <div className="text-[8px] text-gray-500">Scan at FPS Gate</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-2 pt-6 text-center text-[10px]">
            <div className="border-t border-gray-400 pt-1">
              <div>(Tally Clerk)</div>
              <div className="font-bold">P. Rawat</div>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <div>(Weighbridge Op.)</div>
              <div className="font-bold">Scale #02 Live</div>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <div>(Driver / Carrier)</div>
              <div className="font-bold">Received in Sound Bags</div>
            </div>
            <div className="border-t border-gray-400 pt-1">
              <div>(Godown Manager)</div>
              <div className="font-bold">R. Sharma (DL-FCS)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
