import { useCallback } from 'react';
import {
  createStudentPaymentOrder,
  verifyPayment,
} from '../api/paymentApi';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
}

interface UseRazorpayResult {
  initiatePayment: (recordId: string, onSuccess: () => void, onError: (msg: string) => void) => Promise<void>;
}

/**
 * Hook that handles the full Razorpay checkout flow:
 *   1. Creates a payment order on the backend
 *   2. Loads the Razorpay checkout.js script
 *   3. Opens the Razorpay modal
 *   4. On payment success, verifies the signature on the backend
 *   5. Calls onSuccess / onError accordingly
 */
export function useRazorpay(): UseRazorpayResult {
  const initiatePayment = useCallback(async (
    recordId: string,
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    try {
      const order = await createStudentPaymentOrder(recordId);
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key:      order.keyId,
        order_id: order.gatewayOrderId,
        amount:   order.amountPaise,
        currency: order.currency,
        name:     'CloudCampus',
        description: 'Fee Payment',
        prefill: {
          name:    order.prefillName,
          email:   order.prefillEmail,
          contact: order.prefillContact,
        },
        theme: { color: '#2563EB' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({
              paymentOrderId:    order.paymentOrderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess();
          } catch {
            onError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => onError('Payment cancelled.'),
        },
      });

      rzp.open();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to initiate payment.');
    }
  }, []);

  return { initiatePayment };
}
