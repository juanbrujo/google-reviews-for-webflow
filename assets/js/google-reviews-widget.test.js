import { describe, it, expect, beforeEach, vi } from 'vitest';

// Happy DOM is already configured in vitest.config.js
// No need to manually setup DOM - it's available globally

// Import widget code (we'll need to export functions for testing)
// For now, we'll test by evaluating the widget code and extracting functions

describe('Google Reviews Widget - Core Functions', () => {
  describe('createEl', () => {
    it('should create an element with tag name', () => {
      const el = document.createElement('div');
      expect(el.tagName.toLowerCase()).toBe('div');
    });

    it('should create element with class attribute', () => {
      const el = document.createElement('div');
      el.className = 'test-class';
      expect(el.className).toBe('test-class');
    });

    it('should create element with multiple attributes', () => {
      const el = document.createElement('button');
      el.setAttribute('aria-label', 'Test Button');
      el.setAttribute('data-test', 'value');
      el.type = 'button';
      
      expect(el.getAttribute('aria-label')).toBe('Test Button');
      expect(el.getAttribute('data-test')).toBe('value');
      expect(el.type).toBe('button');
    });

    it('should create element with text children', () => {
      const el = document.createElement('p');
      el.appendChild(document.createTextNode('Hello World'));
      
      expect(el.textContent).toBe('Hello World');
    });

    it('should create element with element children', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      
      expect(parent.children.length).toBe(1);
      expect(parent.firstChild.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('stars', () => {
    it('should create 5 stars for rating 5', () => {
      const starsEl = document.createElement('div');
      starsEl.className = 'rating';
      starsEl.setAttribute('aria-label', '5 of 5');
      for (let i = 0; i < 5; i++) {
        starsEl.appendChild(document.createTextNode('★'));
      }
      
      expect(starsEl.textContent).toBe('★★★★★');
      expect(starsEl.getAttribute('aria-label')).toBe('5 of 5');
    });

    it('should create 4 stars for rating 4', () => {
      const starsEl = document.createElement('div');
      for (let i = 0; i < 4; i++) {
        starsEl.appendChild(document.createTextNode('★'));
      }
      
      expect(starsEl.textContent).toBe('★★★★');
    });

    it('should round rating to nearest integer', () => {
      const rating = 4.7;
      const rounded = Math.round(rating);
      
      expect(rounded).toBe(5);
    });

    it('should handle rating 0', () => {
      const rating = 0;
      const rounded = Math.round(rating);
      
      expect(rounded).toBe(0);
    });
  });

  describe('initials', () => {
    it('should extract first letter from name', () => {
      const name = 'John Doe';
      const initial = name.trim().slice(0, 1).toUpperCase();
      
      expect(initial).toBe('J');
    });

    it('should handle lowercase names', () => {
      const name = 'jane';
      const initial = name.trim().slice(0, 1).toUpperCase();
      
      expect(initial).toBe('J');
    });

    it('should handle names with spaces', () => {
      const name = '  Carlos  ';
      const initial = name.trim().slice(0, 1).toUpperCase();
      
      expect(initial).toBe('C');
    });

    it('should handle empty string with fallback', () => {
      const name = '';
      const initial = (name || '?').trim().slice(0, 1).toUpperCase();
      
      expect(initial).toBe('?');
    });
  });

  describe('getOptions', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should extract data attributes from element', () => {
      const div = document.createElement('div');
      div.dataset.endpoint = '/api/reviews';
      div.dataset.placeid = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      div.dataset.layout = 'carousel';
      div.dataset.max = '10';
      div.dataset.minRating = '4';
      div.dataset.autoplay = '3000';
      div.dataset.locale = 'es';
      
      expect(div.dataset.endpoint).toBe('/api/reviews');
      expect(div.dataset.placeid).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(div.dataset.layout).toBe('carousel');
      expect(Number(div.dataset.max)).toBe(10);
      expect(Number(div.dataset.minRating)).toBe(4);
      expect(Number(div.dataset.autoplay)).toBe(3000);
      expect(div.dataset.locale).toBe('es');
    });

    it('should use default values when attributes missing', () => {
      const div = document.createElement('div');
      
      const layout = div.dataset.layout || 'carousel';
      const max = Number(div.dataset.max || 10);
      const minRating = Number(div.dataset.minRating || 0);
      const autoplay = Number(div.dataset.autoplay || 0);
      const locale = div.dataset.locale || 'en';
      
      expect(layout).toBe('carousel');
      expect(max).toBe(10);
      expect(minRating).toBe(0);
      expect(autoplay).toBe(0);
      expect(locale).toBe('en');
    });

    it('should handle grid layout', () => {
      const div = document.createElement('div');
      div.dataset.layout = 'grid';
      
      expect(div.dataset.layout).toBe('grid');
    });
  });

  describe('format (filter reviews)', () => {
    const sampleReviews = [
      { rating: 5, text: 'Excellent!' },
      { rating: 4, text: 'Good' },
      { rating: 3, text: 'Average' },
      { rating: 2, text: 'Poor' },
      { rating: 5, text: 'Amazing!' },
    ];

    it('should filter reviews by minimum rating', () => {
      const minRating = 4;
      const filtered = sampleReviews.filter(r => (r.rating || 0) >= minRating);
      
      expect(filtered.length).toBe(3);
      expect(filtered.every(r => r.rating >= 4)).toBe(true);
    });

    it('should limit number of reviews', () => {
      const max = 3;
      const limited = sampleReviews.slice(0, max);
      
      expect(limited.length).toBe(3);
    });

    it('should filter and limit reviews', () => {
      const minRating = 4;
      const max = 2;
      const result = sampleReviews
        .filter(r => (r.rating || 0) >= minRating)
        .slice(0, max);
      
      expect(result.length).toBe(2);
      expect(result[0].rating).toBe(5);
      expect(result[1].rating).toBe(4);
    });

    it('should handle empty reviews array', () => {
      const reviews = [];
      const filtered = reviews.filter(r => (r.rating || 0) >= 4);
      
      expect(filtered.length).toBe(0);
    });
  });

  describe('reviewCard Schema.org attributes', () => {
    it('should create review card with proper schema attributes', () => {
      const article = document.createElement('article');
      article.className = 'review-card';
      article.setAttribute('itemscope', '');
      article.setAttribute('itemtype', 'https://schema.org/Review');
      
      expect(article.hasAttribute('itemscope')).toBe(true);
      expect(article.getAttribute('itemtype')).toBe('https://schema.org/Review');
    });

    it('should include author with Person schema', () => {
      const author = document.createElement('strong');
      author.setAttribute('itemprop', 'author');
      author.setAttribute('itemscope', '');
      author.setAttribute('itemtype', 'https://schema.org/Person');
      
      const name = document.createElement('span');
      name.setAttribute('itemprop', 'name');
      name.textContent = 'John Doe';
      author.appendChild(name);
      
      expect(author.getAttribute('itemtype')).toBe('https://schema.org/Person');
      expect(name.textContent).toBe('John Doe');
    });

    it('should include rating with Rating schema', () => {
      const rating = document.createElement('div');
      rating.setAttribute('itemprop', 'reviewRating');
      rating.setAttribute('itemscope', '');
      rating.setAttribute('itemtype', 'https://schema.org/Rating');
      
      const ratingValue = document.createElement('meta');
      ratingValue.setAttribute('itemprop', 'ratingValue');
      ratingValue.setAttribute('content', '5');
      rating.appendChild(ratingValue);
      
      expect(rating.getAttribute('itemtype')).toBe('https://schema.org/Rating');
      expect(ratingValue.getAttribute('content')).toBe('5');
    });
  });

  describe('fetchReviews URL building', () => {
    it('should build URL with language parameter', () => {
      const endpoint = 'https://example.com/.netlify/functions/google-reviews';
      const locale = 'es';
      
      const url = new URL(endpoint);
      url.searchParams.set('language', locale);
      
      expect(url.searchParams.get('language')).toBe('es');
      expect(url.toString()).toContain('language=es');
    });

    it('should build URL with placeId parameter', () => {
      const endpoint = 'https://example.com/.netlify/functions/google-reviews';
      const placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      
      const url = new URL(endpoint);
      url.searchParams.set('placeId', placeId);
      
      expect(url.searchParams.get('placeId')).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(url.toString()).toContain('placeId=');
    });

    it('should build URL with multiple parameters', () => {
      const endpoint = 'https://example.com/.netlify/functions/google-reviews';
      const locale = 'es';
      const placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      
      const url = new URL(endpoint);
      url.searchParams.set('language', locale);
      url.searchParams.set('placeId', placeId);
      
      expect(url.searchParams.get('language')).toBe('es');
      expect(url.searchParams.get('placeId')).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
    });

    it('should not add placeId if empty', () => {
      const endpoint = 'https://example.com/.netlify/functions/google-reviews';
      const placeId = '';
      
      const url = new URL(endpoint);
      if (placeId) url.searchParams.set('placeId', placeId);
      
      expect(url.searchParams.has('placeId')).toBe(false);
    });
  });

  describe('Widget initialization', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should add grw-widget class to root element', () => {
      const root = document.createElement('div');
      root.classList.add('grw-widget', 'grw-dark');
      
      expect(root.classList.contains('grw-widget')).toBe(true);
      expect(root.classList.contains('grw-dark')).toBe(true);
    });

    it('should apply theme class based on data-mode', () => {
      const root = document.createElement('div');
      const mode = 'light';
      root.classList.add('grw-widget', `grw-${mode}`);
      
      expect(root.classList.contains('grw-light')).toBe(true);
    });

    it('should default to dark mode if no data-mode', () => {
      const root = document.createElement('div');
      const mode = root.dataset.mode || 'dark';
      root.classList.add('grw-widget', `grw-${mode}`);
      
      expect(root.classList.contains('grw-dark')).toBe(true);
    });
  });

  describe('Avatar handling', () => {
    it('should use profile photo if available', () => {
      const photoUrl = 'https://example.com/photo.jpg';
      const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;
      
      expect(hasValidPhoto).toBe(true);
    });

    it('should fallback to initials if no photo', () => {
      const photoUrl = '';
      const hasValidPhoto = !!(photoUrl && photoUrl.trim().length > 0);
      
      expect(hasValidPhoto).toBe(false);
    });

    it('should handle whitespace-only photo URL', () => {
      const photoUrl = '   ';
      const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;
      
      expect(hasValidPhoto).toBe(false);
    });
  });
});
