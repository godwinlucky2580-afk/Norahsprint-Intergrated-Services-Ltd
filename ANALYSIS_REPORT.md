# NorahsPrint Integrated Services — Complete Website Analysis Report

> **Date:** June 2025  
> **Project:** Portfolio / Business Website  
> **Type:** Single-Page Application (SPA-style) + Admin Dashboard  
> **Data Layer:** Supabase (PostgreSQL + Storage + Auth)

---

## 1. 📁 Folder Structure

```
PORTFOLIO WEBSITE/
├── index.html                  # Main landing page (SPA-style, all sections)
├── styles.css                  # Global styles (~1600+ lines)
├── script.js                   # Main JS logic (~600+ lines, traditional script)
├── admin.html                  # Admin dashboard (standalone)
├── admin.js                    # Admin logic (ES module, Supabase CRUD)
├── admin.css                   # Admin dashboard styles (~300+ lines)
├── README.md                   # Placeholder — "set for corrections"
├── TODO.md                     # Task tracking (mostly complete)
├── robots.txt                  # SEO
├── sitemap.xml                 # SEO
├── .gitignore                  # Git ignores
├── (2).gitignore               # ⚠️ DUPLICATE — should be removed
│
├── images/                     # UI icons, GIFs, profile photo (13 files)
│   ├── me.jpg                  # Logo/avatar (nav logo)
│   ├── import.gif              # CTA arrow animation
│   ├── shopping.gif            # Shopping cart icon
│   ├── call.gif / call.png     # Call icons
│   ├── system-regular-42-*     # Search hover GIF
│   ├── system-regular-67-*     # Clock hover GIF
│   └── WHATSAPP*.svg           # 3 WhatsApp icon variants
│
├── whatsapp_img/               # Portfolio project images (13 images)
│   ├── FURNITURE-1.jpg through FURNITURE-7.jpg
│   ├── ELECTRICAL-2.jpg
│   ├── FLOORING-3.jpg
│   ├── INTERIOR-1.jpg, INTERIOR-2.jpg, INTERIOR-7.jpg
│   ├── LIGHT-2.jpg
│   ├── PAINT-2.jpg
│   ├── POP-7.jpg, POP-13.jpg
│   ├── IMG-20260605-WA0170.jpg
│   └── icon.jpg                # Favicon
│
└── src/                        # ES modules — Supabase product system
    ├── supabaseClient.js       # Factory — returns configured Supabase client
    ├── productsApi.js          # Data access layer — queries Supabase DB
    ├── productsState.js        # State management — search/filter/sort/paginate/cache
    ├── productRenderer.js      # HTML rendering — product grid generator
    └── productImages.js        # Lazy loading — IntersectionObserver
```

---

## 2. 🧩 Components & Reusable Sections

| Component                | Location                                | Reusable? | Notes                                               |
| ------------------------ | --------------------------------------- | --------- | --------------------------------------------------- |
| **Loader**               | `index.html` (inline)                   | ❌ No     | Full-screen overlay, progress bar, 1.5s fade        |
| **Navbar**               | `index.html`                            | ❌ No     | Fixed, backdrop-blur, scroll-aware                  |
| **Mobile Nav**           | `index.html`                            | ❌ No     | Slide-in drawer, JS toggle                          |
| **Hero Section**         | `index.html`                            | ❌ No     | Full-viewport, split layout, image carousel         |
| **Animated Counters**    | `script.js` (`initCounters`)            | ✅ Yes    | `data-count` attribute driven, IntersectionObserver |
| **Service Cards**        | `script.js` (`renderServices`)          | ✅ Yes    | Data-driven from static `services` array            |
| **Product Cards**        | `src/productRenderer.js`                | ✅ Yes    | Dynamic rendering from Supabase                     |
| **Booking Form**         | `index.html`                            | ✅ Yes    | Pattern reused by Contact form                      |
| **Testimonial Cards**    | `script.js` (`renderTestimonials`)      | ✅ Yes    | Data-driven from static `testimonials` array        |
| **Review/Feedback Form** | `index.html` + `initFeedbackRating()`   | ❌ No     | Star rating + Supabase `reviews` insert             |
| **Contact Form**         | `index.html` + `initContactForm()`      | ✅ Yes    | Web3Forms API with loading/success/error states     |
| **WhatsApp CTA**         | Multiple locations                      | ✅ Yes    | Floating button + inline CTA + tooltip pattern      |
| **Footer**               | `index.html`                            | ❌ No     | 4-column grid, social, sitemap                      |
| **Scroll Reveal**        | `styles.css` + `initScrollAnimations()` | ✅ Yes    | 3 variants: reveal, reveal-left, reveal-right       |

