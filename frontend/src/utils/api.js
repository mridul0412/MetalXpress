import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mx_token');
      localStorage.removeItem('mx_user');
    }
    return Promise.reject(err);
  }
);

// Rates
export const fetchLocalRates = (hubSlug) => api.get(`/rates/local?hub=${hubSlug}`);
export const fetchLMERates = () => api.get('/rates/lme');
export const fetchMCXRates = () => api.get('/rates/mcx');
export const fetchForexRates = () => api.get('/rates/forex');
export const parseRateMessage = (message) => api.post('/rates/parse', { message });
export const saveParsedRates = (data) => api.post('/rates/save-parsed', data, {
  headers: { 'x-admin-password': localStorage.getItem('mx_admin_pass') || '' },
});
export const saveManualRates = (data) => api.post('/rates/manual', data, {
  headers: { 'x-admin-password': localStorage.getItem('mx_admin_pass') || '' },
});

// Cities
export const fetchCities = () => api.get('/cities');

// Metals
export const fetchMetals = () => api.get('/metals');

// Auth
// ── MSG91 OTP (parked — kept for easy switch back) ──
export const requestOTP = (phone) => api.post('/auth/request-otp', { phone });
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
// ── Firebase Phone Auth ──
export const checkPhone = (phone) => api.post('/auth/check-phone', { phone });
export const verifyFirebaseOTP = (data) => api.post('/auth/verify-firebase-otp', data);
export const fetchMe = () => api.get('/auth/me');
export const registerEmail = (data) => api.post('/auth/register', data);
export const loginEmail = (data) => api.post('/auth/login', data);

// Google OAuth (handled via redirect — link to this URL)
export const googleAuthUrl = () => `${API_BASE}/auth/google`;

// Profile update (after OTP login or standalone)
export const updateProfile = (data) => api.patch('/auth/profile', data);

// Email verification
export const verifyEmail = (token) => api.get(`/auth/verify-email?token=${token}`);
export const resendVerification = () => api.post('/auth/resend-verification');

// Password reset
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// Subscription / paywall
export const checkSubscription = () => api.get('/auth/subscription');

// Live prices (full shape: {metals, forex, indices, crude, usdInr, fetchedAt})
export const fetchLivePricesDetailed = () => api.get('/rates/live');

// Marketplace
export const fetchListings = (params) => api.get('/marketplace/listings', { params });
export const fetchMyListings = () => api.get('/marketplace/my-listings');
export const createListing = (data) => api.post('/marketplace/listings', data);
export const deleteListing = (id) => api.delete(`/marketplace/listings/${id}`);
export const uploadMedia = (files) => {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  return api.post('/marketplace/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Deals / Negotiation
export const createDeal = (data) => api.post('/marketplace/deals', data);
export const fetchDealDetail = (dealId) => api.get(`/marketplace/deals/${dealId}`);
export const counterOffer = (dealId, data) => api.post(`/marketplace/deals/${dealId}/counter`, data);
export const acceptOffer = (dealId) => api.post(`/marketplace/deals/${dealId}/accept`);
export const rejectDeal = (dealId) => api.post(`/marketplace/deals/${dealId}/reject`);
export const payDeal = (dealId) => api.post(`/marketplace/deals/${dealId}/pay`);
export const fetchMyDeals = (role) => api.get('/marketplace/my-deals', { params: { role } });
export const completeDeal = (dealId) => api.patch(`/marketplace/deals/${dealId}/complete`);
export const disputeDeal = (dealId, data) => api.post(`/marketplace/deals/${dealId}/dispute`, typeof data === 'string' ? { reason: data } : data);
export const fetchDealNotifications = () => api.get('/marketplace/notifications');
export const rateDeal = (dealId, data) => api.post(`/marketplace/deals/${dealId}/rate`, data);
export const fetchUserRatings = (userId) => api.get(`/marketplace/users/${userId}/ratings`);

// Admin marketplace
export const fetchPendingListings = () => api.get('/marketplace/pending', { headers: adminHeaders() });
export const verifyListing = (id, status) => api.patch(`/marketplace/listings/${id}/verify`, { status }, { headers: adminHeaders() });
export const fetchDisputes = () => api.get('/marketplace/disputes', { headers: adminHeaders() });
export const resolveDispute = (dealId, resolution) => api.patch(`/marketplace/deals/${dealId}/resolve-dispute`, { resolution }, { headers: adminHeaders() });

// Alerts
export const fetchAlerts = () => api.get('/alerts');
export const createAlert = (data) => api.post('/alerts', data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);

// Admin
const adminHeaders = () => ({
  'x-admin-password': localStorage.getItem('mx_admin_pass') || '',
});

export const fetchAdminDashboard = () => api.get('/admin/dashboard', { headers: adminHeaders() });
export const adminParsePreview = (message) => api.post('/admin/parse-preview', { message }, { headers: adminHeaders() });
export const fetchRateHistory = (params) => api.get('/admin/rate-history', { params, headers: adminHeaders() });
export const fetchContributors = () => api.get('/admin/contributors', { headers: adminHeaders() });
export const createContributor = (data) => api.post('/admin/contributors', data, { headers: adminHeaders() });
export const saveLMEOverride = (rates) => api.post('/admin/lme-override', { rates }, { headers: adminHeaders() });
export const saveMCXOverride = (rates) => api.post('/admin/mcx-override', { rates }, { headers: adminHeaders() });

export default api;
