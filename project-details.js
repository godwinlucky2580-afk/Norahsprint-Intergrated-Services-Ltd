import { createSupabaseClient } from './src/supabaseClient.js';

const PAGE_CONTENT = document.getElementById('pageContent');
const LOADING_OVERLAY = document.getElementById('loadingOverlay');
const ERROR_SHELL = document.getElementById('errorShell');
const LIGHTBOX = document.getElementById('lightbox');
const LIGHTBOX_IMAGE = document.getElementById('lightboxImage');
const LIGHTBOX_COUNTER = document.getElementById('lightboxCounter');
const LIGHTBOX_CLOSE = document.getElementById('lightboxClose');
const LIGHTBOX_PREV = document.getElementById('lightboxPrev');
const LIGHTBOX_NEXT = document.getElementById('lightboxNext');
const THEME_TOGGLE = document.getElementById('themeToggle');


function logSupabaseError(error, context = 'Supabase operation failed') {
  console.error(context);
  console.error(error);
  console.log({
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });
}

const state = {
  project: null,
  features: [],
  gallery: [],
  related: [],
  activeGalleryIndex: 0,
  selectedTab: 'overview',
  activeThumbnailIndex: 0,
};

function escapeHtml(value) {
  return (value ?? '')
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getTabContent(tabKey, project) {
  switch (tabKey) {
    case 'challenge':
      return `<p class="section-subtext">${escapeHtml(project.challenge || 'No challenge details are available.')}</p>`;
    case 'solution':
      return `<p class="section-subtext">${escapeHtml(project.solution || 'No solution details are available.')}</p>`;
    case 'result':
      return `<p class="section-subtext">${escapeHtml(project.result || 'No result details are available.')}</p>`;
    case 'features':
      if (!state.features.length) {
        return `<p class="section-subtext">No features have been listed for this project.</p>`;
      }
      return `
        <ul class="feature-grid project-feature-list">
          ${state.features.map((feature) => `<li class="feature-card">${escapeHtml(feature.feature || '')}</li>`).join('')}
        </ul>
      `;
    case 'overview':
    default:
      return `<p class="section-subtext">${escapeHtml(project.overview || 'No overview is available.')}</p>`;
  }
}

function setupProjectTabs(project) {
  const tabButtons = Array.from(document.querySelectorAll('.detail-tab-button'));
  const tabPanel = document.getElementById('projectTabPanel');
  if (!tabPanel || !tabButtons.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedTab = button.dataset.tab;
      if (!selectedTab) return;
      state.selectedTab = selectedTab;

      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tab === selectedTab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      tabPanel.innerHTML = getTabContent(selectedTab, project);
    });
  });
}

function setupThumbnailGallery() {
  const thumbnails = Array.from(document.querySelectorAll('.project-thumb'));
  const mainImage = document.getElementById('mainProjectImage');
  if (!thumbnails.length || !mainImage) return;

  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const index = Number(thumb.dataset.index);
      const src = thumb.dataset.src;
      const alt = thumb.dataset.alt;
      if (typeof index !== 'number' || !src) return;

      state.activeThumbnailIndex = index;
      thumbnails.forEach((item) => item.classList.toggle('is-active', Number(item.dataset.index) === index));
      mainImage.src = src;
      mainImage.alt = alt || mainImage.alt;
    });
  });
}

function setThemeToggle() {
  if (!THEME_TOGGLE) return;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeIcon = THEME_TOGGLE.querySelector('#themeIcon');
  const updateThemeIcon = (theme) => {
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  };
  updateThemeIcon(savedTheme);
  THEME_TOGGLE.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeIcon(nextTheme);
  });
}

function showLoading() {
  if (LOADING_OVERLAY) LOADING_OVERLAY.hidden = false;
}

function hideLoading() {
  if (LOADING_OVERLAY) LOADING_OVERLAY.hidden = true;
}

