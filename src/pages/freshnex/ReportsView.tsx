import React from 'react';
import { Download, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const ReportsView: React.FC = () => {
  const { parcels, alerts, trendData, selectedParcel, dataMode } = useFreshNex();

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTelemetryCsv = () => {
    const header = [
      'Parcel ID',
      'Product',
      'Timestamp',
      'Temperature (C)',
      'Humidity (%RH)',
      'MQ135 Raw ADC (Uncalibrated)',
      'Light Intensity (lux)',
      'pH Probe Value',
      'Data Source Mode',
    ];
    const rows = trendData.map((pt) => [
      selectedParcel.id,
      selectedParcel.productName,
      pt.time,
      pt.temperature.toFixed(1),
      String(pt.humidity),
      String(pt.mq135Raw),
      String(pt.lightLux),
      pt.phValue !== null ? pt.phValue.toFixed(1) : 'Not Connected',
      dataMode.toUpperCase(),
    ]);
    downloadCsv(`FreshNex_Telemetry_${selectedParcel.id}.csv`, [header, ...rows]);
  };

  const handleExportAlertsCsv = () => {
    const header = [
      'Alert ID',
      'Severity',
      'Title',
      'Description',
      'Parcel ID',
      'Device ID',
      'Time',
      'Acknowledged',
      'Record Type',
    ];
    const rows = alerts.map((a) => [
      a.id,
      a.severity,
      a.title,
      a.description,
      a.parcelId,
      a.deviceId,
      a.relativeTime,
      a.acknowledged ? 'Yes' : 'No',
      a.isDemonstration ? 'Demonstration' : 'Live Hardware',
    ]);
    downloadCsv('FreshNex_Alerts_Report.csv', [header, ...rows]);
  };

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Compliance & Telemetry Reports
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Export downloadable CSV datasets or print cold-chain audit summaries for parcels, sensor logs, and threshold alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportTelemetryCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#079B68] hover:bg-[#068559] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Sensor Log (CSV)</span>
          </button>
          <button
            onClick={handleExportAlertsCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E5F8F0] hover:bg-[#079B68] text-[#079B68] hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Alerts (CSV)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DFEAF0] bg-white hover:bg-[#F7FAFC] text-[#102F46] text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Printable Parcel Summary Table */}
      <div className="fnx-card p-5 overflow-x-auto">
        <h2 className="text-base font-extrabold text-[#102F46] mb-3">
          Active Parcel Cold-Chain Audit Summary
        </h2>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#DFEAF0] text-[#71869A] uppercase text-[11px]">
              <th className="py-3 px-3">Parcel ID</th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">IoT Node</th>
              <th className="py-3 px-3">Origin → Destination</th>
              <th className="py-3 px-3">Batch Code</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFEAF0]">
            {parcels.map((p) => (
              <tr key={p.id} className="hover:bg-[#F7FAFC]">
                <td className="py-3 px-3 font-extrabold text-[#102F46] font-mono-tabular">
                  {p.id}
                </td>
                <td className="py-3 px-3 font-bold text-[#102F46]">{p.productName}</td>
                <td className="py-3 px-3 font-mono-tabular text-[#71869A]">{p.deviceId}</td>
                <td className="py-3 px-3 text-[#71869A]">
                  {p.origin} → {p.destination}
                </td>
                <td className="py-3 px-3 font-mono-tabular text-[#71869A]">{p.batchCode}</td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5F8F0] text-[#079B68] font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
