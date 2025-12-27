(() => {
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

  const renderGrid = (root, place, reviews) => {
    const grid = createEl("div", { class: "review-grid" }, reviews.map(reviewCard));
    root.innerHTML = "";
    const header = placeHeader(place);
    if (header) root.appendChild(header);
    root.appendChild(grid);
  };

  const renderCarousel = (root, place, reviews, autoplayMs) => {
    const track = createEl("div", { class: "carousel-track", role: "list" }, reviews.map((r) => createEl("div", { role: "listitem" }, [reviewCard(r)])));
    const prev = createEl("button", { type: "button", class: "carousel-btn prev", "aria-label": "Previous" }, ["◀"]);
    const next = createEl("button", { type: "button", class: "carousel-btn next", "aria-label": "Next" }, ["▶"]);

    const scrollByCard = (dir) => () => {
      const card = track.firstElementChild?.firstElementChild;
      const delta = (card?.getBoundingClientRect().width || 260) + 12;
      const maxScroll = track.scrollWidth - track.clientWidth;
      
      if (dir > 0 && track.scrollLeft >= maxScroll - 5) {
        // Al final, volver al inicio
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else if (dir < 0 && track.scrollLeft <= 5) {
        // Al inicio, ir al final
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

    if (autoplayMs > 0) {
      let id = setInterval(scrollByCard(1), autoplayMs);
      carousel.addEventListener("mouseenter", () => clearInterval(id));
      carousel.addEventListener("mouseleave", () => (id = setInterval(scrollByCard(1), autoplayMs)));
    }
  };

  const format = (data, max, minRating) => {
    const reviews = (data.reviews || [])
      .filter((r) => (r.rating || 0) >= minRating)
      .slice(0, max);
    return { place: data.place, reviews };
  };

  const fetchReviews = async (endpoint, locale) => {
    if (!endpoint) return sample;
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("language", locale);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  };

  const render = (root) => {
    const opts = getOptions(root);
    const setLoading = (msg) => (root.innerHTML = `<div class="loading">${msg}</div>`);

    setLoading("Loading reviews...");

    fetchReviews(opts.endpoint, opts.locale)
      .then((data) => format(data, opts.max, opts.minRating))
      .then(({ place, reviews }) => {
        if (!reviews.length) {
          setLoading("No reviews available.");
          return;
        }
        return opts.layout === "grid"
          ? renderGrid(root, place, reviews)
          : renderCarousel(root, place, reviews, opts.autoplay);
      })
      .catch(() => {
        const fallback = format(sample, opts.max, opts.minRating);
        opts.layout === "grid" ? renderGrid(root, fallback.place, fallback.reviews) : renderCarousel(root, fallback.place, fallback.reviews, opts.autoplay);
      });
  };

  const initWidget = (root) => {
    const mode = root.dataset.mode || "dark";
    root.classList.add("grw-widget", `grw-${mode}`);
    render(root);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const widget = $("#google-reviews-widget");
    if (widget) initWidget(widget);
  });
})();
