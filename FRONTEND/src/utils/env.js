const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const getFallbackApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api/v1';
  }

  return `${window.location.origin.replace(/\/+$/, '')}/api/v1`;
};

const envApiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const envLooksLikeLocalhost = /:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envApiBaseUrl);
const currentLooksLikeLocalhost = /:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(currentOrigin);

export const apiBaseUrl =
  envApiBaseUrl && !(envLooksLikeLocalhost && currentOrigin && !currentLooksLikeLocalhost)
    ? envApiBaseUrl
    : getFallbackApiBaseUrl();

export const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export const ensureFrontendEnv = () => {
  const missing = [];

  if (!apiBaseUrl) {
    missing.push('VITE_API_BASE_URL');
  }

  if (!paystackPublicKey) {
    missing.push('VITE_PAYSTACK_PUBLIC_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required frontend environment variables: ${missing.join(', ')}`);
  }
};
