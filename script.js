
const PHONE = '2347011875583';


function logSupabaseError(error, context = 'Supabase operation failed') {
  console.error(context);
  console.error(error);
  console.log({
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    status: error?.status,
  });
}

const services = [
  {
    label: 'Interior & Finishing',
    title: 'Interior & Finishing Works',
    description: 'We transform interiors through thoughtful decoration, wall finishing, screeding, painting, POP ceilings, feature walls and renovation work.',
    bullets: ['Wall and decorative finishes', 'POP ceilings and feature walls', 'Space transformation and finishing'],
    image: '/whatsapp_img/INTERIOR-2.jpg'
  },
  {
    label: 'Furniture & Joinery',
    title: 'Furniture & Joinery',
    description: 'We create custom furniture and joinery for homes and workplaces, from wardrobes and kitchen cabinets to beds, shelving and office furniture.',
    bullets: ['Custom furniture and woodwork', 'Storage, wardrobes and cabinets', 'Residential and office furniture'],
    image: '/whatsapp_img/FURNITURE-7.jpg'
  },
  {
    label: 'Electrical & Lighting',
    title: 'Electrical & Lighting Solutions',
    description: 'Our team handles interior lighting installation, profile and magnetic lighting, spot and decorative lighting, chandelier installation and electrical finishing.',
    bullets: ['Interior and decorative lighting', 'Profile, magnetic and spot lighting', 'Electrical finishing works'],
    image: '/whatsapp_img/ELECTRICAL-2.jpg'
  },
  {
    label: 'Construction Services',
    title: 'Construction & Building Services',
    description: 'We support building finishing, renovation, remodeling, maintenance and improvement works with coordinated project teams and subcontracting services.',
    bullets: ['Building finishing and remodeling', 'Project coordination', 'Maintenance and improvement works'],
    image: '/whatsapp_img/IMG-20260605-WA0170.jpg'
  },
  {
    label: 'Project Execution',
    title: 'Coordinated Project Execution',
    description: 'For projects requiring multiple trades and finishing disciplines, Norahsprint can provide coordinated teams from planning through completion.',
    bullets: ['Flexible multi-trade teams', 'Supervision and quality control', 'Clear client communication'],
    image: '/whatsapp_img/INTERIOR-7.jpg'
  }
];

const products = [
];

const testimonials = [];

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  renderServices();
  // Products are now Supabase-driven (see productsState module).
  // Keep existing renderProducts() function intact for now, but do not call it.
  await renderTestimonials();
  initScrollAnimations();
  initCounters();
  initNav();
  initBookingForm();
  initContactForm();
  initFeedbackRating();
  setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 1800);

  try {
    const { initProductsModule } = await import('./src/productsState.js');
    await initProductsModule({
      orderProductHandler: (name, price) => orderProduct(name, price)
    });
  } catch (e) {
    console.error('Products module failed:', e);
    // Fallback to old UI if Supabase modules fail.
    try {
      renderProducts();
    } catch (fallbackErr) {
      console.error('Fallback renderProducts failed:', fallbackErr);
    }
  }
});

/* FOR INFINIT IMAGE LOOP */
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".hero-visual-card .hero-img");
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = 0;

  if (!images.length || reduceMotion) return;

  function nextImage() {
    images[currentIndex].classList.remove("active");

    currentIndex = (currentIndex + 1) % images.length;

    images[currentIndex].classList.add("active");
  }

  setInterval(nextImage, 4000);
});


/* THEME */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
}
function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

/* NAV */
function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
  document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('open'));
}
function closeMobileNav(){ document.getElementById('mobileNav').classList.remove('open'); }

