import { jsPDF } from 'jspdf';

export interface FullProductReportData {
  // Basic Information
  reportId: string;
  generatedAt: string;
  lastSyncedAt: string;
  productName: string;
  deviceId: string;
  category: string;
  batchNumber: string;
  originLocation: string;

  // Freshness Level
  freshnessScore: number;
  freshnessStatus: string;
  freshnessMessage: string;

  // AI AGENT FRESORA Shelf-Life Prediction
  remainingDays: number;
  remainingHours: number;
  estimatedExpiryDate: string;
  confidencePercent: number;
  spoilageRiskLevel: string;
  predictedStatus: string;
  predictionSummary: string;
  storageAdvice: string;

  // All 8 Sensor Telemetry Readings
  temperature: number;
  humidity: number;
  moisture: number;
  dewPoint: number;
  ph: number;
  acidityClass: string;
  gas: number;
  impact: number;
  light: number;
  gpsLat: number;
  gpsLng: number;
  gpsSats: number;
}

export function generateAndDownloadProductPDF(data: FullProductReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // 1. TOP HEADER BANNER
  doc.setFillColor(7, 34, 26); // #07221A
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(32, 231, 154); // #20E79A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FRESHNEX IOT TELEMETRY & AI AGENT FRESORA', margin + 6, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('OFFICIAL PRODUCT QUALITY & SHELF-LIFE REPORT', margin + 6, y + 16);

  doc.setTextColor(180, 225, 205);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Report ID: ${data.reportId}   |   Generated: ${data.generatedAt}`, margin + 6, y + 22);

  y += 32;

  // 2. SECTION 1: BASIC PRODUCT & DEVICE INFORMATION
  doc.setFillColor(235, 251, 244); // Light emerald tint
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. BASIC PRODUCT & HARDWARE IDENTIFICATION', margin + 4, y + 5.5);
  y += 11;

  doc.setDrawColor(210, 225, 220);
  doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'S');

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 4;

  doc.setFontSize(8.5);
  // Row 1
  doc.setTextColor(92, 127, 117);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Name:', col1X, y + 7);
  doc.setTextColor(7, 34, 26);
  doc.text(data.productName, col1X + 32, y + 7);

  doc.setTextColor(92, 127, 117);
  doc.text('Unique Device ID:', col2X, y + 7);
  doc.setTextColor(19, 73, 59);
  doc.text(data.deviceId, col2X + 34, y + 7);

  // Row 2
  doc.setTextColor(92, 127, 117);
  doc.text('Product Category:', col1X, y + 14);
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'normal');
  doc.text(data.category, col1X + 32, y + 14);

  doc.setTextColor(92, 127, 117);
  doc.setFont('helvetica', 'bold');
  doc.text('Batch Reference:', col2X, y + 14);
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'normal');
  doc.text(data.batchNumber, col2X + 34, y + 14);

  // Row 3
  doc.setTextColor(92, 127, 117);
  doc.setFont('helvetica', 'bold');
  doc.text('GPS Coordinates:', col1X, y + 21);
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.gpsLat.toFixed(4)}°N, ${data.gpsLng.toFixed(4)}°E (${data.gpsSats} Sats)`, col1X + 32, y + 21);

  doc.setTextColor(92, 127, 117);
  doc.setFont('helvetica', 'bold');
  doc.text('Last Sensor Sync:', col2X, y + 21);
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'normal');
  doc.text(data.lastSyncedAt, col2X + 34, y + 21);

  // Row 4
  doc.setTextColor(92, 127, 117);
  doc.setFont('helvetica', 'bold');
  doc.text('Node Status:', col1X, y + 27);
  doc.setTextColor(16, 140, 95);
  doc.text('ONLINE - REAL-TIME TELEMETRY ACTIVE', col1X + 32, y + 27);

  y += 36;

  // 3. SECTION 2: FRESHNESS LEVEL & QUALITY ASSESSMENT
  doc.setFillColor(235, 251, 244);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. LIVE FRESHNESS LEVEL & QUALITY ASSESSMENT', margin + 4, y + 5.5);
  y += 11;

  doc.setDrawColor(210, 225, 220);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'S');

  doc.setFontSize(18);
  doc.setTextColor(16, 140, 95);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.freshnessScore}% FRESH`, col1X, y + 11);

  doc.setFontSize(9.5);
  doc.setTextColor(7, 34, 26);
  doc.text(`Preservation Status: ${data.freshnessStatus.toUpperCase()}`, col2X, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 95, 88);
  const wrappedFreshMsg = doc.splitTextToSize(`Diagnostic Remark: ${data.freshnessMessage}`, contentWidth - 10);
  doc.text(wrappedFreshMsg, col1X, y + 17);

  y += 30;

  // 4. SECTION 3: AI AGENT FRESORA SHELF-LIFE PREDICTION
  doc.setFillColor(7, 34, 26);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(32, 231, 154);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. AI AGENT FRESORA — PREDICTIVE SHELF-LIFE INTELLIGENCE', margin + 4, y + 5.5);
  y += 11;

  doc.setDrawColor(32, 231, 154);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'S');

  doc.setFontSize(13);
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Predicted Remaining Shelf Life: ${data.remainingDays} Days + ${data.remainingHours} Hours`,
    col1X,
    y + 8
  );

  doc.setFontSize(8.5);
  doc.setTextColor(92, 127, 117);
  doc.text(`Estimated Expiry Date: ${data.estimatedExpiryDate}`, col1X, y + 14.5);
  doc.text(`AI Confidence Score: ${data.confidencePercent}%`, col1X + 68, y + 14.5);
  doc.text(`Spoilage Risk: ${data.spoilageRiskLevel} Risk`, col1X + 122, y + 14.5);

  doc.setTextColor(19, 73, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Retention State: ${data.predictedStatus}`, col1X, y + 21);

  doc.setTextColor(40, 60, 55);
  doc.setFont('helvetica', 'normal');
  const wrappedAnalysis = doc.splitTextToSize(`FRESORA Analysis: ${data.predictionSummary}`, contentWidth - 10);
  doc.text(wrappedAnalysis, col1X, y + 27);

  doc.setTextColor(19, 73, 59);
  doc.setFont('helvetica', 'bold');
  const wrappedAdvice = doc.splitTextToSize(`Storage Recommendation: ${data.storageAdvice}`, contentWidth - 10);
  doc.text(wrappedAdvice, col1X, y + 39);

  y += 54;

  // 5. SECTION 4: COMPLETE 8-CHANNEL SENSOR TELEMETRY READINGS
  doc.setFillColor(235, 251, 244);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(7, 34, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. COMPLETE 8-CHANNEL IOT SENSOR TELEMETRY DATA', margin + 4, y + 5.5);
  y += 11;

  const sensorRows: Array<[string, string, string]> = [
    ['1. Ambient Temperature', `${data.temperature} °C`, data.temperature <= 6 ? 'Optimal Cold-Chain' : 'Elevated Thermal'],
    ['2. Relative Humidity', `${data.humidity} %`, 'Regulated Moisture'],
    ['3. Calculated Moisture & Dew Point', `${data.moisture} g/m³ (Dew: ${data.dewPoint} °C)`, 'Psychrometric Balance'],
    ['4. Calculated Acidity (pH)', `pH ${data.ph}`, data.acidityClass],
    ['5. MQ-135 Air Quality / VOC Gas', `${data.gas} ${data.gas > 500 ? 'ADC' : 'ppm'}`, data.gas < 250 ? 'Safe Atmosphere' : 'VOC Warning'],
    ['6. Mechanical Impact Sensor', `${data.impact.toFixed(2)} G`, data.impact <= 1.5 ? 'No Physical Shock' : 'Shock Detected'],
    ['7. Ambient Light Exposure', `${data.light} lx`, data.light <= 50 ? 'Dark Sealed Storage' : 'Light Exposed'],
    ['8. NEO-6M GPS Satellite Lock', `${data.gpsLat.toFixed(4)}°N, ${data.gpsLng.toFixed(4)}°E`, `${data.gpsSats} Satellites Locked`]
  ];

  const rowHeight = 7.5;
  // Table Header
  doc.setFillColor(244, 247, 246);
  doc.rect(margin, y, contentWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(7, 34, 26);
  doc.text('Sensor Channel', margin + 4, y + 5);
  doc.text('Live Reading', margin + 78, y + 5);
  doc.text('Preservation Evaluation', margin + 128, y + 5);
  y += rowHeight;

  doc.setFont('helvetica', 'normal');
  sensorRows.forEach((row, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 252, 251);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(230, 238, 235);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(7, 34, 26);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], margin + 4, y + 5);

    doc.setTextColor(19, 73, 59);
    doc.text(row[1], margin + 78, y + 5);

    doc.setTextColor(92, 127, 117);
    doc.setFont('helvetica', 'normal');
    doc.text(row[2], margin + 128, y + 5);

    y += rowHeight;
  });

  y += 8;

  // 6. FOOTER SIGNATURE
  doc.setDrawColor(200, 220, 212);
  doc.line(margin, y, margin + contentWidth, y);
  doc.setFontSize(7.5);
  doc.setTextColor(110, 140, 130);
  doc.text(
    `Verified by FreshNex IoT Telemetry & AI AGENT FRESORA • Device ID: ${data.deviceId} (${data.productName})`,
    margin,
    y + 5
  );
  doc.text('Page 1 of 1', pageWidth - margin - 16, y + 5);

  const safeDate = new Date().toISOString().slice(0, 10);
  doc.save(`FreshNex_Report_${data.deviceId}_${data.productName}_${safeDate}.pdf`);
}
