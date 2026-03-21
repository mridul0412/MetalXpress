export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 style={{
        fontSize: 24, fontWeight: 800, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>
        Last updated: March 2026
      </p>

      <div style={{
        borderRadius: 16, padding: '24px',
        background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
      }}>
        <LegalSection title="1. Acceptance of Terms">
          By accessing or using MetalXpress ("the Platform"), you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the Platform.
        </LegalSection>

        <LegalSection title="2. User Accounts">
          You may create an account using email and password, phone number with OTP verification, or Google OAuth.
          You are responsible for maintaining the confidentiality of your login credentials. You agree to provide
          accurate information during registration.
        </LegalSection>

        <LegalSection title="3. Platform Services">
          MetalXpress provides real-time scrap metal rate information, a marketplace for buying and selling scrap metal,
          and price alert notifications. Free tier includes LME/MCX live rates, forex data, and marketplace access.
          Pro and Business tiers provide additional features including local spot rates and analytics.
        </LegalSection>

        <LegalSection title="4. Rate Information Disclaimer">
          All metal rates, forex rates, and market data displayed on MetalXpress are for informational purposes only.
          They do not constitute financial, trading, or investment advice. Rates may be delayed, estimated, or
          derived from third-party sources. MetalXpress does not guarantee the accuracy, completeness, or timeliness
          of any rate data. Always verify rates independently before making trading decisions.
        </LegalSection>

        <LegalSection title="5. Marketplace">
          MetalXpress provides a platform for users to list and discover scrap metal buy/sell opportunities.
          We do not verify listings, guarantee transactions, or act as an intermediary. All transactions are
          conducted directly between parties at their own risk.
        </LegalSection>

        <LegalSection title="6. Subscription & Payments">
          Paid subscriptions (Pro, Business) are billed monthly. Payments are processed through Razorpay.
          Refund requests are handled on a case-by-case basis within 7 days of purchase.
        </LegalSection>

        <LegalSection title="7. Limitation of Liability">
          MetalXpress shall not be liable for any direct, indirect, incidental, or consequential damages arising
          from the use of the Platform, including but not limited to losses from trading decisions based on
          rate information displayed on the Platform.
        </LegalSection>

        <LegalSection title="8. Contact">
          For questions about these Terms, contact us at support@metalxpress.in
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
