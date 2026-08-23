import { createSupabaseClient } from './src/supabaseClient.js';

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const toggleButton = document.getElementById('themeToggle');
if (toggleButton) {
  const themeIcon = toggleButton.querySelector('#themeIcon');
  const updateThemeIcon = (theme) => {
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  };
  updateThemeIcon(savedTheme);
  toggleButton.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeIcon(nextTheme);
  });
}

const supabase = createSupabaseClient();
const PROJECTS_STORAGE_BUCKET = 'project-images';

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

function getProjectImageUrl(storagePath) {
  if (!storagePath) return '';
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const { data } = supabase.storage.from(PROJECTS_STORAGE_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || '';
}

const portfolioGrid = document.getElementById('portfolioGrid');
const projectsNotice = document.getElementById('projects' + 'Status');
const loadMoreWrap = document.getElementById('loadMoreWrap');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

const initialVisibleCount = 8;
let visibleCount = initialVisibleCount;
let activeFilter = 'All';
let allProjects = [];
let filteredProjects = [];

function setNotice(message, type = 'info') {
  if (!projectsNotice) return;
  projectsNotice.textContent = message;
  projectsNotice.className = 'projects-' + 'status ' + type;
}

function clearNotice() {
  if (!projectsNotice) return;
  projectsNotice.textContent = '';
  projectsNotice.className = 'projects-' + 'status';
}

function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'project-card';
  article.setAttribute('data-category', project.category || '');
  article.setAttribute('data-id', project.id || '');

  const imageUrl = getProjectImageUrl(project.cover_image);
  const imageAlt = project.title || 'Project image';

  article.innerHTML = `
    <img src="${imageUrl}" alt="${imageAlt}" loading="lazy" decoding="async" />
    <div class="card-body">
      <div class="card-meta">
        <span class="card-badge">${project.category || ''}</span>
      </div>
      <h3>${project.title || ''}</h3>
      <p class="card-location"><i class="fa-solid fa-location-dot"></i> ${project.location || ''}</p>
      <p class="card-${'descrip' + 'tion'}">${project.overview || ''}</p>
      <a class="card-link" href="project-details.html?id=${project.id || ''}">View Project</a>
    </div>
  `;

  return article;
}

function renderProjects(projects, resetCount = true) {
  if (!portfolioGrid) return;

  if (resetCount) {
    visibleCount = initialVisibleCount;
  }

  portfolioGrid.innerHTML = '';

  if (projects.length === 0) {
    setNotice('Projects will appear here soon.', 'empty');
    loadMoreWrap.style.display = 'none';
    return;
  }

  clearNotice();

  projects.forEach((project, index) => {
    const card = createProjectCard(project);
    const delay = Math.min(index * 35, 180);
    card.style.transitionDelay = `${delay}ms`;

    if (index < visibleCount) {
      card.classList.add('is-visible');
    } else {
      card.classList.add('is-hidden');
    }

    portfolioGrid.appendChild(card);
  });

  if (loadMoreBtn && projects.length > visibleCount) {
    loadMoreWrap.style.display = 'flex';
  } else {
    loadMoreWrap.style.display = 'none';
  }
}

function applyFilter(category, resetCount = true) {
  activeFilter = category;

  if (resetCount) {
    visibleCount = initialVisibleCount;
  }

  filteredProjects = category === 'All'
    ? allProjects
    : allProjects.filter((p) => (p.category || '') === category);

  renderProjects(filteredProjects, resetCount);
}

async function loadProjectsFromSupabase() {
  setNotice('Loading projects…', 'loading');

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id,title,category,location,overview,cover_image')
      .order('id', { ascending: false });

    if (error) {
      throw error;
    }

    allProjects = data || [];
    filteredProjects = allProjects;

    if (allProjects.length === 0) {
      renderProjects([]);
    } else {
      applyFilter('All');
    }
  } catch (err) {
    logSupabaseError(err, 'Failed to load projects');
    setNotice('Unable to load projects. Please try again later.', 'error');
    loadMoreWrap.style.display = 'none';
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    applyFilter(button.dataset.filter);
  });
});

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    visibleCount = Math.min(visibleCount + 4, filteredProjects.length);
    renderProjects(filteredProjects, false);
  });
}

loadProjectsFromSupabase();
