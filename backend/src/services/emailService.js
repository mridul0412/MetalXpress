/**
 * Email Service — Resend with dev-mode fallback
 *
 * DEV MODE (no key set): Emails are logged to console only, never sent.
 * PRODUCTION: Set RESEND_API_KEY + EMAIL_FROM in .env
 *
 * Setup (2 min):
 *  1. Sign up at https://resend.com (free — 3,000 emails/month)
 *  2. API Keys → Create Key → copy it → RESEND_API_KEY
 *  3. For EMAIL_FROM: use "BhavX <onboarding@resend.dev>" for testing,
 *     or add/verify your own domain at resend.com/domains for production.
 */

const { Resend } = require('resend');

const isConfigured = () => {
  const key = process.env.RESEND_API_KEY;
  return key && key !== 'your_resend_api_key';
};

const FROM = () => process.env.EMAIL_FROM || 'BhavX <onboarding@resend.dev>';
const FRONTEND = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Core sender ───────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }) {
  if (!isConfigured()) {
    console.log(`\n[EMAIL DEV] ─────────────────────────────────────`);
    console.log(`[EMAIL DEV] To      : ${to}`);
    console.log(`[EMAIL DEV] Subject : ${subject}`);
    console.log(`[EMAIL DEV] Body    : ${html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}`);
    console.log(`[EMAIL DEV] ─────────────────────────────────────\n`);
    return { success: true, dev: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM(), to, subject, html });

  if (error) {
    console.error('[EMAIL] Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  console.log(`[EMAIL] Sent "${subject}" to ${to}`);
  return { success: true };
}

// ── Email templates ───────────────────────────────────────────────────────────

function baseTemplate(content) {
  // Inline SVG iris with sun-core bindu — renders in most modern email clients
  const heroLogoSvg = `<svg width="56" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
    <defs>
      <linearGradient id="emailBlade" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFE9A8"/><stop offset="40%" stop-color="#CFB53B"/><stop offset="100%" stop-color="#7A5A18"/>
      </linearGradient>
      <radialGradient id="emailBindu" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFEF0"/><stop offset="20%" stop-color="#FFE9A8"/><stop offset="50%" stop-color="#FFC942"/><stop offset="80%" stop-color="#FF6B1A"/><stop offset="100%" stop-color="#C73E0A"/>
      </radialGradient>
    </defs>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(45 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(90 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(135 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(180 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(225 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(270 32 32)"/>
    <path d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#emailBlade)" transform="rotate(315 32 32)"/>
    <circle cx="32" cy="32" r="3.5" fill="url(#emailBindu)"/>
  </svg>`;

  // Wordmark: Marcellus serif + ticker bar + framed X
  // (Email clients widely support Google Fonts via web-font import in <head>)
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BhavX — India's Metal Exchange</title>
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+SC:wght@700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:#050912;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050912;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:520px;background:#0D1420;border:1px solid rgba(207,181,59,0.18);border-radius:14px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0D1420,rgba(207,181,59,0.06));padding:32px 32px 26px;text-align:center;border-bottom:1px solid rgba(207,181,59,0.2);">
                <div style="margin-bottom:14px;">${heroLogoSvg}</div>
                <div style="font-family:'Marcellus',Georgia,serif;font-size:30px;letter-spacing:0.02em;line-height:1;">
                  <span style="background:linear-gradient(180deg,#FFE9A8 0%,#FFC942 28%,#CFB53B 60%,#8C6818 100%);-webkit-background-clip:text;background-clip:text;color:#CFB53B;-webkit-text-fill-color:transparent;">Bhav</span>
                  <span style="display:inline-block;width:1.5px;height:18px;background:linear-gradient(180deg,#FFE9A8,#CFB53B 50%,#8C6818);vertical-align:middle;margin:0 9px;"></span>
                  <span style="display:inline-block;padding:3px 11px;border:1.5px solid #CFB53B;background:rgba(207,181,59,0.05);border-radius:3px;vertical-align:middle;">
                    <span style="font-family:'Marcellus',Georgia,serif;font-size:24px;color:#CFB53B;line-height:1;">X</span>
                  </span>
                </div>
                <div style="font-family:'Cormorant SC',Georgia,serif;font-weight:700;font-size:11px;color:rgba(207,181,59,0.7);margin-top:14px;letter-spacing:0.36em;text-transform:uppercase;">
                  India's Metal Exchange
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.32);font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;">
                  <strong style="color:rgba(207,181,59,0.7);">BhavX</strong> · India's Metal Exchange<br/>
                  If you didn't request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// ── sendVerificationEmail ─────────────────────────────────────────────────────

async function sendVerificationEmail(email, name, token) {
  const link = `${FRONTEND()}/verify-email?token=${token}`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#fff;font-family:monospace;">
      Verify your email address
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;">
      Hi ${name || 'Trader'},<br/><br/>
      Welcome to BhavX! Click the button below to verify your email and activate your account.
      This link expires in <strong style="color:#CFB53B;">24 hours</strong>.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${link}"
         style="display:inline-block;background:#CFB53B;color:#000;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;font-family:monospace;
                letter-spacing:1px;">
        VERIFY EMAIL →
      </a>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.3);word-break:break-all;">
      Or copy this link: <span style="color:#CFB53B;">${link}</span>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: 'Verify your BhavX email address',
    html,
  });
}

// ── sendPasswordResetEmail ────────────────────────────────────────────────────

async function sendPasswordResetEmail(email, name, token) {
  const link = `${FRONTEND()}/reset-password?token=${token}`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#fff;font-family:monospace;">
      Reset your password
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;">
      Hi ${name || 'Trader'},<br/><br/>
      We received a request to reset your BhavX password. Click the button below to choose a new password.
      This link expires in <strong style="color:#CFB53B;">1 hour</strong>.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${link}"
         style="display:inline-block;background:#CFB53B;color:#000;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;font-family:monospace;
                letter-spacing:1px;">
        RESET PASSWORD →
      </a>
    </div>

    <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:14px;margin-top:24px;">
      <p style="margin:0;font-size:12px;color:rgba(248,113,113,0.8);">
        ⚠ If you didn't request a password reset, someone else may be trying to access your account.
        You can safely ignore this email — your password has not been changed.
      </p>
    </div>

    <p style="margin:20px 0 0;font-size:12px;color:rgba(255,255,255,0.3);word-break:break-all;">
      Or copy this link: <span style="color:#CFB53B;">${link}</span>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: 'Reset your BhavX password',
    html,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
