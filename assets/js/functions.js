/**
 * Demo Page Functions
 * Logic specific to the landing page (theme toggle, endpoint normalization, etc.)
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
    
    // Theme toggle for demo
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        const mode = e.target.value;
        widget.dataset.mode = mode;
        widget.classList.remove('grw-dark', 'grw-light');
        widget.classList.add(`grw-${mode}`);
      });
    }
  });
})();