function showError(message) {
  if (!ERROR_SHELL) return;
  ERROR_SHELL.hidden = false;
  ERROR_SHELL.innerHTML = `
    <div class="error-card">
      <p class="section-tag">Project Details</p>
      <h2>Unable to load project.</h2>
      <p>${escapeHtml(message)}</p>
      <div class="hero-actions">
        <button class="hero-btn primary" id="retryBtn">Retry</button>
        <a class="hero-btn secondary" href="projects.html">Back to Projects</a>
      </div>
    </div>
  `;
  document.getElementById('retryBtn')?.addEventListener('click', () => {
    ERROR_SHELL.hidden = true;
    initProjectPage();
  });
}

function getImageUrl(storagePath) {
  if (!storagePath) return '';
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const supabase = createSupabaseClient();
  return supabase.storage.from('project-images').getPublicUrl(storagePath).data.publicUrl;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getProjectIdentifier() {
  const id = getQueryParam('id');
  if (id) return { type: 'id', value: id };
  return null;
}

function setSeo(project) {
  const title = project?.title ? `${project.title} | NorahsPrint Integrated Services` : 'Project Details | NorahsPrint Integrated Services';
  const summary = project?.overview ? project.overview.slice(0, 155) : 'View this project story, outcomes, and gallery from NorahsPrint Integrated Services.';
  const image = project?.cover_image ? getImageUrl(project.cover_image) : '';
  document.title = title;
  const metaSummary = document.querySelector('meta[name="descrip' + 'tion"]');
  if (metaSummary) metaSummary.setAttribute('content', summary);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', image || ogImage.getAttribute('content'));
}

function makeSkeleton() {
  return `
    <section class="project-skeleton">
      <div class="project-skeleton-card"></div>
    </section>
  `;
}

function renderProject(project) {
  const heroImageUrl = project.cover_image ? getImageUrl(project.cover_image) : '';
  const thumbnailItems = [
    ...(heroImageUrl ? [{ src: heroImageUrl, alt: `${project.title || 'Project'} cover image`, type: 'cover' }] : []),
    ...state.gallery.map((item) => ({
      src: getImageUrl(item.image_url),
      alt: `${escapeHtml(item.image_type || 'Project')} image`,
      type: item.image_type || 'gallery',
    })),
  ];
  if (thumbnailItems.length === 0 && heroImageUrl) {
    thumbnailItems.push({ src: heroImageUrl, alt: `${project.title || 'Project'} cover image`, type: 'cover' });
  }

  const activeThumb = thumbnailItems[state.activeThumbnailIndex] || thumbnailItems[0] || { src: heroImageUrl, alt: project.title || 'Project image' };
  if (state.activeThumbnailIndex >= thumbnailItems.length) {
    state.activeThumbnailIndex = 0;
  }

  const statusLabel = project.status ? escapeHtml(project.status) : 'N/A';
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'challenge', label: 'Challenges' },
    { key: 'solution', label: 'Solutions' },
    { key: 'result', label: 'Results' },
  ];

  if (state.features.length) {
    tabs.push({ key: 'features', label: 'Features' });
  }

  const tabButtons = tabs.map((tab) => `
    <button
      type="button"
      class="detail-tab-button ${state.selectedTab === tab.key ? 'is-active' : ''}"
      data-tab="${tab.key}"
      aria-selected="${state.selectedTab === tab.key ? 'true' : 'false'}"
    >
      ${tab.label}
    </button>
  `).join('');

  PAGE_CONTENT.innerHTML = `
    <section class="project-detail-shell" data-reveal>
      <div class="project-detail-grid">
        <div class="project-detail-media">
          <div class="project-image-card">
            <img id="mainProjectImage" class="project-main-image" src="${activeThumb.src}" alt="${escapeHtml(activeThumb.alt)}" loading="eager" />
          </div>
          <div class="project-thumbnails">
            ${thumbnailItems.map((thumb, index) => `
              <button type="button" class="project-thumb ${state.activeThumbnailIndex === index ? 'is-active' : ''}" data-index="${index}" data-src="${thumb.src}" data-alt="${escapeHtml(thumb.alt)}" aria-label="View thumbnail ${index + 1}">
                <img src="${thumb.src}" alt="${escapeHtml(thumb.alt)}" loading="lazy" />
              </button>
            `).join('')}
          </div>
        </div>

        <aside class="project-detail-summary">
          <div class="project-summary-header">
            <div class="project-badges">
              ${project.category ? `<span class="hero-pill"><i class="fa-solid fa-layer-group"></i> ${escapeHtml(project.category)}</span>` : ''}
              ${project.location ? `<span class="hero-pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(project.location)}</span>` : ''}
            </div>
            <h1 class="project-summary-title">${escapeHtml(project.title || 'Project')}</h1>
            <p class="project-summary-copy">${escapeHtml(project.overview || '')}</p>
          </div>

          <div class="project-info-card">
            <div class="project-info-row">
              <span>Client</span>
              <strong>${escapeHtml(project.client_name || 'Confidential')}</strong>
            </div>
            <div class="project-info-row">
              <span>Location</span>
              <strong>${escapeHtml(project.location || 'N/A')}</strong>
            </div>
            <div class="project-info-row">
              <span>Category</span>
              <strong>${escapeHtml(project.category || 'N/A')}</strong>
            </div>
            <div class="project-info-row">
              <span>Duration</span>
              <strong>${escapeHtml(project.duration || 'N/A')}</strong>
            </div>
            <div class="project-info-row">
              <span>Status</span>
              <strong>${statusLabel}</strong>
            </div>
          </div>

          <div class="project-summary-actions">
            <a class="hero-btn primary" href="projects.html">Back to Projects</a>
            <a class="hero-btn secondary" href="index.html#contact">Request Similar Project</a>
          </div>
        </aside>
      </div>

      <div class="project-detail-tabs">
        <div class="detail-tab-nav" role="tablist">
          ${tabButtons}
        </div>
        <div class="project-tab-panel" id="projectTabPanel">
          ${getTabContent(state.selectedTab, project)}
        </div>
      </div>
    </section>

    <section class="section-shell" data-reveal>
      <div class="container">
        <p class="section-tag">Before / After</p>
        <h3 class="section-title">Transformation at a glance</h3>
        <div class="before-after-shell">
          <div class="comparison-card" id="comparisonCard">
            <div class="comparison-track">
              <div class="before-layer" id="beforeLayer">
                ${state.gallery.find((item) => item.image_type === 'before') ? `<img src="${getImageUrl(state.gallery.find((item) => item.image_type === 'before').image_url)}" alt="Before renovation" loading="lazy" />` : '<div class="loading-line"></div>'}
              </div>
              <img src="${state.gallery.find((item) => item.image_type === 'after') ? getImageUrl(state.gallery.find((item) => item.image_type === 'after').image_url) : ''}" alt="After renovation" loading="lazy" />
              <div class="comparison-divider" id="comparisonDivider"></div>
              <div class="comparison-handle" id="comparisonHandle"><i class="fa-solid fa-arrows-left-right"></i></div>
              <div class="comparison-labels">
                <span class="comparison-label">Before</span>
                <span class="comparison-label">After</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-shell project-gallery-section" data-reveal>
      <div class="container">
        <p class="section-tag">Project gallery</p>
        <h3 class="section-title">A closer look at the journey</h3>
        ${['before', 'progress', 'after'].map((imageType) => {
          const images = state.gallery.filter((item) => item.image_type === imageType);
          return images.length ? `
            <h4 class="section-subtitle">${escapeHtml(imageType[0].toUpperCase() + imageType.slice(1))}</h4>
            <div class="masonry-grid">
              ${images.map((item) => `
                <div class="masonry-item" data-index="${state.gallery.indexOf(item)}">
                  <img src="${getImageUrl(item.image_url)}" alt="${escapeHtml(`${imageType} project image`)}" loading="lazy" />
                </div>
              `).join('')}
            </div>
          ` : '';
        }).join('')}
      </div>
    </section>

    <section class="section-shell related-projects-section" data-reveal>
      <div class="container">
        <p class="section-tag">Related projects</p>
        <h3 class="section-title">Projects with a similar design language</h3>
        <div class="related-grid">
          ${state.related.map((item) => `
            <article class="related-card">
              <img src="${item.cover_image ? getImageUrl(item.cover_image) : ''}" alt="${escapeHtml(item.title || 'Related project')}" loading="lazy" />
              <div class="related-body">
                <h4>${escapeHtml(item.title || 'Related project')}</h4>
                <p class="section-subtext">${escapeHtml(item.location || '')}</p>
                <a class="hero-btn secondary" href="project-details.html?id=${escapeHtml(item.id || '')}">View Project</a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section-shell cta-section" data-reveal>
      <div class="container">
        <div class="cta-card">
          <p class="section-tag">Start your next build</p>
          <h3 class="section-title">Ready to Build Your Own Project?</h3>
          <div class="cta-actions">
            <a class="hero-btn primary" href="index.html#contact">Request Quote</a>
            <a class="hero-btn secondary" href="index.html#contact">Contact Us</a>
          </div>
        </div>
      </div>
    </section>
  `;

  setupThumbnailGallery();
  setupProjectTabs(project);
  bindGalleryInteractions();
  setupRevealAnimations();
  setupComparisonSlider();
}

function setupRevealAnimations() {
  // Gallery cards start hidden for their entrance animation. Include them in
  // the observer so they become visible when they enter the viewport.
  const revealItems = Array.from(document.querySelectorAll('[data-reveal], .masonry-item'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
}

function setupComparisonSlider() {
  const card = document.getElementById('comparisonCard');
  const beforeLayer = document.getElementById('beforeLayer');
  const divider = document.getElementById('comparisonDivider');
  const handle = document.getElementById('comparisonHandle');
  if (!card || !beforeLayer || !divider || !handle) return;

  const setPosition = (x) => {
    const rect = card.getBoundingClientRect();
    const percent = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
    beforeLayer.style.width = `${percent}%`;
    divider.style.left = `${percent}%`;
    handle.style.left = `${percent}%`;
  };

  const handleStart = (event) => {
    setPosition(event.clientX);
    if (event.pointerId != null && card.setPointerCapture) {
      card.setPointerCapture(event.pointerId);
    }
  };

  card.addEventListener('pointerdown', handleStart);
  card.addEventListener('pointermove', (event) => {
    if (event.buttons === 0) return;
    setPosition(event.clientX);
  });
  card.addEventListener('pointerup', (event) => {
    if (event.pointerId != null && card.releasePointerCapture) {
      card.releasePointerCapture(event.pointerId);
    }
  });
  card.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (touch) setPosition(touch.clientX);
  }, { passive: true });

  setPosition(card.getBoundingClientRect().width * 0.5);
}

function bindGalleryInteractions() {
  const galleryItems = Array.from(document.querySelectorAll('.masonry-item'));
  if (!galleryItems.length) return;

  const openLightbox = (index) => {
    state.activeGalleryIndex = index;
    updateLightbox();
    LIGHTBOX.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const updateLightbox = () => {
    const item = state.gallery[state.activeGalleryIndex];
    if (!item) return;
    LIGHTBOX_IMAGE.src = getImageUrl(item.image_url);
    LIGHTBOX_IMAGE.alt = `${item.image_type || 'Project'} image`;
    LIGHTBOX_COUNTER.textContent = `${state.activeGalleryIndex + 1} / ${state.gallery.length}`;
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      openLightbox(Number(item.getAttribute('data-index')));
    });
  });

  LIGHTBOX_CLOSE?.addEventListener('click', () => {
    LIGHTBOX.hidden = true;
    document.body.style.overflow = '';
  });

  LIGHTBOX_PREV?.addEventListener('click', () => {
    state.activeGalleryIndex = (state.activeGalleryIndex - 1 + state.gallery.length) % state.gallery.length;
    updateLightbox();
  });

  LIGHTBOX_NEXT?.addEventListener('click', () => {
    state.activeGalleryIndex = (state.activeGalleryIndex + 1) % state.gallery.length;
    updateLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (LIGHTBOX.hidden) return;
    if (event.key === 'Escape') {
      LIGHTBOX.hidden = true;
      document.body.style.overflow = '';
    }
    if (event.key === 'ArrowLeft') {
      state.activeGalleryIndex = (state.activeGalleryIndex - 1 + state.gallery.length) % state.gallery.length;
      updateLightbox();
    }
    if (event.key === 'ArrowRight') {
      state.activeGalleryIndex = (state.activeGalleryIndex + 1) % state.gallery.length;
      updateLightbox();
    }
  });

  LIGHTBOX.addEventListener('click', (event) => {
    if (event.target === LIGHTBOX) {
      LIGHTBOX.hidden = true;
      document.body.style.overflow = '';
    }
  });
}

