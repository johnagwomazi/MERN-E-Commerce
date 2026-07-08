import axios from 'axios';

const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';

const getSecretKey = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is undefined inside process.env');
  }

  return secretKey;
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getSecretKey()}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
});

export const initializePaystackTransaction = async (payload) => {
  try {
    console.log('Paystack request:', payload);
    const response = await axios.post(
      `${PAYSTACK_API_BASE_URL}/transaction/initialize`,
      payload,
      { headers: getAuthHeaders() }
    );

    console.log('Paystack response:', response.data);
    return response.data;
  } catch (networkError) {
    const paystackErrorMessage = networkError.response?.data?.message || networkError.message;
    console.error('Paystack error:', networkError.response?.data || networkError);
    console.error('Paystack initialization error:', paystackErrorMessage);
    throw new Error(`Paystack initialization failed: ${paystackErrorMessage}`);
  }
};

export const verifyPaystackTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_API_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (networkError) {
    const paystackErrorMessage = networkError.response?.data?.message || networkError.message;
    console.error('Paystack verification error:', paystackErrorMessage);
    throw new Error(`Paystack verification failed: ${paystackErrorMessage}`);
  }
};
