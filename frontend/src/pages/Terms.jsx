export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <h1 style={{
        fontSize: 28, fontWeight: 800, margin: '0 0 4px',
        background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
        Last Updated: March 2026
      </p>

      {/* Key Points Summary */}
      <div style={{
        borderRadius: 12, padding: '16px 20px', marginBottom: 32,
        background: 'rgba(207,181,59,0.06)',
        border: '1px solid rgba(207,181,59,0.25)',
        fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#CFB53B', fontSize: 13 }}>
          Key Points
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc' }}>
          <li>MetalXpress is a <strong style={{ color: '#fff' }}>facilitator</strong>, not a broker, mediator, or guarantor of deals.</li>
          <li>Commission of <strong style={{ color: '#fff' }}>0.1%</strong> is charged on agreed deal value and is <strong style={{ color: '#fff' }}>non-refundable</strong> once a connection is made, except in cases of confirmed fraud.</li>
          <li><strong style={{ color: '#fff' }}>KYC verification</strong> (Aadhaar/PAN) is required before posting listings on the marketplace.</li>
          <li>All users must be <strong style={{ color: '#fff' }}>18 years or older</strong> and based in India.</li>
        </ul>
      </div>

      {/* Table of Contents */}
      <div style={{
        borderRadius: 12, padding: '16px 20px', marginBottom: 32,
        background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 2,
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
          Contents
        </p>
        {[
          ['#acceptance', '1. Acceptance of Terms'],
          ['#definitions', '2. Definitions'],
          ['#role', '3. MetalXpress\'s Role'],
          ['#kyc', '4. User Accounts & KYC'],
          ['#marketplace', '5. Marketplace Rules'],
          ['#commission', '6. Commission Policy'],
          ['#refund-policy', '7. Refund Policy'],
          ['#disputes', '8. Dispute Process'],
          ['#ban-policy', '9. Ban & Suspension Policy'],
          ['#ratings', '10. Rating System'],
          ['#liability', '11. Limitation of Liability'],
          ['#responsibilities', '12. User Responsibilities'],
          ['#contact', '13. Contact & Governing Law'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{ display: 'block', color: 'rgba(207,181,59,0.7)', textDecoration: 'none', fontSize: 12 }}
            onMouseEnter={e => e.currentTarget.style.color = '#CFB53B'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(207,181,59,0.7)'}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        borderRadius: 16, padding: '28px 24px',
        background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8,
      }}>

        {/* 1 */}
        <LegalSection id="acceptance" title="1. Acceptance of Terms">
          <p>
            By accessing, browsing, or using MetalXpress (the "Platform"), whether through our website
            or any associated services, you acknowledge that you have read, understood, and agree to be
            bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must
            immediately stop using the Platform.
          </p>
          <p>
            You must be at least <strong style={{ color: '#fff' }}>18 years of age</strong> to use MetalXpress.
            By creating an account, you represent and warrant that you are 18 or older, are legally capable
            of entering into binding agreements, and are accessing the Platform from within India.
          </p>
          <p>
            MetalXpress reserves the right to update these Terms at any time. Continued use of the Platform
            after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </LegalSection>

        {/* 2 */}
        <LegalSection id="definitions" title="2. Definitions">
          <DefinitionList items={[
            ['Platform', 'MetalXpress, including the website, mobile web application, backend services, and all associated features.'],
            ['Commission', 'A fee of 0.1% of the agreed deal value, charged to the buyer upon successful negotiation, before contact details are shared.'],
            ['Deal', 'A negotiation between a buyer and a seller conducted through the Platform\'s in-app offer system, progressing through the statuses: negotiating, agreed, paid, connected, and completed.'],
            ['Listing', 'A sell offer posted by a user on the Marketplace, specifying metal type, grade, quantity, location, price, and optionally photos.'],
            ['Dispute', 'A formal complaint raised by either party within 7 days of connection, requesting admin review of a deal.'],
            ['KYC', 'Know Your Customer verification, requiring government-issued identification (Aadhaar or PAN) to validate a user\'s identity before they can post listings.'],
            ['Connection', 'The point at which contact details (phone number, email) of both parties are revealed after commission payment.'],
            ['Parties', 'The buyer and the seller involved in a specific Deal, excluding MetalXpress.'],
          ]} />
        </LegalSection>

        {/* 3 */}
        <LegalSection id="role" title="3. MetalXpress's Role">
          <p style={{ color: '#CFB53B', fontWeight: 600, marginBottom: 12, fontSize: 12 }}>
            MetalXpress is a facilitator and connection platform. We are NOT a broker, mediator,
            agent, or guarantor of any transaction.
          </p>
          <p>
            Our role is limited to providing a digital venue where verified metal traders can
            discover counterparties, negotiate deal terms through structured in-app offers, and
            connect after commission payment. Specifically, MetalXpress does <strong style={{ color: '#fff' }}>not</strong>:
          </p>
          <BulletList items={[
            'Inspect, test, weigh, or verify the quality, grade, or quantity of any material listed or traded.',
            'Guarantee delivery, payment, or completion of any deal between parties.',
            'Hold funds in escrow (commission payments excepted during dispute review).',
            'Act as an intermediary, agent, or representative of either party.',
            'Provide financial, legal, or trading advice of any kind.',
            'Guarantee the accuracy of real-time rate data displayed on the Platform.',
          ]} />
          <p>
            Once a connection is made and contact details are shared, the responsibility for
            inspecting material, negotiating final terms, arranging logistics, and completing
            payment lies <strong style={{ color: '#fff' }}>entirely with the parties involved</strong>.
            MetalXpress bears no liability for the outcome of any transaction.
          </p>
        </LegalSection>

        {/* 4 */}
        <LegalSection id="kyc" title="4. User Accounts & KYC">
          <p>
            Users may create an account using email and password with mandatory phone OTP verification,
            or through Google OAuth. One account per individual is permitted. Creating multiple accounts
            to circumvent bans, manipulate ratings, or abuse the platform will result in permanent
            suspension of all associated accounts.
          </p>
          <p><strong style={{ color: '#fff' }}>Phone Verification</strong></p>
          <p>
            Phone number verification via OTP is mandatory at the time of account creation. This ensures
            a verified communication channel for all users on the Platform.
          </p>
          <p><strong style={{ color: '#fff' }}>KYC Requirements</strong></p>
          <p>
            Before posting any listing on the Marketplace, users must complete KYC verification by
            providing a valid Aadhaar card or PAN card. KYC verification is reviewed by MetalXpress
            administrators.
          </p>
          <BulletList items={[
            'Users are responsible for maintaining the security of their login credentials.',
            'All information provided during registration and KYC must be accurate, current, and complete.',
            'Submission of forged, stolen, or falsified KYC documents will result in an immediate and permanent account ban, and MetalXpress reserves the right to report such activity to appropriate authorities.',
            'Users must notify MetalXpress promptly of any unauthorized access to their account.',
          ]} />
        </LegalSection>

        {/* 5 */}
        <LegalSection id="marketplace" title="5. Marketplace Rules">
          <p>
            All listings posted on the MetalXpress Marketplace must comply with the following rules.
            Violations may result in listing removal, account suspension, or permanent ban.
          </p>
          <p><strong style={{ color: '#fff' }}>Listing Accuracy</strong></p>
          <BulletList items={[
            'Listings must accurately represent the metal type, grade, quantity, condition, and location of the material.',
            'Prices, where provided, must reflect genuine asking or willing-to-pay amounts.',
            'Photos must be recent (taken within 7 days of listing) and depict the actual material being offered. Stock photos, AI-generated images, or photos of different material are prohibited.',
            'Descriptions must be honest and not exaggerate quality, availability, or any other characteristic.',
          ]} />
          <p><strong style={{ color: '#fff' }}>Prohibited Conduct</strong></p>
          <BulletList items={[
            'Posting fake, misleading, or duplicate listings.',
            'Listing material that is stolen, illegally obtained, or subject to legal dispute.',
            'Using the platform to spam, advertise unrelated products, or solicit users for external services.',
            'Inflating or deflating listed quantities or prices to manipulate marketplace perception.',
          ]} />
          <p>
            All listings are subject to admin verification before they become publicly visible. MetalXpress
            reserves the right to remove any listing at its sole discretion, with or without prior notice.
          </p>
        </LegalSection>

        {/* 6 */}
        <LegalSection id="commission" title="6. Commission Policy">
          <p>
            MetalXpress charges a commission of <strong style={{ color: '#CFB53B' }}>0.1%</strong> of the
            agreed deal value. The agreed deal value is calculated as:
          </p>
          <div style={{
            background: 'rgba(207,181,59,0.08)', borderRadius: 8, padding: '12px 16px',
            margin: '12px 0 16px', border: '1px solid rgba(207,181,59,0.2)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#CFB53B',
            textAlign: 'center', fontWeight: 600,
          }}>
            Commission = Agreed Price per kg &times; Agreed Quantity &times; 0.001
          </div>
          <BulletList items={[
            'Commission is charged to the buyer after both parties have agreed on price and quantity through in-app negotiation (offer and counter-offer system).',
            'Commission is the fee for facilitating the verified connection between counterparties.',
            'Payment of the commission is required before contact details of either party are revealed.',
            'Commission is non-refundable once a connection has been established (contact details shared), except in cases of confirmed fraud as outlined in the Refund Policy.',
            'The commission amount is calculated and displayed transparently at every stage of negotiation.',
          ]} />
        </LegalSection>

        {/* 7 */}
        <LegalSection id="refund-policy" title="7. Refund Policy">
          <p>
            Refund eligibility depends on the specific scenario. The table below outlines our refund
            policy for commission payments:
          </p>
          <RefundTable />
          <p style={{ marginTop: 16 }}>
            Refund requests must be submitted through the in-app dispute system within 7 days of
            connection. Refunds, where applicable, are processed within 5-7 business days to the
            original payment method.
          </p>
        </LegalSection>

        {/* 8 */}
        <LegalSection id="disputes" title="8. Dispute Process">
          <p>
            If you encounter an issue with a deal after connection, you may raise a dispute through
            the Platform. The dispute process is as follows:
          </p>
          <NumberedList items={[
            <><strong style={{ color: '#fff' }}>Initiate Dispute</strong> — From the deal detail screen, select "Report Issue / Raise Dispute." Disputes must be raised within <strong style={{ color: '#fff' }}>7 days</strong> of the connection date. Disputes filed after this window will not be considered.</>,
            <><strong style={{ color: '#fff' }}>Select Category</strong> — Choose the category that best describes your issue (e.g., seller unresponsive, material mismatch, suspected fraud). The selected category determines refund eligibility as per the Refund Policy above.</>,
            <><strong style={{ color: '#fff' }}>Provide Evidence</strong> — Upload supporting evidence including: photographs of received material, WhatsApp or messaging screenshots, delivery receipts, weighment slips, or any other relevant documentation. A minimum of one piece of evidence is required.</>,
            <><strong style={{ color: '#fff' }}>Admin Review</strong> — A MetalXpress administrator will review the dispute, evidence, and both parties' accounts within <strong style={{ color: '#fff' }}>48 hours</strong> of filing.</>,
            <><strong style={{ color: '#fff' }}>Resolution</strong> — Based on the review, the admin will apply one of the following resolutions: full refund and seller action, deal marked as completed, or deal cancelled. The resolution will align with the Refund Policy table.</>,
            <><strong style={{ color: '#fff' }}>Escrow Hold</strong> — During the review period, the commission amount is held in escrow and not settled until a resolution is reached.</>,
            <><strong style={{ color: '#fff' }}>Final Decision</strong> — The admin's resolution decision is final and binding. MetalXpress does not offer an appeals process for dispute resolutions.</>,
          ]} />
        </LegalSection>

        {/* 9 */}
        <LegalSection id="ban-policy" title="9. Ban & Suspension Policy">
          <p>
            MetalXpress enforces the following account restrictions to maintain a trustworthy
            marketplace for all traders:
          </p>
          <p><strong style={{ color: '#fff' }}>Automatic Cooldown</strong></p>
          <p>
            If 3 or more disputes are filed against your account (as buyer or seller), your account
            enters an automatic <strong style={{ color: '#fff' }}>7-day cooldown period</strong>. During cooldown,
            you cannot create new listings, make offers, or enter new negotiations. Existing connected
            deals remain active.
          </p>
          <p><strong style={{ color: '#fff' }}>Permanent Ban</strong></p>
          <BulletList items={[
            'Confirmed scam or fake listing: immediate and permanent account ban.',
            'Submission of forged or falsified KYC documents: permanent ban and potential legal action.',
            'Repeated violations of Marketplace Rules after prior warnings.',
          ]} />
          <p><strong style={{ color: '#fff' }}>Suspension</strong></p>
          <BulletList items={[
            'Repeated low-quality or frivolous disputes (attempting to game the refund system): account suspended pending review.',
            'Banned users cannot create listings, make offers, negotiate deals, or access marketplace features.',
            'Ban or suspension reasons are communicated to the affected user via email.',
          ]} />
          <p><strong style={{ color: '#fff' }}>Appeals</strong></p>
          <p>
            Users may appeal a ban or suspension by emailing <span style={{ color: '#CFB53B' }}>support@metalxpress.in</span> within
            30 days of the action. Appeals must include a written explanation and any supporting evidence.
            MetalXpress will review and respond within 10 business days. The appeal decision is final.
          </p>
        </LegalSection>

        {/* 10 */}
        <LegalSection id="ratings" title="10. Rating System">
          <p>
            After a deal is marked as completed, both the buyer and seller may rate each other on
            a scale of 1 to 5 stars, with an optional written comment.
          </p>
          <BulletList items={[
            'Ratings are public and visible on the user\'s profile and their future listings.',
            'Ratings provide transparency and help other traders make informed decisions about potential counterparties.',
            'Rating manipulation, including soliciting fake positive reviews, posting retaliatory negative reviews, or using multiple accounts to inflate ratings, will result in account suspension.',
            'Users cannot delete or edit their own ratings once submitted.',
            'MetalXpress reserves the right to remove ratings that contain abusive language, personal threats, or irrelevant content.',
          ]} />
        </LegalSection>

        {/* 11 */}
        <LegalSection id="liability" title="11. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, MetalXpress, its founders, employees,
            and affiliates shall not be held liable for:
          </p>
          <BulletList items={[
            'The outcome of any deal or transaction between parties on the Platform.',
            'The quality, grade, weight, condition, or authenticity of any material listed or traded.',
            'Delivery failures, logistics issues, or payment disputes between parties.',
            'Any direct, indirect, incidental, special, consequential, or punitive damages arising from the use of or inability to use the Platform.',
            'Losses, financial or otherwise, resulting from actions or inaction of a counterparty.',
            'Accuracy, completeness, or timeliness of rate data, market information, or any other data displayed on the Platform.',
            'Unauthorized access to your account resulting from your failure to secure your credentials.',
          ]} />
          <p>
            In any event, MetalXpress's total aggregate liability to you for all claims arising
            from or related to the Platform shall not exceed the <strong style={{ color: '#fff' }}>total
            commission amount paid by you</strong> in the 12-month period preceding the claim.
          </p>
          <p>
            You acknowledge that you use the Platform and transact with other users entirely at
            your own risk.
          </p>
        </LegalSection>

        {/* 12 */}
        <LegalSection id="responsibilities" title="12. User Responsibilities">
          <p>
            As a user of MetalXpress, you agree to the following responsibilities:
          </p>
          <BulletList items={[
            'Provide accurate, truthful, and complete information in your profile, listings, and communications.',
            'Complete all deals negotiated through the Platform in good faith.',
            'Not circumvent the Platform to avoid commission payment (e.g., exchanging contact details outside the app before paying commission, using coded messages in offer text).',
            'Report any suspicious activity, fraudulent listings, or terms violations to MetalXpress promptly.',
            'Keep your KYC documents and profile information current and up to date.',
            'Not use the Platform for any unlawful purpose or in violation of any applicable Indian law or regulation.',
            'Respect other users and maintain professional conduct in all negotiations and communications.',
            'Not attempt to reverse-engineer, scrape, or misuse any part of the Platform or its data.',
          ]} />
        </LegalSection>

        {/* 13 */}
        <LegalSection id="contact" title="13. Contact & Governing Law">
          <p>
            For questions, concerns, or feedback regarding these Terms of Service, contact us:
          </p>
          <div style={{
            background: 'rgba(207,181,59,0.06)', borderRadius: 8, padding: '14px 18px',
            margin: '12px 0', border: '1px solid rgba(207,181,59,0.15)',
          }}>
            <p style={{ margin: '0 0 4px', color: '#CFB53B', fontWeight: 600, fontSize: 12 }}>
              MetalXpress Support
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              Email: <span style={{ color: '#CFB53B' }}>support@metalxpress.in</span>
            </p>
          </div>
          <p style={{ marginTop: 16 }}>
            These Terms of Service are governed by and construed in accordance with the laws of
            India. Any disputes arising out of or in connection with these Terms shall be subject
            to the exclusive jurisdiction of the courts located in <strong style={{ color: '#fff' }}>Delhi, India</strong>.
          </p>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary, and the remaining
            provisions shall remain in full force and effect.
          </p>
        </LegalSection>

      </div>
    </div>
  );
}

/* --- Reusable Components --- */

function LegalSection({ id, title, children }) {
  return (
    <div id={id} style={{ marginBottom: 32, scrollMarginTop: 80 }}>
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: '#CFB53B', margin: '0 0 12px',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {title}
      </h3>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: '8px 0 12px', paddingLeft: 20, listStyleType: 'disc' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

function NumberedList({ items }) {
  return (
    <ol style={{ margin: '8px 0 12px', paddingLeft: 20, listStyleType: 'decimal' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 10 }}>{item}</li>
      ))}
    </ol>
  );
}

function DefinitionList({ items }) {
  return (
    <div style={{ margin: '8px 0 12px' }}>
      {items.map(([term, definition], i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <span style={{ color: '#CFB53B', fontWeight: 600 }}>{term}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 8px' }}>&mdash;</span>
          <span>{definition}</span>
        </div>
      ))}
    </div>
  );
}

function RefundTable() {
  const rows = [
    {
      scenario: 'Seller never responds after connection',
      refund: true,
      action: 'Seller receives warning; repeat offenses lead to permanent ban',
    },
    {
      scenario: 'Buyer stops responding / ghosts',
      refund: false,
      action: 'Commission earned — connection was successfully provided',
    },
    {
      scenario: 'Material quality does not match listing',
      refund: false,
      action: 'Seller\'s KYC details shared with buyer for direct resolution',
    },
    {
      scenario: 'Fake listing / confirmed scam attempt',
      refund: true,
      action: 'Seller permanently banned; KYC reported to authorities',
    },
    {
      scenario: 'Both parties claim deal didn\'t happen',
      refund: false,
      action: 'Commission retained — verified connection was made',
    },
  ];

  const cellStyle = {
    padding: '10px 14px',
    borderBottom: '1px solid rgba(207,181,59,0.12)',
    fontSize: 12,
    verticalAlign: 'top',
  };

  const headerStyle = {
    ...cellStyle,
    color: '#CFB53B',
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '2px solid rgba(207,181,59,0.3)',
    background: 'rgba(207,181,59,0.08)',
  };

  return (
    <div style={{
      margin: '16px 0', borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(207,181,59,0.3)',
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        background: 'rgba(8,14,26,0.6)',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <thead>
          <tr>
            <th style={headerStyle}>Scenario</th>
            <th style={{ ...headerStyle, textAlign: 'center', width: 80 }}>Refund</th>
            <th style={headerStyle}>Action Taken</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
            }}>
              <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.7)' }}>{row.scenario}</td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                {row.refund ? (
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: 14 }} title="Full refund">
                    &#10003;
                  </span>
                ) : (
                  <span style={{ color: '#f87171', fontWeight: 700, fontSize: 14 }} title="No refund">
                    &#10007;
                  </span>
                )}
              </td>
              <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
