
const PHONE = '2347011875583';

const services = [
  {icon:'<i style="color: #1A60D4;" class="fa-solid fa-bed"></i>',title:'Custom African Furniture',desc:'Handcrafted from premium African hardwoods — Iroko, Mahogany, and Sapele — each piece tells a story of heritage and modern design.',features:['Bespoke design consultation','Premium African hardwood','Hand-finished detailing','10-year craftsmanship warranty'],service:'Custom African Furniture'},
  {icon:'<i style="color: #1A60D4;" class="fa-solid fa-bolt-lightning"></i>',title:'Electrical Installations',desc:'Fully certified residential and commercial electrical works — safe, reliable, and code-compliant.',features:['COREN-certified engineers','Smart home wiring','Home installation','Industrial electrical systems'],service:'Electrical Installation'},
  {icon:'<i style="color: #1A60D4;" class="fa fa-cubes"></i><i class="fa fa-square-o"></i>',title:'Celling POP',desc:'Precision POP systems for homes, offices, and industrial sites. We install, repair, and maintain all Pop infrastructure.',features:['Full POP installations','Pop leak detection','Industrial Pop systems','Water treatment solutions'],service:'POP'},
  {icon:'<i style="color: #1A60D4;" class="fa-solid fa-tools"></i>',title:'General Contracting',desc:'End-to-end project management for renovations, office fit-outs, and new builds. One team. One accountable partner.',features:['Full project management','Interior & exterior works','Commercial fit-outs','Renovation & restoration'],service:'General Contracting'}
];

const products = [
  {id:1,name:'Royal Iroko Dining Set',price:'₦420,000',cat:'Furniture',desc:'8-seater dining set crafted from premium Iroko wood with hand-carved details.',img:'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600&q=75'},
  {id:2,name:'Executive Mahogany Desk',price:'₦185,000',cat:'Furniture',desc:'Solid mahogany office desk with built-in cable management and drawers.',img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75'},
  {id:3,name:'Lagos Lounge Sofa Set',price:'₦310,000',cat:'Furniture',desc:'3+2 seater sofa in premium leather with Sapele wooden frame.',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=75'},
  {id:4,name:'Abuja King Bed Frame',price:'₦255,000',cat:'Furniture',desc:'King-size bed frame in solid Afromosia wood with carved headboard.',img:'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=75'},
  {id:5,name:'Smart LED Panel System',price:'₦65,000',cat:'Electrical',desc:'Complete smart LED lighting panel with dimmer control — set of 6.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75'},
  {id:6,name:'Industrial Circuit Breaker Board',price:'₦88,000',cat:'Electrical',desc:'32-slot distribution board, IP65 rated, with surge protection.',img:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=75'},
  {id:7,name:'Solar Inverter System 5KVA',price:'₦320,000',cat:'Electrical',desc:'5KVA hybrid solar inverter with 150Ah battery bank. Full installation included.',img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75'},
  {id:8,name:'CCTV Security Package',price:'₦120,000',cat:'Electrical',desc:'8-camera HD CCTV system with DVR and remote mobile access.',img:'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=75'},
  {id:9,name:'PPR Pop Bundle (100m)',price:'₦45,000',cat:'Pop',desc:'Premium PPR Pop 20mm diameter, hot & cold water rated, 100m bundle.',img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=75'},
  {id:10,name:'Pedrollo Water Pump 1HP',price:'₦72,000',cat:'Pop',desc:'Italian Pedrollo 1HP centrifugal water pump for residential use.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=75'},
  {id:11,name:'Overhead Water Tank 5000L',price:'₦110,000',cat:'Pop',desc:'Heavy-duty polyethylene 5000L overhead water storage tank.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75'},
  {id:12,name:'Kitchen Mixer Tap Set',price:'₦28,000',cat:'Pop',desc:'Premium brass mixer tap with ceramic cartridge and chrome finish.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=75'}
];

const testimonials = [
  {name:'Adaeze Nwachukwu',role:'Interior Designer, Lagos',stars:5,text:"NorahsPrint & Sons transformed my client's home beyond what we imagined. The Iroko dining set is absolutely stunning — guests always ask where it came from. Impeccable quality and they delivered ahead of schedule."},
  {name:'Chief Emeka Eze',role:'Property Developer, Abuja',stars:5,text:"We've engaged them for 3 commercial projects now. Their electrical installations pass every inspection first time. Professional team, fair pricing, and they actually show up when they say they will."},
  {name:'Bimbo Adeleke',role:'Homeowner, Port Harcourt',stars:5,text:"The solar inverter system they installed has saved me thousands monthly on generator fuel. Installation was clean, explained thoroughly, and their after-sales support is excellent."},
  {name:'Dr. Seun Falade',role:'Clinic Owner, Rivers State',stars:4,text:"Contracted them for our medical facility POP — a critical job. They met every regulation, completed on time, and the lead engineer was incredibly knowledgeable. Highly recommend."},
  {name:'Ngozi Obi',role:'Restaurant Owner, PH',stars:5,text:"My restaurant renovation was handled entirely by their contracting team. New furniture, rewiring, and full kitchen POP. The result is beautiful and I've had nothing but compliments since opening."},
  {name:'Tunde Bakare',role:'CEO, TechBridge Nigeria',stars:5,text:"Fitted our entire office floor — custom desks, conference table, and complete electrical rewiring. Professional from start to finish. The mahogany boardroom table is a showpiece."}
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderServices();
  renderProducts();
  renderTestimonials();
  initScrollAnimations();
  initCounters();
  initNav();
  initBookingForm();
  initContactForm();
  initFeedbackRating();
  setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 1800);
});

/* FOR INFINIT IMAGE LOOP */
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".hero-visual-card .hero-img");
  let currentIndex = 0;

  function nextImage() {
    images[currentIndex].classList.remove("active");

    currentIndex = (currentIndex + 1) % images.length;

    images[currentIndex].classList.add("active");
  }

  setInterval(nextImage, 4000);
});


