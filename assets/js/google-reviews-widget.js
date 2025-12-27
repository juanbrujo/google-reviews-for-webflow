/**
 * Google Reviews Widget - Standalone JavaScript
 * Zero dependencies, framework-agnostic, works anywhere.
 * https://github.com/juanbrujo/google-reviews-for-webflow
 * 
 * Usage (Auto-init):
 * <div id="google-reviews-widget"
 *      data-endpoint="/.netlify/functions/google-reviews"
 *      data-layout="carousel"
 *      data-mode="dark"
 *      data-max="10"
 *      data-min-rating="4"
 *      data-autoplay="0"
 *      data-locale="en">
 * </div>
 * <link rel="stylesheet" href="google-reviews-widget.css">
 * <script src="google-reviews-widget.js" defer></script>
 * 
 * Usage (Manual):
 * const widget = GoogleReviewsWidget.init('#my-widget', {
 *   endpoint: '/.netlify/functions/google-reviews',
 *   layout: 'carousel',
 *   mode: 'dark',
 *   beforeInit: (instance) => console.log('Before init', instance),
 *   created: (instance) => console.log('Created', instance)
 * });
 * 
 * widget.update({ max: 5, minRating: 5 });
 * widget.destroy();
 */

(() => {
  // Widget instances registry
  const instances = new Map();
  // Sample data fallback
  const sample = {
    place: {
      name: "Sample Coffee House",
      formatted_address: "123 Demo St, Webflow City",
      rating: 4.8,
      user_ratings_total: 245,
    },
    reviews: [
      { author_name: "Jane Doe", rating: 5, text: "Great vibe and fast Wi‑Fi. Perfect spot for remote work. The baristas are super friendly and remember your order!", relative_time_description: "2 days ago", time: Math.floor(Date.now() / 1000), profile_photo_url: "" },
      { author_name: "Carlos Pérez", rating: 4, text: "Excelente café y atención. El ambiente es muy acogedor y la música está a buen volumen.", relative_time_description: "1 week ago", time: Math.floor(Date.now() / 1000) - 86400 * 7, profile_photo_url: "" },
      { author_name: "Alicia", rating: 5, text: "Café tostado perfecto y música suave. Me encanta venir aquí los fines de semana para relajarme con un libro.", relative_time_description: "3 weeks ago", time: Math.floor(Date.now() / 1000) - 86400 * 21, profile_photo_url: "" },
      { author_name: "Michael Chen", rating: 5, text: "Best latte in town! The presentation is beautiful and the taste is even better. Highly recommend the vanilla bean latte.", relative_time_description: "1 month ago", time: Math.floor(Date.now() / 1000) - 86400 * 30, profile_photo_url: "" },
      { author_name: "Sofia Martinez", rating: 5, text: "Amazing pastries and excellent coffee. The croissants are fresh every morning and the cappuccino is perfectly balanced.", relative_time_description: "1 month ago", time: Math.floor(Date.now() / 1000) - 86400 * 32, profile_photo_url: "" },
      { author_name: "David Kim", rating: 4, text: "Great atmosphere for meetings. The space is well-designed with comfortable seating and good lighting. Wi-Fi is reliable too.", relative_time_description: "2 months ago", time: Math.floor(Date.now() / 1000) - 86400 * 60, profile_photo_url: "" },
      { author_name: "Emma Thompson", rating: 5, text: "My favorite coffee shop in the city! The staff is always welcoming and the coffee quality is consistently excellent.", relative_time_description: "2 months ago", time: Math.floor(Date.now() / 1000) - 86400 * 65, profile_photo_url: "" },
      { author_name: "Luis Rodriguez", rating: 5, text: "Increíble servicio y café delicioso. El espresso es fuerte como me gusta y los precios son muy razonables.", relative_time_description: "3 months ago", time: Math.floor(Date.now() / 1000) - 86400 * 90, profile_photo_url: "" },
    ],
  };

  // Utilities
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  
  const createEl = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") el.className = v;
      else if (k.startsWith("aria-") || k.startsWith("data-") || k === "itemscope" || k === "itemtype" || k === "itemprop" || k === "content") {
        el.setAttribute(k, v);
      }
      else el[k] = v;
    });
    children.forEach((child) => (typeof child === "string" ? el.appendChild(document.createTextNode(child)) : el.appendChild(child)));
    return el;
  };

  const getOptions = (root) => ({
    endpoint: root.dataset.endpoint,
    placeId: root.dataset.placeid || "",
    layout: root.dataset.layout || "carousel",
    max: Number(root.dataset.max || 10),
    minRating: Number(root.dataset.minRating || 0),
    autoplay: Number(root.dataset.autoplay || 0),
    locale: root.dataset.locale || "en",
  });

  const stars = (rating) => {
    const rounded = Math.round(rating);
    return createEl("div", { class: "rating", "aria-label": `${rating} of 5` }, Array.from({ length: rounded }).map(() => "★"));
  };

  const initials = (name = "?") => name.trim().slice(0, 1).toUpperCase();

  // Review Card with Schema.org microdata
  const reviewCard = (review) => {
    const hasValidPhoto = review.profile_photo_url && review.profile_photo_url.trim().length > 0;
    const avatarAttrs = { class: "avatar", "aria-hidden": "true" };
    if (hasValidPhoto) {
      avatarAttrs.style = `background-image: url('${review.profile_photo_url}');`;
      avatarAttrs.class = "avatar has-photo";
    } else {
      avatarAttrs.class = "avatar no-photo";
    }
    const avatarContent = hasValidPhoto ? [] : [initials(review.author_name)];
    const avatar = createEl("div", avatarAttrs, avatarContent);
    
    // Fallback to initials if image fails to load
    if (hasValidPhoto) {
      const img = new Image();
      img.onerror = () => {
        avatar.classList.remove('has-photo');
        avatar.classList.add('no-photo');
        avatar.textContent = initials(review.author_name);
      };
      img.src = review.profile_photo_url;
    }
    
    // Schema.org markup for rich snippets
    const authorName = createEl("strong", { itemprop: "author", itemscope: "", itemtype: "https://schema.org/Person" }, [
      createEl("span", { itemprop: "name" }, [review.author_name])
    ]);
    const timeEl = createEl("div", { class: "meta" }, [review.relative_time_description || ""]);
    if (review.time) {
      const isoDate = new Date(review.time * 1000).toISOString();
      timeEl.setAttribute("itemprop", "datePublished");
      timeEl.setAttribute("content", isoDate);
    }
    
    const ratingValue = createEl("meta", { itemprop: "ratingValue", content: String(review.rating || 0) });
    const ratingEl = stars(review.rating || 0);
    ratingEl.setAttribute("itemprop", "reviewRating");
    ratingEl.setAttribute("itemscope", "");
    ratingEl.setAttribute("itemtype", "https://schema.org/Rating");
    ratingEl.appendChild(ratingValue);
    ratingEl.appendChild(createEl("meta", { itemprop: "bestRating", content: "5" }));
    ratingEl.appendChild(createEl("meta", { itemprop: "worstRating", content: "1" }));
    
    const header = createEl("div", { class: "review-header" }, [avatar, createEl("div", {}, [authorName, timeEl]), ratingEl]);
    const body = createEl("p", { class: "review-text", itemprop: "reviewBody" }, [review.text || ""]);
    
    const card = createEl("article", { 
      class: "review-card",
      itemscope: "",
      itemtype: "https://schema.org/Review",
      "aria-label": `Review by ${review.author_name}`
    }, [header, body]);
    
    return card;
  };

  // Place Header with Schema.org microdata
  const placeHeader = (place) => {
    if (!place) return null;
    
    const name = createEl("strong", { itemprop: "name" }, [place.name || ""]);
    const ratingText = place.rating ? `${Number(place.rating).toFixed(1)} / 5` : "";
    const meta = createEl("span", { class: "meta" }, [ratingText]);
    
    // Schema.org rating
    const ratingEl = stars(place.rating || 0);
    ratingEl.setAttribute("itemprop", "aggregateRating");
    ratingEl.setAttribute("itemscope", "");
    ratingEl.setAttribute("itemtype", "https://schema.org/AggregateRating");
    const ratingValue = createEl("meta", { itemprop: "ratingValue", content: String(place.rating || 0) });
    const reviewCount = createEl("meta", { itemprop: "reviewCount", content: String(place.user_ratings_total || 0) });
    const bestRating = createEl("meta", { itemprop: "bestRating", content: "5" });
    ratingEl.appendChild(ratingValue);
    ratingEl.appendChild(reviewCount);
    ratingEl.appendChild(bestRating);
    
    const wrap = createEl("div", { 
      class: "place-header",
      itemscope: "",
      itemtype: "https://schema.org/LocalBusiness",
      "aria-label": "Place information" 
    }, [name, ratingEl, meta]);
    
    return wrap;
  };

  // Grid Layout
  const renderGrid = (root, place, reviews) => {
    const grid = createEl("div", { class: "review-grid", "data-count": String(reviews.length) }, reviews.map(reviewCard));
    root.innerHTML = "";
    const header = placeHeader(place);
    if (header) root.appendChild(header);
    root.appendChild(grid);
  };

  // Carousel Layout with circular scrolling
  const renderCarousel = (root, place, reviews, autoplayMs) => {
    const track = createEl("div", { class: "carousel-track", role: "list", "data-count": String(reviews.length) }, reviews.map((r) => createEl("div", { role: "listitem" }, [reviewCard(r)])));
    const prev = createEl("button", { type: "button", class: "carousel-btn prev", "aria-label": "Previous" }, ["◀"]);
    const next = createEl("button", { type: "button", class: "carousel-btn next", "aria-label": "Next" }, ["▶"]);

    const scrollByCard = (dir) => () => {
      const card = track.firstElementChild?.firstElementChild;
      const delta = (card?.getBoundingClientRect().width || 260) + 12;
      const maxScroll = track.scrollWidth - track.clientWidth;
      
      if (dir > 0 && track.scrollLeft >= maxScroll - 5) {
        // Loop to beginning
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else if (dir < 0 && track.scrollLeft <= 5) {
        // Loop to end
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        track.scrollBy({ left: dir * delta, behavior: "smooth" });
      }
    };

    prev.addEventListener("click", scrollByCard(-1));
    next.addEventListener("click", scrollByCard(1));

    const carousel = createEl("div", { class: "carousel" }, [track, prev, next]);

    root.innerHTML = "";
    const header = placeHeader(place);
    if (header) root.appendChild(header);
    root.appendChild(carousel);

    // Toggle navigation visibility based on scroll availability
    const updateNavVisibility = () => {
      const hasScroll = track.scrollWidth > track.clientWidth;
      prev.style.display = hasScroll ? "" : "none";
      next.style.display = hasScroll ? "" : "none";
    };
    
    // Check on load and resize
    setTimeout(updateNavVisibility, 100);
    window.addEventListener("resize", updateNavVisibility);

    // Auto-play with pause on hover
    if (autoplayMs > 0) {
      let id = setInterval(scrollByCard(1), autoplayMs);
      carousel.addEventListener("mouseenter", () => clearInterval(id));
      carousel.addEventListener("mouseleave", () => (id = setInterval(scrollByCard(1), autoplayMs)));
    }
  };

  // Filter reviews
  const format = (data, max, minRating) => {
    const reviews = (data.reviews || [])
      .filter((r) => (r.rating || 0) >= minRating)
      .slice(0, max);
    return { place: data.place, reviews };
  };

  // Fetch reviews from endpoint
  const fetchReviews = async (endpoint, locale, placeId) => {
    if (!endpoint) return sample;
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("language", locale);
    if (placeId) url.searchParams.set("placeId", placeId);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  };

  // Remove all data-* attributes for security after successful load
  const removeDataAttrs = (root) => {
    const dataAttrs = Array.from(root.attributes).filter(attr => attr.name.startsWith('data-'));
    dataAttrs.forEach(attr => root.removeAttribute(attr.name));
  };

  // Main render function
  const render = (root, instance) => {
    const opts = instance ? instance.options : getOptions(root);
    const setLoading = (msg) => (root.innerHTML = `<div class="loading">${msg}</div>`);

    setLoading("Loading reviews...");

    fetchReviews(opts.endpoint, opts.locale, opts.placeId)
      .then((data) => format(data, opts.max, opts.minRating))
      .then(({ place, reviews }) => {
        if (!reviews.length) {
          root.innerHTML = "";
          return;
        }
        const result = opts.layout === "grid"
          ? renderGrid(root, place, reviews)
          : renderCarousel(root, place, reviews, opts.autoplay);
        
        // Remove data-* attributes after successful render
        removeDataAttrs(root);
        
        // Call created callback
        if (instance && instance.options.created) {
          instance.options.created(instance);
        }
        
        return result;
      })
      .catch(() => {
        const fallback = format(sample, opts.max, opts.minRating);
        opts.layout === "grid" ? renderGrid(root, fallback.place, fallback.reviews) : renderCarousel(root, fallback.place, fallback.reviews, opts.autoplay);
        
        // Remove data-* attributes even on fallback (sample data loaded successfully)
        removeDataAttrs(root);
        
        // Call created callback even on fallback
        if (instance && instance.options.created) {
          instance.options.created(instance);
        }
      });
  };

  // Widget Instance Class
  class GoogleReviewsWidgetInstance {
    constructor(element, options = {}) {
      this.element = typeof element === 'string' ? $(element) : element;
      if (!this.element) {
        throw new Error(`Widget element not found: ${element}`);
      }
      
      // Merge data-* attributes with passed options (options take precedence)
      const dataOpts = getOptions(this.element);
      this.options = {
        endpoint: options.endpoint || dataOpts.endpoint,
        placeId: options.placeId || dataOpts.placeId || "",
        layout: options.layout || dataOpts.layout || "carousel",
        mode: options.mode || this.element.dataset.mode || "dark",
        max: options.max !== undefined ? options.max : dataOpts.max,
        minRating: options.minRating !== undefined ? options.minRating : dataOpts.minRating,
        autoplay: options.autoplay !== undefined ? options.autoplay : dataOpts.autoplay,
        locale: options.locale || dataOpts.locale || "en",
        // Callbacks
        beforeInit: options.beforeInit || null,
        created: options.created || null,
      };
      
      this.isInitialized = false;
      this.isDestroyed = false;
    }

    // Initialize the widget
    init() {
      if (this.isDestroyed) {
        throw new Error('Cannot init a destroyed widget instance');
      }
      
      if (this.isInitialized) {
        console.warn('Widget already initialized');
        return this;
      }

      // beforeInit callback
      if (this.options.beforeInit) {
        this.options.beforeInit(this);
      }

      // Add theme classes
      this.element.classList.add("grw-widget", `grw-${this.options.mode}`);
      
      // Render
      render(this.element, this);
      
      this.isInitialized = true;
      instances.set(this.element, this);
      
      return this;
    }

    // Update widget options and re-render
    update(newOptions = {}) {
      if (this.isDestroyed) {
        throw new Error('Cannot update a destroyed widget instance');
      }
      
      if (!this.isInitialized) {
        throw new Error('Widget must be initialized before updating');
      }

      // Merge new options
      Object.assign(this.options, newOptions);
      
      // Re-render
      render(this.element, this);
      
      return this;
    }

    // Destroy widget instance
    destroy() {
      if (this.isDestroyed) {
        console.warn('Widget already destroyed');
        return;
      }

      // Clear content
      this.element.innerHTML = '';
      
      // Remove classes
      this.element.classList.remove("grw-widget", `grw-${this.options.mode}`);
      
      // Remove from registry
      instances.delete(this.element);
      
      this.isDestroyed = true;
      this.isInitialized = false;
      
      return null;
    }

    // Get current options
    getOptions() {
      return { ...this.options };
    }
  }

  // Legacy initWidget for backward compatibility
  const initWidget = (root) => {
    const mode = root.dataset.mode || "dark";
    root.classList.add("grw-widget", `grw-${mode}`);
    render(root);
  };

  // Auto-initialize on DOMContentLoaded (only if data-auto-init is not false)
  document.addEventListener("DOMContentLoaded", () => {
    const widget = $("#google-reviews-widget");
    if (widget && widget.dataset.autoInit !== 'false') {
      initWidget(widget);
    }
  });

  // Public API
  if (typeof window !== 'undefined') {
    window.GoogleReviewsWidget = {
      // Create and initialize new instance
      init: (element, options = {}) => {
        const instance = new GoogleReviewsWidgetInstance(element, options);
        return instance.init();
      },
      
      // Create instance without initializing
      create: (element, options = {}) => {
        return new GoogleReviewsWidgetInstance(element, options);
      },
      
      // Get existing instance
      getInstance: (element) => {
        const el = typeof element === 'string' ? $(element) : element;
        return instances.get(el) || null;
      },
      
      // Destroy all instances
      destroyAll: () => {
        instances.forEach(instance => instance.destroy());
      },
      
      // Legacy support
      initWidget,
      render,
    };
  }
})();
