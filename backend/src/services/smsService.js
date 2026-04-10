/**
 * SMS Service — MSG91 with dev-mode fallback
 *
 * DEV MODE (no key set): OTP is logged to console, always uses 1234.
 * PRODUCTION: Set MSG91_API_KEY + MSG91_TEMPLATE_ID in .env
 *
 * Setup (5 min):
 *  1. Sign up at https://msg91.com
 *  2. SMS → Flow → Create flow with text: "Your MetalXpress OTP is ##otp##. Valid for 10 minutes. Do not share."
 *  3. Copy Auth Key (top right) → MSG91_API_KEY
 *  4. Copy Flow ID → MSG91_TEMPLATE_ID
 */

const IS_PROD = process.env.NODE_ENV === 'production';
const MSG91_KEY = process.env.MSG91_API_KEY;
const MSG91_TEMPLATE = process.env.MSG91_TEMPLATE_ID;

const isConfigured = () =>
  MSG91_KEY && MSG91_KEY !== 'your_msg91_api_key' &&
  MSG91_TEMPLATE && MSG91_TEMPLATE !== 'your_msg91_template_id';

/**
 * Send OTP via SMS.
 * @param {string} phone  - bare 10-digit Indian number (no +91)
 * @param {string} otp    - 4-digit OTP string
 */
async function sendOTP(phone, otp) {
  if (!isConfigured()) {
    // Dev mode — log to console, return success
    console.log(`\n[SMS DEV] ─────────────────────────────`);
    console.log(`[SMS DEV] Phone : +91${phone}`);
    console.log(`[SMS DEV] OTP   : ${otp}`);
    console.log(`[SMS DEV] ─────────────────────────────\n`);
    return { success: true, dev: true };
  }

  // MSG91 Flow API v5
  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: MSG91_KEY,
    },
    body: JSON.stringify({
      flow_id: MSG91_TEMPLATE,
      sender: 'MTLXPR',
      mobiles: `91${phone}`,
      OTP: otp,
    }),
  });

  const data = await response.json();

  if (data.type !== 'success') {
    console.error('[SMS] MSG91 error:', data);
    throw new Error(data.message || 'Failed to send SMS via MSG91');
  }

  console.log(`[SMS] OTP sent to +91${phone}`);
  return { success: true };
}

module.exports = { sendOTP };