---

## 3. 📄 Pages / Sections

### 3.1 Public Site (`index.html`) — Single Page

| #   | Section            | ID              | Key Features                                                                                    |
| --- | ------------------ | --------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Loader**         | `#loader`       | Brand logo + animated progress bar, auto-hides after 1.8s                                       |
| 2   | **Navbar**         | `#navbar`       | Desktop links, theme toggle, Book Now CTA, hamburger                                            |
| 3   | **Hero**           | `#hero`         | Full-screen: headline, subtext, CTA buttons, stat counters, image carousel with floating badges |
| 4   | **About**          | `#about`        | 2-column: company image with spinning badge, story, 6 pillar services                           |
| 5   | **Services**       | `#services`     | 4 cards: Furniture, Electrical, POP, Contracting                                                |
| 6   | **Products**       | `#products`     | Search + filter pills + sort + paginated grid (Supabase)                                        |
| 7   | **Booking**        | `#booking`      | Features list + consultation form → WhatsApp redirect                                           |
| 8   | **Testimonials**   | `#testimonials` | 6 client review cards with star ratings                                                         |
| 9   | **Feedback**       | `#feedback`     | 5-star rating + review form → Supabase `reviews` table                                          |
| 10  | **Contact**        | `#contact`      | Phone, email, location, hours + Web3Forms email form                                            |
| 11  | **Footer**         | Footer tag      | 4-column layout: brand, services, company, contact                                              |
| 12  | **WhatsApp Float** | `.wa-float`     | Fixed bottom-right, pulse animation, tooltip                                                    |

### 3.2 Admin Dashboard (`admin.html`) — Standalone Page

- **Sidebar:** Brand logo, navigation (Products only), user info, logout
- **Topbar:** Page title, product count chip
- **Add Product Panel:** Form with name, description, price, category, image upload with preview
- **Manage Products Panel:** Search + category filter + table with inline edit/delete actions
- **Toast Notifications:** Success/error toasts for all CRUD operations

---

## 4. 🎨 CSS Architecture

### 4.1 Structure (`styles.css`)

| Section              | Lines | Notes                                                                      |
| -------------------- | ----- | -------------------------------------------------------------------------- |
| CSS Variables        | ~50   | 40+ custom properties for colors, shadows, radii, fonts                    |
| Light Theme Override | ~20   | `[data-theme="light"]` block                                               |
| Reset & Base         | ~60   | Box-sizing, smooth scroll, focus ring, scrollbar                           |
| Utilities            | ~30   | `.container`, `.section-pad`, `.section-tag`, `.section-title`, `.sr-only` |
| Navbar               | ~100  | Fixed, backdrop-filter, scrolled state, responsive                         |
| Mobile Nav           | ~40   | Slide-in with transform                                                    |
| Hero                 | ~200  | Background gradients, grid overlay, image carousel, floating badges, stats |
| About                | ~80   | 2-column grid, spinning badge, pillar cards                                |
| Services             | ~90   | Auto-fit grid, card hover effects, features list                           |
| Products             | ~120  | Controls (search, filter, sort), grid, cards, pagination                   |
| Booking              | ~100  | 2-column grid, form styles, feature list                                   |
| Testimonials         | ~60   | Cards with quote decoration, star ratings, author                          |
| Feedback             | ~40   | Centered form, star rating input                                           |
| Contact              | ~80   | Grid with details, WhatsApp CTA                                            |
| Footer               | ~80   | 4-column grid, social buttons                                              |
| WhatsApp Float       | ~50   | Fixed position, pulse animation, tooltip                                   |
| Animations           | ~60   | Reveal (3 variants), loader, floating, gold separator                      |
| Responsive           | ~80   | 4 breakpoints: 1024px, 768px, 480px, 390px                                 |