async function fetchProjectData(identifier) {
  const supabase = createSupabaseClient();
  const query = supabase.from('projects').select('*').eq('id', identifier.value);

  const { data: projectData, error: projectError } = await query.maybeSingle();

  if (projectError) throw projectError;
  if (!projectData) {
    throw new Error('Project not found');
  }

  const [{ data: featuresData, error: featuresError }, { data: galleryData, error: galleryError }, { data: relatedData, error: relatedError }] = await Promise.all([
    supabase.from('project_features').select('*').eq('project_id', projectData.id).order('id', { ascending: true }),
    supabase.from('project_gallery').select('*').eq('project_id', projectData.id).order('display_order', { ascending: true }),
    supabase.from('projects').select('id,title,location,category,cover_image').eq('category', projectData.category).neq('id', projectData.id).limit(3),
  ]);

  if (featuresError || galleryError || relatedError) {
    throw featuresError || galleryError || relatedError;
  }

  return {
    project: projectData,
    features: featuresData || [],
    gallery: galleryData || [],
    related: relatedData || [],
  };
}

function renderNotFound() {
  PAGE_CONTENT.innerHTML = `
    <div class="not-found-shell">
      <div class="not-found-card">
        <p class="section-tag">Project Details</p>
        <h1 class="section-title">Project Not Found</h1>
        <p class="section-subtext">The requested project could not be found. Please return to the portfolio and explore other completed work.</p>
        <div class="hero-actions">
          <a class="hero-btn primary" href="projects.html">Return to Projects</a>
          <a class="hero-btn secondary" href="index.html">Back Home</a>
        </div>
      </div>
    </div>
  `;
}

export async function initProjectPage() {
  setThemeToggle();
  const transitionOverlay = document.querySelector('.page-transition');
  if (transitionOverlay) {
    transitionOverlay.style.opacity = '0.75';
  }
  showLoading();
  PAGE_CONTENT.innerHTML = makeSkeleton();
  ERROR_SHELL.hidden = true;

  try {
    const identifier = getProjectIdentifier();
    if (!identifier) {
      throw new Error('Project identifier is missing');
    }

    const data = await fetchProjectData(identifier);
    state.project = data.project;
    state.features = data.features;
    state.gallery = data.gallery;
    state.related = data.related;

    setSeo(state.project);
    renderProject(state.project);
  } catch (error) {
    logSupabaseError(error, 'Project details load failed');
    if (error.message === 'Project not found') {
      renderNotFound();
    } else {
      showError(error.message || 'Unable to load project.');
    }
  } finally {
    const transitionOverlay = document.querySelector('.page-transition');
    if (transitionOverlay) {
      transitionOverlay.style.opacity = '0';
    }
    hideLoading();
  }
}

initProjectPage();
