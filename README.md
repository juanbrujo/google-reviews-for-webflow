# Google Reviews Widget for Webflow | Free Open-Source Integration

> 🌟 **Free, responsive widget to embed Google Reviews in Webflow CMS sites**

Add authentic customer reviews from Google to your Webflow website with our lightweight, SEO-optimized widget. Features responsive carousel design, dark/light theming, and more. Perfect for Webflow CMS, Webflow Ecommerce, and static sites.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Netlify Status](https://img.shields.io/badge/Netlify-Ready-00C7B7?logo=netlify)
![Webflow Compatible](https://img.shields.io/badge/Webflow-Compatible-4353FF?logo=webflow)
![Tests](https://img.shields.io/badge/Tests-49%20passing-success)
![API Coverage](https://img.shields.io/badge/API%20Coverage-100%25-brightgreen)

🔗 [Live Demo](https://google-reviews-for-webflow.netlify.app/)

---

## 🎯 Features
- **Lightweight & Framework-free**: Vanilla HTML, CSS, and JavaScript (functional programming style)
- **Fully Decoupled Widget**: `google-reviews-widget.js` + `google-reviews-widget.css` work standalone
- **Secure Backend**: Netlify Function proxy prevents exposing your API key
- **Responsive Carousel**: 3 cards (desktop) → 2 (tablet) → 1 (mobile) with centered controls
- **Dark/Light Theming**: CSS custom properties enable easy theme switching with `data-mode` attribute
- **8px Grid System**: All spacing follows `calc(var(--space) * n)` for consistency
- **Avatar Support**: User profile photos with automatic fallback to initials
- **SEO-Optimized**: Schema.org microdata on every review card (Review, Rating, LocalBusiness schemas)
- **Rich Snippets Ready**: Google can display star ratings and review counts in search results
- **Structured Data**: JSON-LD + microdata for maximum search engine visibility
- **Fallback Data**: Sample reviews included for local development without API keys
- **Zero Dependencies**: No npm packages required; deploys instantly to Netlify

> 📊 **SEO Details**: Each review card includes Schema.org Review markup with author, rating, date, and body. The place header includes LocalBusiness and AggregateRating schemas.

### 🔎 SEO Features
- Review microdata on each card (`Review`, `Rating`, `datePublished`, `reviewBody`)
- Aggregate rating in header (`LocalBusiness` + `AggregateRating` with `ratingValue`, `reviewCount`)
- JSON-LD `SoftwareApplication` on the landing page for better discovery
- Open Graph + Twitter Cards for social sharing previews
- Eligible for Google Rich Results (stars and review counts)

## 🚀 Quick Start

### 1. Get Your Google API Key & Place ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable **Places API**
3. Create an **API Key** (restrict to places API for security)
4. Find your **Place ID** using [Places API Explorer](https://developers.google.com/maps/documentation/places/web-service/overview) and [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)

### 2. Deploy to Netlify
1. Push this repo to GitHub
2. Import site from GitHub in [Netlify Dashboard](https://app.netlify.com/)
3. Set environment variables in **Site Settings → Build & Deploy → Environment**:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   PLACE_ID=your_place_id_here
   REVIEWS_LANGUAGE=es
   ```
4. Deploy is automatic. Your function runs at `https://<your-site>.netlify.app/.netlify/functions/google-reviews`

### 3. Embed in Webflow
Add a **Code Embed** block in Webflow:

```html
<div id="google-reviews-widget"
     data-endpoint="https://<your-site>.netlify.app/.netlify/functions/google-reviews"
     data-placeid="ChIJN1t_tDeuEmsRUsoyG83frY4"
     data-layout="carousel"
     data-mode="dark">
</div>

<link rel="stylesheet" href="https://<your-site>.netlify.app/assets/css/google-reviews-widget.css">
<script src="https://<your-site>.netlify.app/assets/js/google-reviews-widget.js" defer></script>
```

Replace `<your-site>` with your actual Netlify domain.

## 📂 Project Structure
```
├── index.html                           # Landing page & demo with theme toggle
├── README.md                            # This file
├── LICENSE                              # MIT license
├── netlify.toml                         # Netlify configuration
├── .env.example                         # Environment variable template
├── AGENTS.md                            # Contribution roles
├── assets/
│   ├── css/
│   │   ├── styles.css                  # Demo page styles (8px grid, smooth scroll)
│   │   └── google-reviews-widget.css   # Widget styles (scoped .grw-widget, themes)
│   ├── js/
│   │   ├── google-reviews-widget.js    # Widget standalone code (framework-free)
│   │   └── functions.js                # Demo-specific logic (theme toggle)
│   └── img/
│       ├── favicon.svg                 # SVG favicon
│       └── og-image.png                # Open Graph preview image
└── netlify/
    └── functions/
        └── google-reviews.js           # Google Places API proxy (Node.js)
```

## ⚙️ Configuration

### Widget Initialization

#### Auto-Initialization (Default)
The widget automatically initializes on `DOMContentLoaded`:

```html
<div id="google-reviews-widget"
     data-endpoint="/.netlify/functions/google-reviews"
     data-layout="carousel"
     data-mode="dark">
</div>
```

To disable auto-init:
```html
<div id="google-reviews-widget" data-auto-init="false"></div>
```

#### Manual Initialization with Callbacks
Use the JavaScript API for advanced control:

```javascript
const widget = GoogleReviewsWidget.init('#google-reviews-widget', {
  endpoint: '/.netlify/functions/google-reviews',
  layout: 'carousel',
  mode: 'dark',
  max: 10,
  minRating: 4,
  
  // Callback before initialization
  beforeInit: (instance) => {
    console.log('Widget initializing...');
  },
  
  // Callback after reviews loaded
  created: (instance) => {
    console.log('Widget ready!');
  }
});

// Update widget dynamically
widget.update({ minRating: 5, max: 5 });

// Destroy widget
widget.destroy();
```

📖 **[Complete API Documentation](docs/API.md)** - Learn about all methods, callbacks, and advanced usage

### Data Attributes

### Data Attributes (HTML)
Add these to your widget `<div>`:

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-endpoint` | URL | (required) | Backend endpoint URL |
| `data-placeid` | string | (optional) | Google Place ID (overrides env PLACE_ID) |
| `data-layout` | `carousel`, `grid` | `carousel` | Display layout |
| `data-mode` | `dark`, `light` | `light` | Theme mode |
| `data-max` | number | `10` | Max reviews to display |
| `data-min-rating` | 1–5 | `4` | Minimum star rating filter |
| `data-autoplay` | ms (0 = disabled) | `0` | Carousel autoplay delay |
| `data-locale` | BCP-47 tag | `es` | Language code (passed to API) |

### Environment Variables (Netlify)
Set these in your Netlify site settings:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_PLACES_API_KEY` | ✅ Yes | — | Your Google Places API key |
| `PLACE_ID` | ❌ Optional | — | Default Google Place ID (fallback if `data-placeid` not set) |
| `REVIEWS_LANGUAGE` | ❌ Optional | `en` | Language code (overridden by `data-locale` if set) |

**Note:** The backend returns all available reviews from Google Places. Apply display limits and filters client-side using `data-max` and `data-min-rating` (the backend does not enforce a limit).

## 🎨 Theming

Widget uses CSS custom properties for colors. Switch themes by changing `data-mode`:

```html
<!-- Dark theme (default) -->
<div id="google-reviews-widget" data-mode="dark"></div>

<!-- Light theme -->
<div id="google-reviews-widget" data-mode="light"></div>
```

Or toggle dynamically:
```js
document.getElementById('google-reviews-widget').setAttribute('data-mode', 'light');
```

CSS variables available in `google-reviews-widget.css`:
- `--grw-space`: 8px (base unit)
- `--grw-bg`: Background color
- `--grw-text`: Text color
- `--grw-card-bg`: Card background
- `--grw-rating`: Star color
- `--grw-muted`: Muted text
- `--grw-border`: Border color
- `--grw-card-height`: 240px

## 📝 Local Development

```bash
# Install Netlify CLI (optional)
npm install -g netlify-cli

# Run local dev server with live functions
netlify dev

# Visit http://localhost:8888
```

Visit `index.html` in browser to see the demo with sample data.

## 🧪 Testing

```bash
# Run all tests (49 tests: 33 widget + 16 API)
npm test

# Watch mode for development
npm run test:watch

# Interactive UI
npm run test:ui

# Coverage report (API: 100%)
npm run test:coverage
```

**Test Coverage:**
- ✅ **49 tests passing**
- ✅ **API: 100%** coverage (statements, functions, branches)
- ✅ Widget: Core logic validated (IIFE architecture)

## 🔒 Security

- **API Key Protection**: Your Google API Key is never exposed to the client. All requests go through the Netlify Function backend.
- **Function Proxy**: `netlify/functions/google-reviews.js` handles API calls server-side.
- **Environment Variables**: Sensitive config is stored in Netlify, not in code.

## 📊 API Response

The widget fetches from your endpoint and expects JSON like:

```json
{
  "meta": {
    "source": "google_places",
    "timestamp": "2025-12-26T10:30:00Z"
  },
  "place": {
    "name": "Business Name",
    "rating": 4.8,
    "review_count": 245
  },
  "reviews": [
    {
      "author_name": "John Doe",
      "rating": 5,
      "text": "Great service!",
      "time": 1703592600,
      "profile_photo_url": "https://..."
    }
  ]
}
```

## 🎯 Browser Support
- Chrome, Edge, Firefox, Safari (modern versions)
- Mobile: iOS Safari 12+, Chrome on Android
- Uses CSS Grid, CSS custom properties, and ES6

## 🤝 Contributing
See [AGENTS.md](AGENTS.md) for roles and contribution guidelines.

**Tips**:
- Keep JavaScript functional (no classes, prefer helper functions)
- No heavy dependencies; vanilla JS only
- Test responsive behavior at 320px, 768px, 1024px widths
- Respect Google Places API quotas

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Google Reviews for Webflow Contributors**

This project is open source and free to use, modify, and distribute under the MIT license terms.
