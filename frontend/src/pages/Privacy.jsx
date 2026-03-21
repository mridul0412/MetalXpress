export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 style={{
        fontSize: 24, fontWeight: 800, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>
        Last updated: March 2026
      </p>

      <div style={{
        borderRadius: 16, padding: '24px',
        background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
      }}>
        <LegalSection title="1. Information We Collect">
          We collect information you provide during registration: email address, phone number, name, city,
          and trader type. We also collect usage data such as pages visited and features used.
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          Your information is used to provide and improve our services, send OTP codes for authentication,
          deliver price alerts, facilitate marketplace interactions, and process subscription payments.
        </LegalSection>

        <LegalSection title="3. Data Storage & Security">
          Your data is stored in a PostgreSQL database with encrypted connections. Passwords are hashed using
          bcrypt with a high work factor. JWT tokens are used for session management and expire after 30 days.
          We do not store raw passwords.
        </LegalSection>

        <LegalSection title="4. Third-Party Services">
          We use the following third-party services: Yahoo Finance and Stooq for market data, Razorpay for
          payment processing (when subscription payments are active), and Google OAuth for social login.
          Each service has its own privacy policy.
        </LegalSection>

        <LegalSection title="5. Data Sharing">
          We do not sell, rent, or share your personal information with third parties for marketing purposes.
          We may share anonymized, aggregated usage data for analytics. Your contact information is only
          revealed to other users in marketplace listings you explicitly create.
        </LegalSection>

        <LegalSection title="6. Your Rights">
          You can update your profile information at any time. You can request deletion of your account by
          contacting support@metalxpress.in. We will delete your personal data within 30 days of a verified request.
        </LegalSection>

        <LegalSection title="7. Cookies & Local Storage">
          We use localStorage to store your authentication token (mx_token) and user preferences. We do not
          use third-party tracking cookies.
        </LegalSection>

        <LegalSection title="8. Contact">
          For privacy-related questions or data deletion requests, contact: support@metalxpress.in
        </LegalSection>
      </div>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#CFB53B', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
