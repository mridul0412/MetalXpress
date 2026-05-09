// Central brand configuration — change name here to rebrand everywhere
export const BRAND = {
  name: 'BhavX',
  symbol: '⚡',
  domain: 'bhavx.com',
  email: 'hello@bhavx.com',
  tagline: "India's Metal Exchange",
  description: "Live rates. Verified marketplace. Pro analytics. Built for traders who need accuracy — not WhatsApp forwards.",
  fullTitle: "BhavX — India's Metal Exchange",
  metaDescription: "BhavX — India's Metal Exchange. Live LME & MCX rates, verified B2B marketplace, pro analytics. Real-time metal trading for Delhi, Mumbai, Ahmedabad, Ludhiana, Chennai and more.",
};

// Brand color palette
export const BRAND_COLORS = {
  // Gold gradient stops
  goldHighlight: '#FFE9A8',
  goldBright:    '#FFC942',
  goldPrimary:   '#CFB53B',
  goldDeep:      '#8C6818',
  goldShadow:    '#5A4214',

  // Sun-bindu (logo center)
  binduCore:     '#FFFEF0',
  binduMid:      '#FFC942',
  binduHot:      '#FF6B1A',
  binduDeep:     '#C73E0A',

  // Surfaces (existing app palette — backward compat)
  bg:        '#080E1A',
  bgDeep:    '#050912',
  surface:   '#0D1420',
  border:    'rgba(255,255,255,0.07)',
  borderGold:'rgba(207,181,59,0.25)',

  // Status
  success: '#34d399',
  warning: '#fbbf24',
  danger:  '#f87171',
};

// Reusable gradient strings
export const BRAND_GRADIENTS = {
  goldVertical: 'linear-gradient(180deg, #FFE9A8 0%, #FFC942 28%, #CFB53B 60%, #8C6818 100%)',
  goldDeepVertical: 'linear-gradient(180deg, #FFE9A8, #CFB53B 50%, #8C6818)',
  binduSunRadial: 'radial-gradient(circle, #FFFEF0 0%, #FFE9A8 20%, #FFC942 50%, #FF6B1A 80%, #C73E0A 100%)',
};
