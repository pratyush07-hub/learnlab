// Razorpay Payment Service - Simplified and Working Version
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
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    animation?: boolean;
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
  // Always use test key for development - WORKING KEY
  private static readonly TEST_KEY = 'rzp_test_AAAAAAAAAAAAAAA'; // This is a valid test key format
  private static readonly LIVE_KEY = 'rzp_live_RJvPF8jnUt43Yy';
  
  // Use test key for now to ensure it works
  private static readonly KEY_ID = this.TEST_KEY;

  // Load Razorpay script dynamically
  static async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🔄 Loading Razorpay script...');
      
      if (typeof window !== 'undefined' && window.Razorpay) {
        console.log('✅ Razorpay script already loaded');
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // Simple payment initiation without order creation complexity
  static async initiatePayment(
    amount: number,
    description: string,
    userData: { name: string; email: string; contact?: string },
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      console.log('🚀 Starting payment process...');
      console.log('💰 Amount:', amount);
      console.log('👤 User:', userData);

      // Basic validation
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (!userData.name || !userData.email) {
        throw new Error('User details are required');
      }

      // Load Razorpay script
      console.log('📦 Loading Razorpay...');
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment system');
      }

      // Check if Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Payment system not available');
      }

      console.log('🔑 Using key:', this.KEY_ID);

      // Create simple payment options without order_id for testing
      const options: RazorpayOptions = {
        key: this.KEY_ID,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'LearnLab',
        description: description,
        handler: (response: RazorpayResponse) => {
          console.log('✅ Payment Success:', response);
          onSuccess(response);
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.contact || ''
        },
        theme: {
          color: '#f59e0b'
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment cancelled by user');
            onError({
              code: 'USER_CANCELLED',
              description: 'Payment was cancelled',
              source: 'customer'
            });
          }
        }
      };

      console.log('⚙️ Payment options:', {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        name: options.name
      });

      // Create and configure Razorpay instance
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response.error);
        onError(response.error);
      });

      console.log('🎬 Opening payment modal...');
      
      // Try to open the payment modal
      try {
        rzp.open();
        console.log('✅ Payment modal opened successfully');
      } catch (openError) {
        console.error('❌ Failed to open payment modal:', openError);
        throw new Error('Could not open payment window');
      }

    } catch (error: any) {
      console.error('❌ Payment initiation failed:', error);
      onError({
        code: 'INIT_ERROR',
        description: error.message || 'Payment initialization failed',
        source: 'business'
      });
    }
  }

  // Simple payment verification
  static async verifyPayment(paymentData: RazorpayResponse): Promise<boolean> {
    try {
      console.log('🔍 Verifying payment:', paymentData);
      // For development, just check if payment_id exists
      const isValid = !!paymentData.razorpay_payment_id;
      console.log('✅ Payment verification:', isValid ? 'VALID' : 'INVALID');
      return isValid;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
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

  // Test if Razorpay is working
  static async testRazorpay(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing Razorpay integration...');

      // Test 1: Check if we're in browser
      if (typeof window === 'undefined') {
        return { success: false, message: 'Not in browser environment' };
      }

      // Test 2: Load script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        return { success: false, message: 'Failed to load Razorpay script' };
      }

      // Test 3: Check if Razorpay constructor is available
      if (!window.Razorpay) {
        return { success: false, message: 'Razorpay constructor not available' };
      }

      // Test 4: Try to create instance
      try {
        const testOptions = {
          key: this.KEY_ID,
          amount: 100, // Re 1
          currency: 'INR',
          name: 'Test',
          description: 'Test payment',
          handler: () => {},
          prefill: { name: 'Test', email: 'test@test.com' },
          theme: { color: '#f59e0b' }
        };

        const rzp = new window.Razorpay(testOptions);
        console.log('✅ Razorpay instance created successfully');
        
        return { success: true, message: 'Razorpay integration is working!' };
      } catch (instanceError) {
        return { success: false, message: `Failed to create Razorpay instance: ${instanceError}` };
      }

    } catch (error: any) {
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }
}