/* RENDER SERVICES */
function renderServices() {
  const tabsRoot = document.getElementById('servicesTabs');
  const showcase = document.getElementById('servicesShowcase');
  const titleEl = document.getElementById('featuredServiceTitle');
  const labelEl = document.getElementById('featuredServiceLabel');
  const descriptionEl = document.getElementById('featuredServiceDescription');
  const bulletsEl = document.getElementById('featuredServiceBullets');
  const imageEl = document.getElementById('featuredServiceImage');
  const badgeEl = document.getElementById('featuredServiceBadge');
  let featuredTransitionTimer = null;

  if (!tabsRoot || !showcase || !titleEl || !labelEl || !descriptionEl || !bulletsEl || !imageEl || !badgeEl) {
    return;
  }

  tabsRoot.innerHTML = services.map((service, index) => `
    <button
      class="services-tab ${index === 0 ? 'is-active' : ''}"
      type="button"
      data-index="${index}"
      aria-selected="${index === 0}"
    >
      ${service.label}
    </button>
  `).join('');

  const updateFeaturedService = (index) => {
    const service = services[index];
    if (!service) return;

    if (featuredTransitionTimer) {
      clearTimeout(featuredTransitionTimer);
    }

    showcase.classList.remove('is-transitioning');
    showcase.classList.add('is-transitioning');

    tabsRoot.querySelectorAll('.services-tab').forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    featuredTransitionTimer = setTimeout(() => {
      imageEl.src = service.image;
      imageEl.alt = service.title;
      labelEl.textContent = service.label;
      titleEl.textContent = service.title;
      descriptionEl.textContent = service.description;
      bulletsEl.innerHTML = service.bullets.map((item) => `<li>${item}</li>`).join('');
      badgeEl.textContent = `Featured service · ${service.label}`;
      showcase.classList.remove('is-transitioning');
      featuredTransitionTimer = null;
    }, 220);
  };

  tabsRoot.querySelectorAll('.services-tab').forEach((button) => {
    button.addEventListener('click', () => updateFeaturedService(Number(button.dataset.index)));
  });

  updateFeaturedService(0);
}

/* RENDER PRODUCTS */
let activeFilter='All', searchQuery='';
function renderProducts() {
  const cats = ['All',...new Set(products.map(p=>p.cat))];
  document.getElementById('filterBtns').innerHTML = cats.map(c=>
    `<button class="filter-btn ${c==='All'?'active':''}" onclick="setFilter('${c}',this)">${c}</button>`).join('');
  document.getElementById('searchInput').addEventListener('input', e=>{ searchQuery=e.target.value.toLowerCase(); filterProducts(); });
  filterProducts();
}
function setFilter(cat,btn){
  activeFilter=cat;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  filterProducts();
}

