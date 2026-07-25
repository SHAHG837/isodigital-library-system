import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';

/**
 * Downloads a Blob as a file
 */
export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data: any, fileName: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadFile(blob, fileName);
}

/**
 * Export array of records to CSV file
 */
export function exportToCSV(data: any[], fileName: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, fileName);
}

/**
 * Export array of records to Excel (.xlsx) safely
 */
export function exportToExcel(data: any[], fileName: string, sheetName = 'ISO Records') {
  try {
    if (!data || data.length === 0) {
      alert('No records available to export.');
      return;
    }

    // Clean data for Excel export: remove huge base64 strings (e.g., profilePhoto) and format objects
    const cleanedData = data.map((item) => {
      const cleaned: Record<string, any> = {};
      Object.keys(item).forEach((key) => {
        if (key === 'profilePhoto') return; // Skip base64 image strings that crash XLSX
        const val = item[key];
        if (val !== null && typeof val === 'object') {
          cleaned[key] = JSON.stringify(val);
        } else {
          cleaned[key] = val ?? '';
        }
      });
      return cleaned;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  } catch (err) {
    console.error('XLSX export error, falling back to CSV:', err);
    try {
      // Fallback to CSV if XLSX writing encounters an issue
      const csvData = data.map(({ profilePhoto, ...rest }) => rest);
      exportToCSV(csvData, fileName.replace(/\.xlsx$/i, '.csv'));
    } catch (csvErr) {
      console.error('CSV fallback failed:', csvErr);
      alert('Unable to export file. Please check console.');
    }
  }
}

/**
 * Export to Word (.docx) document with ISO header table
 */
export async function exportToWord(records: any[], title: string, fileName = 'ISO_Document.docx') {
  if (records.length === 0) return;

  const keys = Object.keys(records[0]).filter((k) => k !== 'profilePhoto');

  const headerCells = keys.map(
    (k) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: k.toUpperCase(),
                bold: true,
                color: 'FFFFFF',
                size: 20
              })
            ]
          })
        ],
        shading: { fill: '065F46' }, // Emerald green
        width: { size: Math.floor(100 / keys.length), type: WidthType.PERCENTAGE }
      })
  );

  const dataRows = records.map((record) => {
    return new TableRow({
      children: keys.map(
        (k) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(record[k] ?? ''),
                    size: 18
                  })
                ]
              })
            ],
            width: { size: Math.floor(100 / keys.length), type: WidthType.PERCENTAGE }
          })
      )
    });
  });

  const table = new Table({
    rows: [new TableRow({ children: headerCells }), ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'INTERNATIONAL SADAT ORGANIZATION (ISO)',
            heading: HeadingLevel.HEADING_1,
            alignment: 'center',
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: 'DIGITAL LIBRARY MANAGEMENT SYSTEM',
            heading: HeadingLevel.HEADING_2,
            alignment: 'center',
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${title} - Exported Date: ${new Date().toLocaleDateString()}`,
                italics: true,
                size: 20
              })
            ],
            spacing: { after: 300 }
          }),
          table,
          new Paragraph({
            children: [
              new TextRun({
                text: '\n\nPrepared by: Syed Muhammad Aamir Naqvi Al Bukhari, Chairman IT Support Council. Contact: 03323475431.',
                bold: true,
                size: 18,
                color: '065F46'
              })
            ],
            spacing: { before: 400 }
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}

/**
 * Export to PowerPoint (.pptx)
 */
export async function exportToPowerPoint(records: any[], title: string, fileName = 'ISO_Presentation.pptx') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F172A' }; // Dark Slate
  slide1.addText('INTERNATIONAL SADAT ORGANIZATION (ISO)', {
    x: 0.5,
    y: 1.5,
    w: '90%',
    fontSize: 28,
    bold: true,
    color: '10B981',
    align: 'center'
  });
  slide1.addText(title, {
    x: 0.5,
    y: 2.5,
    w: '90%',
    fontSize: 22,
    color: 'F8FAFC',
    align: 'center'
  });
  slide1.addText('Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council)', {
    x: 0.5,
    y: 4.5,
    w: '90%',
    fontSize: 14,
    color: '94A3B8',
    align: 'center'
  });

  // Data Slide(s)
  if (records.length > 0) {
    const slide2 = pptx.addSlide();
    slide2.addText(`${title} - Records Overview`, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      fontSize: 20,
      bold: true,
      color: '065F46'
    });

    const headers = Object.keys(records[0]).filter((k) => k !== 'profilePhoto').slice(0, 6);
    const tableData: any[][] = [
      headers.map((h) => ({ text: h.toUpperCase(), options: { fill: '065F46', color: 'FFFFFF', bold: true } }))
    ];

    records.slice(0, 15).forEach((rec) => {
      tableData.push(headers.map((h) => ({ text: String(rec[h] ?? ''), options: { color: '1E293B', fontSize: 10 } })));
    });

    slide2.addTable(tableData, {
      x: 0.5,
      y: 1.2,
      w: 9.0,
      colW: Array(headers.length).fill(9.0 / headers.length)
    });
  }

  const finalName = fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx`;
  await pptx.writeFile({ fileName: finalName });
}

/**
 * Export records to PDF report using jsPDF
 */
export function exportToPDFReport(records: any[], fileName = 'ISO_PDF_Report.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70); // Emerald green
  doc.text('INTERNATIONAL SADAT ORGANIZATION (ISO)', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Digital Library Management System - Official Report', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 32);
  doc.text(`Total Records: ${records.length}`, 14, 38);

  let y = 48;
  records.slice(0, 25).forEach((rec, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const name = rec.fullName || rec.name || rec.id;
    const details = `${idx + 1}. ${name} - ID: ${rec.id} - Location: ${rec.city || ''}, ${rec.district || ''}`;
    doc.text(details, 14, y);
    y += 8;
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Prepared by Syed Muhammad Aamir Naqvi Al Bukhari, Chairman IT Support Council. Contact: 03323475431.',
    105,
    285,
    { align: 'center' }
  );

  doc.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}

/**
 * Export DOM container element directly to PDF using html2canvas & jsPDF
 */
export async function exportElementToPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}

/**
 * Print element directly
 */
export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ISO Digital Library Print</title>

        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 10px; color: #1e293b; background: white; font-size: 11px; }
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
          th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; font-size: 10px; word-wrap: break-word; }
          th { background-color: #065f46; color: white; font-weight: 700; text-transform: uppercase; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .header-title { text-align: center; color: #065f46; margin-bottom: 2px; font-weight: 800; font-size: 16px; text-transform: uppercase; }
          .header-sub { text-align: center; font-size: 11px; color: #475569; margin-bottom: 12px; font-weight: 600; }
          .footer-note { margin-top: 15px; text-align: center; font-size: 10px; color: #065f46; border-top: 1px solid #e2e8f0; padding-top: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-title">INTERNATIONAL SADAT ORGANIZATION (ISO)</div>
        <div class="header-sub">ISO Digital Library Management System - Official Roster</div>
        ${element.innerHTML}
        <div class="footer-note">Prepared by Syed Muhammad Aamir Naqvi Al Bukhari, Chairman IT Support Council. Contact: 03323475431.</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Specialized Member Directory 1-Page Printable Roster
 */
export function printMemberDirectoryTable(records: any[], title = 'ISO Official Members Directory') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = records
    .map(
      (m, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold; font-family: monospace;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace; color: #065f46;">${m.id || 'N/A'}</td>
      <td style="font-weight: 800; color: #0f172a;">${m.fullName || m.name || ''}</td>
      <td>
        <div><strong>Mob:</strong> ${m.mobileNumber || 'N/A'}</div>
        <div style="font-size: 8px; color: #475569;"><strong>WA:</strong> ${m.whatsappNumber || m.whatsapp || 'N/A'}</div>
      </td>
      <td>${m.city || ''}, ${m.district || ''}</td>
      <td>${m.division || ''}, ${m.province || ''}</td>
      <td style="font-family: monospace; font-size: 9px;">${m.joiningDate || m.appointmentDate || '2026-01-01'}</td>
      <td style="text-align: center;">
        <span style="background-color: #d1fae5; color: #065f46; font-weight: bold; font-size: 8px; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">
          ${m.status || 'Active'}
        </span>
      </td>
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ISO Print</title>
        <style>
          @page { size: A4 landscape; margin: 5mm; }
          html, body { margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
          .container { padding: 8px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #065f46; padding-bottom: 6px; margin-bottom: 8px; }
          .title-main { font-size: 16px; font-weight: 900; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; }
          .title-sub { font-size: 10px; font-weight: 700; color: #475569; }
          .badge { background: #065f46; color: white; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 4px; }
          th { background: #065f46; color: #ffffff; text-align: left; padding: 5px 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; border: 1px solid #047857; }
          td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 9px; vertical-align: middle; word-wrap: break-word; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: 700; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="title-main">International Sadat Organization (ISO)</div>
              <div class="title-sub">${title} • Single-Page Executive Roster</div>
            </div>
            <div>
              <span class="badge">TOTAL RECORDS: ${records.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%; text-align: center;">#</th>
                <th style="width: 14%;">Member ID</th>
                <th style="width: 22%;">Full Name</th>
                <th style="width: 18%;">Contact Phone</th>
                <th style="width: 16%;">City / District</th>
                <th style="width: 14%;">Division / Province</th>
                <th style="width: 8%;">Joined</th>
                <th style="width: 8%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Authentication: ISO Central Digital Library Repository</span>
            <span>Auth: Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council - 03323475431)</span>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Helper to safely capture an HTML element with html2canvas without errors
 */
async function renderCardToCanvas(elementId: string): Promise<HTMLCanvasElement | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false, // Prevents canvas tainting SecurityError DOMException!
      backgroundColor: '#0f172a',
      logging: false,
      onclone: (clonedDoc) => {
        // Remove all oklch color values which html2canvas fails to parse
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((s) => {
          if (s.textContent && s.textContent.includes('oklch')) {
            s.textContent = s.textContent.replace(/oklch\([^\)]+\)/gi, '#0f172a');
          }
        });

        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
            htmlEl.style.cssText = htmlEl.style.cssText.replace(/oklch\([^\)]+\)/gi, '#0f172a');
          }
        });
      }
    });
  } catch (e) {
    console.warn('html2canvas capture warning:', e);
    return null;
  }
}

/**
 * Print membership card pixel-perfect
 */
export async function printCardElement(elementId: string) {
  try {
    const canvas = await renderCardToCanvas(elementId);
    let imgData = '';
    if (canvas) {
      imgData = canvas.toDataURL('image/png');
    }

    const element = document.getElementById(elementId);
    const innerContent = element ? element.innerHTML : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ISO Official Membership Card</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; text-align: center; margin: 0; padding: 20px; }
            .header-title { font-size: 18px; font-weight: 800; color: #065f46; margin-bottom: 4px; text-transform: uppercase; }
            .header-sub { font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 20px; }
            .card-wrapper { display: flex; justify-content: center; align-items: center; margin: 20px auto; flex-wrap: wrap; gap: 20px; }
            .card-img { max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #cbd5e1; }
            .footer-note { margin-top: 30px; font-size: 10px; font-weight: 700; color: #065f46; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header-title">International Sadat Organization (ISO)</div>
          <div class="header-sub">Official Digital Membership Card & QR Verification Certificate</div>
          <div class="card-wrapper">
            ${imgData ? `<img src="${imgData}" class="card-img" />` : innerContent}
          </div>
          <div class="footer-note">
            Authorized by Syed Muhammad Aamir Naqvi Al Bukhari, Chairman IT Support Council.<br/>
            Central Digital Repository & Membership Verification System • Contact: 03323475431
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.error('Error rendering card for print:', err);
  }
}

/**
 * Download Membership Card as clean PDF document
 */
export async function downloadCardAsPDF(elementId: string, personName: string, personId: string) {
  try {
    const canvas = await renderCardToCanvas(elementId);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm

    // Header bar
    pdf.setFillColor(6, 95, 70); // #065f46
    pdf.rect(0, 0, pdfWidth, 24, 'F');

    pdf.setFontSize(15);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INTERNATIONAL SADAT ORGANIZATION (ISO)', pdfWidth / 2, 12, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Digital Membership Card & QR Verification Certificate', pdfWidth / 2, 18, { align: 'center' });

    // Member Name & Details
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Membership Card Certificate: ${personName}`, 14, 36);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Membership ID: ${personId}  |  Issued Date: ${new Date().toLocaleDateString()}`, 14, 43);

    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posX = (pdfWidth - imgWidth) / 2;
      const posY = 50;

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);

      const footerY = Math.min(posY + imgHeight + 15, 260);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, footerY, pdfWidth - 14, footerY);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 95, 70);
      pdf.text('AUTHENTICATION & IT SUPPORT COUNCIL', 14, footerY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Issued by: Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council)', 14, footerY + 14);
      pdf.text('Official Contact: 03323475431  |  Email: syedmuhammadamir837@gmail.com', 14, footerY + 20);
    } else {
      // Fallback Vector PDF layout if canvas is null
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 50, 182, 100, 4, 4, 'F');

      pdf.setFontSize(14);
      pdf.setTextColor(6, 95, 70);
      pdf.setFont('helvetica', 'bold');
      pdf.text(personName, 24, 68);

      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Official ID: ${personId}`, 24, 78);
      pdf.text(`Status: Verified Active Member`, 24, 88);

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('International Sadat Organization - Official Digital Record', 24, 100);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 95, 70);
      pdf.text('AUTHENTICATION & IT SUPPORT COUNCIL', 14, 180);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Issued by: Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council - 03323475431)', 14, 188);
    }

    pdf.save(`ISO_Membership_Card_${personId}.pdf`);
  } catch (err) {
    console.error('Error exporting card PDF:', err);
  }
}

/**
 * Download Membership Card as high resolution PNG image
 */
export async function downloadCardAsPNG(elementId: string, personId: string) {
  try {
    const canvas = await renderCardToCanvas(elementId);
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `ISO_Membership_Card_${personId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback: create canvas programmatically
      const element = document.getElementById(elementId);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="400" y="80" fill="#10b981" font-size="24" font-weight="bold" text-anchor="middle">INTERNATIONAL SADAT ORGANIZATION</text>
        <text x="400" y="120" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">OFFICIAL MEMBERSHIP CARD</text>
        <text x="400" y="220" fill="#38bdf8" font-size="22" font-weight="bold" text-anchor="middle">ID: ${personId}</text>
        <text x="400" y="320" fill="#94a3b8" font-size="14" text-anchor="middle">Auth: Syed M. Aamir Naqvi Al Bukhari (03323475431)</text>
      </svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ISO_Membership_Card_${personId}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Error exporting card PNG:', err);
  }
}

