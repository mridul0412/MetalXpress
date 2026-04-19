/**
 * SMS Service — MSG91 OTP API with dev-mode fallback
 *
 * DEV MODE  : OTP logged to console, uses 1234. No keys needed.
 * PRODUCTION: Set MSG91_API_KEY in .env. No template/flow needed —
 *             uses MSG91's built-in OTP send API.
 *
 * NOTE on Indian SMS (DLT):
 *   TRAI mandates DLT registration for commercial SMS in India.
 *   For production, register your entity at msg91.com → DLT section.
 *   Until then, dev mode (console log) is used automatically.
 */

const isConfigured = () => {
  const key = process.env.MSG91_API_KEY;
  return key && key !== 'your_msg91_api_key' && key.length > 10;
};

/**
 * Send OTP via MSG91.
 * @param {string} phone - bare 10-digit Indian number (no +91)
 * @param {string} otp   - 4-digit OTP string
 */
async function sendOTP(phone, otp) {
  if (!isConfigured()) {
    console.log(`\n[SMS DEV] ─────────────────────────────`);
    console.log(`[SMS DEV] Phone : +91${phone}`);
    console.log(`[SMS DEV] OTP   : ${otp}`);
    console.log(`[SMS DEV] (Set MSG91_API_KEY in .env for real SMS)`);
    console.log(`[SMS DEV] ─────────────────────────────\n`);
    return { success: true, dev: true };
  }

  const authkey = process.env.MSG91_API_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  // Use Flow API if template ID is set, otherwise use simple OTP API
  if (templateId && templateId !== 'your_msg91_template_id') {
    // Flow-based API (requires DLT-registered template)
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey },
      body: JSON.stringify({
        flow_id: templateId,
        sender: process.env.MSG91_SENDER_ID || 'MTLXPR',
        mobiles: `91${phone}`,
        OTP: otp,
      }),
    });
    const data = await response.json();
    if (data.type !== 'success') {
      console.error('[SMS] MSG91 Flow error:', data);
      throw new Error(data.message || 'Failed to send SMS');
    }
  } else {
    // Simple OTP API — uses MSG91's pre-approved OTP template
    const params = new URLSearchParams({
      authkey,
      mobile: `91${phone}`,
      message: `Your BhavX OTP is ${otp}. Valid for 10 minutes. Do not share.`,
      sender: 'MTLXPR',
      otp,
      otp_expiry: 10,
    });
    const response = await fetch(
      `https://api.msg91.com/api/sendotp.php?${params.toString()}`,
      { method: 'GET' }
    );
    const text = await response.text();
    if (!text.includes('success') && !text.includes('otp_send_success')) {
      console.error('[SMS] MSG91 OTP error:', text);
      throw new Error('Failed to send OTP via MSG91');
    }
  }

  console.log(`[SMS] OTP sent to +91${phone}`);
  return { success: true };
}

module.exports = { sendOTP };