function filterProducts(){
  const grid=document.getElementById('productsGrid');
  const filtered=products.filter(p=>(activeFilter==='All'||p.cat===activeFilter)&&(p.name.toLowerCase().includes(searchQuery)||p.desc.toLowerCase().includes(searchQuery)));
  if(!filtered.length){ grid.innerHTML='<div class="no-results">🔍 No products found. Try a different search or filter.</div>'; return; }
  grid.innerHTML=filtered.map((p,i)=>`
    <div class="product-card reveal" style="transition-delay:${(i%4)*0.08}s">
      <div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy"/><div class="product-cat">${p.cat}</div></div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <div class="product-price"><span>₦</span>${p.price}</div>
          <button class="btn-order" onclick="orderProduct('${p.name}','${p.price}')"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="20px" height="20px" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
viewBox="0 0 6652.7 6652.87"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
 <g id="Layer_x0020_1">
  <metadata id="CorelCorpID_0Corel-Layer"/>
  <g id="_2534975432304">
   <path fill="#FEFEFE" d="M2086.53 785.73c721.28,-400.41 1769.93,-367.33 2506.32,2.87l445.92 263.7c378.2,260.78 740.91,742.83 908.94,1160.79 425.28,1057.79 235.17,2270.61 -573.74,3072.34 -139.22,137.98 -217.98,220.16 -377.13,332.49 -1623.29,1145.79 -3017.4,118.35 -3193.22,118.35 -351.94,0 -812.68,259.18 -1123.56,266.11 2.32,-104.38 178.54,-603.29 232.17,-743.56 235.95,-617.1 -409.58,-688.59 -409.58,-1947.09 0,-404.38 121.81,-847.84 255.81,-1133.87 308.26,-658.01 683.85,-1034.52 1328.07,-1392.13zm-2000.93 1842.84c-35.43,179.12 -85.6,503.54 -85.6,712.72 0,270 81.02,677.16 147.47,916.96 254.26,917.53 430.86,424.02 158.98,1222.68l-289.99 865.29c-32.67,148.31 83.56,306.63 220.07,306.63 178.54,0 566.94,-141.83 751.99,-194.17 457.67,-129.47 634.85,-269.15 929.32,-127.03l512.85 196.76c1381.24,389.72 2873.55,-176.08 3595.54,-1241.21 549.85,-811.2 626.46,-1198.56 626.46,-2182.46 0,-874.28 -455.09,-1621.26 -1012.68,-2180.62 -995.08,-998.25 -2419.44,-1166.46 -3726.91,-607.52 -716.68,306.39 -1288.5,984.97 -1627.8,1683.78 -81.22,167.28 -160.02,427.46 -199.72,628.17z"/>
   <path fill="#1A60D4" d="M4583.88 786.14c-736.39,-370.2 -1785.04,-403.28 -2506.32,-2.87 -644.22,357.61 -1019.8,734.12 -1328.07,1392.13 -134,286.02 -255.81,729.49 -255.81,1133.87 0,1258.5 645.53,1329.99 409.58,1947.09 -53.63,140.27 -229.85,639.18 -232.17,743.56 310.88,-6.93 771.62,-266.11 1123.56,-266.11 175.83,0 1569.93,1027.44 3193.22,-118.35 159.15,-112.33 237.91,-194.51 377.13,-332.49 808.91,-801.73 999.02,-2014.55 573.74,-3072.34 -168.04,-417.96 -530.74,-900.01 -908.94,-1160.79l-445.92 -263.7zm-2099.07 1241.61c163.02,269.36 395.57,498.6 298.7,670.52 -53.88,95.61 -220.11,246.67 -220.11,344.88 0,196.09 986.3,1003.88 1171.04,964.29 186.21,-39.91 206.94,-313.8 425.61,-313.8 84.07,0 374.61,142.98 469,181.5 325.74,132.92 358.9,150.17 358.9,439.42 0,75.25 -182.22,284.42 -235.21,326.58 -675.58,537.45 -1763.59,-263.94 -2167.53,-673.63l-442.97 -444.06 -357.79 -529.23c-56.47,-112.59 -137.64,-301.81 -137.64,-453.72 0,-361.55 480.47,-1103.52 838,-512.76z"/>
   <path fill="#FEFEFE" d="M2792.49 2710.87c96.87,-171.92 -135.69,-401.16 -298.7,-670.52 -357.53,-590.76 -838,151.21 -838,512.76 0,151.91 81.17,341.13 137.64,453.72l357.79 529.23 442.97 444.06c403.94,409.68 1491.95,1211.08 2167.53,673.63 52.99,-42.16 235.21,-251.33 235.21,-326.58 0,-289.25 -33.16,-306.5 -358.9,-439.42 -94.39,-38.52 -384.92,-181.5 -469,-181.5 -218.67,0 -239.41,273.89 -425.61,313.8 -184.74,39.59 -1171.04,-768.2 -1171.04,-964.29 0,-98.21 166.24,-249.28 220.11,-344.88z"/>
  </g>
 </g>
</svg> Order</button>
        </div>
      </div>
    </div>`).join('');
  initScrollAnimations();
}

function orderProduct(name,price){
  const msg=encodeURIComponent(`Hello, I want to order ${name} for ${price}. Please confirm availability and delivery details.`);
  window.open(`https://wa.me/${PHONE}?text=${msg}`,'_blank');
}

/* RENDER TESTIMONIALS */
function renderLegacyTestimonials(){
  document.getElementById('testimonialsGrid').innerHTML=testimonials.map((t,i)=>`
    <div class="testimonial-card reveal" style="transition-delay:${i*0.1}s">
      <div class="stars">${'<span>★</span>'.repeat(t.stars)}${'<span style="color:var(--text-muted)">★</span>'.repeat(5-t.stars)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.name.charAt(0)}</div>
        <div class="author-info"><h4>${t.name}</h4><span>${t.role}</span></div>
      </div>
    </div>`).join('');
}

