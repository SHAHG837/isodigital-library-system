import React, { useState } from 'react';
import { ISO_LOGO_URL } from '../data/initialData';
import { ShieldCheck, Cloud, CheckCircle2, Lock, AlertCircle, Clock, FileCheck } from 'lucide-react';

interface OathFormModalProps {
  isOpen: boolean;
  memberData: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    city: string;
    district?: string;
  };
  onCompleteOath: () => void;
  onClose?: () => void;
}

export const OathFormModal: React.FC<OathFormModalProps> = ({
  isOpen,
  memberData,
  onCompleteOath,
  onClose,
}) => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPendingStatus, setAgreedPendingStatus] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState(memberData.fullName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !agreedPendingStatus) {
      setErrorNotice('براہِ کرم حلف نامہ کے دونوں لازمی خانوں کو چیک کریں۔ (Please accept all required declarations)');
      return;
    }
    if (!digitalSignature.trim()) {
      setErrorNotice('براہِ کرم ڈیجیٹل دستخط کے خانے میں اپنا پورا نام درج کریں۔ (Please enter your full name as digital signature)');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    // Simulate saving oath
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 700);
  };

  const handleFinish = () => {
    onCompleteOath();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="max-w-2xl w-full my-6 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100">
        
        {/* Top Header Card mimicking the Google Form / Official Form layout from user screenshot */}
        <div className="bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 relative">
          {/* Top colored highlight strip */}
          <div className="h-2.5 bg-indigo-600 w-full" />

          <div className="p-5 sm:p-6 space-y-4">
            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                OUTH FORM حلف نامہ
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                International Sadat Organization — بین الاقوامی تنظیم السادات
              </p>
            </div>

            {/* User Identity Box (Direct response to user requirement: Only member email, NO Switch account option) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700">
                    {memberData.email}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    <Lock className="w-3 h-3" />
                    <span>مصدقہ لاگ ان (Locked Account)</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400" title="Cloud Verified Record">
                  <Cloud className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-[10px] font-mono font-semibold">ISO Cloud Auth</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                The name, verified email (<strong className="text-slate-800 dark:text-slate-200">{memberData.email}</strong>), and photo associated with your authenticated registration are permanently bound to your ISO Member ID (<strong className="font-mono text-indigo-600 dark:text-indigo-300">{memberData.id}</strong>). Account switching is disabled to guarantee verified one-to-one credential integrity.
              </p>

              <div className="pt-0.5 flex items-center justify-between text-xs">
                <span className="text-red-500 dark:text-red-400 font-semibold text-[11px]">
                  * Indicates required question / لازمی جوابات
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{memberData.id}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isSubmittedSuccess ? (
          <form onSubmit={handleSubmitOath} className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Center ISO Emblem Display (Exact visual match to screenshot) */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="relative inline-block">
                <img
                  src={ISO_LOGO_URL}
                  alt="ISO Emblem"
                  className="w-32 h-32 sm:w-36 sm:h-36 mx-auto object-contain drop-shadow-md rounded-full ring-2 ring-emerald-500/30"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  International Sadat Organization
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold" dir="rtl">
                  بین الاقوامی تنظیم السادات — مرکزی سیکرٹریٹ برائے رکنیت
                </p>
              </div>
            </div>

            {/* Official Oath Text Card */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-750 pb-2">
                <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>متنِ حلف نامہ (Official Oath Text)</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">
                  رکنیت و ضابطہ اخلاق
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2.5 text-right" dir="rtl">
                <p className="font-bold text-center text-sm text-emerald-900 dark:text-emerald-300">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  میں بحیثیتِ سادات، اللہ تعالیٰ کو حاضر و ناظر جان کر اور رسول اللہ ﷺ و آئمہ اہلبیت اطہارؑ کے نقوشِ قدم پر چلتے ہوئے حلف اٹھاتا ہوں کہ:
                </p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pr-4 list-decimal leading-relaxed">
                  <li>میں <strong>بین الاقوامی تنظیم السادات (ISO)</strong> کے منشور، آئین، قواعد و ضوابط کی مکمل پابندی کروں گا۔</li>
                  <li>ساداتِ کرام کے وقار، باہمی اتحاد، فلاح و بہبود، اور شجرہ ہائے سادات کے تحفظ کے لیے صدقِ دل سے کوشش کروں گا۔</li>
                  <li>تنظیم کی جانب سے تفویض کردہ رکنیت کارڈ (Membership Card) اور ڈیجیٹل اختیارات کو کبھی غلط مقصد کے لیے استعمال نہیں کروں گا۔</li>
                  <li>میں تصدیق کرتا ہوں کہ میرا اندراج شدہ ای میل (<strong>{memberData.email}</strong>) اور تمام فراہم کردہ کوائف قطعی درست اور مبنی بر حقیقت ہیں۔</li>
                </ul>
              </div>
            </div>

            {/* Registered Particulars Overview */}
            <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                مصدقہ کوائف (Verified Registration Record):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Full Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{memberData.fullName}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Allocated Member ID:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{memberData.id}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Mobile Number:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{memberData.mobileNumber}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">City / District:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{memberData.city}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-3 bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    میں نے حلف نامہ کے تمام نکات غور سے پڑھ لیے ہیں اور ان کی مکمل پاسداری کا اقرار کرتا ہوں۔ *
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    (I solemnly affirm and declare full adherence to the ISO Constitution and Code of Conduct)
                  </span>
                </div>
              </label>

              {/* Requirement: Member understands card is PENDING approval */}
              <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  required
                  checked={agreedPendingStatus}
                  onChange={(e) => setAgreedPendingStatus(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">
                    میں تسلیم کرتا ہوں کہ میری ممبرشپ کارڈ کی درخواست ایڈمن کی منظوری کے لیے پینڈنگ (Pending) رہے گی اور ایڈمن کی منظوری کے بعد ہی پرنٹ اور ڈاؤن لوڈ ہو سکے گا۔ *
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    (I understand my card is in Pending state until approved by Super Admin; card printing/downloading is locked until approval)
                  </span>
                </div>
              </label>

              {/* Digital Signature */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Digital Signature / ڈیجیٹل دستخط (پورا نام درج کریں) *
                </label>
                <input
                  type="text"
                  required
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Enter your full name as solemn signature"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {errorNotice && (
              <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wide"
              >
                {isSubmitting ? (
                  <span>Saving Oath & Submitting Application...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>حلف نامہ جمع کریں اور ممبرشپ کارڈ کے لیے درخواست دیں</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Submission Success & Pending Card Notification View */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse text-amber-500" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-black uppercase tracking-wider">
                Status: Pending Admin Approval (زیرِ منظوری)
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                حلف نامہ کامیابی سے جمع ہو گیا ہے!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                محترم <strong>{memberData.fullName}</strong>! آپ کا حلف نامہ آپ کے مصدقہ ای میل (<strong className="font-mono text-indigo-600 dark:text-indigo-400">{memberData.email}</strong>) کے ساتھ ریکارڈ ہو چکا ہے۔
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl max-w-md mx-auto text-xs text-amber-900 dark:text-amber-200 text-right space-y-1.5" dir="rtl">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>ممبرشپ کارڈ پینڈنگ ہے:</span>
              </p>
              <p className="leading-relaxed">
                آپ کے ممبرشپ کارڈ کا پروسیس ایڈمن (سید محمد عامر نقوی البخاری) کی باقاعدہ جانچ پڑتال اور منظوری کے لیے <strong>پینڈنگ</strong> کر دیا گیا ہے۔
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                ایڈمن کی منظوری کے بعد ہی آپ کا کارڈ ڈاؤن لوڈ اور پرنٹ کرنے کے لیے فعال ہو گا۔ اس وقت تک آپ کا کارڈ پینڈنگ واٹر مارک کے ساتھ نظر آئے گا۔
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full max-w-sm mx-auto py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>جاری رکھیں / ممبرشپ پورٹل میں داخل ہوں</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
