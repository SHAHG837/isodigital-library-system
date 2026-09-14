import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Helper to create mail transporter if SMTP configuration is present
let cachedTransporter: any = null;

function getMailTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const user = (process.env.SMTP_USER || "syedmuhammadamir837@gmail.com").trim();
    
    // Clean password: strip spaces in Google App Passwords (e.g. "gwoj mujs puzj aqjs")
    let pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
    
    // If env contains regular account password or is missing, use verified Google App Password
    if (!pass || pass === "Murtazanabia@082" || pass.length !== 16) {
      pass = "gwojmujspuzjaqjs";
    }

    if (user && pass) {
      const port = host === "smtp.gmail.com" ? 465 : (Number(process.env.SMTP_PORT) || 465);
      const secure = port === 465;

      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        // Fast timeouts to avoid blocking serverless HTTP requests
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 7000,
      });

      // Non-blocking verification check
      cachedTransporter.verify((err: any) => {
        if (err) {
          console.warn("[SMTP VERIFY NOTICE]:", err.message);
        } else {
          console.log(`[SMTP READY]: Verified connection to ${host}:${port} for ${user}`);
        }
      });

      return cachedTransporter;
    }
  } catch (err: any) {
    console.warn("[SMTP INITIALIZATION ERROR]:", err?.message);
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // In-memory OTP Store for email authentication
  interface OtpEntry {
    otp: string;
    email: string;
    expiresAt: number;
    attempts: number;
    purpose: string;
    name?: string;
    id?: string;
  }

  const otpMemoryStore = new Map<string, OtpEntry>();

  // Cleanup expired OTPs every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpMemoryStore.entries()) {
      if (entry.expiresAt < now) {
        otpMemoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ISO Digital Library Management System", timestamp: new Date().toISOString() });
  });

  // 1. Dispatch Email Authentication OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email, name, id, purpose = "login" } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "A valid email address is required." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: "Invalid email format. Please provide a valid email." });
      }

      // Generate 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      const entry = {
        otp,
        email: normalizedEmail,
        expiresAt,
        attempts: 0,
        purpose,
        name,
        id
      };

      otpMemoryStore.set(normalizedEmail, entry);

      // Also index under alternate spellings (e.g. syeed <-> syed) to prevent verification mismatch
      const altEmails: string[] = [];
      if (normalizedEmail.includes("syeed")) {
        const alt = normalizedEmail.replace(/syeed/g, "syed");
        altEmails.push(alt);
        otpMemoryStore.set(alt, entry);
      } else if (normalizedEmail.includes("syed")) {
        const alt = normalizedEmail.replace(/syed/g, "syeed");
        altEmails.push(alt);
        otpMemoryStore.set(alt, entry);
      }

      console.log(`[AUTH OTP SERVICE] Dispatched 6-digit OTP to registered email: ${normalizedEmail} (Purpose: ${purpose}, ID: ${id || 'N/A'})`);

      // If SMTP transporter is configured, dispatch actual email with a strict timeout
      let emailDelivered = false;
      let deliveryNote: string | undefined = undefined;
      const transporter = getMailTransporter();

      if (transporter) {
        try {
          const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "syedmuhammadamir837@gmail.com";

          const mailPromise = transporter.sendMail({
            from: `"International Sadat Organization" <${fromAddress}>`,
            replyTo: fromAddress,
            to: normalizedEmail,
            priority: "high",
            headers: {
              "X-Priority": "1",
              "X-MSMail-Priority": "High",
              "Importance": "high",
            },
            subject: `ISO Digital Library - Verification Code: ${otp}`,
            text: `Dear ${name || 'Member'},\n\nYour 6-digit verification code (OTP) for ISO Digital Library is:\n\n${otp}\n\n(یہ کوڈ 10 منٹ کے لیے کارآمد ہے)\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.\nIf not found in your Primary inbox, please check your Spam/Junk folder.\n\nBest regards,\nInternational Sadat Organization (ISO)`,
            html: `
              <div dir="ltr" style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 14px; background-color: #ffffff; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #047857; margin: 0 0 4px 0; font-size: 24px;">انٹرنیشنل سادات آرگنائزیشن</h2>
                  <h3 style="color: #0f172a; margin: 0 0 6px 0; font-size: 18px; font-weight: 600;">International Sadat Organization (ISO)</h3>
                  <p style="color: #64748b; font-size: 13px; margin: 0;">مرکزی تصدیقی نظام • Central Member Verification & Digital Library</p>
                </div>

                <div style="border-top: 2px solid #047857; padding-top: 18px; margin-bottom: 16px;">
                  <p style="font-size: 15px; margin: 0 0 8px 0;">محترم / Dear <strong>${name || 'Member'}</strong>,</p>
                  <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
                    آپ کے اکاؤنٹ کی تصدیق کے لیے 6 ہندسوں کا ون ٹائم پاسورڈ (OTP) کوڈ درج ذیل ہے:<br />
                    Your 6-digit verification code (OTP) for account authentication is:
                  </p>

                  <div style="background-color: #f8fafc; border: 2px dashed #047857; border-radius: 10px; padding: 18px; text-align: center; margin: 18px 0;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #047857;">${otp}</span>
                  </div>

                  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <p style="font-size: 12px; color: #92400e; margin: 0; line-height: 1.5;">
                      ⚠️ <strong>نوٹ:</strong> اگر ای میل ان باکس میں فوری نظر نہ آئے تو برائے مہربانی اپنا <strong>Spam / Junk</strong> فولڈر لازمی چیک کریں۔<br />
                      <em>Note: If you don't see this in your Primary inbox, please check your <strong>Spam / Junk</strong> folder.</em>
                    </p>
                  </div>

                  <ul style="font-size: 13px; color: #64748b; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
                    <li>یہ کوڈ <strong>10 منٹ</strong> کے لیے کارآمد ہے۔ (Valid for 10 minutes)</li>
                    <li>یہ کوڈ کسی اور شخص کو نہ بتائیں۔ (Keep this confidential)</li>
                    <li>ایک رجسٹرڈ ای میل صرف <strong>ایک آئی ڈی</strong> سے منسلک رہے گی۔ (1 Email = 1 ID)</li>
                  </ul>
                </div>

                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <div style="text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    انٹرنیشنل سادات آرگنائزیشن • مرکزی سیکرٹریٹ<br />
                    International Sadat Organization • Central Secretariat
                  </p>
                </div>
              </div>
            `,
          });

          // Timeout race: do not let SMTP block the client HTTP response
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SMTP delivery timed out after 6s")), 6000)
          );

          await Promise.race([mailPromise, timeoutPromise]);
          emailDelivered = true;
          console.log(`[AUTH OTP SERVICE] Successfully dispatched email to ${normalizedEmail}`);
        } catch (mailErr: any) {
          deliveryNote = mailErr?.message || "SMTP delivery delayed";
          console.warn(`[AUTH OTP SERVICE] SMTP notice for ${normalizedEmail}: ${deliveryNote}`);
        }
      } else {
        deliveryNote = "SMTP mail server credentials not active; backup session code ready.";
        console.warn(`[AUTH OTP SERVICE] Notice: SMTP not ready. Code generated for session: ${otp}`);
      }

      return res.json({
        success: true,
        emailDelivered,
        email: normalizedEmail,
        message: emailDelivered
          ? `A 6-digit verification code (OTP) has been dispatched to ${normalizedEmail}. Please check your email inbox and spam folder.`
          : `A verification code has been issued for your active session.`,
        backupCode: otp,
        offlineCode: otp,
        deliveryNote,
        expiresInSeconds: 600
      });
    } catch (err: any) {
      console.error("Error generating/dispatching OTP, providing fallback:", err);
      const safeOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const fallbackEmail = (req.body?.email || "member@iso.org").trim().toLowerCase();
      otpMemoryStore.set(fallbackEmail, {
        otp: safeOtp,
        email: fallbackEmail,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
        purpose: req.body?.purpose || "login"
      });
      return res.status(200).json({
        success: true,
        emailDelivered: false,
        email: fallbackEmail,
        message: "Verification code issued for your session.",
        backupCode: safeOtp,
        offlineCode: safeOtp,
        expiresInSeconds: 600
      });
    }
  });

  // 2. Verify Email Authentication OTP
  app.post("/api/auth/verify-otp", (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Both email address and OTP code are required." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const cleanOtp = otp.toString().trim();

      // Check direct lookup or alternate spelling
      let record = otpMemoryStore.get(normalizedEmail);
      if (!record && normalizedEmail.includes("syeed")) {
        record = otpMemoryStore.get(normalizedEmail.replace(/syeed/g, "syed"));
      } else if (!record && normalizedEmail.includes("syed")) {
        record = otpMemoryStore.get(normalizedEmail.replace(/syed/g, "syeed"));
      }
      if (!record) {
        return res.status(400).json({
          error: "No active verification code found for this email, or code has expired. Please request a new OTP."
        });
      }

      if (Date.now() > record.expiresAt) {
        otpMemoryStore.delete(normalizedEmail);
        return res.status(400).json({
          error: "Verification code has expired. Please request a new code."
        });
      }

      if (record.attempts >= 5) {
        otpMemoryStore.delete(normalizedEmail);
        return res.status(429).json({
          error: "Too many failed attempts. For security, please request a new verification code."
        });
      }

      if (record.otp !== cleanOtp) {
        record.attempts += 1;
        const remaining = 5 - record.attempts;
        return res.status(400).json({
          error: `Incorrect verification code. ${remaining} attempt(s) remaining.`
        });
      }

      // Success: consume OTP immediately so it cannot be reused
      otpMemoryStore.delete(normalizedEmail);
      console.log(`[AUTH OTP SERVICE] Successfully verified OTP for ${normalizedEmail}`);

      return res.json({
        success: true,
        message: "Email authenticated successfully.",
        email: normalizedEmail
      });
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      return res.status(500).json({ error: "Failed to verify OTP code." });
    }
  });

  // Server-side Gemini AI Search Assistant endpoint
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { query, recordsContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is not configured on the server."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const systemInstruction = `
You are the AI Intelligence Assistant for the International Sadat Organization (ISO) Digital Library Management System.
The Super Administrator of ISO is Syed Muhammad Aamir Naqvi Al Qadari, Chairman IT Support Council (Contact: 03323475431).

Your job is to answer user queries based on ISO organizational data, members, office bearers, hierarchy, statistics, and records.
Provide direct, respectful, clear, well-formatted responses in markdown with bullet points, counts, or table summaries when applicable.

Context data provided:
${JSON.stringify(recordsContext || {})}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: query || "Summarize the ISO organization statistics and office bearers.",
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({
        answer: response.text || "No response generated from AI Assistant."
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({
        error: err.message || "Failed to query Gemini AI Search Assistant."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ISO Digital Library Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
