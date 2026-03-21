import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 style={{
        fontSize: 24, fontWeight: 800, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Contact Us
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.5 }}>
        Have a question, feedback, or need support? Reach out to us through any of these channels.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <ContactCard icon={<Mail size={20} color="#CFB53B" />} title="Email" value="support@metalxpress.in"
          link="mailto:support@metalxpress.in" />
        <ContactCard icon={<MessageCircle size={20} color="#34d399" />} title="WhatsApp" value="+91 XXXXX XXXXX"
          link="#" subtitle="Business hours: 9 AM - 6 PM IST" />
        <ContactCard icon={<Phone size={20} color="#60a5fa" />} title="Phone" value="+91 XXXXX XXXXX"
          link="#" subtitle="Mon - Sat, 9 AM - 6 PM IST" />
        <ContactCard icon={<MapPin size={20} color="#f87171" />} title="Office" value="New Delhi, India"
          subtitle="By appointment only" />
      </div>

      {/* FAQ hint */}
      <div style={{
        marginTop: 32, borderRadius: 16, padding: '24px', textAlign: 'center',
        background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
          Common Questions
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>How do I get local spot rates?</strong>
          {' '}— Sign up for a Pro subscription (₹299/month).
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Are LME/MCX rates free?</strong>
          {' '}— Yes, live global metal rates are free for all users.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>How accurate are the rates?</strong>
          {' '}— Rates are sourced from Yahoo Finance, Stooq, and admin-verified WhatsApp broadcasts.
        </p>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, value, link, subtitle }) {
  const Wrapper = link ? 'a' : 'div';
  return (
    <Wrapper href={link || undefined} style={{
      borderRadius: 14, padding: '20px',
      background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
      textDecoration: 'none', display: 'block', transition: 'border-color 0.15s',
    }}>
      <div style={{ marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{value}</p>
      {subtitle && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{subtitle}</p>}
    </Wrapper>
  );
}