### 4.2 Design System

| Token            | Value                                   |
| ---------------- | --------------------------------------- |
| **Display Font** | Cormorant Garamond (serif)              |
| **Body Font**    | DM Sans (sans-serif)                    |
| **Primary Blue** | `#3d8eff` (gold alias)                  |
| **Dark Blue**    | `#1a60d4` (gold-dark)                   |
| **Light Blue**   | `#7cb9ff` (gold-light)                  |
| **Dark BG**      | `#050c1c`                               |
| **Card Radius**  | `20px`                                  |
| **Small Radius** | `12px`                                  |
| **Pill Radius**  | `100px`                                 |
| **Shadow**       | `0 8px 40px rgba(61, 142, 255, 0.25)`   |
| **Transition**   | `0.4s cubic-bezier(0.25, 0.8, 0.25, 1)` |

### 4.3 Strengths ✅

- Complete **dark/light theme** via `data-theme` attribute + `localStorage` persistence
- CSS custom properties for **consistent theming**
- **Accessibility**: `:focus-visible` ring, `aria-label`, `.sr-only` utility class
- **4 responsive breakpoints** covering desktop, tablet, mobile, small mobile
- **GPU-accelerated animations** using `transform` and `opacity` only
- Good use of `backdrop-filter` for glassmorphism effects

### 4.4 Issues ⚠️

- **Inconsistent naming**: Mixes BEM-like (`.hero-title`), utility (`.btn-primary`), and custom (`.about-pillar`)
- **Dead CSS**: `#Gif` selector (not in HTML), `.hero-img, active` (missing semicolon)
- **Duplicates**: `.book img` visibility rules appear in multiple media queries
- **Inline styles**: Several elements use `style="..."` for transition delays, max-widths
- **Hardcoded colors**: Some buttons use direct hex values instead of CSS variables

---

## 5. ⚙️ JavaScript Architecture

### 5.1 File Inventory

| File                 | Type        | Lines | Dependencies                 | Purpose                                                    |
| -------------------- | ----------- | ----- | ---------------------------- | ---------------------------------------------------------- |
| `script.js`          | Global IIFE | ~600  | None (Supabase SDK via CDN)  | Theme, nav, services, testimonials, forms, animations      |
| `supabaseClient.js`  | ES Module   | ~30   | `window.supabase` CDN        | Creates configured Supabase client                         |
| `productsApi.js`     | ES Module   | ~120  | `supabaseClient.js`          | DB queries: loadProducts, loadCategories, getProductsCount |
| `productsState.js`   | ES Module   | ~200  | productsApi, productRenderer | State management: debounce, cache, pagination, retry       |
| `productRenderer.js` | ES Module   | ~120  | productImages                | HTML generation: product cards, price formatting           |
| `productImages.js`   | ES Module   | ~50   | None                         | Lazy loading via IntersectionObserver                      |
| `admin.js`           | ES Module   | ~500  | Supabase SDK                 | Auth gate, CRUD, image upload, search/filter               |

### 5.2 Initialization Flow

