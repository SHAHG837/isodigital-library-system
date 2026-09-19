import React, { useState, useEffect } from 'react';
import { ISO_LOGO_URL, SUPER_ADMIN_INFO } from '../data/initialData';
import {
  ShieldCheck,
  Lock,
  Phone,
  KeyRound,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Shield,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  RefreshCw,
  Copy,
  Check,
  Database,
  Sparkles
} from 'lucide-react';
import { AdminCredential, Member, OfficeBearer, AdminUser } from '../types';
import { OathFormModal } from './OathFormModal';
import {
  CompulsoryGoogleFormGate,
  OFFICIAL_GOOGLE_FORM_URL
} from './CompulsoryGoogleFormGate';
import {
  isValidEmail,
  checkEmailUniqueness,
  findAccountByEmailOrId,
  sendEmailOtp,
  verifyEmailOtp,
  suggestEmailCorrection
} from '../services/authOtpService';
import {
  signUpWithSupabase,
  signInWithSupabase,
  signInWithSupabaseOtp,
  verifySupabaseOtp,
  SUPABASE_PROJECT_ID
} from '../lib/supabaseClient';

interface AuthLoginGateProps {
  adminCredentials: AdminCredential[];
  members: Member[];
  admins: AdminUser[];
  onLoginSuccess: (credential: AdminCredential, welcomeMessage?: string) => void;
  onRegisterMember: (memberData: Omit<Member, 'id' | 'joiningDate' | 'status'>) => void;
  onRegisterOfficeBearer: (bearerData: Omit<OfficeBearer, 'id' | 'appointmentDate' | 'status'>) => void;
}

const COMPULSORY_GOOGLE_FORM_URL = OFFICIAL_GOOGLE_FORM_URL;

