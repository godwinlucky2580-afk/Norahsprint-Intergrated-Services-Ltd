
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
      <button class="btn-book-service" data-service="${s.service.replace(/"/g,'&quot;')}">📱 Book Now</button>
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
          <button class="btn-order" onclick="orderProduct('${p.name}','${p.price}')"><i class="fab fa-whatsapp"></i> Order</button>
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
    const msg=encodeURIComponent(`Hello NorahsPrint & Sons! I'd like to book a service.\n\n👤 Name: ${name}\n🔧 Service: ${service}\n📅 Date: ${date}\n`+(details?`📝 Details: ${details}\n`:'')+`\nPlease confirm availability. Thank you!`);
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
          subject    : 'New Contact Message — NorahsPrint & Sons Website',
          from_name  : 'NorahsPrint & Sons Website',
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
  document.getElementById('ratingInput').addEventListener('mouseleave',()=>{ stars.forEach((s,i)=>s.style.color=i<selectedRating?'white':'var(--text-muted)'); });
  stars.forEach((s,i)=>s.classList.toggle('active',i<5));
  document.getElementById('feedbackForm').addEventListener('submit',e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    btn.textContent='✅ Review Submitted! Thank you';
    setTimeout(()=>{ btn.textContent='✉️ Submit Review'; e.target.reset(); selectedRating=5; document.querySelectorAll('#ratingInput span').forEach((s,i)=>{ s.classList.toggle('active',i<5); s.style.color=''; }); },3000);
  });
}

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