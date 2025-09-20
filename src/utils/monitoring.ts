// Production Monitoring and Analytics
export class ProductionMonitoring {
  private static isProduction = process.env.NODE_ENV === 'production';

  // Performance monitoring
  static trackPageLoad() {
    if (!this.isProduction || typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      console.log('Page Load Time:', loadTime + 'ms');
      
      // Send to analytics
      this.sendMetric('page_load_time', loadTime);
    });
  }

  // User interaction tracking
  static trackUserAction(action: string, category: string, label?: string, value?: number) {
    if (!this.isProduction) return;

    console.log('User Action:', { action, category, label, value });
    
    // Google Analytics 4 tracking (if implemented)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  // Payment tracking
  static trackPaymentEvent(event: 'payment_initiated' | 'payment_success' | 'payment_failed', data: any) {
    if (!this.isProduction) return;

    console.log('Payment Event:', event, data);
    
    // Track payment events
    this.trackUserAction(event, 'payment', data.program_title, data.amount);
    
    // Send to backend for business analytics
    this.sendBusinessMetric(event, data);
  }

  // Error tracking
  static trackError(error: Error, context?: string) {
    if (!this.isProduction) return;

    console.error('Tracked Error:', error, context);
    
    // Send error to monitoring service
    // This would integrate with services like Sentry, LogRocket, etc.
  }

  // Performance metrics
  static trackPerformance(metricName: string, value: number) {
    if (!this.isProduction) return;

    console.log('Performance Metric:', metricName, value);
    
    // Send to analytics
    this.sendMetric(metricName, value);
  }

  // Feature usage tracking
  static trackFeatureUsage(feature: string, action: string) {
    if (!this.isProduction) return;

    this.trackUserAction(action, 'feature_usage', feature);
  }

  // Business metrics
  private static sendBusinessMetric(event: string, data: any) {
    // This would send to your backend analytics API
    // fetch('/api/analytics/business', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     event,
    //     data,
    //     timestamp: new Date().toISOString()
    //   })
    // });
  }

  // Technical metrics
  private static sendMetric(name: string, value: number) {
    // This would send to your monitoring service
    // fetch('/api/analytics/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name,
    //     value,
    //     timestamp: new Date().toISOString()
    //   })
    // });
  }

  // Initialize monitoring
  static initialize() {
    if (!this.isProduction) return;

    this.trackPageLoad();

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), 'unhandled_error');
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'unhandled_promise');
    });

    console.log('Production monitoring initialized');
  }
}

// Usage tracking hooks
export const useProductionTracking = () => {
  const trackAction = (action: string, category: string, label?: string, value?: number) => {
    ProductionMonitoring.trackUserAction(action, category, label, value);
  };

  const trackPayment = (event: 'payment_initiated' | 'payment_success' | 'payment_failed', data: any) => {
    ProductionMonitoring.trackPaymentEvent(event, data);
  };

  const trackFeature = (feature: string, action: string) => {
    ProductionMonitoring.trackFeatureUsage(feature, action);
  };

  return { trackAction, trackPayment, trackFeature };
};