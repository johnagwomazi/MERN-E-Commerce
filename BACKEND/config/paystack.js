import axios from 'axios';

/**
 * Communicates directly with the Paystack transaction authorization pipeline
 * @param {string} reference - The unique tracking reference key string sent from the client UI
 */
export const verifyPaystackTransaction = async (reference) => {
  try {
    // 1. Enforce safety validation checks inside the core networking layer
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error("Paystack network initialization failed: PAYSTACK_SECRET_KEY is undefined inside process.env");
    }

    // 2. Direct server-to-server validation call using exact Paystack schema prerequisites
    const response = await axios.get(
      `https://paystack.co{encodeURIComponent(reference)}`,
      {
        headers: {
          // The single space after 'Bearer' is strict. Do not remove it.
          Authorization: `Bearer ${secretKey.trim()}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    // 3. Return the clean payload data packet block straight back to your controller route
    return response.data;
  } catch (networkError) {
    // Gracefully catch and structure Paystack's raw error messages for your central express middleware
    const paystackErrorMessage = networkError.response?.data?.message || networkError.message;
    console.error("Paystack External Network Subsystem Error:", paystackErrorMessage);
    throw new Error(`Paystack Verification Gateway Reject: ${paystackErrorMessage}`);
  }
};
