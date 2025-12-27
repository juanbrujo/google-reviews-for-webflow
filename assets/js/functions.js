/**
 * Demo Page Functions
 * Logic specific to the landing page (theme toggle, endpoint normalization, etc.)
 * Demonstrates advanced widget API usage with callbacks and methods
 */

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('google-reviews-widget');
    
    if (!widget) return;
    
    // Normalize endpoint to absolute URL for cross-domain compatibility
    const endpoint = widget.dataset.endpoint || '/.netlify/functions/google-reviews';
    widget.dataset.endpoint = endpoint.startsWith('http') 
      ? endpoint 
      : new URL(endpoint, window.location.origin).toString();
    
    // Theme toggle with widget update API
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        const mode = e.target.value;
        
        // Get existing instance or create new one
        let instance = GoogleReviewsWidget.getInstance(widget);
        
        if (instance) {
          // Update existing instance
          widget.classList.remove('grw-dark', 'grw-light');
          widget.classList.add(`grw-${mode}`);
          instance.update({ mode });
        } else {
          // Fallback to legacy behavior
          widget.dataset.mode = mode;
          widget.classList.remove('grw-dark', 'grw-light');
          widget.classList.add(`grw-${mode}`);
        }
      });
    }
    
    // Example: Advanced API usage (uncomment to test)
    /*
    // Manual initialization with callbacks
    const widgetInstance = GoogleReviewsWidget.init('#google-reviews-widget', {
      endpoint: '/.netlify/functions/google-reviews',
      layout: 'carousel',
      mode: 'dark',
      max: 8,
      minRating: 4,
      beforeInit: (instance) => {
        console.log('Widget about to initialize', instance.getOptions());
      },
      created: (instance) => {
        console.log('Widget created successfully!', instance);
      }
    });
    
    // Update widget after 5 seconds
    setTimeout(() => {
      widgetInstance.update({ max: 5, minRating: 5 });
    }, 5000);
    
    // Destroy widget after 10 seconds
    setTimeout(() => {
      widgetInstance.destroy();
    }, 10000);
    */
  });
})();
