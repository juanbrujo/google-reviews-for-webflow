/* Netlify Function proxy for Google Places Reviews */

const SAMPLE = {
  place: {
    name: "Sample Coffee House",
    formatted_address: "123 Demo St, Webflow City",
    rating: 4.8,
    user_ratings_total: 128,
  },
  reviews: [
    {
      author_name: "Jane Doe",
      rating: 5,
      text: "Great vibe and fast Wi‑Fi.",
      relative_time_description: "2 days ago",
      time: Math.floor(Date.now() / 1000),
      profile_photo_url: "",
    },
    {
      author_name: "Carlos Pérez",
      rating: 4,
      text: "Excelente café y atención.",
      relative_time_description: "1 week ago",
      time: Math.floor(Date.now() / 1000) - 86400 * 7,
      profile_photo_url: "",
    },
  ],
};

const withDefault = (value, fallback) => (value === undefined || value === null || value === "" ? fallback : value);

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const defaultPlaceId = process.env.PLACE_ID;
  const qs = new URLSearchParams(event.queryStringParameters || {});

  const placeId = withDefault(qs.get("placeId"), defaultPlaceId);
  const language = withDefault(qs.get("language"), process.env.REVIEWS_LANGUAGE || "en");

  if (!placeId) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({ error: "Missing placeId" }),
    };
  }

  // If no API key is configured, serve sample data for demos.
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({
        meta: { source: "sample", fetchedAt: new Date().toISOString() },
        ...SAMPLE,
      }),
    };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total,reviews");
  url.searchParams.set("language", language);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google API responded ${response.status}`);
    }
    const payload = await response.json();

    if (payload.status !== "OK") {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        body: JSON.stringify({ error: payload.status, details: payload.error_message || null }),
      };
    }

    const rawReviews = Array.isArray(payload.result.reviews) ? payload.result.reviews : [];
    const limitParam = Number(qs.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : rawReviews.length;
    const reviews = rawReviews
      .slice(0, limit)
      .map(({ author_name, rating, text, relative_time_description, time, profile_photo_url }) => ({
        author_name,
        rating,
        text,
        relative_time_description,
        time,
        profile_photo_url,
      }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600",
        ...corsHeaders,
      },
      body: JSON.stringify({
        meta: { source: "google-places", fetchedAt: new Date().toISOString() },
        place: {
          name: payload.result.name,
          formatted_address: payload.result.formatted_address,
          rating: payload.result.rating,
          user_ratings_total: payload.result.user_ratings_total,
        },
        reviews,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({ error: "upstream_error", message: error.message }),
    };
  }
};
