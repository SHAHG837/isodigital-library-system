import React, { useState } from 'react';
import { OfficeBearer } from '../types';
import { ISO_LOGO_URL } from '../data/initialData';
import { generateQRCodeDataURL } from '../utils/qrCode';
import { printCardElement, downloadCardAsPDF, downloadCardAsPNG } from '../utils/exportImport';
import {
  Award,
  Printer,
  Download,
  X,
  CreditCard,
  Layout,
  Edit2,
  Trash2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface OfficeBearerCardModalProps {
  isOpen: boolean;
  bearer: OfficeBearer | null;
  onClose: () => void;
  onEdit?: (bearer: OfficeBearer) => void;
  onDelete?: (id: string) => void;
  isSuperAdmin: boolean;
  isOwnRecord?: boolean;
}

export const OfficeBearerCardModal: React.FC<OfficeBearerCardModalProps> = ({
  isOpen,
  bearer,
  onClose,
  onEdit,
  onDelete,
  isSuperAdmin,
  isOwnRecord
}) => {
  const [layoutFormat, setLayoutFormat] = useState<'cnic' | 'badge'>('cnic');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !bearer) return null;

  const bearerName = bearer.name;
  const bearerDesignation = bearer.designation;
  const bearerPhoto = bearer.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300';
  const bearerPhone = bearer.mobileNumber;
  const bearerDistrict = bearer.district || bearer.city || 'Islamabad';
  const bearerProvince = bearer.province || 'Pakistan';
  const bearerId = bearer.id;

  const formattedCnicId = bearerId.startsWith('ISO-')
    ? bearerId
    : `ISO-OB-${bearerId.replace(/[^0-9]/g, '').padEnd(6, '0').slice(0, 6)}`;

  const qrData = `https://iso.org.pk/verify-executive?id=${encodeURIComponent(bearerId)}&name=${encodeURIComponent(bearerName)}&designation=${encodeURIComponent(bearerDesignation)}`;
  const qrCodeUrl = generateQRCodeDataURL(qrData);

  const handlePrint = async () => {
    setIsGenerating(true);
    await printCardElement('ob-printable-card-element');
    setIsGenerating(false);
  };

  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    await downloadCardAsPNG('ob-printable-card-element', `ISO_Executive_${bearerName.replace(/\s+/g, '_')}`);
    setIsGenerating(false);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    await downloadCardAsPDF('ob-printable-card-element', bearerName, formattedCnicId);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-6 text-white max-h-[95vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Official Office Bearer Identity Card
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold font-mono">
                  {bearer.designation}
                </span>
                {isOwnRecord && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                    ★ Your Official Card
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5" dir="rtl">
                عہدیدار کا سرکاری شناختی کارڈ — برائے پرنٹ، محفوظ اور ڈیجیٹل تصدیق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Super Admin Full Control Notice */}
        {isSuperAdmin && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>سپر ایڈمن مکمل اختیارات:</strong> آپ اس عہدیدار کی تفصیلات میں ترمیم، پرنٹ یا ریکارڈ ڈیلیٹ کر سکتے ہیں۔
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(bearer);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Bearer</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(bearer.id);
                  }}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Format Switcher & Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Layout:</span>
            <button
              type="button"
              onClick={() => setLayoutFormat('cnic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutFormat === 'cnic'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>CNIC Format (Front & Back)</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutFormat('badge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutFormat === 'badge'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Executive Neck Badge</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Save Card Image as PNG"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Printable PDF"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="flex justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
          <div
            id="ob-printable-card-element"
            className="flex flex-col md:flex-row items-center justify-center gap-6 p-4"
            style={{ minWidth: layoutFormat === 'cnic' ? '860px' : '620px' }}
          >
            {layoutFormat === 'cnic' ? (
              <>
                {/* CNIC FRONT SIDE */}
                <div
                  style={{
                    width: '420px',
                    height: '260px',
                    backgroundColor: '#064e3b',
                    backgroundImage: 'radial-gradient(circle at 50% 30%, #047857 0%, #064e3b 60%, #022c22 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    color: '#ffffff',
                    border: '2px solid #10b981',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Watermark Logo */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-25px',
                      bottom: '-25px',
                      width: '210px',
                      height: '210px',
                      opacity: 0.12,
                      pointerEvents: 'none'
                    }}
                  >
                    <img src={ISO_LOGO_URL} alt="Seal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Header Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #059669', paddingBottom: '6px', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={ISO_LOGO_URL} alt="ISO Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#6ee7b7', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                          ISLAMIC REPUBLIC OF PAKISTAN
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.2px' }}>
                          INTERNATIONAL SADAT ORGANIZATION
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                      <div style={{ fontSize: '9px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase' }}>
                        EXECUTIVE CABINET
                      </div>
                      <div style={{ fontSize: '8px', color: '#a7f3d0', fontFamily: 'monospace' }}>
                        عہدیداران شناختی کارڈ
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', zIndex: 10 }}>
                    {/* Photo & Smart Chip Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      {/* Smart Chip Graphic */}
                      <div
                        style={{
                          width: '36px',
                          height: '26px',
                          backgroundColor: '#d97706',
                          backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                          borderRadius: '4px',
                          border: '1px solid #fef08a',
                          position: 'relative',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
                        }}
                      >
                        <div style={{ width: '12px', height: '100%', borderRight: '1px solid #78350f', borderLeft: '1px solid #78350f', margin: '0 auto' }} />
                      </div>

                      {/* Photo */}
                      <img
                        src={bearerPhoto}
                        alt={bearerName}
                        crossOrigin="anonymous"
                        style={{
                          width: '76px',
                          height: '86px',
                          borderRadius: '8px',
                          border: '2px solid #f59e0b',
                          objectFit: 'cover',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, fontSize: '9px', color: '#ecfdf5', lineHeight: '1.4' }}>
                      <div style={{ marginBottom: '3px' }}>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Official Designation ID</span>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#fef08a', fontFamily: 'monospace', letterSpacing: '0.8px' }}>
                          {formattedCnicId}
                        </span>
                      </div>

                      <div style={{ marginBottom: '2px' }}>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Cabinet Official Name</span>
                        <strong style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase' }}>{bearerName}</strong>
                      </div>

                      <div style={{ marginBottom: '2px' }}>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Official Designation</span>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#fcd34d' }}>{bearerDesignation}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                        <div>
                          <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Status</span>
                          <strong style={{ fontSize: '8px', color: '#34d399' }}>ACTIVE OFFICIAL</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Country</span>
                          <strong style={{ fontSize: '8px', color: '#ffffff' }}>PAKISTAN</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Appointed</span>
                          <strong style={{ fontSize: '8px', color: '#ffffff', fontFamily: 'monospace' }}>{bearer.appointmentDate || '2026-01-01'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div style={{ borderTop: '1px dashed #059669', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', color: '#a7f3d0', zIndex: 10 }}>
                    <div>
                      <span>Jurisdiction: <strong>{bearerDistrict}, {bearerProvince}</strong></span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '10px', color: '#fef08a', fontWeight: 'bold' }}>S. M. Aamir Naqvi</span>
                      <span style={{ display: 'block', fontSize: '6px', color: '#6ee7b7' }}>Chairman IT Support Council</span>
                    </div>
                  </div>
                </div>

                {/* CNIC BACK SIDE */}
                <div
                  style={{
                    width: '420px',
                    height: '260px',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #090d16 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    color: '#ffffff',
                    border: '2px solid #334155',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Top Bar with QR Code */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase' }}>
                        Executive Verification & Emergency Contact
                      </div>
                      <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '2px' }}>
                        Phone: {bearerPhone} | WhatsApp: {bearer.whatsapp || bearerPhone}
                      </div>
                      <div style={{ fontSize: '7px', color: '#94a3b8' }}>
                        City: {bearer.city || 'Islamabad'} | District: {bearerDistrict}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      <img src={qrCodeUrl} alt="Verify QR" style={{ width: '56px', height: '56px' }} />
                    </div>
                  </div>

                  {/* Urdu Terms Box */}
                  <div
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '7.5px',
                      color: '#cbd5e1',
                      lineHeight: '1.4',
                      textAlign: 'right'
                    }}
                    dir="rtl"
                  >
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#fef08a' }}>
                      یہ کارڈ انٹرنیشنل سادات آرگنائزیشن کے باضابطہ کابینہ عہدیدار کا سرکاری شناختی ثبوت ہے۔
                    </p>
                    <p style={{ margin: '2px 0 0 0' }}>
                      گمشدگی کی صورت میں قریبی لیڈرشپ برانچ یا مرکزی دفتر آئی ٹی سپورٹ کونسل کو مطلع کریں۔
                    </p>
                  </div>

                  {/* Bottom Strip */}
                  <div style={{ borderTop: '1px dashed #475569', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7px', color: '#94a3b8' }}>
                    <span>Property of International Sadat Organization</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>Helpline: 03323475431</span>
                  </div>
                </div>
              </>
            ) : (
              /* BADGE FORMAT (Front & Back) */
              <>
                <div
                  style={{
                    width: '300px',
                    height: '460px',
                    backgroundColor: '#064e3b',
                    backgroundImage: 'linear-gradient(180deg, #047857 0%, #064e3b 40%, #022c22 100%)',
                    borderRadius: '20px',
                    padding: '20px',
                    color: '#ffffff',
                    border: '3px solid #10b981',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ width: '40px', height: '6px', backgroundColor: '#022c22', borderRadius: '10px', margin: '-8px 0 6px 0', border: '1px solid #059669' }} />

                  <div>
                    <img src={ISO_LOGO_URL} alt="ISO" style={{ width: '56px', height: '56px', margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '8px', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      INTERNATIONAL SADAT ORGANIZATION
                    </div>
                    <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '900', letterSpacing: '0.5px' }}>
                      OFFICIAL EXECUTIVE BADGE
                    </div>
                  </div>

                  <div>
                    <img
                      src={bearerPhoto}
                      alt={bearerName}
                      crossOrigin="anonymous"
                      style={{
                        width: '105px',
                        height: '115px',
                        borderRadius: '16px',
                        border: '3px solid #f59e0b',
                        objectFit: 'cover',
                        margin: '0 auto',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                      }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' }}>
                        {bearerName}
                      </h4>
                      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>
                        {bearerDesignation}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '8px', color: '#a7f3d0', width: '100%', borderTop: '1px dashed #059669', paddingTop: '8px' }}>
                    <div>ID: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{formattedCnicId}</strong></div>
                    <div>Jurisdiction: <strong>{bearerDistrict}, {bearerProvince}</strong></div>
                    <div>Contact: <strong>{bearerPhone}</strong></div>
                  </div>
                </div>

                {/* Badge Back */}
                <div
                  style={{
                    width: '300px',
                    height: '460px',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '20px',
                    padding: '20px',
                    color: '#ffffff',
                    border: '3px solid #334155',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ width: '40px', height: '6px', backgroundColor: '#020617', borderRadius: '10px', margin: '-8px 0 6px 0', border: '1px solid #334155' }} />

                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>
                      Executive Verification
                    </div>
                    <p style={{ fontSize: '7.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Scan QR code to verify this executive identity and authorized jurisdiction.
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '12px' }}>
                    <img src={qrCodeUrl} alt="QR" style={{ width: '110px', height: '110px' }} />
                  </div>

                  <div style={{ fontSize: '7.5px', color: '#94a3b8', borderTop: '1px dashed #334155', paddingTop: '8px', width: '100%' }}>
                    Issued by International Sadat Organization<br />
                    Auth: Syed M. Aamir Naqvi Al Bukhari<br />
                    Chairman IT Support Council (03323475431)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>High-resolution vector ISO format for official printing and PVC badge fabrication.</span>
          </p>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
          >
            Close Card Preview
          </button>
        </div>
      </div>
    </div>
  );
};
