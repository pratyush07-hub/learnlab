// Test Razorpay Environment Configuration
console.log('=== Razorpay Environment Test ===');

// Check environment variables
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const fallbackKeyId = 'rzp_live_RJvPF8jnUt43Yy';

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', razorpayKeyId ? 'Set' : 'Not set');
console.log('Using Key ID:', razorpayKeyId || fallbackKeyId);

// Test if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('Environment: Browser ✓');
  
  // Test Razorpay script loading
  const testScriptLoad = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log('Razorpay already available ✓');
        resolve(true);
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully ✓');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script ✗');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Run the test
  testScriptLoad().then((success) => {
    if (success) {
      console.log('=== Environment Test PASSED ===');
      console.log('Razorpay integration should work correctly!');
    } else {
      console.log('=== Environment Test FAILED ===');
      console.log('Check internet connection and firewall settings');
    }
  });
} else {
  console.log('Environment: Node.js (server-side)');
  console.log('Razorpay can only be tested in browser environment');
}

export {};