```
DOMContentLoaded
  ├── initTheme()              // localStorage → data-theme
  ├── renderServices()         // Static data → service cards HTML
  ├── renderTestimonials()     // Static data → testimonial cards HTML
  ├── initScrollAnimations()   // IntersectionObserver for reveals
  ├── initCounters()           // Animated numbers from data-count
  ├── initNav()                // Scroll class toggle + hamburger
  ├── initBookingForm()        // WhatsApp redirect
  ├── initContactForm()        // Web3Forms API submit
  ├── initFeedbackRating()     // Stars UI + Supabase insert
  ├── Loader hide (1800ms)
  └── Dynamic Import →
      └── productsState.initProductsModule()
            ├── loadCategories() → render filter buttons
            ├── refresh() → getProductsCount() + loadProducts() → renderProductGrid()
            └── setupLazyImages()
```

### 5.3 Data Flow (Products)

```
Supabase PostgreSQL
    ↓ (REST API)
productsApi.js (loadProducts, loadCategories, getProductsCount)
    ↓
productsState.js (state: page, search, sort, category, cache)
    ↓
productRenderer.js (renderProductGrid → HTML string)
    ↓
productImages.js (IntersectionObserver → lazy load images)
    ↓
DOM (<div id="productsGrid">)
```

### 5.4 Strengths ✅

| Feature                  | Implementation                                           | Benefit                      |
| ------------------------ | -------------------------------------------------------- | ---------------------------- |
| **Modular architecture** | 5 ES modules in `src/`                                   | Clean separation of concerns |
| **Request caching**      | Map-based cache in productsState                         | Reduces API calls            |
| **Debounced search**     | 300ms debounce                                           | Prevents rate limiting       |
| **Retry logic**          | 3 attempts with exponential backoff                      | Resilience                   |
| **Lazy images**          | IntersectionObserver + placeholder SVG                   | Performance                  |
| **Graceful fallback**    | Catches module import failure → calls `renderProducts()` | Resilience                   |
| **Price formatting**     | Handles string, number, BigInt, formatted values         | Robust                       |
| **Single init entry**    | `initProductsModule({ orderProductHandler })`            | Clean API                    |

### 5.5 Issues ⚠️

| Issue                       | Location                       | Severity | Description                                                                           |
| --------------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------- |
| **Mixed module systems**    | `script.js`                    | High     | Global script dynamically imports ES modules — fragile                                |
| **Dual product renderers**  | script.js + productRenderer.js | High     | Two implementations: `renderProducts()` (dead) and `renderProductGrid()` (active)     |
| **Hardcoded data**          | script.js                      | Medium   | `services` and `testimonials` arrays are static                                       |
| **Global pollution**        | script.js                      | Medium   | `PHONE`, `services`, `testimonials`, `activeFilter`, `searchQuery` are window globals |
| **Alert on error**          | script.js feedback form        | Medium   | Uses `alert()` instead of inline toast/message                                        |
| **No form validation UX**   | Booking form                   | Low      | No client-side validation feedback styling                                            |
| **Admin auth via prompt()** | admin.js                       | Low      | Uses `prompt()` for login instead of a proper form                                    |
| **Duplicate WhatsApp SVG**  | script.js + productRenderer.js | Low      | ~200 lines SVG duplicated across files                                                |

---

## 6. 🔌 Supabase Integration

### 6.1 Connection Details

| Parameter          | Value                                            |
| ------------------ | ------------------------------------------------ |
| **URL**            | `https://qlsamwfphiusocbddzdp.supabase.co`       |
| **Anon Key**       | `sb_publishable_CtwYB9-3gNMDG6dK6FcPuQ_2zKPW1Y4` |
| **Storage Bucket** | `product-images` (public)                        |
| **Auth**           | Email/password for admin                         |

### 6.2 Database Tables

| Table      | Columns                                                       | Used By             |
| ---------- | ------------------------------------------------------------- | ------------------- |
| `products` | id, name, description, price, category, image_url, created_at | Public site + Admin |
| `reviews`  | id, name, rating, review, created_at                          | Feedback form       |

### 6.3 Modules Map

