import React, { useState, useEffect } from 'react';
import { Member, OfficeBearer, AdminCredential } from '../types';
import { ISO_LOGO_URL } from '../data/initialData';
import { Award, Printer, Download, QrCode, User, CheckCircle2, FileText, Image as ImageIcon, ShieldCheck, CreditCard, Layout, ShieldAlert } from 'lucide-react';
import { generateQRCodeDataURL } from '../utils/qrCode';
import { printCardElement, downloadCardAsPDF, downloadCardAsPNG } from '../utils/exportImport';

interface MembershipCardModuleProps {
  members: Member[];
  officeBearers: OfficeBearer[];
  currentLoggedInUser?: AdminCredential | null;
  onUpdateMember?: (updatedMember: Member) => void;
}

export const MembershipCardModule: React.FC<MembershipCardModuleProps> = ({
  members,
  officeBearers,
  currentLoggedInUser,
  onUpdateMember
}) => {
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Find user's member record
  const myMemberRecord = members.find((m) =>
    (currentLoggedInUser?.mobileNumber && m.mobileNumber === currentLoggedInUser.mobileNumber) ||
    (currentLoggedInUser?.name && m.fullName.toLowerCase() === currentLoggedInUser.name.toLowerCase())
  );

  // Find user's office bearer record
  const myOfficeBearerRecord = officeBearers.find((o) =>
    (currentLoggedInUser?.mobileNumber && o.mobileNumber === currentLoggedInUser.mobileNumber) ||
    (currentLoggedInUser?.name && o.name.toLowerCase() === currentLoggedInUser.name.toLowerCase())
  );

  const [selectedType, setSelectedType] = useState<'Member' | 'OfficeBearer'>(
    myMemberRecord ? 'Member' : (myOfficeBearerRecord ? 'OfficeBearer' : 'Member')
  );
  const [selectedId, setSelectedId] = useState<string>(
    myMemberRecord?.id || myOfficeBearerRecord?.id || members[0]?.id || ''
  );
  const [cardLayoutFormat, setCardLayoutFormat] = useState<'cnic' | 'badge'>('cnic');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isRegularMember) {
      if (myOfficeBearerRecord && !myMemberRecord) {
        setSelectedType('OfficeBearer');
        setSelectedId(myOfficeBearerRecord.id);
      } else if (myMemberRecord) {
        setSelectedType('Member');
        setSelectedId(myMemberRecord.id);
      }
    }
  }, [isRegularMember, myMemberRecord, myOfficeBearerRecord]);

  const activePerson =
    selectedType === 'Member'
      ? members.find((m) => m.id === selectedId) || members[0]
      : officeBearers.find((o) => o.id === selectedId) || officeBearers[0];

  const personName = activePerson ? ('fullName' in activePerson ? activePerson.fullName : activePerson.name) : 'Syed Member';
  const personPhoto = activePerson?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
  const personRole = activePerson ? ('designation' in activePerson ? activePerson.designation : 'ISO Member') : 'ISO Member';
  const personPhone = activePerson ? ('mobileNumber' in activePerson ? activePerson.mobileNumber : activePerson.mobileNumber) : '03323475431';
  const personDistrict = activePerson?.district || 'Karachi Central';
  const personProvince = activePerson?.province || 'Sindh';
  const personCity = activePerson?.city || 'Karachi';
  const personId = activePerson?.id || 'ISO-42101-0332347-1';

  // Format National ID Number format: e.g. ISO-42101-0332347-1
  const formattedCnicId = personId.startsWith('ISO-')
    ? personId
    : `ISO-42101-${personId.replace(/[^0-9]/g, '').padEnd(7, '0').slice(0, 7)}-1`;

  // Generate QR Code data URL
  const qrData = `https://iso.org.pk/verify?id=${encodeURIComponent(personId)}&name=${encodeURIComponent(personName)}&role=${encodeURIComponent(personRole)}&status=${encodeURIComponent(activePerson && 'status' in activePerson ? activePerson.status : 'Active')}`;
  const qrCodeUrl = generateQRCodeDataURL(qrData);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    await downloadCardAsPDF('printable-iso-card', personName, formattedCnicId);
    setIsGenerating(false);
  };

  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    await downloadCardAsPNG('printable-iso-card', formattedCnicId);
    setIsGenerating(false);
  };

  const handlePrintCard = async () => {
    setIsGenerating(true);
    await printCardElement('printable-iso-card');
    setIsGenerating(false);
  };

  const isMemberVerified =
    selectedType === 'Member' &&
    activePerson &&
    'status' in activePerson &&
    activePerson.status === 'Verified';

  const isApproved =
    selectedType === 'OfficeBearer' ||
    (activePerson && 'status' in activePerson
      ? activePerson.status === 'Approved' ||
        activePerson.status === 'Verified' ||
        (activePerson.status === 'Active' && !activePerson.notes?.includes('Registered via Email OTP'))
      : false);

  const PendingWatermarkOverlay = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(1.5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        borderRadius: '14px',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          transform: 'rotate(-20deg)',
          backgroundColor: '#b45309',
          color: '#ffffff',
          padding: '8px 22px',
          borderRadius: '10px',
          fontWeight: '900',
          fontSize: '12px',
          letterSpacing: '1.5px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
          border: '2px solid #fef3c7',
          textAlign: 'center',
          textTransform: 'uppercase',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⏳</span>
          <span>APPROVAL PENDING</span>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0px', color: '#fef08a' }} dir="rtl">
          کارڈ زیرِ منظوری ہے — ڈاؤن لوڈ و پرنٹ معطل
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isApproved && (
        <div className="bg-amber-950/90 border-2 border-amber-500/80 text-amber-100 p-4 rounded-2xl flex items-start gap-3 shadow-xl">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <span>کارڈ ڈاؤن لوڈ اور پرنٹ معطل ہے — اسٹیٹس: {activePerson && 'status' in activePerson ? activePerson.status : 'Pending'}</span>
              </h4>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold uppercase font-mono">
                {activePerson && 'status' in activePerson ? activePerson.status : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-amber-200 leading-relaxed" dir="rtl">
              محترم <strong>{personName}</strong>! آپ کا ممبرشپ کارڈ ایڈمن (سید محمد عامر نقوی البخاری) کی جانچ پڑتال اور باقاعدہ منظوری کے لیے <strong>زیرِ التواء (Pending)</strong> ہے۔ ایڈمن کی منظوری کے بعد ہی اصل کارڈ کا ڈاؤن لوڈ اور پرنٹ ممکن ہوگا۔
            </p>
            <p className="text-[11px] text-amber-300/80">
              Card download and high-resolution printing are strictly locked until Super Admin approves your membership.
            </p>
          </div>
        </div>
      )}

      {/* Admin Approval & Verification Quick Bar */}
      {isAdminOrManager && activePerson && 'status' in activePerson && (
        <div className="bg-slate-900 border-2 border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isMemberVerified ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>Super Admin Card & Verification Control</span>
                <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                  activePerson.status === 'Verified'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : activePerson.status === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Status: {activePerson.status}
                </span>
              </h4>
              <p className="text-[11px] text-slate-300">
                {isMemberVerified
                  ? `Member ${personName} is officially verified in the database. The 'Verified' trust badge is actively displayed on their card.`
                  : `You can mark ${personName} as 'Verified' in the database to display the authentic 'Verified' badge on their card:`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {activePerson.status !== 'Verified' ? (
              <button
                type="button"
                id="btn-mark-verified"
                onClick={() => {
                  if (onUpdateMember && 'status' in activePerson) {
                    onUpdateMember({ ...activePerson, status: 'Verified' });
                  }
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Mark as Verified in Database (displays verified badge on card)"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mark Verified (تصدیق شدہ کریں)</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-unmark-verified"
                onClick={() => {
                  if (onUpdateMember && 'status' in activePerson) {
                    onUpdateMember({ ...activePerson, status: 'Approved' });
                  }
                }}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Change status back to Standard Approved"
              >
                <span>Set to Approved</span>
              </button>
            )}

            {activePerson.status !== 'Approved' && activePerson.status !== 'Verified' && (
              <button
                type="button"
                onClick={() => {
                  if (onUpdateMember && 'status' in activePerson) {
                    onUpdateMember({ ...activePerson, status: 'Approved' });
                  }
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Card</span>
              </button>
            )}

            {activePerson.status !== 'Rejected' && (
              <button
                type="button"
                onClick={() => {
                  if (onUpdateMember && 'status' in activePerson) {
                    onUpdateMember({ ...activePerson, status: 'Rejected' });
                  }
                }}
                className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Official Membership Card (National ID Card Format)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentic Dual-Sided National ID (CNIC) Card Format with Smart Chip, Security Watermark, and Real-Time Verification QR Code.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating || !isApproved}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isApproved ? 'Approval required by Super Admin before downloading' : 'Download PDF'}
            >
              <FileText className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={isGenerating || !isApproved}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isApproved ? 'Approval required by Super Admin before downloading' : 'Save PNG'}
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" /> Save PNG
            </button>
            <button
              onClick={handlePrintCard}
              disabled={isGenerating || !isApproved}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isApproved ? 'Approval required by Super Admin before printing' : 'Print Card'}
            >
              <Printer className="w-4 h-4" /> Print Card
            </button>
          </div>
        </div>
      </div>

      {/* Select Person & Format Switcher Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Holder Category</label>
          {isRegularMember ? (
            <select
              value={selectedType}
              onChange={(e: any) => {
                const val = e.target.value;
                setSelectedType(val);
                if (val === 'Member' && myMemberRecord) {
                  setSelectedId(myMemberRecord.id);
                } else if (val === 'OfficeBearer' && myOfficeBearerRecord) {
                  setSelectedId(myOfficeBearerRecord.id);
                }
              }}
              disabled={!(myMemberRecord && myOfficeBearerRecord)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-75"
            >
              {myMemberRecord && <option value="Member">General Membership Card</option>}
              {myOfficeBearerRecord && <option value="OfficeBearer">Official Executive / Bearer Card</option>}
              {!myMemberRecord && !myOfficeBearerRecord && <option value="Member">General Membership Card</option>}
            </select>
          ) : (
            <select
              value={selectedType}
              onChange={(e: any) => {
                setSelectedType(e.target.value);
                if (e.target.value === 'Member') {
                  setSelectedId(members[0]?.id || '');
                } else {
                  setSelectedId(officeBearers[0]?.id || '');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold"
            >
              <option value="Member">ISO General Member</option>
              <option value="OfficeBearer">ISO Office Bearer</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Person</label>
          <select
            disabled={isRegularMember}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-75"
          >
            {isRegularMember ? (
              selectedType === 'OfficeBearer' && myOfficeBearerRecord ? (
                <option value={myOfficeBearerRecord.id}>{myOfficeBearerRecord.name} - {myOfficeBearerRecord.designation} (My Card)</option>
              ) : myMemberRecord ? (
                <option value={myMemberRecord.id}>{myMemberRecord.fullName} ({myMemberRecord.id}) - My Card</option>
              ) : (
                <option value="">No Card Found</option>
              )
            ) : selectedType === 'Member' ? (
              members.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.id})</option>
              ))
            ) : (
              officeBearers.map((o) => (
                <option key={o.id} value={o.id}>{o.name} - {o.designation} ({o.id})</option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Card Format Layout</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCardLayoutFormat('cnic')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                cardLayoutFormat === 'cnic'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> National ID (CNIC)
            </button>
            <button
              type="button"
              onClick={() => setCardLayoutFormat('badge')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                cardLayoutFormat === 'badge'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Smart Badge
            </button>
          </div>
        </div>
      </div>

      {/* Card Preview Container */}
      <div className="flex flex-col items-center justify-center py-10 bg-slate-900 rounded-3xl border border-slate-800 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
            {cardLayoutFormat === 'cnic' ? 'National ID Card Format (Front & Back)' : 'Vertical Smart Badge Format'}
          </span>
          {isMemberVerified ? (
            <span
              id="status-verified-indicator"
              className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/50 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Verified Status in Database (تصدیق شدہ رکن)</span>
            </span>
          ) : selectedType === 'Member' && activePerson && 'status' in activePerson ? (
            <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-medium flex items-center gap-1">
              <span>Database Status:</span>
              <strong className="text-slate-200">{activePerson.status}</strong>
            </span>
          ) : null}
        </div>

        {/* PRINTABLE CARD AREA - CAPTURED EXACTLY BY CANVAS */}
        <div
          id="printable-iso-card"
          style={{
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {cardLayoutFormat === 'cnic' ? (
            /* ========================================================================= */
            /*  NATIONAL ID CARD (CNIC FORMAT) - FRONT & BACK LANDSCAPE CARDS            */
            /* ========================================================================= */
            <>
              {/* CNIC FRONT SIDE */}
              <div
                style={{
                  width: '420px',
                  height: '260px',
                  backgroundColor: '#064e3b',
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #065f46 0%, #022c22 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  color: '#ffffff',
                  border: '2px solid #059669',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                {/* Guilloche Background Watermark Lines */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.15,
                    backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 0, transparent 10px)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1.5px solid #059669', paddingBottom: '6px', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={ISO_LOGO_URL}
                      alt="ISO Logo"
                      crossOrigin="anonymous"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #f59e0b', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '900', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                        ISLAMIC REPUBLIC OF PAKISTAN
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.2px' }}>
                        INTERNATIONAL SADAT ORGANIZATION
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                    <div style={{ fontSize: '9px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase' }}>
                      COMMUNITY CNIC
                    </div>
                    <div style={{ fontSize: '8px', color: '#a7f3d0', fontFamily: 'monospace' }}>
                      قومی شناختی کارڈ
                    </div>
                    {isMemberVerified && (
                      <div
                        id="cnic-header-verified-tag"
                        style={{
                          marginTop: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2.5px',
                          backgroundColor: 'rgba(2, 132, 199, 0.3)',
                          border: '1px solid #38bdf8',
                          color: '#7dd3fc',
                          borderRadius: '3px',
                          padding: '1px 5px',
                          fontSize: '6.5px',
                          fontWeight: '900',
                          letterSpacing: '0.4px'
                        }}
                      >
                        <span style={{ fontSize: '7px' }}>✓</span>
                        <span>VERIFIED RECORD</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', zIndex: 10 }}>
                  {/* Photo & Smart Chip Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    {/* Smart Chip Graphic */}
                    <div
                      style={{
                        width: '36px',
                        height: '24px',
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

                    {/* Member Photo with verified indicator */}
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={personPhoto}
                        alt={personName}
                        crossOrigin="anonymous"
                        style={{
                          width: '76px',
                          height: '84px',
                          borderRadius: '8px',
                          border: isMemberVerified ? '2px solid #38bdf8' : '2px solid #f59e0b',
                          objectFit: 'cover',
                          boxShadow: isMemberVerified ? '0 0 10px rgba(56, 189, 248, 0.4), 0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                      />
                      {isMemberVerified && (
                        <div
                          id="cnic-photo-verified-badge"
                          style={{
                            marginTop: '-9px',
                            backgroundColor: '#0284c7',
                            backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '1.5px 6px',
                            fontSize: '6.5px',
                            fontWeight: '900',
                            letterSpacing: '0.6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2.5px',
                            border: '1px solid #7dd3fc',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
                            zIndex: 15,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}
                          title="Verified Member in ISO Database"
                        >
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>VERIFIED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member CNIC Details */}
                  <div style={{ flex: 1, fontSize: '9px', color: '#ecfdf5', lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '3px' }}>
                      <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>National Identity Number</span>
                      <span style={{ fontSize: '13px', fontWeight: '900', color: '#fef08a', fontFamily: 'monospace', letterSpacing: '0.8px' }}>
                        {formattedCnicId}
                      </span>
                    </div>

                    <div style={{ marginBottom: '2px' }}>
                      <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Full Name</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '10px', color: '#ffffff', textTransform: 'uppercase' }}>{personName}</strong>
                        {isMemberVerified && (
                          <span
                            id="cnic-name-verified-badge"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2.5px',
                              backgroundColor: '#0284c7',
                              backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
                              color: '#ffffff',
                              fontSize: '7px',
                              fontWeight: '900',
                              padding: '1px 5px',
                              borderRadius: '9999px',
                              border: '1px solid #7dd3fc',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}
                            title="Verified Member Credential in ISO Database"
                          >
                            <svg width="7.5" height="7.5" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '2px' }}>
                      <span style={{ fontSize: '7px', color: '#a7f3d0', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Designation / Category</span>
                      <span style={{ fontSize: '9px', fontWeight: '800', color: '#34d399' }}>{personRole}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <div>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Gender</span>
                        <strong style={{ fontSize: '8px', color: '#ffffff' }}>M / MALE</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Country</span>
                        <strong style={{ fontSize: '8px', color: '#ffffff' }}>PAKISTAN</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '7px', color: '#a7f3d0', display: 'block' }}>Issue Date</span>
                        <strong style={{ fontSize: '8px', color: '#ffffff', fontFamily: 'monospace' }}>01.01.2026</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div style={{ borderTop: '1px dashed #059669', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', color: '#a7f3d0', zIndex: 10 }}>
                  <div>
                    <span>District: <strong>{personDistrict}, {personProvince}</strong></span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '10px', color: '#fef08a', fontWeight: 'bold' }}>S. M. Aamir Naqvi</span>
                    <span style={{ display: 'block', fontSize: '6px', color: '#6ee7b7' }}>Holder Signature</span>
                  </div>
                </div>

                {!isApproved && <PendingWatermarkOverlay />}
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
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #334155', paddingBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase' }}>
                      DIGITAL LIBRARY VERIFICATION & RECORD
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8' }}>International Sadat Organization Central Repository</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isMemberVerified && (
                      <span
                        id="cnic-back-verified-seal"
                        style={{
                          fontSize: '7px',
                          fontWeight: '900',
                          color: '#ffffff',
                          border: '1px solid #7dd3fc',
                          padding: '1.5px 5px',
                          borderRadius: '4px',
                          backgroundColor: '#0284c7',
                          backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2.5px',
                          letterSpacing: '0.4px'
                        }}
                      >
                        <span>✓</span>
                        <span>STATUS: VERIFIED</span>
                      </span>
                    )}
                    <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#38bdf8', border: '1px solid #0284c7', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(2,132,199,0.1)' }}>
                      SECURE ENCRYPTED
                    </span>
                  </div>
                </div>

                {/* Back Body */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 0' }}>
                  {/* Address & Info */}
                  <div style={{ flex: 1, fontSize: '8.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '7px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Registered Address</span>
                      <span style={{ fontWeight: '600', color: '#f1f5f9' }}>
                        House / Office, District {personDistrict}, {personProvince}, Pakistan.
                      </span>
                    </div>

                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '7px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Contact Phone / WhatsApp</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#34d399' }}>{personPhone}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '7px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Authorized Authority</span>
                      <span style={{ fontSize: '8px', fontWeight: '700', color: '#fbbf24' }}>
                        Syed M. Aamir Naqvi Al Bukhari (Chairman IT Support Council)
                      </span>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', textAlign: 'center' }}>
                    <img src={qrCodeUrl} alt="Verification QR" style={{ width: '74px', height: '74px' }} />
                    <span style={{ fontSize: '6px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginTop: '2px' }}>SCAN TO VERIFY</span>
                  </div>
                </div>

                {/* Barcode Line */}
                <div style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', textAlign: 'center', margin: '2px 0' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: '900', color: '#0f172a', letterSpacing: '4px' }}>
                    ||||| ||| ||||||| |||| |||||| ||| |||||
                  </div>
                </div>

                {/* Microtext Disclaimer */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: '4px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', fontSize: '7px', color: '#64748b' }}>
                  <span>Property of ISO. Drop in post box if found.</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>Contact: 03323475431</span>
                </div>

                {!isApproved && <PendingWatermarkOverlay />}
              </div>
            </>
          ) : (
            /* ========================================================================= */
            /*  VERTICAL SMART BADGE FORMAT                                             */
            /* ========================================================================= */
            <>
              {/* Badge Front */}
              <div
                style={{
                  width: '280px',
                  height: '420px',
                  backgroundColor: '#0f172a',
                  backgroundImage: 'linear-gradient(180deg, #022c22 0%, #0f172a 100%)',
                  borderRadius: '20px',
                  padding: '20px',
                  color: '#ffffff',
                  border: '2px solid #059669',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ borderBottom: '1px solid #059669', width: '100%', paddingBottom: '8px' }}>
                  <img src={ISO_LOGO_URL} alt="Logo" crossOrigin="anonymous" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 4px auto', border: '2px solid #f59e0b' }} />
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' }}>INTERNATIONAL SADAT ORG</div>
                  <div style={{ fontSize: '8px', color: '#34d399', fontWeight: 'bold' }}>OFFICIAL MEMBERSHIP BADGE</div>
                </div>

                <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={personPhoto}
                      alt={personName}
                      crossOrigin="anonymous"
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: isMemberVerified ? '3px solid #38bdf8' : '3px solid #10b981',
                        objectFit: 'cover',
                        margin: '0 auto 6px auto',
                        boxShadow: isMemberVerified ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
                      }}
                    />
                    {isMemberVerified && (
                      <div
                        id="badge-photo-verified-check"
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '2px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0f172a',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                        }}
                        title="Verified Member"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <span>{personName}</span>
                  </div>

                  {isMemberVerified && (
                    <div
                      id="badge-verified-pill"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3.5px',
                        backgroundColor: '#0284c7',
                        backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        fontSize: '8px',
                        fontWeight: '900',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: '1px solid #7dd3fc',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        marginTop: '4px',
                        marginBottom: '4px'
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>OFFICIALLY VERIFIED</span>
                    </div>
                  )}

                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#fbbf24' }}>{personRole}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>ID: {personId}</div>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', width: '100%', paddingTop: '8px', fontSize: '8px', color: '#cbd5e1' }}>
                  <div>District: <strong>{personDistrict}, {personProvince}</strong></div>
                  <div>Contact: <strong>{personPhone}</strong></div>
                </div>

                {!isApproved && <PendingWatermarkOverlay />}
              </div>

              {/* Badge Back */}
              <div
                style={{
                  width: '280px',
                  height: '420px',
                  backgroundColor: '#0f172a',
                  borderRadius: '20px',
                  padding: '20px',
                  color: '#ffffff',
                  border: '2px solid #334155',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', borderBottom: '1px solid #334155', width: '100%', paddingBottom: '8px' }}>
                  DIGITAL QR VERIFICATION
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
                  {isMemberVerified && (
                    <div
                      id="badge-back-verified-chip"
                      style={{
                        backgroundColor: 'rgba(2, 132, 199, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#7dd3fc',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '7.5px',
                        fontWeight: '900',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginBottom: '8px',
                        letterSpacing: '0.4px'
                      }}
                    >
                      <span>✓</span>
                      <span>DATABASE VERIFIED CREDENTIAL</span>
                    </div>
                  )}

                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px' }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                  </div>
                </div>

                <div style={{ fontSize: '8px', color: '#94a3b8', lineHeight: '1.4' }}>
                  This card certifies official registration in the ISO Central Digital Repository. Scan QR code to verify.
                </div>

                <div style={{ borderTop: '1px solid #334155', width: '100%', paddingTop: '8px', fontSize: '7px', color: '#64748b' }}>
                  Auth: Syed M. Aamir Naqvi Al Bukhari<br />
                  Chairman IT Support Council (03323475431)
                </div>

                {!isApproved && <PendingWatermarkOverlay />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
