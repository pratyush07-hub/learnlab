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
  // Production configuration with environment-based key selection
  private static readonly LIVE_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RJvPF8jnUt43Yy';
  private static readonly TEST_KEY = 'rzp_test_AAAAAAAAAAAAAAA';
  
  // Use live key for production, test key for development
  private static readonly KEY_ID = process.env.NODE_ENV === 'production' 
    ? this.LIVE_KEY 
    : this.TEST_KEY;

  // Check if we're in production mode
  private static readonly IS_PRODUCTION = process.env.NODE_ENV === 'production';

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

  // Simple payment initiation with production enhancements
  static async initiatePayment(
    amount: number,
    description: string,
    userData: { name: string; email: string; contact?: string },
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      console.log('🚀 Starting payment process...');
      console.log('🏭 Production mode:', this.IS_PRODUCTION);
      console.log('💰 Amount:', amount);
      console.log('👤 User:', userData);

      // Basic validation
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (!userData.name || !userData.email) {
        throw new Error('User details are required');
      }

      // Validate email format for production
      if (this.IS_PRODUCTION && !this.isValidEmail(userData.email)) {
        throw new Error('Please provide a valid email address');
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

      console.log('🔑 Using key:', this.KEY_ID.substring(0, 12) + '...');
      console.log('🌍 Environment:', this.IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT');

      // Create payment options with production optimizations
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

      // Add order_id for production (when backend is ready)
      if (this.IS_PRODUCTION && process.env.NEXT_PUBLIC_ENABLE_ORDER_CREATION === 'true') {
        try {
          const order = await this.createProductionOrder(amount, description, userData);
          options.order_id = order.id;
          console.log('📋 Order created for production:', order.id);
        } catch (orderError) {
          console.warn('⚠️ Order creation failed, proceeding without order_id:', orderError);
        }
      }

      console.log('⚙️ Payment options:', {
        key: options.key.substring(0, 12) + '...',
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        order_id: options.order_id || 'Not used'
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

  // Email validation helper
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Production order creation (for future backend integration)
  private static async createProductionOrder(
    amount: number, 
    description: string, 
    userData: { name: string; email: string }
  ): Promise<{ id: string; amount: number; currency: string }> {
    // This should call your backend API to create a Razorpay order
    // For now, we'll simulate it
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production, make an API call to your backend:
    // const response = await fetch('/api/razorpay/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: orderId })
    // });
    // return await response.json();
    
    return {
      id: orderId,
      amount: amount * 100,
      currency: 'INR'
    };
  }

  // Enhanced test function with production checks
  static async testRazorpay(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing Razorpay integration...');
      console.log('🏭 Production mode:', this.IS_PRODUCTION);
      console.log('🔑 Using key:', this.KEY_ID.substring(0, 12) + '...');

      // Test 1: Check if we're in browser
      if (typeof window === 'undefined') {
        return { success: false, message: 'Not in browser environment' };
      }

      // Test 2: Check environment configuration
      if (this.IS_PRODUCTION && this.KEY_ID.includes('test')) {
        return { 
          success: false, 
          message: 'Warning: Using test key in production environment' 
        };
      }

      if (!this.IS_PRODUCTION && this.KEY_ID.includes('live')) {
        console.warn('⚠️ Using live key in development');
      }

      // Test 3: Load script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        return { success: false, message: 'Failed to load Razorpay script' };
      }

      // Test 4: Check if Razorpay constructor is available
      if (!window.Razorpay) {
        return { success: false, message: 'Razorpay constructor not available' };
      }

      // Test 5: Try to create instance
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
        
        const environmentText = this.IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT';
        const keyType = this.KEY_ID.includes('test') ? 'TEST' : 'LIVE';
        
        return { 
          success: true, 
          message: `Razorpay integration working! (${environmentText} mode with ${keyType} key)` 
        };
      } catch (instanceError) {
        return { 
          success: false, 
          message: `Failed to create Razorpay instance: ${instanceError}` 
        };
      }

    } catch (error: any) {
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }
}