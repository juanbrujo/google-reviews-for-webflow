import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler } from '../netlify/functions/google-reviews.js';

describe('Google Reviews API Function', () => {
  beforeEach(() => {
    // Reset environment variables
    vi.stubEnv('GOOGLE_PLACES_API_KEY', '');
    vi.stubEnv('PLACE_ID', '');
    vi.stubEnv('REVIEWS_LANGUAGE', 'en');
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('CORS Headers', () => {
    it('should handle OPTIONS preflight request', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
      expect(response.body).toBe('');
    });

    it('should include CORS headers in GET response', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', '');
      
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('Sample Data Fallback', () => {
    it('should return sample data when no API key is configured', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', '');
      vi.stubEnv('PLACE_ID', 'fallback-place-id'); // Need placeId even for sample
      
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(body.meta.source).toBe('sample');
      expect(body.place).toBeDefined();
      expect(body.place.name).toBe('Sample Coffee House');
      expect(body.reviews).toBeDefined();
      expect(Array.isArray(body.reviews)).toBe(true);
    });
  });

  describe('Query Parameters', () => {
    it('should use placeId from query string if provided', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'default-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test Place',
            formatted_address: '123 Test St',
            rating: 4.5,
            user_ratings_total: 100,
            reviews: [
              {
                author_name: 'Test User',
                rating: 5,
                text: 'Great!',
                relative_time_description: '1 day ago',
                time: 1234567890,
                profile_photo_url: 'https://example.com/photo.jpg',
              },
            ],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          placeId: 'custom-place-id',
          language: 'es',
        },
      };

      await handler(event);

      expect(global.fetch).toHaveBeenCalled();
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('place_id=custom-place-id');
    });

    it('should use default PLACE_ID from env when not in query', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'default-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test Place',
            rating: 4.5,
            reviews: [],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      await handler(event);

      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('place_id=default-place-id');
    });

    it('should use language from query string', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test',
            rating: 4,
            reviews: [],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          language: 'es',
        },
      };

      await handler(event);

      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('language=es');
    });

    it('should return 400 if placeId is missing', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', '');

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Missing placeId');
    });
  });

  describe('Google Places API Integration', () => {
    it('should successfully fetch and transform reviews', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Amazing Coffee Shop',
            formatted_address: '456 Main St, City',
            rating: 4.8,
            user_ratings_total: 250,
            reviews: [
              {
                author_name: 'Jane Doe',
                rating: 5,
                text: 'Excellent service!',
                relative_time_description: '2 days ago',
                time: 1703000000,
                profile_photo_url: 'https://example.com/jane.jpg',
              },
              {
                author_name: 'John Smith',
                rating: 4,
                text: 'Good coffee',
                relative_time_description: '1 week ago',
                time: 1702000000,
                profile_photo_url: '',
              },
            ],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Cache-Control']).toBe('public, max-age=600');

      const body = JSON.parse(response.body);
      expect(body.meta.source).toBe('google-places');
      expect(body.place.name).toBe('Amazing Coffee Shop');
      expect(body.place.rating).toBe(4.8);
      expect(body.reviews).toHaveLength(2);
      expect(body.reviews[0].author_name).toBe('Jane Doe');
      expect(body.reviews[0].rating).toBe(5);
    });

    it('should handle Google API errors', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'INVALID_REQUEST',
          error_message: 'Invalid place ID',
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(502);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('INVALID_REQUEST');
      expect(body.details).toBe('Invalid place ID');
    });

    it('should handle network errors', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('upstream_error');
      expect(body.message).toBe('Network failure');
    });

    it('should handle HTTP error responses', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: false,
        status: 403,
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('upstream_error');
    });
  });

  describe('Reviews Mapping', () => {
    it('should map all review fields correctly', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test Place',
            rating: 5,
            reviews: [
              {
                author_name: 'Test Author',
                rating: 5,
                text: 'Test review text',
                relative_time_description: '1 day ago',
                time: 1234567890,
                profile_photo_url: 'https://example.com/photo.jpg',
                extra_field: 'should be filtered out',
              },
            ],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(body.reviews[0]).toEqual({
        author_name: 'Test Author',
        rating: 5,
        text: 'Test review text',
        relative_time_description: '1 day ago',
        time: 1234567890,
        profile_photo_url: 'https://example.com/photo.jpg',
      });
      expect(body.reviews[0].extra_field).toBeUndefined();
    });

    it('should handle empty reviews array', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test Place',
            rating: 4.5,
            reviews: [],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(body.reviews).toEqual([]);
    });

    it('should handle missing reviews field', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test Place',
            rating: 4.5,
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(body.reviews).toEqual([]);
    });
  });

  describe('Environment Variables', () => {
    it('should use REVIEWS_LANGUAGE from env as default', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');
      vi.stubEnv('REVIEWS_LANGUAGE', 'fr');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test',
            rating: 4,
            reviews: [],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      await handler(event);

      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('language=fr');
    });

    it('should override REVIEWS_LANGUAGE with query param', async () => {
      vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-api-key');
      vi.stubEnv('PLACE_ID', 'test-place-id');
      vi.stubEnv('REVIEWS_LANGUAGE', 'fr');

      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: {
            name: 'Test',
            rating: 4,
            reviews: [],
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          language: 'es',
        },
      };

      await handler(event);

      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('language=es');
    });
  });
});
