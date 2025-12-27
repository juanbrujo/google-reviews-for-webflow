# Widget API Documentation

## Auto-Initialization (Default)

The widget auto-initializes on `DOMContentLoaded` by default:

```html
<div id="google-reviews-widget"
     data-endpoint="/.netlify/functions/google-reviews"
     data-layout="carousel"
     data-mode="dark"
     data-max="10"
     data-min-rating="4"
     data-autoplay="3000"
     data-locale="en">
</div>
```

To disable auto-initialization:

```html
<div id="google-reviews-widget" data-auto-init="false"></div>
```

## Manual Initialization

### Basic Usage

```javascript
const widget = GoogleReviewsWidget.init('#google-reviews-widget', {
  endpoint: '/.netlify/functions/google-reviews',
  layout: 'carousel',
  mode: 'dark',
  max: 10,
  minRating: 4,
  autoplay: 3000,
  locale: 'en'
});
```

### With Callbacks

```javascript
const widget = GoogleReviewsWidget.init('#google-reviews-widget', {
  endpoint: '/.netlify/functions/google-reviews',
  layout: 'carousel',
  mode: 'dark',
  
  // Called before widget initialization
  beforeInit: (instance) => {
    console.log('About to initialize with options:', instance.getOptions());
    // Perform any pre-init logic here
  },
  
  // Called after reviews are loaded and rendered
  created: (instance) => {
    console.log('Widget created successfully!');
    // Add custom logic after widget is ready
  }
});
```

## Instance Methods

### `init()`

Initialize the widget:

```javascript
const instance = GoogleReviewsWidget.create('#my-widget', options);
instance.init();
```

### `update(newOptions)`

Update widget options and re-render:

```javascript
// Change to show only 5-star reviews
widget.update({ minRating: 5, max: 5 });

// Switch to grid layout
widget.update({ layout: 'grid' });

// Change language
widget.update({ locale: 'es' });
```

### `destroy()`

Remove widget and clean up:

```javascript
widget.destroy();
```

### `getOptions()`

Get current widget options:

```javascript
const options = widget.getOptions();
console.log(options);
```

## Static Methods

### `GoogleReviewsWidget.init(element, options)`

Create and initialize a new widget instance:

```javascript
const widget = GoogleReviewsWidget.init('#my-widget', {
  endpoint: '/.netlify/functions/google-reviews',
  mode: 'dark'
});
```

### `GoogleReviewsWidget.create(element, options)`

Create instance without initializing (useful for deferred init):

```javascript
const widget = GoogleReviewsWidget.create('#my-widget', options);
// Do something else...
widget.init();
```

### `GoogleReviewsWidget.getInstance(element)`

Get existing widget instance:

```javascript
const widget = GoogleReviewsWidget.getInstance('#my-widget');
if (widget) {
  widget.update({ mode: 'light' });
}
```

### `GoogleReviewsWidget.destroyAll()`

Destroy all widget instances:

```javascript
GoogleReviewsWidget.destroyAll();
```

## Callbacks

### `beforeInit(instance)`

Called before widget initialization. Receives the widget instance.

```javascript
beforeInit: (instance) => {
  console.log('Initializing with:', instance.getOptions());
  // Add loading spinner
  instance.element.classList.add('is-loading');
}
```

### `created(instance)`

Called after reviews are successfully loaded and rendered. Receives the widget instance.

```javascript
created: (instance) => {
  console.log('Widget ready!');
  // Remove loading spinner
  instance.element.classList.remove('is-loading');
  
  // Track analytics
  gtag('event', 'widget_loaded', {
    reviews_count: instance.getOptions().max
  });
}
```

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | String | - | API endpoint URL (required) |
| `placeId` | String | `""` | Google Place ID (overrides env var) |
| `layout` | String | `"carousel"` | Layout type: `carousel` or `grid` |
| `mode` | String | `"dark"` | Theme: `dark` or `light` |
| `max` | Number | `10` | Maximum number of reviews to display |
| `minRating` | Number | `0` | Minimum rating filter (0-5) |
| `autoplay` | Number | `0` | Carousel autoplay delay in ms (0 = disabled) |
| `locale` | String | `"en"` | Language code (BCP-47) |
| `beforeInit` | Function | `null` | Callback before initialization |
| `created` | Function | `null` | Callback after successful render |

## Advanced Examples

### Dynamic Multi-Location Widget

```javascript
// Load reviews for different locations
const locations = [
  { id: 'ChIJ...', name: 'Downtown Branch' },
  { id: 'ChIK...', name: 'Airport Branch' }
];

let currentIndex = 0;
const widget = GoogleReviewsWidget.init('#reviews', {
  endpoint: '/.netlify/functions/google-reviews',
  placeId: locations[0].id,
  created: (instance) => {
    console.log(`Loaded: ${locations[currentIndex].name}`);
  }
});

// Switch location every 10 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % locations.length;
  widget.update({ placeId: locations[currentIndex].id });
}, 10000);
```

### Conditional Rendering Based on Data

```javascript
const widget = GoogleReviewsWidget.init('#reviews', {
  endpoint: '/.netlify/functions/google-reviews',
  beforeInit: (instance) => {
    // Show loading state
    document.querySelector('#loading').style.display = 'block';
  },
  created: (instance) => {
    // Hide loading, show widget
    document.querySelector('#loading').style.display = 'none';
    
    // Show different message based on reviews
    const options = instance.getOptions();
    if (options.max < 5) {
      console.warn('Limited reviews available');
    }
  }
});
```

### Theme Switcher

```javascript
const widget = GoogleReviewsWidget.init('#reviews', {
  endpoint: '/.netlify/functions/google-reviews',
  mode: 'dark'
});

document.querySelector('#theme-toggle').addEventListener('click', () => {
  const currentMode = widget.getOptions().mode;
  const newMode = currentMode === 'dark' ? 'light' : 'dark';
  
  widget.element.classList.remove(`grw-${currentMode}`);
  widget.element.classList.add(`grw-${newMode}`);
  widget.update({ mode: newMode });
});
```

### Programmatic Filtering

```javascript
const widget = GoogleReviewsWidget.init('#reviews', {
  endpoint: '/.netlify/functions/google-reviews',
  max: 10,
  minRating: 0
});

// Show only 5-star reviews
document.querySelector('#filter-5-star').addEventListener('click', () => {
  widget.update({ minRating: 5 });
});

// Show all reviews
document.querySelector('#show-all').addEventListener('click', () => {
  widget.update({ minRating: 0 });
});
```

## Security

After successful initialization, all `data-*` attributes are automatically removed from the widget element for security. Options are stored internally in the instance.

## Error Handling

```javascript
try {
  const widget = GoogleReviewsWidget.init('#missing-element', options);
} catch (error) {
  console.error('Widget initialization failed:', error.message);
}

// Check if destroyed before updating
const widget = GoogleReviewsWidget.getInstance('#my-widget');
if (widget && !widget.isDestroyed) {
  widget.update({ max: 5 });
}
```

## Legacy Support

The previous API is still supported for backward compatibility:

```javascript
// Old way (still works)
GoogleReviewsWidget.initWidget(element);
GoogleReviewsWidget.render(element);
```
