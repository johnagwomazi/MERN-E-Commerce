export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
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

