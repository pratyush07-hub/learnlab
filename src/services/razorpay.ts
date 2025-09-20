// Razorpay Payment Service
export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (multiply by 100)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayService {
  private static readonly KEY_ID = 'rzp_live_RJvPF8jnUt43Yy';
  private static readonly KEY_SECRET = 'WeQgl0hxDyKoKjzjYmhWSGci';

  // Load Razorpay script dynamically
  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create order on server (for production, this should be a backend API call)
  static async createOrder(orderData: PaymentData): Promise<{ id: string; amount: number; currency: string }> {
    // In production, this should call your backend API to create a Razorpay order
    // For now, we'll simulate order creation
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: orderData.amount,
      currency: orderData.currency
    };
  }

  // Initialize payment
  static async initiatePayment(
    amount: number,
    description: string,
    userData: { name: string; email: string; contact?: string },
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const order = await this.createOrder({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          description,
          customer_name: userData.name,
          customer_email: userData.email
        }
      });

      // Razorpay options
      const options: RazorpayOptions = {
        key: this.KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'LearnLab',
        description,
        order_id: order.id,
        handler: (response: RazorpayResponse) => {
          console.log('Payment successful:', response);
          onSuccess(response);
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.contact || ''
        },
        notes: {
          description,
          customer_name: userData.name
        },
        theme: {
          color: '#f59e0b' // Amber color to match app theme
        }
      };

      // Create Razorpay instance and open
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        onError(response.error);
      });

      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      onError(error);
    }
  }

  // Verify payment (should be done on server-side in production)
  static async verifyPayment(paymentData: RazorpayResponse): Promise<boolean> {
    try {
      // In production, this should call your backend API to verify the payment
      // The backend should verify the signature using Razorpay webhook or verification API
      
      // For now, we'll just check if payment_id exists
      return !!paymentData.razorpay_payment_id;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  // Format amount for display
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}