```
index.html (window.__SUPABASE_URL, __SUPABASE_ANON_KEY)
    │
    ├── async import → src/productsState.js
    │   └── src/productsApi.js
    │       └── src/supabaseClient.js
    │           └── window.supabase.createClient(url, key)
    │
    └── window.supabase (CDN) ← script.js feedback form (direct usage)

admin.html (window.__SUPABASE_URL, __SUPABASE_ANON_KEY)
    └── admin.js (type="module")
        └── import { createClient } from CDN
```

---

## 7. 🛠️ Admin Dashboard

### 7.1 Features

| Feature                 | Implementation                                                       | Status     |
| ----------------------- | -------------------------------------------------------------------- | ---------- |
| **Auth Gate**           | Email/password via `prompt()` + `supabase.auth.signInWithPassword()` | Functional |
| **Product Creation**    | Form → image upload to storage → DB insert                           | Complete   |
| **Product Listing**     | Table with search + category filter                                  | Complete   |
| **Inline Editing**      | Row expands with editable fields → Save/Cancel                       | Complete   |
| **Product Deletion**    | Confirm dialog → DB delete + storage cleanup                         | Complete   |
| **Image Preview**       | File input → blob URL preview                                        | Complete   |
| **Toast Notifications** | Success/error toasts with auto-dismiss                               | Complete   |
| **Category Filter**     | Dynamically populated from DB                                        | Complete   |
| **Product Count**       | Stats chip in topbar                                                 | Complete   |

### 7.2 Architecture

```
admin.html → admin.js (ES module)
  ├── requireAdmin()          // Auth gate (session check or prompt login)
  ├── fetchProducts()         // DB query with search + category filter
  ├── fetchCategories()       // Distinct categories from DB
  ├── createProduct()         // Insert + return new product
  ├── updateProduct()         // Update by ID
  ├── deleteProduct()         // Delete by ID + cleanup storage file
  ├── uploadImageToStorage()  // Upload to product-images bucket
  └── buildPublicUrlForBucket() // Generate public URL from storage path
```

---

## 8. 🟢 Areas That Should Stay Untouched

| Area                                           | Reason                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| **Supabase Integration Architecture**          | Well-structured modular data layer with caching, retry, debounce  |
| **Lazy Image Loading** (`productImages.js`)    | Production-ready IntersectionObserver implementation              |
| **Scroll Animations** (`initScrollAnimations`) | Clean, performant, reusable                                       |
| **Contact Form** (Web3Forms)                   | Working API integration with proper loading/success/error states  |
| **Theme System**                               | Full dark/light with localStorage persistence, smooth transitions |
| **Hero Image Carousel**                        | Smooth CSS transitions, timed rotation works well                 |
| **Loader Animation**                           | Branded, smooth, good UX                                          |
| **Footer Layout**                              | Well-structured multi-column, good link organization              |
| **Price Formatting** (`formatPrice()`)         | Robust multi-type handler (string, number, formatted)             |
| **Admin Inline Editing**                       | Clean UX pattern, row-level expand/collapse                       |
| **Responsive Breakpoints**                     | Well-chosen: 1024, 768, 480, 390                                  |
| **SEO Meta Tags**                              | OG tags, canonical URL, robots.txt, sitemap.xml present           |

---

## 9. 🔴 Areas That Should Be Redesigned / Improved

### 9.1 Critical

| Priority    | Issue                                 | Location                           | Recommendation                                          |
| ----------- | ------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| 🔴 **HIGH** | Duplicate `(2).gitignore`             | Root                               | Remove the duplicate file                               |
| 🔴 **HIGH** | Empty `README.md`                     | Root                               | Write proper documentation (setup, deploy, env vars)    |
| 🔴 **HIGH** | Supabase keys exposed in HTML         | `index.html`, `admin.html`         | Move to environment variables or use server-side proxy  |
| 🔴 **HIGH** | `alert()` on feedback error           | `script.js` (`initFeedbackRating`) | Replace with inline toast/message like the contact form |
| 🔴 **HIGH** | No feedback after booking form submit | `script.js` (`initBookingForm`)    | Add success confirmation before WhatsApp redirect       |

