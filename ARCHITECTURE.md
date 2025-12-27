# Widget Architecture

## 📦 Separación de Responsabilidades

### Widget Autónomo (para Webflow)
Archivos totalmente independientes que se pueden usar en cualquier sitio:

- **`assets/css/google-reviews-widget.css`**
  - Estilos del widget con scope `.grw-widget`
  - Temas dark/light mediante CSS custom properties
  - Sistema de 8px grid
  - Responsive (3/2/1 columnas)

- **`assets/js/google-reviews-widget.js`**
  - Lógica del widget 100% autónoma
  - Zero dependencies, vanilla JavaScript
  - Auto-inicializa en `DOMContentLoaded`
  - Exporta API opcional: `window.GoogleReviewsWidget`
  - Incluye Schema.org microdata (Review, Rating, LocalBusiness)
  - Fallback con datos de muestra

### Demo/Landing Page
Archivos específicos para el sitio de demostración:

- **`assets/css/styles.css`**
  - Estilos de la landing page (hero, panel, footer)
  - Smooth scroll, badges, code blocks
  - `.google-reviews-wrapper` con fondo condicional

- **`assets/js/functions.js`**
  - Lógica específica del demo:
    - Normalización de endpoint a URL absoluta
    - Theme toggle (select dropdown)
  - No es necesario para Webflow

- **`index.html`**
  - Landing page con documentación
  - Demo interactivo del widget
  - Setup instructions

## 🎯 Uso en Webflow

### Opción 1: Embed Simple
```html
<div id="google-reviews-widget"
     data-endpoint="https://your-site.netlify.app/.netlify/functions/google-reviews"
     data-layout="carousel"
     data-mode="dark"
     data-max="8"
     data-min-rating="4"
     data-autoplay="3000"
     data-locale="es">
</div>

<link rel="stylesheet" href="https://your-site.netlify.app/assets/css/google-reviews-widget.css">
<script src="https://your-site.netlify.app/assets/js/google-reviews-widget.js" defer></script>
```

### Opción 2: Inicialización Manual
```html
<div id="google-reviews-widget" data-endpoint="..." data-mode="dark"></div>

<link rel="stylesheet" href="https://your-site.netlify.app/assets/css/google-reviews-widget.css">
<script src="https://your-site.netlify.app/assets/js/google-reviews-widget.js" defer></script>

<script>
// Opcional: cambiar tema dinámicamente desde Webflow
window.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('google-reviews-widget');
  // El widget se inicializa automáticamente
  
  // Cambiar tema después:
  widget.dataset.mode = 'light';
  widget.classList.remove('grw-dark');
  widget.classList.add('grw-light');
});
</script>
```

## 📁 Estructura Final del Proyecto

```
google-reviews-for-webflow/
│
├── index.html                        # Demo page
├── README.md                         # Documentación principal
├── LICENSE                           # MIT
├── SEO.md                            # Guía SEO
├── ARCHITECTURE.md                   # Este archivo
├── AGENTS.md                         # Roles de contribución
├── .env.example                      # Template de variables
├── .gitignore                        # Patrones ignorados
├── netlify.toml                      # Config de Netlify
├── package.json                      # Scripts npm
│
├── assets/
│   ├── css/
│   │   ├── google-reviews-widget.css  # ⭐ WIDGET (usar en Webflow)
│   │   └── styles.css                 # Demo page styles
│   │
│   ├── js/
│   │   ├── google-reviews-widget.js   # ⭐ WIDGET (usar en Webflow)
│   │   └── functions.js               # Demo logic (theme toggle)
│   │
│   └── img/
│       ├── favicon.svg                # Favicon SVG
│       └── og-image.png               # Open Graph image
│
└── netlify/
    └── functions/
        └── google-reviews.js          # ⭐ BACKEND (Netlify Function)
```

## ✅ Verificación

### Widget completamente desacoplado:
- ✅ `google-reviews-widget.js` no depende de `functions.js`
- ✅ `google-reviews-widget.css` no depende de `styles.css`
- ✅ No hay código inline en el HTML del widget
- ✅ Puede usarse standalone sin la demo page
- ✅ Auto-inicializa con `DOMContentLoaded`
- ✅ Exporta API opcional para control manual

### Demo independiente:
- ✅ `functions.js` solo maneja lógica del demo
- ✅ `styles.css` solo estilos de la landing
- ✅ Puede eliminarse sin afectar el widget

## 🚀 Despliegue

### Para usar en Webflow:
1. Deploy a Netlify (variables: `GOOGLE_PLACES_API_KEY`, `PLACE_ID`)
2. Copiar solo 2 archivos en Webflow Custom Code:
   - `google-reviews-widget.css` (stylesheet)
   - `google-reviews-widget.js` (script defer)
3. Agregar `<div id="google-reviews-widget">` con data-attributes

### Para desarrollo local:
```bash
npm run dev          # Netlify Dev (funciones + demo)
npm run serve        # Simple HTTP server (solo demo, usa sample data)
```

## 🔧 Mantenimiento

### Actualizar el widget:
- Solo editar `google-reviews-widget.js` y `google-reviews-widget.css`
- No tocar `functions.js` ni `styles.css` (son solo demo)

### Actualizar el backend:
- Solo editar `netlify/functions/google-reviews.js`
- Variables en Netlify Dashboard

### Actualizar la demo:
- Editar `index.html`, `styles.css`, `functions.js`
- No afecta usuarios de Webflow