/* BOOKING FORM — WhatsApp */
function escapeReviewHtml(value) {
  return (value ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function renderTestimonials(){
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  grid.innerHTML = '<p class="section-subtitle" style="text-align:center">Loading reviews…</p>';

  try {
    const { createSupabaseClient } = await import('./src/supabaseClient.js');
    const { data, error } = await createSupabaseClient()
      .from('reviews')
      .select('name,rating,review')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;

    const reviews = data || [];
    if (!reviews.length) {
      grid.innerHTML = '<p class="section-subtitle" style="text-align:center">Approved client reviews will appear here soon.</p>';
      return;
    }

    grid.innerHTML = reviews.map((review, index) => {
      const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
      const name = escapeReviewHtml(review.name || 'Client');
      const reviewText = escapeReviewHtml(review.review || '');
      return `
        <div class="testimonial-card reveal" style="transition-delay:${index * 0.1}s">
          <div class="stars">${'<span>★</span>'.repeat(rating)}${'<span style="color:var(--text-muted)">★</span>'.repeat(5 - rating)}</div>
          <p class="testimonial-text">"${reviewText}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${name.charAt(0)}</div>
            <div class="author-info"><h4>${name}</h4><span>Verified Client</span></div>
          </div>
        </div>`;
    }).join('');
  } catch (error) {
    logSupabaseError(error, 'Approved reviews load failed');
    grid.innerHTML = '<p class="section-subtitle" style="text-align:center">Reviews are unavailable right now. Please try again later.</p>';
  }
}

function initBookingForm(){
  document.getElementById('bookingForm').addEventListener('submit', e=>{
    e.preventDefault();
    const name=document.getElementById('bookName').value.trim();
    const service=document.getElementById('bookService').value;
    const date=document.getElementById('bookDate').value;
    const details=document.getElementById('bookDetails').value.trim();
    const msg=encodeURIComponent(`Hello NorahsPrint Integrated Services Ltd! I'd like to book a service.\n\n👤 Name: ${name}\n🔧 Service: ${service}\n📅 Date: ${date}\n`+(details?`📝 Details: ${details}\n`:'')+`\nPlease confirm availability. Thank you!`);
    window.open(`https://wa.me/${PHONE}?text=${msg}`,'_blank');
  });
}

/* =====================================================
   CONTACT FORM — Web3Forms API
   Delivers messages to: godwinlucky2580@gmail.com
   ===================================================== */
function initContactForm(){
  const form       = document.getElementById('contactForm');
  const btn        = document.getElementById('contactSubmitBtn');
  const successMsg = document.getElementById('contactSuccess');
  const errorMsg   = document.getElementById('contactError');

  function showStatus(el) {
    el.classList.add('visible');
    // force reflow so transition fires
    el.getBoundingClientRect();
  }
  function hideStatus(el) {
    el.classList.remove('visible');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous status
    hideStatus(successMsg);
    hideStatus(errorMsg);

    // Loading state
    btn.disabled    = true;
    btn.textContent = '⏳ Sending…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body   : JSON.stringify({
          access_key : 'cf0c4895-0bc8-414d-b0b2-180b2e911bcd',
          subject    : 'New Contact Message — NorahsPrint Integrated Services Ltd Website',
          from_name  : 'NorahsPrint Integrated Services Ltd',
          name       : form.querySelector('[name="name"]').value,
          email      : form.querySelector('[name="email"]').value,
          phone      : form.querySelector('[name="phone"]').value || 'Not provided',
          message    : form.querySelector('[name="message"]').value
        })
      });

      const data = await response.json();

      if (data.success) {
        showStatus(successMsg);
        form.reset();
        btn.textContent = '✅ Message Sent!';
        setTimeout(() => {
          btn.textContent = 'Send Message 📨';
          btn.disabled    = false;
          hideStatus(successMsg);
        }, 5000);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      showStatus(errorMsg);
      btn.textContent = 'Send Message 📨';
      btn.disabled    = false;
      console.error('Contact form error:', err);
    }
  });
}