### 9.2 Medium

| Priority   | Issue                             | Location                           | Recommendation                                |
| ---------- | --------------------------------- | ---------------------------------- | --------------------------------------------- |
| 🟡 **MED** | Two product rendering functions   | `script.js` + `productRenderer.js` | Remove dead `renderProducts()` from script.js |
| 🟡 **MED** | Hardcoded services + testimonials | `script.js`                        | Store in Supabase DB and fetch dynamically    |
| 🟡 **MED** | Global variables                  | `script.js`                        | Wrap in IIFE/module properly                  |
| 🟡 **MED** | Duplicate `loading` attributes    | `index.html` hero images           | Remove duplicate `loading="eager"`            |
| 🟡 **MED** | Unused CSS selectors              | `styles.css`                       | Audit and remove dead CSS                     |
| 🟡 **MED** | Missing alt text                  | `index.html`                       | Descriptive alt text for all images           |
| 🟡 **MED** | Admin uses `prompt()` for login   | `admin.js`                         | Build a proper login form modal               |

### 9.3 Low

| Priority   | Issue                                    | Location                           | Recommendation                                        |
| ---------- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| 🔵 **LOW** | Duplicate WhatsApp SVG                   | `script.js` + `productRenderer.js` | Extract to a shared constant or SVG sprite            |
| 🔵 **LOW** | Commented-out code blocks                | `script.js` (~40 lines)            | Remove unused Supabase rating code                    |
| 🔵 **LOW** | Generic alt texts                        | `index.html`                       | "Premium furniture 1" → "Custom Iroko dining table"   |
| 🔵 **LOW** | No mobile nav close on outside click     | `script.js`                        | Add `click` listener on overlay/body                  |
| 🔵 **LOW** | Missing transition on inline edit cancel | `admin.js` / `admin.css`           | Add smooth collapse animation                         |
| 🔵 **LOW** | Typo: "Integrated"                       | Throughout project                 | Should be "Integrated" (appears in nav, footer, meta) |

---

## 10. 📊 Summary Statistics

| Metric                     | Value                                  |
| -------------------------- | -------------------------------------- |
| **Total Files**            | 12 code files + 26 assets = 38 total   |
| **HTML Pages**             | 2 (index.html, admin.html)             |
| **CSS Files**              | 2 (styles.css, admin.css)              |
| **JavaScript Files**       | 7 (script.js, admin.js, 5 src modules) |
| **Supabase Tables**        | 2 (products, reviews)                  |
| **Supabase Storage**       | 1 bucket (product-images)              |
| **CSS Variables**          | ~40                                    |
| **Responsive Breakpoints** | 4                                      |
| **Sections on Homepage**   | 12                                     |
| **Static Data Arrays**     | 3 (services, products[], testimonials) |
| **Dynamic Modules**        | 5 ES modules                           |
| **Total Image Assets**     | 26 (13 UI + 13 portfolio)              |

---

## 11. 🎯 Overall Assessment

The website is a **well-architected single-page business site** with a professional design system, functional Supabase integration, and a complete admin dashboard. The product system is the strongest architectural component — properly modular with caching, pagination, debounced search, and lazy loading.

**Major strengths:**

- Clean visual design with consistent theming
- Good modular architecture for the product system
- Functional admin dashboard with full CRUD
- Proper responsive implementation

**Primary concerns:**

- Mixed module loading patterns (global + ES modules)
- Hardcoded data that should be database-driven
- Security exposure of Supabase keys in HTML
- Several minor code quality issues (duplicates, dead code, commented blocks)

The site is **production-ready for its core functionality** but would benefit from addressing the high-priority items (README, Supabase key security, error handling UX) before critical deployment.