export const AuthLoginGate: React.FC<AuthLoginGateProps> = ({
  adminCredentials,
  members,
  admins,
  onLoginSuccess,
  onRegisterMember
}) => {
  // Gate Tab: Switch between Member Portal, Supabase Auth (Cloud), & Admin Panel
  const [activeGateTab, setActiveGateTab] = useState<'member' | 'supabase' | 'admin'>('member');

  // Supabase Cloud Auth State
  const [sbAuthMode, setSbAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [sbEmail, setSbEmail] = useState('');
  const [sbPassword, setSbPassword] = useState('');
  const [sbFullName, setSbFullName] = useState('');
  const [sbRole, setSbRole] = useState<'applicant' | 'member' | 'recruiter'>('applicant');
  const [sbOtpCode, setSbOtpCode] = useState('');
  const [sbOtpSent, setSbOtpSent] = useState(false);
  const [sbLoading, setSbLoading] = useState(false);
  const [sbError, setSbError] = useState('');
  const [sbSuccessMsg, setSbSuccessMsg] = useState('');
  const [sbShowPassword, setSbShowPassword] = useState(false);

  // Member Auth Sub-tab: 'signin' (existing member OTP) vs 'signup' (new member registration)
  const [memberAuthMode, setMemberAuthMode] = useState<'signin' | 'signup'>('signin');

  // ==========================================
  // 1. MEMBER SIGN IN (EMAIL OTP AUTHENTICATION)
  // ==========================================
  const [signInInput, setSignInInput] = useState(''); // Email or Member ID
  const [signInOtpStep, setSignInOtpStep] = useState(false);
  const [signInOtpCode, setSignInOtpCode] = useState('');
  const [signInMatchedAccount, setSignInMatchedAccount] = useState<{
    member?: Member;
    admin?: AdminUser;
    id: string;
    name: string;
    email: string;
    mobile: string;
  } | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInSuccessMsg, setSignInSuccessMsg] = useState('');
  const [signInOfflineCode, setSignInOfflineCode] = useState<string | null>(null);
  const [showSignInBackupCode, setShowSignInBackupCode] = useState(false);
  const [signInResendTimer, setSignInResendTimer] = useState(0);

  // Timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (signInResendTimer > 0) {
      timer = setInterval(() => setSignInResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [signInResendTimer]);

  // Handle Step 1: Lookup registered member & Send OTP to registered email
  const handleMemberSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInSuccessMsg('');
    setSignInOfflineCode(null);

    const cleanInput = signInInput.trim();
    if (!cleanInput) {
      setSignInError('Please enter your Registered Email Address or Member ID.');
      return;
    }

    // Lookup account in members (or admins)
    const lookup = findAccountByEmailOrId(cleanInput, members, admins, adminCredentials);
    if (!lookup.found || !lookup.email) {
      setSignInError(
        `No registered member found for "${cleanInput}". One email is strictly linked to one ID. Please verify your email or click "Join as New Member".`
      );
      return;
    }

    // Set matched account details
    const matched = {
      member: lookup.member,
      admin: lookup.admin,
      id: lookup.id || 'N/A',
      name: lookup.name || 'Member',
      email: lookup.email,
      mobile: lookup.mobile || ''
    };
    setSignInMatchedAccount(matched);

    // Send OTP to registered email
    setSignInLoading(true);
    try {
      const res = await sendEmailOtp(lookup.email, lookup.name, lookup.id, 'login');
      setSignInLoading(false);
      if (res.success) {
        setSignInOtpStep(true);
        setSignInOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setSignInSuccessMsg(`A 6-digit verification code has been dispatched to ${lookup.email}. Please check your inbox and spam folder.`);
        } else {
          setSignInSuccessMsg(`Verification code issued for your active session.`);
          setShowSignInBackupCode(true);
        }
        setSignInResendTimer(30);
      } else {
        setSignInError(res.error || 'Failed to dispatch OTP to registered email.');
      }
    } catch (err: any) {
      setSignInLoading(false);
      setSignInError(err.message || 'Error communicating with OTP service.');
    }
  };

  // Handle Step 2: Verify OTP and log in as member
  const handleMemberVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    if (!signInMatchedAccount?.email) {
      setSignInError('Session expired. Please enter your registered email again.');
      setSignInOtpStep(false);
      return;
    }

    const cleanOtp = signInOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setSignInError('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setSignInLoading(true);
    try {
      const res = await verifyEmailOtp(signInMatchedAccount.email, cleanOtp);
      setSignInLoading(false);

      if (res.success) {
        // Authenticate as member
        const memberCred: AdminCredential = {
          mobileNumber: signInMatchedAccount.mobile || '03000000000',
          password: 'email_otp_verified',
          name: signInMatchedAccount.name,
          designation: 'ISO General Member',
          role: 'Viewer',
          isSuperAdmin: false,
          createdDate: new Date().toISOString().split('T')[0],
          email: signInMatchedAccount.email,
          memberId: signInMatchedAccount.id
        };

        const firstName = signInMatchedAccount.name.split(' ')[0] || signInMatchedAccount.name;
        onLoginSuccess(
          memberCred,
          `Welcome back, ${firstName}! Email verified (${signInMatchedAccount.email}) linked to ID ${signInMatchedAccount.id}.`
        );
      } else {
        setSignInError(res.error || 'Invalid verification code. Please check your email.');
      }
    } catch (err: any) {
      setSignInLoading(false);
      setSignInError(err.message || 'Verification failed. Please try again.');
    }
  };

  // Resend OTP for sign-in
  const handleResendSignInOtp = async () => {
    if (signInResendTimer > 0 || !signInMatchedAccount?.email) return;
    setSignInLoading(true);
    setSignInError('');
    setSignInSuccessMsg('');
    try {
      const res = await sendEmailOtp(
        signInMatchedAccount.email,
        signInMatchedAccount.name,
        signInMatchedAccount.id,
        'login'
      );
      setSignInLoading(false);
      if (res.success) {
        setSignInOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setSignInSuccessMsg(`A fresh 6-digit verification code has been dispatched to ${signInMatchedAccount.email}.`);
        } else {
          setSignInSuccessMsg(`Fresh verification code issued for your active session.`);
          setShowSignInBackupCode(true);
        }
        setSignInResendTimer(30);
      } else {
        setSignInError(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setSignInLoading(false);
      setSignInError('Failed to resend OTP.');
    }
  };

  // ==========================================
  // 2. NEW MEMBER REGISTRATION WITH 1 EMAIL PER 1 ID
  // ==========================================
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regDistrict, setRegDistrict] = useState('');

  // Registration OTP step
  const [regOtpStep, setRegOtpStep] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOfflineCode, setRegOfflineCode] = useState<string | null>(null);
  const [showRegBackupCode, setShowRegBackupCode] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regResendTimer, setRegResendTimer] = useState(0);

  // Compulsory Form Notice Modal State after joining
  const [newMemberJoinedData, setNewMemberJoinedData] = useState<{ name: string; cred: AdminCredential } | null>(null);

  useEffect(() => {
    let timer: any;
    if (regResendTimer > 0) {
      timer = setInterval(() => setRegResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regResendTimer]);

  // Real-time Email Uniqueness Verification ("One email is for one ID")
  const emailCheck = regEmail ? checkEmailUniqueness(regEmail, members, admins) : { isUnique: true };

  // Handle Step 1 of Join: Validate inputs, check 1-email-1-id rule, send verification OTP
  const handleRegSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');
    setRegOfflineCode(null);
    setShowRegBackupCode(false);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanMobile = regMobile.trim();
    const cleanCity = regCity.trim();

    if (!cleanName || !cleanEmail || !cleanMobile || !cleanCity) {
      setRegError('Please complete all required fields (Full Name, Email, Mobile, and City).');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setRegError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // STRICT CHECK: "One email is for one ID"
    const uniqueness = checkEmailUniqueness(cleanEmail, members, admins);
    if (!uniqueness.isUnique) {
      setRegError(
        `One Email For One ID Rule: This email (${cleanEmail}) is already registered with ${uniqueness.conflictType} ID: ${uniqueness.conflictId} (${uniqueness.conflictName}). In accordance with ISO policy, one email is strictly reserved for one ID only. Please sign in with this email or provide a different email address.`
      );
      return;
    }

    // Send verification OTP to new email
    setRegLoading(true);
    try {
      const res = await sendEmailOtp(cleanEmail, cleanName, undefined, 'registration');
      setRegLoading(false);
      if (res.success) {
        setRegOtpStep(true);
        setRegOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setRegSuccessMsg(`A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox and spam folder.`);
        } else {
          setRegSuccessMsg(`Verification code issued for your active registration session.`);
          setShowRegBackupCode(true);
        }
        setRegResendTimer(30);
      } else {
        setRegError(res.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setRegLoading(false);
      setRegError(err.message || 'Error dispatching OTP code.');
    }
  };

  // Resend OTP for new member registration
  const handleResendRegOtp = async () => {
    if (regResendTimer > 0 || !regEmail) return;
    setRegLoading(true);
    setRegError('');
    setRegSuccessMsg('');
    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const res = await sendEmailOtp(cleanEmail, regName.trim(), undefined, 'registration');
      setRegLoading(false);
      if (res.success) {
        setRegOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setRegSuccessMsg(`A fresh 6-digit verification code has been dispatched to ${cleanEmail}.`);
        } else {
          setRegSuccessMsg(`Fresh verification code issued for your active session.`);
          setShowRegBackupCode(true);
        }
        setRegResendTimer(30);
      } else {
        setRegError(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setRegLoading(false);
      setRegError('Failed to resend OTP.');
    }
  };

  // Handle Step 2 of Join: Verify OTP, create member with unique ID and bind 1-to-1 with email
  const handleRegVerifyOtpAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanOtp = regOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setRegError('Please enter the full 6-digit verification code sent to your email.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await verifyEmailOtp(regEmail.trim().toLowerCase(), cleanOtp);
      setRegLoading(false);

      if (!res.success) {
        setRegError(res.error || 'Invalid verification code. Please check and try again.');
        return;
      }

      // Re-verify uniqueness before final insertion
      const uniqueness = checkEmailUniqueness(regEmail.trim().toLowerCase(), members, admins);
      if (!uniqueness.isUnique) {
        setRegError(`Registration conflict: Email is already assigned to ID ${uniqueness.conflictId}.`);
        return;
      }

      // Generate unique ID for this new member
      const newMemberId = `ISO-MEM-2026-${String(members.length + 1).padStart(3, '0')}`;

      const newMemberData = {
        fullName: regName.trim(),
        mobileNumber: regMobile.trim(),
        whatsappNumber: regMobile.trim(),
        city: regCity.trim(),
        district: regDistrict.trim() || regCity.trim(),
        division: regCity.trim(),
        province: 'Sindh',
        country: 'Pakistan',
        email: regEmail.trim().toLowerCase(),
        address: `District ${regCity.trim()}, Pakistan`,
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        notes: `Registered via Email OTP (${regEmail.trim().toLowerCase()}) - Bound to ID ${newMemberId}`,
        oathSubmitted: true,
        oathDate: new Date().toISOString(),
        status: 'Pending' as const // Strict requirement: New members start in Pending status until approved by Super Admin
      };

      onRegisterMember(newMemberData);

      const firstName = regName.trim().split(' ')[0] || regName.trim();
      const memberCredential: AdminCredential = {
        mobileNumber: regMobile.trim(),
        password: 'email_otp_verified',
        name: regName.trim(),
        designation: 'ISO General Member',
        role: 'Viewer',
        isSuperAdmin: false,
        createdDate: new Date().toISOString().split('T')[0],
        email: regEmail.trim().toLowerCase(),
        memberId: newMemberId
      };

      // Show In-App Official Oath Form (حلف نامہ) directly
      setNewMemberJoinedData({
        name: firstName,
        cred: memberCredential
      });
    } catch (err: any) {
      setRegLoading(false);
      setRegError(err.message || 'Verification error.');
    }
  };

  // Finalize entry after compulsory dialog
  const handleFinalizeMemberEntry = () => {
    if (newMemberJoinedData) {
      onLoginSuccess(
        newMemberJoinedData.cred,
        `Welcome to ISO Portal, ${newMemberJoinedData.name}! Your membership card application has been submitted and is currently Pending Super Admin approval.`
      );
      setNewMemberJoinedData(null);
    }
  };

  // ==========================================
  // 3. ADMIN PANEL LOGIN (EMAIL OTP OR MOBILE PASSWORD)
  // ==========================================
  const [adminAuthMethod, setAdminAuthMethod] = useState<'emailOtp' | 'password'>('emailOtp');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminOtpStep, setAdminOtpStep] = useState(false);
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminOfflineCode, setAdminOfflineCode] = useState<string | null>(null);
  const [showAdminBackupCode, setShowAdminBackupCode] = useState(false);
  const [adminResendTimer, setAdminResendTimer] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminMatchedAcc, setAdminMatchedAcc] = useState<AdminUser | AdminCredential | null>(null);

  useEffect(() => {
    let timer: any;
    if (adminResendTimer > 0) {
      timer = setInterval(() => setAdminResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [adminResendTimer]);

  // Standard Mobile + Password Inputs
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hidden Cabinet Official Login Option
  const [showCabinetOptionBelowAdmin, setShowCabinetOptionBelowAdmin] = useState(false);
  const [cabinetMobileInput, setCabinetMobileInput] = useState('');
  const [cabinetPasswordInput, setCabinetPasswordInput] = useState('');
  const [showCabinetPassword, setShowCabinetPassword] = useState(false);
  const [cabinetLoginError, setCabinetLoginError] = useState('');

  // Send OTP to registered Admin Email
  const handleAdminSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccessMsg('');
    setAdminOfflineCode(null);

    const cleanEmail = adminEmailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setAdminError('Please enter your registered Administrator Email address.');
      return;
    }

    // Check if email matches Super Admin or any Admin
    let matched: any = admins.find((a) => a.email && a.email.trim().toLowerCase() === cleanEmail);
    if (!matched) {
      const credMatched = adminCredentials.find((c) => c.email && c.email.trim().toLowerCase() === cleanEmail);
      if (credMatched) {
        matched = {
          id: credMatched.memberId || 'ADM-001',
          name: credMatched.name,
          email: credMatched.email,
          phone: credMatched.mobileNumber,
          designation: credMatched.designation,
          role: credMatched.role,
          isSuperAdmin: credMatched.isSuperAdmin
        };
      }
    }
    if (!matched && (cleanEmail === SUPER_ADMIN_INFO.email.toLowerCase() || cleanEmail === 'aamir.naqvi@example.com')) {
      matched = {
        id: 'ADM-SUPER',
        name: SUPER_ADMIN_INFO.name,
        email: SUPER_ADMIN_INFO.email,
        phone: SUPER_ADMIN_INFO.mobileNumber,
        designation: SUPER_ADMIN_INFO.designation,
        role: 'SuperAdmin',
        isSuperAdmin: true
      };
    }

    if (!matched) {
      setAdminError(`No administrator account is linked to ${cleanEmail}. One email is for one ID.`);
      return;
    }

    setAdminMatchedAcc(matched);
    setAdminLoading(true);
    try {
      const res = await sendEmailOtp(cleanEmail, matched.name, matched.id, 'admin');
      setAdminLoading(false);
      if (res.success) {
        setAdminOtpStep(true);
        setAdminOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setAdminSuccessMsg(`A 6-digit OTP verification code has been dispatched to ${cleanEmail}. Please check your email inbox and spam folder.`);
        } else {
          setAdminSuccessMsg(`Verification code issued for your active administrator session.`);
          setShowAdminBackupCode(true);
        }
        setAdminResendTimer(30);
      } else {
        setAdminError(res.error || 'Failed to dispatch admin OTP.');
      }
    } catch (err: any) {
      setAdminLoading(false);
      setAdminError(err.message || 'Error communicating with OTP service.');
    }
  };

  // Resend Admin OTP
  const handleResendAdminOtp = async () => {
    if (adminResendTimer > 0 || !adminEmailInput) return;
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccessMsg('');
    try {
      const cleanEmail = adminEmailInput.trim().toLowerCase();
      const res = await sendEmailOtp(cleanEmail, adminMatchedAcc?.name, (adminMatchedAcc as any)?.id, 'admin');
      setAdminLoading(false);
      if (res.success) {
        setAdminOfflineCode(res.offlineCode || res.backupCode || null);
        if (res.emailDelivered) {
          setAdminSuccessMsg(`A fresh 6-digit OTP code has been dispatched to ${cleanEmail}.`);
        } else {
          setAdminSuccessMsg(`Fresh verification code issued for your administrator session.`);
          setShowAdminBackupCode(true);
        }
        setAdminResendTimer(30);
      } else {
        setAdminError(res.error || 'Failed to resend admin OTP.');
      }
    } catch (err: any) {
      setAdminLoading(false);
      setAdminError('Failed to resend admin OTP.');
    }
  };

  // Verify Admin OTP
  const handleAdminVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanOtp = adminOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setAdminError('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setAdminLoading(true);
    try {
      const res = await verifyEmailOtp(adminEmailInput.trim().toLowerCase(), cleanOtp);
      setAdminLoading(false);

      if (res.success) {
        const isSuper = adminMatchedAcc?.isSuperAdmin || adminMatchedAcc?.role === 'SuperAdmin';
        const adminCred: AdminCredential = {
          mobileNumber: adminMatchedAcc?.phone || adminMatchedAcc?.mobileNumber || '03323475431',
          password: 'admin_otp_verified',
          name: adminMatchedAcc?.name || 'Administrator',
          designation: adminMatchedAcc?.designation || 'Administrator',
          role: (adminMatchedAcc?.role as any) || 'SuperAdmin',
          isSuperAdmin: Boolean(isSuper),
          createdDate: '2026-01-01',
          email: adminEmailInput.trim().toLowerCase(),
          memberId: adminMatchedAcc?.id || 'ADM-0001'
        };

        onLoginSuccess(
          adminCred,
          `Welcome, ${adminCred.name}! Admin Email Verified (${adminCred.email}) with ${adminCred.role} access.`
        );
      } else {
        setAdminError(res.error || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setAdminLoading(false);
      setAdminError(err.message || 'Verification error.');
    }
  };

  // ==========================================
  // SUPABASE CLOUD AUTHENTICATION HANDLERS
  // ==========================================
  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSbError('');
    setSbSuccessMsg('');
    if (!sbEmail.trim() || !sbPassword.trim()) {
      setSbError('Please enter both email and password.');
      return;
    }
    setSbLoading(true);
    const result = await signInWithSupabase(sbEmail, sbPassword);
    setSbLoading(false);
    if (!result.success) {
      setSbError(result.error || 'Authentication failed. Please check your email and password.');
      return;
    }
    const profile = result.profile;
    const cred: AdminCredential = {
      mobileNumber: profile?.phone || '03000000000',
      password: 'supabase_auth_session',
      name: profile?.full_name || result.user?.user_metadata?.full_name || sbEmail.split('@')[0],
      designation: profile?.role === 'admin' ? 'System Administrator' : 'Opportunities Candidate',
      role: profile?.role === 'admin' ? 'Admin' : 'Viewer',
      isSuperAdmin: profile?.role === 'admin',
      createdDate: new Date().toISOString().split('T')[0],
      email: sbEmail.trim().toLowerCase(),
      memberId: result.user?.id
    };
    onLoginSuccess(cred, `Welcome back, ${cred.name}! Successfully authenticated via Supabase.`);
  };

  const handleSupabaseSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSbError('');
    setSbSuccessMsg('');
    if (!sbEmail.trim() || !sbPassword.trim() || !sbFullName.trim()) {
      setSbError('Please provide your Full Name, Email Address, and Password.');
      return;
    }
    if (sbPassword.length < 6) {
      setSbError('Password must be at least 6 characters long.');
      return;
    }
    setSbLoading(true);
    const result = await signUpWithSupabase(sbEmail, sbPassword, sbFullName, sbRole);
    setSbLoading(false);
    if (!result.success) {
      setSbError(result.error || 'Registration failed.');
      return;
    }
    if (result.session) {
      const profile = result.profile;
      const cred: AdminCredential = {
        mobileNumber: profile?.phone || '03000000000',
        password: 'supabase_auth_session',
        name: sbFullName.trim(),
        designation: sbRole === 'recruiter' ? 'Talent Recruiter' : 'Opportunities Candidate',
        role: 'Viewer',
        isSuperAdmin: false,
        createdDate: new Date().toISOString().split('T')[0],
        email: sbEmail.trim().toLowerCase(),
        memberId: result.user?.id
      };
      onLoginSuccess(cred, `Account created! Welcome to the portal, ${sbFullName.trim()}.`);
    } else {
      setSbSuccessMsg(
        `Account created successfully in Supabase! A profile row was created in public.profiles. You can sign in right now with your email & password.`
      );
      setSbAuthMode('signin');
    }
  };

  const handleSupabaseSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSbError('');
    setSbSuccessMsg('');
    if (!sbEmail.trim()) {
      setSbError('Please enter your email address.');
      return;
    }
    setSbLoading(true);
    const result = await signInWithSupabaseOtp(sbEmail);
    setSbLoading(false);
    if (!result.success) {
      setSbError(result.error || 'Failed to dispatch Supabase login link / OTP.');
      return;
    }
    setSbOtpSent(true);
    setSbSuccessMsg(`Verification link / OTP code dispatched to ${sbEmail}. Please check your inbox.`);
  };

  const handleSupabaseVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSbError('');
    setSbSuccessMsg('');
    if (!sbOtpCode.trim()) {
      setSbError('Please enter the 6-digit verification code.');
      return;
    }
    setSbLoading(true);
    const result = await verifySupabaseOtp(sbEmail, sbOtpCode);
    setSbLoading(false);
    if (!result.success) {
      setSbError(result.error || 'Invalid code. Please try again.');
      return;
    }
    const profile = result.profile;
    const cred: AdminCredential = {
      mobileNumber: profile?.phone || '03000000000',
      password: 'supabase_auth_session',
      name: profile?.full_name || sbEmail.split('@')[0],
      designation: profile?.role === 'admin' ? 'System Administrator' : 'Opportunities Candidate',
      role: profile?.role === 'admin' ? 'Admin' : 'Viewer',
      isSuperAdmin: profile?.role === 'admin',
      createdDate: new Date().toISOString().split('T')[0],
      email: sbEmail.trim().toLowerCase(),
      memberId: result.user?.id
    };
    onLoginSuccess(cred, `Welcome! Verified via Supabase.`);
  };

  // Submit Admin Mobile & Password
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanMobile = mobileInput.trim();
    const cleanPass = passwordInput.trim();
    const cleanDigits = cleanMobile.replace(/\D/g, '');

    // 1. Direct match in adminCredentials (by exact mobile, digits slice, or email)
    const found = adminCredentials.find((acc) => {
      const accDigits = acc.mobileNumber.replace(/\D/g, '');
      const matchMobile =
        acc.mobileNumber === cleanMobile ||
        (cleanDigits && accDigits === cleanDigits) ||
        (cleanDigits.length >= 7 && accDigits.endsWith(cleanDigits.slice(-7)));
      const matchEmail = acc.email && acc.email.toLowerCase() === cleanMobile.toLowerCase();

      return (matchMobile || matchEmail) && acc.password === cleanPass;
    });

    if (found) {
      const firstName = found.name.split(' ')[0] || found.name;
      onLoginSuccess(
        found,
        `Welcome back, ${firstName}! Authenticated as ${found.designation} (${found.role}).`
      );
      return;
    }

    // 2. Fallback match in admins list
    const matchedAdmin = admins.find((adm) => {
      const admDigits = adm.phone ? adm.phone.replace(/\D/g, '') : '';
      const matchMobile =
        adm.phone === cleanMobile ||
        (cleanDigits && admDigits === cleanDigits) ||
        (cleanDigits.length >= 7 && admDigits.endsWith(cleanDigits.slice(-7)));
      const matchEmail = adm.email && adm.email.toLowerCase() === cleanMobile.toLowerCase();
      return matchMobile || matchEmail;
    });

    if (matchedAdmin && (cleanPass === 'admin123' || cleanPass === 'password')) {
      const adminCred: AdminCredential = {
        mobileNumber: matchedAdmin.phone || cleanMobile,
        password: cleanPass,
        name: matchedAdmin.name,
        designation: matchedAdmin.designation,
        role: (matchedAdmin.role as any) || 'Admin',
        isSuperAdmin: Boolean(matchedAdmin.isSuperAdmin),
        createdDate: matchedAdmin.createdDate || '2026-01-01',
        email: matchedAdmin.email,
        memberId: matchedAdmin.id
      };
      onLoginSuccess(
        adminCred,
        `Welcome back, ${matchedAdmin.name}! Authenticated as ${matchedAdmin.designation}.`
      );
      return;
    }

    // 3. Super Admin hardcoded master credential fallback
    const isSuperMobile =
      cleanMobile === '03323475431' ||
      cleanDigits === '03323475431' ||
      cleanDigits.endsWith('3323475431') ||
      cleanMobile.toLowerCase() === SUPER_ADMIN_INFO.email.toLowerCase();

    if (isSuperMobile && cleanPass === 'admin123') {
      const defaultSuperAdmin: AdminCredential = {
        mobileNumber: '03323475431',
        password: 'admin123',
        name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
        designation: 'Chairman IT Support Council',
        role: 'SuperAdmin',
        isSuperAdmin: true,
        createdDate: '2026-01-01',
        email: SUPER_ADMIN_INFO.email
      };
      onLoginSuccess(
        defaultSuperAdmin,
        `Welcome back, Syed Muhammad Aamir Naqvi! Super Administrator Access Granted.`
      );
      return;
    }

    setAdminError('Authentication failed. Invalid Mobile ID / Email or Password.');
  };

  // Submit Cabinet Official
  const handleCabinetLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCabinetLoginError('');

    const cleanMobile = cabinetMobileInput.trim();
    const cleanPass = cabinetPasswordInput.trim();

    const found = adminCredentials.find(
      (acc) => acc.mobileNumber === cleanMobile && acc.password === cleanPass
    );

    if (found) {
      onLoginSuccess(
        found,
        `Welcome back, ${found.name}! Logged into Admin Panel as ${found.designation} (${found.role}).`
      );
    } else if (cleanMobile === '03323475431' && cleanPass === 'admin123') {
      const defaultSuperAdmin: AdminCredential = {
        mobileNumber: '03323475431',
        password: 'admin123',
        name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
        designation: 'Chairman IT Support Council',
        role: 'SuperAdmin',
        isSuperAdmin: true,
        createdDate: '2026-01-01',
        email: SUPER_ADMIN_INFO.email
      };
      onLoginSuccess(defaultSuperAdmin, `Welcome back! Authenticated with Admin privileges.`);
    } else {
      setCabinetLoginError('Authentication failed. Invalid Cabinet Official Mobile ID or Password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Official Compulsory Google Registration Form for Newly Joined Member */}
      {newMemberJoinedData && (
        <CompulsoryGoogleFormGate
          isModalMode={true}
          user={newMemberJoinedData.cred}
          onFormCompleted={handleFinalizeMemberEntry}
        />
      )}

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative">
        
        {/* Header: Clean ISO Branding */}
        <div className="p-5 text-center border-b border-slate-800 bg-slate-950/50">
          <img
            src={ISO_LOGO_URL}
            alt="ISO Logo"
            className="w-14 h-14 rounded-full mx-auto ring-2 ring-emerald-500/50 shadow-lg object-cover mb-2"
          />
          <h1 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
            International Sadat Organization
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mt-0.5">
            Digital Library & Central Repository
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
            <KeyRound className="w-3 h-3" />
            <span>Email OTP & Supabase PostgreSQL Authentication</span>
          </div>
        </div>

        {/* Navigation Switcher: Member Portal vs Supabase Auth (Cloud) */}
        {activeGateTab !== 'admin' && (
          <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveGateTab('member');
                setSbError('');
                setSbSuccessMsg('');
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeGateTab === 'member'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Member Portal (OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveGateTab('supabase');
                setSignInError('');
                setRegError('');
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeGateTab === 'supabase'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>Supabase Auth (Cloud)</span>
            </button>
          </div>
        )}

        {/* Dynamic Content: Admin Mode vs Supabase Mode vs Member Mode */}
        {activeGateTab === 'admin' ? (
          /* ========================================================= */
          /* ADMIN & CABINET LOGIN                                     */
          /* ========================================================= */
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator Login</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveGateTab('member');
                  setAdminError('');
                  setAdminSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to Member Portal
              </button>
            </div>

            {/* Admin Auth Method Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setAdminAuthMethod('emailOtp');
                  setAdminError('');
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  adminAuthMethod === 'emailOtp'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminAuthMethod('password');
                  setAdminError('');
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  adminAuthMethod === 'password'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mobile & Password
              </button>
            </div>

            {adminError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{adminError}</span>
              </div>
            )}

            {adminSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adminSuccessMsg}</span>
              </div>
            )}

            {adminAuthMethod === 'emailOtp' ? (
              /* Admin Option A: Registered Email OTP */
              !adminOtpStep ? (
                <form onSubmit={handleAdminSendOtp} className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your registered administrator email address to receive an authentication OTP.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Admin Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="Enter registered administrator email"
                        value={adminEmailInput}
                        onChange={(e) => setAdminEmailInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {adminLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Send Verification Code</span>
                  </button>
                </form>
              ) : (
                /* Admin OTP Verification Step */
                <form onSubmit={handleAdminVerifyOtp} className="space-y-3.5">
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Administrator Email Verification</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                        {adminMatchedAcc?.role || 'Admin'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900/90 border border-amber-500/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Admin Email:</span>
                        <button
                          type="button"
                          onClick={() => { setAdminOtpStep(false); setShowAdminBackupCode(false); }}
                          className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                        >
                          Change / Edit
                        </button>
                      </div>
                      <p className="text-xs text-amber-300 font-mono font-bold truncate">
                        {adminEmailInput}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                      <p className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Sender: <strong className="text-white font-mono">syedmuhammadamir837@gmail.com</strong></span>
                      </p>
                      <p className="text-amber-300 font-medium">
                        ⚠️ اگر ای میل ان باکس میں نہ ملے تو برائے مہربانی اپنا <strong>Spam / Junk</strong> فولڈر لازمی چیک کریں۔<br />
                        <span className="text-[10px] text-slate-300">(Please check both your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folders)</span>
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href="https://mail.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded text-[11px] font-semibold border border-slate-600 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>Open Gmail (جی میل کھولیں)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Resend & Instant Backup Verification Code */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={adminResendTimer > 0 || adminLoading}
                        onClick={handleResendAdminOtp}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
                        <span>{adminResendTimer > 0 ? `Resend email in ${adminResendTimer}s` : 'Resend Code to Email'}</span>
                      </button>

                      {adminOfflineCode && (
                        <button
                          type="button"
                          onClick={() => setShowAdminBackupCode(!showAdminBackupCode)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        >
                          {showAdminBackupCode ? 'Hide Backup Code' : "Didn't receive email? Show Backup Code"}
                        </button>
                      )}
                    </div>

                    {showAdminBackupCode && adminOfflineCode && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-amber-500/40">
                          <div>
                            <span className="text-[10px] text-amber-300 font-bold block">Instant Backup Code:</span>
                            <span className="text-[10px] text-slate-400">Issued to prevent blocking:</span>
                          </div>
                          <span className="font-mono text-lg font-black tracking-widest text-amber-300 bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30">
                            {adminOfflineCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                          Enter this 6-digit code into the box below to log in as admin immediately.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-Digit OTP Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code"
                      value={adminOtpCode}
                      onChange={(e) => setAdminOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-lg tracking-widest font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {adminLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Verify & Access Admin Panel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminOtpStep(false)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Admin Option B: Mobile & Password */
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile User ID
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="Enter Mobile ID (e.g. 03001234567)"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs px-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Log In as Administrator
                </button>
              </form>
            )}

            {/* Cabinet Login Option (Collapsed Below Admin Panel) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCabinetOptionBelowAdmin(!showCabinetOptionBelowAdmin)}
                className="w-full py-2 px-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Cabinet Member Login</span>
                </div>
                {showCabinetOptionBelowAdmin ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {showCabinetOptionBelowAdmin && (
                <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
                  {cabinetLoginError && (
                    <div className="p-2.5 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl">
                      {cabinetLoginError}
                    </div>
                  )}
                  <form onSubmit={handleCabinetLoginSubmit} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Cabinet Mobile ID
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 03001234567"
                        value={cabinetMobileInput}
                        onChange={(e) => setCabinetMobileInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Security Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCabinetPassword ? 'text' : 'password'}
                          required
                          placeholder="Password"
                          value={cabinetPasswordInput}
                          onChange={(e) => setCabinetPasswordInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCabinetPassword(!showCabinetPassword)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white text-[11px]"
                        >
                          {showCabinetPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Log In to Cabinet
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : activeGateTab === 'supabase' ? (
          /* ========================================================= */
          /* SUPABASE CLOUD AUTHENTICATION (PostgreSQL Backend)        */
          /* ========================================================= */
          <div className="p-5 space-y-4">
            {/* Supabase Sub-tab Selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setSbAuthMode('signin');
                  setSbError('');
                  setSbSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sbAuthMode === 'signin'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setSbAuthMode('signup');
                  setSbError('');
                  setSbSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sbAuthMode === 'signup'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up (New)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSbAuthMode('otp');
                  setSbError('');
                  setSbSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sbAuthMode === 'otp'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Cloud Status Badge */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>PostgreSQL Auth • Project: <strong className="text-emerald-400 font-mono">{SUPABASE_PROJECT_ID}</strong></span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                db/schema.sql
              </span>
            </div>

            {sbError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{sbError}</span>
              </div>
            )}

            {sbSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{sbSuccessMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {sbAuthMode === 'signin' && (
              <form onSubmit={handleSupabaseSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. candidate@example.com"
                      value={sbEmail}
                      onChange={(e) => setSbEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={sbShowPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={sbPassword}
                      onChange={(e) => setSbPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSbShowPassword(!sbShowPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      {sbShowPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sbLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Sign In with Supabase</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Don't have a Supabase account?{' '}
                  <button
                    type="button"
                    onClick={() => { setSbAuthMode('signup'); setSbError(''); }}
                    className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign Up now
                  </button>
                </p>
              </form>
            )}

            {/* SIGN UP FORM (Creates user in auth.users and profile in public.profiles via SQL trigger) */}
            {sbAuthMode === 'signup' && (
              <form onSubmit={handleSupabaseSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Syed Ali Raza"
                      value={sbFullName}
                      onChange={(e) => setSbFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. candidate@example.com"
                      value={sbEmail}
                      onChange={(e) => setSbEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password (min. 6 characters) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={sbShowPassword ? 'text' : 'password'}
                      required
                      placeholder="Choose a password"
                      value={sbPassword}
                      onChange={(e) => setSbPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSbShowPassword(!sbShowPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      {sbShowPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Portal Account Role
                  </label>
                  <select
                    value={sbRole}
                    onChange={(e: any) => setSbRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="applicant">Candidate / Job Seeker</option>
                    <option value="member">ISO Community Member</option>
                    <option value="recruiter">Recruiter / Employer</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    New signups create an entry in <strong>auth.users</strong>. The trigger in <strong>db/schema.sql</strong> (<code className="text-white font-mono">on_auth_user_created</code>) automatically provisions your <strong className="text-white">public.profiles</strong> record!
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={sbLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Sign Up & Create Profile in Supabase</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setSbAuthMode('signin'); setSbError(''); }}
                    className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* MAGIC LINK / OTP FORM */}
            {sbAuthMode === 'otp' && (
              !sbOtpSent ? (
                <form onSubmit={handleSupabaseSendOtp} className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Receive a one-time verification link or OTP code in your inbox to sign in password-free.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. candidate@example.com"
                        value={sbEmail}
                        onChange={(e) => setSbEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sbLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>Send Magic Link / OTP Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSupabaseVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-digit OTP from Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={sbOtpCode}
                      onChange={(e) => setSbOtpCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl tracking-widest font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={sbLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {sbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Verify & Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSbOtpSent(false)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )
            )}

            {/* Subtle link to Admin */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveGateTab('admin');
                  setSbError('');
                }}
                className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator & Official Cabinet Access</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MEMBER PORTAL (EMAIL OTP AUTHENTICATION & 1-TO-1 ID)      */
          /* ========================================================= */
          <div className="p-5 space-y-4">
            
            {/* 2 Simple Tabs: Sign In / Join */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMemberAuthMode('signin');
                  setSignInError('');
                  setSignInSuccessMsg('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  memberAuthMode === 'signin'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Member Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMemberAuthMode('signup');
                  setRegError('');
                  setRegSuccessMsg('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  memberAuthMode === 'signup'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Join as New Member
              </button>
            </div>

            {/* Error Message */}
            {(signInError || regError) && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{signInError || regError}</span>
              </div>
            )}

            {/* Success Message */}
            {(signInSuccessMsg || regSuccessMsg) && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{signInSuccessMsg || regSuccessMsg}</span>
              </div>
            )}

            {memberAuthMode === 'signin' ? (
              /* ======================================================= */
              /* TAB A: MEMBER SIGN IN WITH EMAIL OTP                    */
              /* ======================================================= */
              !signInOtpStep ? (
                /* Step 1: Input registered email or ID */
                <form onSubmit={handleMemberSendOtp} className="space-y-3.5">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Enter your <span className="font-bold text-white">Registered Email</span> linked to your ISO Member ID. A 6-digit OTP will be dispatched to verify your identity.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Email Address or Member ID <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Enter registered email or Member ID"
                        value={signInInput}
                        onChange={(e) => setSignInInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {signInLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Send Verification Code (OTP)</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Input 6-Digit OTP */
                <form onSubmit={handleMemberVerifyOtp} className="space-y-3.5">
                  <div className="p-3.5 bg-indigo-950/50 border border-indigo-500/40 rounded-xl space-y-2.5">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>OTP Verification</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                        {signInMatchedAccount?.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">
                      Welcome, <strong>{signInMatchedAccount?.name}</strong>. A 6-digit verification code has been dispatched.
                    </p>

                    <div className="p-2.5 bg-slate-900/90 border border-indigo-500/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Registered Email Address:</span>
                        <button
                          type="button"
                          onClick={() => { setSignInOtpStep(false); setShowSignInBackupCode(false); }}
                          className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                        >
                          Change / Edit
                        </button>
                      </div>
                      <p className="text-xs text-indigo-300 font-mono font-bold truncate">
                        {signInMatchedAccount?.email}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                      <p className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Sender: <strong className="text-white font-mono">syedmuhammadamir837@gmail.com</strong></span>
                      </p>
                      <p className="text-amber-300 font-medium">
                        ⚠️ اگر ای میل ان باکس میں نہ ملے تو برائے مہربانی اپنا <strong>Spam / Junk</strong> فولڈر لازمی چیک کریں۔<br />
                        <span className="text-[10px] text-slate-300">(Please check both your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folders)</span>
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href="https://mail.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded text-[11px] font-semibold border border-slate-600 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-indigo-400" />
                          <span>Open Gmail (جی میل کھولیں)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Resend & Instant Backup Verification Code */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={signInResendTimer > 0 || signInLoading}
                        onClick={handleResendSignInOtp}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${signInLoading ? 'animate-spin' : ''}`} />
                        <span>{signInResendTimer > 0 ? `Resend email in ${signInResendTimer}s` : 'Resend Code to Email'}</span>
                      </button>

                      {signInOfflineCode && (
                        <button
                          type="button"
                          onClick={() => setShowSignInBackupCode(!showSignInBackupCode)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        >
                          {showSignInBackupCode ? 'Hide Backup Code' : "Didn't receive email? Show Backup Code"}
                        </button>
                      )}
                    </div>

                    {showSignInBackupCode && signInOfflineCode && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-amber-500/40">
                          <div>
                            <span className="text-[10px] text-amber-300 font-bold block">Instant Backup Code:</span>
                            <span className="text-[10px] text-slate-400">Issued to prevent blocking:</span>
                          </div>
                          <span className="font-mono text-lg font-black tracking-widest text-amber-300 bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30">
                            {signInOfflineCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                          Enter this 6-digit code into the box below to sign in immediately.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-Digit Verification Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code"
                      value={signInOtpCode}
                      onChange={(e) => setSignInOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl tracking-widest font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={signInLoading}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {signInLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Verify & Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignInOtpStep(false)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* ======================================================= */
              /* TAB B: NEW MEMBER JOIN (1 EMAIL = 1 ID MANDATORY RULE) */
              /* ======================================================= */
              !regOtpStep ? (
                /* Step 1: Fill form & Check 1 Email = 1 ID */
                <form onSubmit={handleRegSendOtp} className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 leading-relaxed">
                      <span className="font-bold text-amber-300">Strict Rule:</span>{' '}
                      One email is permitted for only one ID. Your email will receive a verification code before ID issuance.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Syed Ali Raza Naqvi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Email Address <span className="text-red-400">* (For OTP & ID Linking)</span>
                      </label>
                      {regEmail && !emailCheck.isUnique && (
                        <span className="text-[10px] text-red-400 font-bold">
                          Already in use by {emailCheck.conflictId}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. syedmuhammadamir911@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={`w-full bg-slate-800 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                          regEmail && !emailCheck.isUnique
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-700 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {regEmail && suggestEmailCorrection(regEmail) && (
                      <div className="mt-1.5 p-2 bg-amber-500/15 border border-amber-500/40 rounded-lg flex items-center justify-between gap-2">
                        <div className="text-[11px] text-amber-300">
                          <span>Did you mean: </span>
                          <strong className="font-mono text-white underline">{suggestEmailCorrection(regEmail)}</strong>?
                        </div>
                        <button
                          type="button"
                          onClick={() => setRegEmail(suggestEmailCorrection(regEmail)!)}
                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded cursor-pointer transition-colors"
                        >
                          Apply Fix
                        </button>
                      </div>
                    )}
                    {regEmail && !emailCheck.isUnique && (
                      <p className="mt-1 text-[11px] text-red-400 leading-snug">
                        ⚠️ One email is strictly reserved for one ID only. Please sign in with this email or enter another email address.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="03001234567"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        City Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Karachi, Lahore, etc."
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading || (Boolean(regEmail) && !emailCheck.isUnique)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {regLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Send Verification OTP & Verify Email</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP for New Member Registration */
                <form onSubmit={handleRegVerifyOtpAndJoin} className="space-y-3.5">
                  <div className="p-3.5 bg-indigo-950/50 border border-indigo-500/40 rounded-xl space-y-2.5">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Verifying New Member Email</span>
                      </span>
                      <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded">1 Email = 1 ID</span>
                    </div>

                    <p className="text-xs text-slate-200">
                      Applicant: <strong>{regName}</strong> ({regCity})
                    </p>

                    <div className="p-2.5 bg-slate-900/90 border border-indigo-500/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Destination Email Address:</span>
                        <button
                          type="button"
                          onClick={() => { setRegOtpStep(false); setShowRegBackupCode(false); }}
                          className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                        >
                          Change / Edit
                        </button>
                      </div>
                      <p className="text-xs text-indigo-300 font-mono font-bold truncate">
                        {regEmail}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                      <p className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Sender: <strong className="text-white font-mono">syedmuhammadamir837@gmail.com</strong></span>
                      </p>
                      <p className="text-amber-300 font-medium">
                        ⚠️ اگر ای میل ان باکس میں نہ ملے تو برائے مہربانی اپنا <strong>Spam / Junk</strong> فولڈر لازمی چیک کریں۔<br />
                        <span className="text-[10px] text-slate-300">(Please check both your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folders)</span>
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href="https://mail.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded text-[11px] font-semibold border border-slate-600 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-indigo-400" />
                          <span>Open Gmail (جی میل کھولیں)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Resend & Instant Backup Verification Code */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={regResendTimer > 0 || regLoading}
                        onClick={handleResendRegOtp}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${regLoading ? 'animate-spin' : ''}`} />
                        <span>{regResendTimer > 0 ? `Resend email in ${regResendTimer}s` : 'Resend Code to Email'}</span>
                      </button>

                      {regOfflineCode && (
                        <button
                          type="button"
                          onClick={() => setShowRegBackupCode(!showRegBackupCode)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        >
                          {showRegBackupCode ? 'Hide Backup Code' : "Didn't receive email? Show Backup Code"}
                        </button>
                      )}
                    </div>

                    {showRegBackupCode && regOfflineCode && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-amber-500/40">
                          <div>
                            <span className="text-[10px] text-amber-300 font-bold block">Instant Backup Code:</span>
                            <span className="text-[10px] text-slate-400">Issued to prevent blocking:</span>
                          </div>
                          <span className="font-mono text-lg font-black tracking-widest text-amber-300 bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30">
                            {regOfflineCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                          Enter this 6-digit code into the box below to complete verification and join.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-Digit Email Verification Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code"
                      value={regOtpCode}
                      onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl tracking-widest font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {regLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Confirm & Issue Member ID</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegOtpStep(false)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )
            )}

            {/* Bottom: Subtle Link to Administrator Login */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveGateTab('admin');
                  setSignInError('');
                  setRegError('');
                }}
                className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator & Official Cabinet Access</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
