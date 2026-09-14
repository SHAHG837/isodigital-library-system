import { Member, AdminUser, AdminCredential } from '../types';

export interface SendOtpResult {
  success: boolean;
  message: string;
  emailDelivered?: boolean;
  offlineCode?: string;
  backupCode?: string;
  deliveryNote?: string;
  expiresInSeconds?: number;
  error?: string;
}

/**
 * Detect common email typos (e.g. syeed instead of syed, gmial.com instead of gmail.com)
 */
export function suggestEmailCorrection(email: string): string | null {
  const clean = email.trim().toLowerCase();
  if (!clean.includes('@')) return null;

  const parts = clean.split('@');
  if (parts.length !== 2) return null;
  const [localPart, domainPart] = parts;

  const domainCorrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  let newDomain = domainCorrections[domainPart] || domainPart;
  let newLocal = localPart;

  // Catch common Urdu/Pakistani typo "syeed" -> "syed"
  if (localPart.startsWith('syeed')) {
    newLocal = localPart.replace(/^syeed/, 'syed');
  }

  if (newDomain !== domainPart || newLocal !== localPart) {
    return `${newLocal}@${newDomain}`;
  }
  return null;
}

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Fallback client-side OTP storage in case of network edge cases
interface ClientOtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}
const clientOtpStore = new Map<string, ClientOtpRecord>();

/**
 * Validate email format with standard pattern
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Check that one email is strictly reserved for ONE ID only.
 * Returns true if unique, or returns existing account details if already bound to another ID.
 */
export function checkEmailUniqueness(
  email: string,
  members: Member[],
  admins: AdminUser[],
  currentId?: string
): { isUnique: boolean; conflictId?: string; conflictName?: string; conflictType?: string } {
  if (!email || !email.trim()) {
    return { isUnique: true };
  }

  const normalized = email.trim().toLowerCase();

  // Check Members
  const existingMember = members.find(
    (m) => m.email?.trim().toLowerCase() === normalized && m.id !== currentId
  );
  if (existingMember) {
    return {
      isUnique: false,
      conflictId: existingMember.id,
      conflictName: existingMember.fullName,
      conflictType: 'Member'
    };
  }

  // Check Admins
  const existingAdmin = admins.find(
    (a) => a.email.trim().toLowerCase() === normalized && a.id !== currentId
  );
  if (existingAdmin) {
    return {
      isUnique: false,
      conflictId: existingAdmin.id,
      conflictName: existingAdmin.name,
      conflictType: 'Administrator'
    };
  }

  return { isUnique: true };
}

/**
 * Find account by registered email OR ID (Member ID, Admin ID, or Mobile)
 */
export function findAccountByEmailOrId(
  query: string,
  members: Member[],
  admins: AdminUser[],
  adminCredentials: AdminCredential[]
): {
  found: boolean;
  member?: Member;
  admin?: AdminUser;
  adminCred?: AdminCredential;
  id?: string;
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
} {
  const clean = query.trim().toLowerCase();
  if (!clean) return { found: false };

  // 1. Search in Members
  const member = members.find(
    (m) =>
      m.id.toLowerCase() === clean ||
      (m.email && m.email.trim().toLowerCase() === clean) ||
      m.mobileNumber === query.trim()
  );
  if (member) {
    return {
      found: true,
      member,
      id: member.id,
      name: member.fullName,
      email: member.email,
      mobile: member.mobileNumber,
      role: 'Member'
    };
  }

  // 2. Search in Admins
  const admin = admins.find(
    (a) =>
      a.id.toLowerCase() === clean ||
      a.email.trim().toLowerCase() === clean ||
      a.phone === query.trim()
  );
  if (admin) {
    const cred = adminCredentials.find(
      (c) => c.mobileNumber === admin.phone || c.name.toLowerCase() === admin.name.toLowerCase()
    );
    return {
      found: true,
      admin,
      adminCred: cred,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      mobile: admin.phone,
      role: admin.role
    };
  }

  // 3. Search in Admin Credentials
  const cred = adminCredentials.find(
    (c) =>
      c.mobileNumber === query.trim() ||
      (c.email && c.email.trim().toLowerCase() === clean)
  );
  if (cred) {
    return {
      found: true,
      adminCred: cred,
      id: cred.memberId || cred.mobileNumber,
      name: cred.name,
      email: cred.email || 'syedmuhammadamir837@gmail.com',
      mobile: cred.mobileNumber,
      role: cred.role
    };
  }

  return { found: false };
}

/**
 * Dispatch 6-digit OTP to the specified email address
 */
export async function sendEmailOtp(
  email: string,
  name?: string,
  id?: string,
  purpose: 'login' | 'registration' | 'admin' = 'login'
): Promise<SendOtpResult> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return {
      success: false,
      message: 'Invalid email address provided.',
      error: 'Please enter a valid email address.'
    };
  }

  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, name, id, purpose })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        emailDelivered: data.emailDelivered,
        offlineCode: data.offlineCode || data.backupCode,
        backupCode: data.backupCode || data.offlineCode,
        deliveryNote: data.deliveryNote,
        message: data.message || `A 6-digit OTP verification code has been dispatched to ${normalized}. Please check your email inbox and spam folder.`,
        expiresInSeconds: data.expiresInSeconds || 600
      };
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server error dispatching OTP');
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to send OTP verification code to email.',
      error: err.message || 'Error communicating with email service.'
    };
  }
}

/**
 * Verify 6-digit OTP for the specified email address
 */
export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResult> {
  const normalized = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  if (!normalized || !cleanOtp) {
    return {
      success: false,
      error: 'Both email and verification code are required.'
    };
  }

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, otp: cleanOtp })
    });

    if (res.ok) {
      const data = await res.json();
      clientOtpStore.delete(normalized);
      return {
        success: true,
        message: data.message || 'Email successfully verified!'
      };
    } else {
      const errorData = await res.json().catch(() => ({}));
      // Check if fallback store has it
      const fallbackRecord = clientOtpStore.get(normalized);
      if (fallbackRecord && fallbackRecord.otp === cleanOtp && fallbackRecord.expiresAt > Date.now()) {
        clientOtpStore.delete(normalized);
        return { success: true, message: 'Email verified successfully!' };
      }
      return {
        success: false,
        error: errorData.error || 'Invalid or expired verification code.'
      };
    }
  } catch (err: any) {
    // Local fallback verification
    const record = clientOtpStore.get(normalized);
    if (!record) {
      return {
        success: false,
        error: 'No active OTP found for this email or OTP has expired. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      clientOtpStore.delete(normalized);
      return {
        success: false,
        error: 'Verification code has expired. Please request a new code.'
      };
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      return {
        success: false,
        error: 'Incorrect verification code. Please check and try again.'
      };
    }

    clientOtpStore.delete(normalized);
    return {
      success: true,
      message: 'Email successfully verified!'
    };
  }
}