/* FEEDBACK RATING */
let selectedRating=5;
function initFeedbackRating(){
  const stars=document.querySelectorAll('#ratingInput span');
  stars.forEach(star=>{
    star.addEventListener('click',()=>{ selectedRating=parseInt(star.dataset.val); stars.forEach((s,i)=>s.classList.toggle('active',i<selectedRating)); });
    star.addEventListener('mouseenter',()=>{ const v=parseInt(star.dataset.val); stars.forEach((s,i)=>s.style.color=i<v?'white':'var(--text-muted)'); });
  });
  document.getElementById('ratingInput').addEventListener('mouseleave',()=>{ stars.forEach((s,i)=>s.style.color=i<selectedRating?' #1A60D4':'var(--text-muted)'); });
  stars.forEach((s,i)=>s.classList.toggle('active',i<5));
  document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('fbName').value.trim();
    const review = document.getElementById('fbReview').value.trim();
    const rating = selectedRating;

    // Keep UI behavior exactly the same
    btn.textContent='✅ Review Submitted! Thank you';

    try {
      const { createSupabaseClient } = await import('./src/supabaseClient.js');
      const supabaseClient = createSupabaseClient();

      const { data, error } = await supabaseClient
        .from('reviews')
        .insert({
          name,
          rating,
          review
        });

      if (error) {
        logSupabaseError(error, 'Supabase insert reviews error');
        alert(`Failed to submit review to Supabase:\n${error.message || error}`);
      } else {
        console.log('Supabase insert reviews success:', data);
      }
    } catch (err) {
      logSupabaseError(err, 'Supabase insert feedback_reviews exception');
      alert(`Failed to submit review to Supabase:\n${err.message || err}`);
    } finally {
      setTimeout(() => {
        btn.textContent='Submit Review';
        e.target.reset();
        selectedRating=5;
        document.querySelectorAll('#ratingInput span').forEach((s,i)=>{ s.classList.toggle('active',i<5); s.style.color=''; });
      }, 3000);
    }
  });
}

// // NEW RATING SYSTEM USING SUPABASE
// // Rating System
// const stars = document.querySelectorAll("#ratingInput span");
// let selectedRating = 0;

// stars.forEach((star) => {
//   star.addEventListener("click", () => {
//     selectedRating = parseInt(star.dataset.val);

//     stars.forEach((s) => {
//       const value = parseInt(s.dataset.val);

//       if (value <= selectedRating) {
//         s.classList.add("active");
//       } else {
//         s.classList.remove("active");
//       }
//     });
//   });
// });

// // Form Submission
// const feedbackForm = document.getElementById("feedbackForm");

// feedbackForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const name = document.getElementById("fbName").value.trim();
//   const review = document.getElementById("fbReview").value.trim();

//   // Validate rating
//   if (selectedRating === 0) {
//     alert("Please select a star rating.");
//     return;
//   }

//   try {
//     const submitBtn = feedbackForm.querySelector("button");
//     submitBtn.disabled = true;
//     submitBtn.innerHTML = "Submitting...";

//     const { data, error } = await supabase
//       .from("reviews")
//       .insert([
//         {
//           name: name,
//           rating: selectedRating,
//           review: review
//         }
//       ]);

//     if (error) {
//       console.error(error);
//       alert("Failed to submit review.");
//       return;
//     }

//     alert("Thank you! Your review has been submitted.");

//     // Reset Form
//     feedbackForm.reset();
//     selectedRating = 0;

//     stars.forEach((star) => {
//       star.classList.remove("active");
//     });

//   } catch (err) {
//     console.error(err);
//     alert("Something went wrong.");
//   } finally {
//     const submitBtn = feedbackForm.querySelector("button");
//     submitBtn.disabled = false;
//     submitBtn.innerHTML =
//       '<i style="color:black;" class="fas fa-pencil-alt"></i> Submit Review';
//   }
// });

// // STTOED HERE FOR FUTURE REFERENCE


/* SCROLL ANIMATIONS */
function initScrollAnimations(){
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } }),{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>obs.observe(el));
}
window.initScrollAnimations = initScrollAnimations;

/* COUNTERS */
function initCounters(){
  const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el=entry.target, target=parseInt(el.dataset.count); let current=0;
      const step=target/60;
      const timer=setInterval(()=>{ current=Math.min(current+step,target); el.textContent=Math.round(current);
        if(current>=target){ el.textContent=target+(el.closest('.stat-item')?.querySelector('.stat-label')?.textContent.includes('%')?'':'+'); clearInterval(timer); }
      },25);
      obs.unobserve(el);
    }
  }),{threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(c=>obs.observe(c));
}
