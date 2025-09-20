'use client';

import { useState } from 'react';
import { RazorpayService } from '@/services/razorpay';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testPayment = async () => {
    setLoading(true);
    setStatus('Initializing payment...');

    try {
      await RazorpayService.initiatePayment(
        1, // ₹1 for testing
        'Test Payment - CSP Fix',
        {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        (response) => {
          setStatus(`✅ Payment Success: ${response.razorpay_payment_id}`);
          setLoading(false);
        },
        (error) => {
          setStatus(`❌ Payment Error: ${error.description || error.message || 'Unknown error'}`);
          setLoading(false);
        }
      );
    } catch (error: any) {
      setStatus(`❌ Initialization Error: ${error.message}`);
      setLoading(false);
    }
  };

  const checkRazorpayAvailability = async () => {
    setStatus('Checking Razorpay availability...');
    
    try {
      const scriptLoaded = await RazorpayService.loadRazorpayScript();
      if (scriptLoaded && typeof window !== 'undefined' && window.Razorpay) {
        setStatus('✅ Razorpay is available and working!');
      } else {
        setStatus('❌ Razorpay failed to load - likely CSP issue');
      }
    } catch (error: any) {
      setStatus(`❌ Error checking Razorpay: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Payment Gateway Test
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={checkRazorpayAvailability}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Check Razorpay Availability
          </button>

          <button
            onClick={testPayment}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Test Payment (₹1)'}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Status:</h3>
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Environment Info:</h3>
          <ul className="space-y-1">
            <li>Mode: {process.env.NODE_ENV}</li>
            <li>Razorpay Key: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 12)}...</li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p><strong>Note:</strong> This test page helps verify that the CSP changes allow Razorpay to load properly. If you see "This content is blocked" errors, the CSP needs further adjustment.</p>
        </div>
      </div>
    </div>
  );
}