/* THEME */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
}
function updateThemeIcon(t){ document.getElementById('themeToggle').textContent = t==='dark'?'🌙':'☀️'; }

/* NAV */
function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
  document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('open'));
}
function closeMobileNav(){ document.getElementById('mobileNav').classList.remove('open'); }

/* RENDER SERVICES */
function renderServices() {
  document.getElementById('servicesGrid').innerHTML = services.map((s,i) => `
    <div class="service-card reveal" style="transition-delay:${i*0.1}s">
      <div class="service-icon">${s.icon}</div>
      <div class="service-title">${s.title}</div>
      <p class="service-desc">${s.desc}</p>
      <ul class="service-features">${s.features.map(f=>`<li>${f}</li>`).join('')}</ul>
      <button class="btn-book-service" data-service="${s.service.replace(/"/g,'&quot;')}"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="25px" height="25px" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
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
</svg> Book Now</button>
    </div>`).join('');

  // Attach click listeners after rendering
  document.querySelectorAll('.btn-book-service').forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.getAttribute('data-service');
      const msg = encodeURIComponent(`Hello NorahsPrint & Sons, I am interested in your ${service} service. Please provide more information.`);
      window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank');
    });
  });
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
          <div class="product-price">${p.price}<span> NGN</span></div>
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
function renderTestimonials(){
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
function initBookingForm(){
  document.getElementById('bookingForm').addEventListener('submit', e=>{
    e.preventDefault();
    const name=document.getElementById('bookName').value.trim();
    const service=document.getElementById('bookService').value;
    const date=document.getElementById('bookDate').value;
    const details=document.getElementById('bookDetails').value.trim();
    const msg=encodeURIComponent(`Hello NorahsPrint Intergrated Services Ltd! I'd like to book a service.\n\n👤 Name: ${name}\n🔧 Service: ${service}\n📅 Date: ${date}\n`+(details?`📝 Details: ${details}\n`:'')+`\nPlease confirm availability. Thank you!`);
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
          subject    : 'New Contact Message — NorahsPrint Intergrated Services Ltd Website',
          from_name  : 'NorahsPrint Intergrated Services Ltd',
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
      const SUPABASE_URL = "https://qlsamwfphiusocbddzdp.supabase.co";
      const SUPABASE_ANON_KEY = "sb_publishable_CtwYB9-3gNMDG6dK6FcPuQ_2zKPW1Y4";

      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabaseClient
        .from('reviews')
        .insert({
          name,
          rating,
          review
        });

      if (error) {
        console.error('Supabase insert reviews error:', error);
        alert(`Failed to submit review to Supabase:\n${error.message || error}`);
      } else {
        console.log('Supabase insert reviews success:', data);
      }
    } catch (err) {
      console.error('Supabase insert feedback_reviews exception:', err);
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