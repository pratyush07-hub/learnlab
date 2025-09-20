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
  // Use environment variable or fallback to test key
  private static readonly KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_9WzaALpStMXqHK';
  
  // Load Razorpay script dynamically
  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Loading Razorpay script...');
      
      if (typeof window !== 'undefined' && window.Razorpay) {
        console.log('Razorpay script already loaded');
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // Create order on server (for production, this should be a backend API call)
  static async createOrder(orderData: PaymentData): Promise<{ id: string; amount: number; currency: string }> {
    try {
      console.log('Creating order with data:', orderData);
      
      // In production, this should call your backend API to create a Razorpay order
      // For now, we'll simulate order creation with enhanced logging
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const order = {
        id: orderId,
        amount: orderData.amount,
        currency: orderData.currency
      };
      
      console.log('Order created successfully:', order);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
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
      // Validate input parameters
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount. Amount must be greater than 0.');
      }

      if (!userData.name || !userData.email) {
        throw new Error('User name and email are required for payment.');
      }

      console.log('Initiating payment with params:', { amount, description, userData });
      
      // Validate environment
      if (typeof window === 'undefined') {
        throw new Error('Payment can only be initiated in browser environment');
      }

      // Validate API key
      if (!this.KEY_ID) {
        throw new Error('Razorpay API key not configured properly');
      }

      console.log('Using Razorpay Key ID:', this.KEY_ID);
      console.log('Environment:', process.env.NODE_ENV || 'development');

      // Load Razorpay script
      console.log('Loading Razorpay script...');
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script. Please check your internet connection.');
      }

      // Verify Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay is not available. Script may not have loaded properly.');
      }

      console.log('Razorpay script loaded, creating order...');

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

      console.log('Order created, setting up Razorpay options...');

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
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            onError({
              code: 'USER_CANCELLED',
              description: 'Payment cancelled by user',
              source: 'customer',
              step: 'payment_authentication',
              reason: 'user_cancelled'
            });
          }
        }
      };

      console.log('Creating Razorpay instance with options:', {
        ...options,
        key: `${options.key.substring(0, 8)}...` // Hide full key in logs
      });

      // Create Razorpay instance and open
      const rzp = new window.Razorpay(options);
      
      // Enhanced error handling
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed event:', response.error);
        onError(response.error);
      });

      // Add additional event listeners for debugging
      rzp.on('payment.submit', (response: any) => {
        console.log('Payment submitted:', response);
      });

      console.log('Opening Razorpay payment modal...');
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          rzp.open();
        } catch (openError) {
          console.error('Error opening Razorpay modal:', openError);
          onError({
            code: 'MODAL_OPEN_ERROR',
            description: 'Failed to open payment modal',
            source: 'business',
            step: 'payment_initialization',
            reason: 'modal_open_failed'
          });
        }
      }, 100);
      
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