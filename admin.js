import { createSupabaseClient } from './src/supabaseClient.js';

// NOTE:
// This dashboard is intentionally standalone (no React/Next/Vue) and uses the existing
// Supabase products/products-images setup. It gates access via Supabase Auth.

const supabase = createSupabaseClient();

const STORAGE_BUCKET = 'product-images';
const PROJECT_STORAGE_BUCKET = 'project-images';
const TABLE = 'products';
const PROJECTS_TABLE = 'projects';
const PROJECT_FEATURES_TABLE = 'project_features';
const PROJECT_GALLERY_TABLE = 'project_gallery';
const REVIEWS_TABLE = 'reviews';

const qs = (sel) => document.querySelector(sel);
const projectsTbodyEl = document.getElementById('projectsTbody');
let projectsCache = [];
let reviewsCache = [];
let activeReviewFilter = 'all';

// Safely flatten nested Supabase row data (handles potential JSON/object fields)
function safeVal(obj, path, fallback = '') {
  if (!obj) return fallback;
  const parts = path.split('.');
  let current = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return fallback;
    current = current[p];
  }
  return current ?? fallback;
}

function escapeHtml(str) {
  return (str ?? '')
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function toast({ type = 'success', title = '', message = '' } = {}) {
  const container = qs('#toastContainer');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  el.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}" aria-hidden="true"></i>
    <div>
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    el.style.transition = '200ms ease';
    setTimeout(() => el.remove(), 250);
  }, 4200);
}

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

async function logProjectSaveStep(startMessage, doneMessage, operation) {
  console.log(startMessage);
  const result = await operation();
  if (result?.error) throw result.error;
  console.log(doneMessage);
  return result;
}

function show(el) {
  if (!el) return;
  el.style.display = '';
}

function hide(el) {
  if (!el) return;
  el.style.display = 'none';
}

function setBusy(isBusy) {
  const formBtn = qs('#submitProductBtn');
  const loadWrap = qs('#productsLoading');

  if (formBtn) formBtn.disabled = isBusy;
  if (loadWrap) {
    if (isBusy) show(loadWrap);
    else hide(loadWrap);
  }
}

function normalizeCategory(value) {
  const v = (value ?? '').toString().trim();
  return v || '';
}

function normalizeText(value) {
  return (value ?? '').toString().trim();
}

function buildPublicUrlForBucket(path, bucket = STORAGE_BUCKET) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const url = supabase.storage.from(bucket).getPublicUrl(path);
  return url?.data?.publicUrl || '';
}

function getStoragePathFromProjectImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (!/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const marker = `/storage/v1/object/public/${PROJECT_STORAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return '';
  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

async function requireAdmin() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) throw error;

  if (!session) {
    const email = prompt("Enter admin email:");
    const password = prompt("Enter admin password:");

    if (!email || !password) {
      throw new Error("Login cancelled");
    }

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (loginError) throw loginError;

    return data.user;
  }

  return session.user;
}
// async function requireAdmin() {
//   // Security model:
//   // - Your Supabase RLS should ensure only admins can write products.
//   // - Here we additionally gate UI access by Auth.
//   const {
//     data: { session },
//     error: sessionError,
//   } = await supabase.auth.getSession();

//   if (sessionError) {
//     throw sessionError;
//   }

//   const user = session?.user;
//   if (!user) {
//     // Redirect to Supabase-hosted auth (admin should log in)
//     // Uses a universal OAuth callback; adjust if needed.
//     const redirectTo = window.location.href;
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: { redirectTo },
//     });
//     if (error) throw error;
//     return;
//   }

//   // Optional admin check:
//   // If you have an `admins` table, uncomment below.
//   // const { data: isAdmin, error } = await supabase
//   //   .from('admins')
//   //   .select('id')
//   //   .eq('user_id', user.id)
//   //   .maybeSingle();
//   // if (error) throw error;
//   // if (!isAdmin) throw new Error('Not authorized');

//   return user;
// }

function renderAdminHeaderUser(user) {
  const el = qs('#adminUserEmail');
  if (!el) return;
  el.textContent = user.email || user.id;
}

async function fetchProducts({ search = '', category = 'All' } = {}) {
  let query = supabase
    .from(TABLE)
    .select('id,name,description,price,category,image_url');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const q = normalizeText(search);
  if (q) {
    query = query.or([
      `name.ilike.%${q}%`,
      `category.ilike.%${q}%`,
      `description.ilike.%${q}%`,
    ].join(','));
  }

  query = query.order('id', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('category')
    .not('category', 'is', null)
    .order('category', { ascending: true });

  if (error) throw error;
  const cats = new Set((data || []).map((r) => normalizeCategory(r.category)).filter(Boolean));
  return ['All', ...Array.from(cats)];
}

function productRowHtml(p) {
    const rawPrice = p.price !== null && p.price !== undefined ? String(p.price).replace(/[^0-9.]/g, '') : '0';
    const numericPrice = parseFloat(rawPrice) || 0;
    
    // 2. Format with commas and Naira sign
    const formattedPrice = `₦${numericPrice.toLocaleString('en-NG')}`;
    
    const img = p.image_url || '';

  return `
    <tr data-id="${p.id}">
      <td>
        ${img ? `<img class="thumb" src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy" />` : `<div class="empty">—</div>`}
      </td>
      <td>
        <div style="font-weight:800">${escapeHtml(p.name || '')}</div>
      </td>
      <td>
        <div style="color:var(--muted);max-width:420px;">${escapeHtml(p.description || '')}</div>
      </td>
      <td>
        <div style="font-weight:900">${escapeHtml(formattedPrice)}</div>
      </td>
      <td>
        <div>${escapeHtml(p.category || '')}</div>
      </td>
      <td>
        <div class="actions">
          <button class="icon-btn icon-btn-primary" type="button" data-action="edit">Edit</button>
          <button class="icon-btn icon-btn-danger" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    </tr>
    <tr class="product-edit-row" data-id="${p.id}">
      <td colspan="6">
        <div class="inline-edit" aria-label="Edit form">
          <div class="edit-fields">
            <div class="form-row">
              <label>Name</label>
              <input type="text" class="edit-name" value="${escapeHtml(p.name || '')}" />
            </div>
            <div class="form-row edit-description-field">
              <label>Description</label>
              <textarea class="edit-description" rows="3">${escapeHtml(p.description || '')}</textarea>
            </div>
            <div class="form-row">
              <label>Price (NGN)</label>
              <input type="number" class="edit-price" min="0" step="1" value="${escapeHtml(p.price ?? 0)}" />
            </div>
            <div class="form-row">
              <label>Category</label>
              <input type="text" class="edit-category" value="${escapeHtml(p.category || '')}" />
            </div>
          </div>
          <div class="actions edit-actions">
            <button class="icon-btn" type="button" data-action="cancel">Cancel</button>
            <button class="icon-btn icon-btn-primary" type="button" data-action="save">Save</button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function setEditOpen(row, open) {
  const edit = row.nextElementSibling?.querySelector('.inline-edit');
  if (!edit) return;
  row.nextElementSibling.classList.toggle('open', open);
  edit.classList.toggle('open', open);
}

async function createProduct({ name, description, price, category, imagePath, imageUrl } = {}) {
  const payload = {
    name,
    description,
    price,
    category,
    image_url: imageUrl,
  };

  const { data, error } = await supabase.from(TABLE).insert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}

async function updateProduct(id, { name, description, price, category } = {}) {
  const payload = { name, description, price, category };

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function deleteProduct(id) {
  // 1. Get the image URL before deleting the row
  const { data: product } = await supabase
    .from(TABLE)
    .select('image_url')
    .eq('id', id)
    .maybeSingle();

  // 2. Delete the row from the database
  const { error: dbError } = await supabase.from(TABLE).delete().eq('id', id);
  if (dbError) throw dbError;

  // 3. Clean up the storage file if a URL exists
  if (product?.image_url) {
    const fileName = product.image_url.split('/').pop();
    await supabase.storage.from(STORAGE_BUCKET).remove([`products/${fileName}`]);
  }
}

async function uploadImageToStorage(file) {
  // Storage path uses timestamp + random to avoid collisions.
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `products/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const publicUrl = buildPublicUrlForBucket(path);
  if (!publicUrl) throw new Error('Failed to generate public URL from uploaded image.');

  return { imagePath: path, imageUrl: publicUrl };
}

function getProjectValue(project, path, fallback = '') {
  if (!project) return fallback;
  const parts = path.split('.');
  let current = project;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return fallback;
    current = current[part];
  }
  return current ?? fallback;
}

function buildProjectRowHtml(project) {
  const title = getProjectValue(project, 'title', 'Untitled Project');
  const category = getProjectValue(project, 'category', 'Uncategorized');
  const location = getProjectValue(project, 'location', '—');
  const clientName = getProjectValue(project, 'client_name', 'Client not listed');
  const coverImage = getProjectValue(project, 'cover_image', '');
  const coverImageSrc = buildPublicUrlForBucket(coverImage, PROJECT_STORAGE_BUCKET);
  const duration = getProjectValue(project, 'duration', '—');

  return `
    <tr data-id="${project.id}">
      <td>
        ${coverImageSrc ? `<img class="thumb" src="${escapeHtml(coverImageSrc)}" alt="${escapeHtml(title)}" loading="lazy" />` : `<div class="empty">—</div>`}
      </td>
      <td>
        <div style="font-weight:800">${escapeHtml(title)}</div>
        <div style="color:var(--muted);font-size:.82rem;margin-top:4px;">${escapeHtml(clientName)}</div>
      </td>
      <td><div>${escapeHtml(category)}</div></td>
      <td><div>${escapeHtml(location)}</div></td>
      <td><div>${escapeHtml(duration)}</div></td>
      <td><div>${escapeHtml(getProjectValue(project, 'created_at', '—'))}</div></td>
      <td>
        <div class="actions">
          <button class="icon-btn icon-btn-primary" type="button" data-action="view">View</button>
          <button class="icon-btn" type="button" data-action="edit">Edit</button>
          <button class="icon-btn" type="button" data-action="duplicate">Duplicate</button>
          <button class="icon-btn icon-btn-danger" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

async function fetchProjects({ search = '', category = 'All' } = {}) {
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*').order('id', { ascending: false });
  if (error) throw error;

  const projects = data || [];
  const query = normalizeText(search).toLowerCase();

  return projects.filter((project) => {
    const title = normalizeText(getProjectValue(project, 'title', '')).toLowerCase();
    const location = normalizeText(getProjectValue(project, 'location', '')).toLowerCase();
    const clientName = normalizeText(getProjectValue(project, 'client_name', '')).toLowerCase();
    const categoryValue = normalizeText(getProjectValue(project, 'category', '')).toLowerCase();
    const passesSearch = !query || [title, location, clientName, categoryValue].some((value) => value.includes(query));
    const passesCategory = category === 'All' || categoryValue === category.toLowerCase();
    return passesSearch && passesCategory;
  });
}

function populateProjectFilters(projects) {
  const categoryFilter = qs('#projectsCategoryFilter');

  if (categoryFilter) {
    const categories = ['All', ...Array.from(new Set((projects || []).map((project) => normalizeText(getProjectValue(project, 'category', '')).trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b));
    const currentValue = categoryFilter.value || 'All';
    categoryFilter.innerHTML = categories.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    if (categories.includes(currentValue)) categoryFilter.value = currentValue;
    else categoryFilter.value = 'All';
  }

}

function renderProjectsTable() {
  const projectsLoadingEl = qs('#projectsLoading');
  const projectsErrorEl = qs('#projectsError');
  const projectsTableWrapEl = qs('#projectsTableWrap');
  const projectsEmptyEl = qs('#projectsEmpty');
  const projectsSearchInput = qs('#projectsSearchInput');
  const projectsCategoryFilter = qs('#projectsCategoryFilter');
  const projectStatsChip = qs('#projectStatsChip');

  if (!projectsTbodyEl) return;

  const search = projectsSearchInput?.value || '';
  const category = projectsCategoryFilter?.value || 'All';

  const filteredProjects = projectsCache.filter((project) => {
    const title = normalizeText(getProjectValue(project, 'title', '')).toLowerCase();
    const location = normalizeText(getProjectValue(project, 'location', '')).toLowerCase();
    const clientName = normalizeText(getProjectValue(project, 'client_name', '')).toLowerCase();
    const categoryValue = normalizeText(getProjectValue(project, 'category', '')).toLowerCase();
    const query = normalizeText(search).toLowerCase();

    const passesSearch = !query || [title, location, clientName, categoryValue].some((value) => value.includes(query));
    const passesCategory = category === 'All' || categoryValue === category.toLowerCase();
    return passesSearch && passesCategory;
  });

  if (!filteredProjects.length) {
    projectsTbodyEl.innerHTML = '';
    hide(projectsTableWrapEl);
    show(projectsEmptyEl);
    if (projectStatsChip) projectStatsChip.querySelector('span').textContent = '0 projects';
    return;
  }

  projectsTbodyEl.innerHTML = filteredProjects.map(buildProjectRowHtml).join('');
  show(projectsTableWrapEl);
  hide(projectsEmptyEl);
  if (projectStatsChip) projectStatsChip.querySelector('span').textContent = `${filteredProjects.length} of ${projectsCache.length} projects`;
  hide(projectsErrorEl);
  hide(projectsLoadingEl);
}

async function loadProjectsView() {
  const projectsLoadingEl = qs('#projectsLoading');
  const projectsErrorEl = qs('#projectsError');
  const projectsTableWrapEl = qs('#projectsTableWrap');
  const projectsEmptyEl = qs('#projectsEmpty');
  const projectStatsChip = qs('#projectStatsChip');

  try {
    hide(projectsErrorEl);
    hide(projectsEmptyEl);
    hide(projectsTableWrapEl);
    show(projectsLoadingEl);

    projectsCache = await fetchProjects();
    populateProjectFilters(projectsCache);
    renderProjectsTable();

    if (projectStatsChip) {
      const count = projectsCache.length;
      projectStatsChip.querySelector('span').textContent = `${count} project${count === 1 ? '' : 's'}`;
    }
  } catch (error) {
    logSupabaseError(error, 'Projects load failed');
    const message = error?.message || 'Failed to load projects.';
    projectsErrorEl.textContent = message;
    show(projectsErrorEl);
    toast({ type: 'error', title: 'Projects unavailable', message });
    if (projectStatsChip) projectStatsChip.querySelector('span').textContent = '—';
  } finally {
    hide(projectsLoadingEl);
  }
}

function formatReviewDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderReviewCounters() {
  const total = reviewsCache.length;
  const approved = reviewsCache.filter((review) => review.approved).length;
  const pending = total - approved;
  const setCount = (selector, value) => {
    const el = qs(selector);
    if (el) el.textContent = String(value);
  };
  setCount('#reviewsTotalCount', total);
  setCount('#reviewsPendingCount', pending);
  setCount('#reviewsApprovedCount', approved);
}

function renderReviewsTable() {
  const tbody = qs('#reviewsTbody');
  const tableWrap = qs('#reviewsTableWrap');
  const empty = qs('#reviewsEmpty');
  if (!tbody || !tableWrap || !empty) return;

  const filtered = reviewsCache.filter((review) => (
    activeReviewFilter === 'all'
    || (activeReviewFilter === 'approved' && review.approved)
    || (activeReviewFilter === 'pending' && !review.approved)
  ));

  renderReviewCounters();
  if (!filtered.length) {
    tbody.innerHTML = '';
    hide(tableWrap);
    show(empty);
    return;
  }

  tbody.innerHTML = filtered.map((review) => {
    const approved = Boolean(review.approved);
    const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
    return `
      <tr data-review-id="${escapeHtml(review.id)}">
        <td><strong>${escapeHtml(review.name || 'Anonymous')}</strong></td>
        <td><span class="review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span></td>
        <td><div class="review-copy">${escapeHtml(review.review || '')}</div></td>
        <td>${formatReviewDate(review.created_at)}</td>
        <td><span class="review-status ${approved ? 'approved' : 'pending'}">${approved ? 'Approved' : 'Pending'}</span></td>
        <td>
          <div class="actions">
            <button class="icon-btn icon-btn-primary" type="button" data-review-action="toggle" data-review-id="${escapeHtml(review.id)}">
              <i class="fa-solid ${approved ? 'fa-rotate-left' : 'fa-check'}" aria-hidden="true"></i>
              ${approved ? 'Unapprove' : 'Approve'}
            </button>
            <button class="icon-btn icon-btn-danger" type="button" data-review-action="delete" data-review-id="${escapeHtml(review.id)}">
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  show(tableWrap);
  hide(empty);
}

async function loadReviewsView() {
  const loading = qs('#reviewsLoading');
  const errorBox = qs('#reviewsError');
  const tableWrap = qs('#reviewsTableWrap');
  const empty = qs('#reviewsEmpty');
  try {
    hide(errorBox);
    hide(tableWrap);
    hide(empty);
    show(loading);
    const { data, error } = await supabase
      .from(REVIEWS_TABLE)
      .select('id,created_at,name,rating,review,approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    reviewsCache = data || [];
    renderReviewsTable();
  } catch (error) {
    logSupabaseError(error, 'Reviews load failed');
    errorBox.textContent = error?.message || 'Failed to load reviews.';
    show(errorBox);
    toast({ type: 'error', title: 'Reviews unavailable', message: errorBox.textContent });
  } finally {
    hide(loading);
  }
}

async function main() {
  const productsLoadingEl = qs('#productsLoading');
  const productsErrorEl = qs('#productsError');
  const productsTableWrapEl = qs('#productsTableWrap');
  const productsEmptyEl = qs('#productsEmpty');
  const productsTbodyEl = qs('#productsTbody');
  const productsSection = qs('#productsSection');
  const projectsSection = qs('#projectsSection');
  const reviewsSection = qs('#reviewsSection');

  const addForm = qs('#addProductForm');
  const nameInput = qs('#pName');
  const descInput = qs('#pDesc');
  const priceInput = qs('#pPrice');
  const categoryInput = qs('#pCategory');
  const imageInput = qs('#pImage');

  const imagePreview = qs('#imagePreview');
  const imagePreviewMeta = qs('#imagePreviewMeta');

  const searchInput = qs('#searchInput');
  const categoryFilter = qs('#categoryFilter');

  const projectsSearchInput = qs('#projectsSearchInput');
  const projectsCategoryFilter = qs('#projectsCategoryFilter');

  const logoutBtn = qs('#logoutBtn');
  const addProjectBtn = qs('#addProjectBtn');
  const projectModalBackdrop = qs('#projectModalBackdrop');
  const closeProjectModalBtn = qs('#closeProjectModalBtn');
  const cancelProjectModalBtn = qs('#cancelProjectModalBtn');
  const projectForm = qs('#projectForm');
  const projectModalViewContent = qs('#projectModalViewContent');
  const projectModalLoading = qs('#projectModalLoading');
  const projectModalTitle = qs('#projectModalTitle');
  const projectModalEyebrow = qs('#projectModalEyebrow');
  const saveProjectBtn = qs('#saveProjectBtn');
  const projectTitleInput = qs('#projectTitleInput');
  const projectClientNameInput = qs('#projectClientNameInput');
  const projectCategoryInput = qs('#projectCategoryInput');
  const projectLocationInput = qs('#projectLocationInput');
  const projectShortDescriptionInput = qs('#projectShortDescriptionInput');
  const projectFullDescriptionInput = qs('#projectFullDescriptionInput');
  const projectDurationInput = qs('#projectDurationInput');
  const projectSolutionInput = qs('#projectSolutionInput');
  const projectResultInput = qs('#projectResultInput');
  const projectFeaturesRows = qs('#projectFeaturesRows');
  const addProjectFeaturesRowBtn = qs('#addProjectFeaturesRowBtn');
  const projectCoverInput = qs('#projectCoverInput');
  const projectBeforeInput = qs('#projectBeforeInput');
  const projectProgressInput = qs('#projectProgressInput');
  const projectAfterInput = qs('#projectAfterInput');
  const projectCoverPreview = qs('#projectCoverPreview');
  const projectBeforePreview = qs('#projectBeforePreview');
  const projectProgressPreview = qs('#projectProgressPreview');
  const projectAfterPreview = qs('#projectAfterPreview');
  const projectCoverUploadProgressLabel = qs('#projectCoverUploadProgressLabel');
  const projectBeforeUploadProgressLabel = qs('#projectBeforeUploadProgressLabel');
  const projectProgressUploadProgressLabel = qs('#projectProgressUploadProgressLabel');
  const projectAfterUploadProgressLabel = qs('#projectAfterUploadProgressLabel');
  const projectCoverUploadProgressBar = qs('#projectCoverUploadProgressBar');
  const projectBeforeUploadProgressBar = qs('#projectBeforeUploadProgressBar');
  const projectProgressUploadProgressBar = qs('#projectProgressUploadProgressBar');
  const projectAfterUploadProgressBar = qs('#projectAfterUploadProgressBar');

  let projectModalMode = 'create';
  let activeProjectId = null;
  let activeProjectData = null;
  let activeProjectFeatures = [];
  let activeProjectGallery = [];

  function setProjectModalLoading(isBusy) {
    if (!projectModalLoading) return;
    projectModalLoading.hidden = !isBusy;
    if (saveProjectBtn) saveProjectBtn.disabled = isBusy;
  }

  function setProjectModalViewVisible(isVisible) {
    if (projectForm) projectForm.hidden = isVisible;
    if (projectModalViewContent) projectModalViewContent.hidden = !isVisible;
  }

  function resetProjectModalForm() {
    if (projectForm) projectForm.reset();
    if (projectCoverPreview) projectCoverPreview.innerHTML = '';
    if (projectBeforePreview) projectBeforePreview.innerHTML = '';
    if (projectProgressPreview) projectProgressPreview.innerHTML = '';
    if (projectAfterPreview) projectAfterPreview.innerHTML = '';
    if (projectCoverUploadProgressLabel) projectCoverUploadProgressLabel.textContent = 'No file selected';
    if (projectBeforeUploadProgressLabel) projectBeforeUploadProgressLabel.textContent = 'No files selected';
    if (projectProgressUploadProgressLabel) projectProgressUploadProgressLabel.textContent = 'No files selected';
    if (projectAfterUploadProgressLabel) projectAfterUploadProgressLabel.textContent = 'No files selected';
    if (projectCoverUploadProgressBar) projectCoverUploadProgressBar.style.width = '0%';
    if (projectBeforeUploadProgressBar) projectBeforeUploadProgressBar.style.width = '0%';
    if (projectProgressUploadProgressBar) projectProgressUploadProgressBar.style.width = '0%';
    if (projectAfterUploadProgressBar) projectAfterUploadProgressBar.style.width = '0%';
    if (projectFeaturesRows) projectFeaturesRows.innerHTML = '';
    addProjectFeaturesRow();
  }

  function addProjectFeaturesRow(defaults = {}) {
    if (!projectFeaturesRows) return;
    const row = document.createElement('div');
    row.className = 'dynamic-row dynamic-row-single';
    row.innerHTML = `
      <input type="text" class="project-feature-input" value="${escapeHtml(defaults.feature || '')}" placeholder="Feature" />
      <button class="icon-btn icon-btn-danger" type="button" data-remove="feature">Remove</button>
    `;
    projectFeaturesRows.appendChild(row);
  }

  function populateProjectFeaturesRows(features = []) {
    if (!projectFeaturesRows) return;
    projectFeaturesRows.innerHTML = '';
    if (!features.length) {
      addProjectFeaturesRow();
      return;
    }
    features.forEach((feature) => addProjectFeaturesRow({ feature: feature.feature }));
  }

  function setProjectUploadPreview(container, files) {
    if (!container) return;
    container.innerHTML = '';
    if (!files.length) return;
    const fragment = document.createDocumentFragment();
    files.forEach((file) => {
      const card = document.createElement('div');
      card.className = 'upload-preview-card';
      const preview = document.createElement('img');
      preview.src = URL.createObjectURL(file);
      preview.alt = file.name;
      const name = document.createElement('div');
      name.className = 'preview-name';
      name.textContent = file.name;
      card.appendChild(preview);
      card.appendChild(name);
      fragment.appendChild(card);
    });
    container.appendChild(fragment);
  }

  function setExistingProjectPreview(container, imageUrls, altText) {
    if (!container) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    imageUrls.filter(Boolean).forEach((imageUrl) => {
      const card = document.createElement('div');
      card.className = 'upload-preview-card';
      const preview = document.createElement('img');
      preview.src = imageUrl;
      preview.alt = altText;
      card.appendChild(preview);
      fragment.appendChild(card);
    });
    container.appendChild(fragment);
  }

  function setProjectUploadProgress(labelEl, barEl, message, percent) {
    if (labelEl) labelEl.textContent = message;
    if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  async function uploadProjectFiles(files, labelEl, barEl) {
    if (!files?.length) return [];
    const uploaded = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `projects/${Date.now()}-${Math.random().toString(16).slice(2)}-${index}.${ext}`;
      setProjectUploadProgress(labelEl, barEl, `Uploading ${index + 1} of ${files.length}…`, Math.round(((index + 1) / files.length) * 90));
      const { error: uploadError } = await supabase.storage.from(PROJECT_STORAGE_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const publicUrl = buildPublicUrlForBucket(path, PROJECT_STORAGE_BUCKET);
      if (!publicUrl) throw new Error('Failed to generate public URL for uploaded project image.');
      uploaded.push({ path, publicUrl });
    }
    setProjectUploadProgress(labelEl, barEl, `${files.length} file${files.length === 1 ? '' : 's'} ready`, 100);
    return uploaded;
  }

  async function loadProjectRelations(projectId) {
    const [{ data: featuresData, error: featuresError }, { data: galleryData, error: galleryError }] = await Promise.all([
      supabase.from(PROJECT_FEATURES_TABLE).select('*').eq('project_id', projectId).order('id', { ascending: true }),
      supabase.from(PROJECT_GALLERY_TABLE).select('*').eq('project_id', projectId).order('display_order', { ascending: true }),
    ]);

    if (featuresError || galleryError) {
      throw featuresError || galleryError;
    }

    return {
      features: featuresData || [],
      gallery: galleryData || [],
    };
  }

  function openProjectModal(mode = 'create', project = null) {
    projectModalMode = mode;
    activeProjectId = project?.id || null;
    activeProjectData = project || null;
    if (mode === 'create') {
      activeProjectFeatures = [];
      activeProjectGallery = [];
    }
    setProjectModalLoading(false);
    if (projectModalBackdrop) projectModalBackdrop.hidden = false;

    if (mode === 'view' && project) {
      projectModalTitle.textContent = 'Project Preview';
      projectModalEyebrow.textContent = 'Project details';
      setProjectModalViewVisible(true);
      renderProjectView(project);
      return;
    }

    projectModalTitle.textContent = mode === 'edit' ? 'Edit Project' : 'Add New Project';
    projectModalEyebrow.textContent = mode === 'edit' ? 'Project workspace' : 'New project';
    setProjectModalViewVisible(false);
    resetProjectModalForm();

    if (mode === 'edit' && project) {
      if (projectTitleInput) projectTitleInput.value = getProjectValue(project, 'title', '');
      if (projectClientNameInput) projectClientNameInput.value = getProjectValue(project, 'client_name', '');
      if (projectCategoryInput) projectCategoryInput.value = getProjectValue(project, 'category', '');
      if (projectLocationInput) projectLocationInput.value = getProjectValue(project, 'location', '');
      if (projectDurationInput) projectDurationInput.value = getProjectValue(project, 'duration', '');
      if (projectShortDescriptionInput) projectShortDescriptionInput.value = getProjectValue(project, 'overview', '');
      if (projectFullDescriptionInput) projectFullDescriptionInput.value = getProjectValue(project, 'challenge', '');
      if (projectSolutionInput) projectSolutionInput.value = getProjectValue(project, 'solution', '');
      if (projectResultInput) projectResultInput.value = getProjectValue(project, 'result', '');
      populateProjectFeaturesRows(activeProjectFeatures);
      const coverImageUrl = buildPublicUrlForBucket(getProjectValue(project, 'cover_image', ''), PROJECT_STORAGE_BUCKET);
      setExistingProjectPreview(projectCoverPreview, coverImageUrl ? [coverImageUrl] : [], 'Cover image');
      setExistingProjectPreview(projectBeforePreview, activeProjectGallery.filter((item) => item.image_type === 'before').map((item) => buildPublicUrlForBucket(item.image_url, PROJECT_STORAGE_BUCKET)), 'Before image');
      setExistingProjectPreview(projectProgressPreview, activeProjectGallery.filter((item) => item.image_type === 'progress').map((item) => buildPublicUrlForBucket(item.image_url, PROJECT_STORAGE_BUCKET)), 'Progress image');
      setExistingProjectPreview(projectAfterPreview, activeProjectGallery.filter((item) => item.image_type === 'after').map((item) => buildPublicUrlForBucket(item.image_url, PROJECT_STORAGE_BUCKET)), 'After image');
    }
  }

  function closeProjectModal() {
    if (projectModalBackdrop) projectModalBackdrop.hidden = true;
    setProjectModalLoading(false);
    setProjectModalViewVisible(false);
    resetProjectModalForm();
    activeProjectId = null;
    activeProjectData = null;
    activeProjectFeatures = [];
    activeProjectGallery = [];
  }

  function renderProjectView(project) {
    if (!projectModalViewContent) return;
    const coverImage = getProjectValue(project, 'cover_image', '');
    const featuresMarkup = activeProjectFeatures.length
      ? activeProjectFeatures.map((feature) => `<div class="project-view-card"><strong>${escapeHtml(feature.feature || 'Feature')}</strong></div>`).join('')
      : '<div class="project-view-empty">No features added.</div>';
    const renderGalleryGroup = (imageType, heading) => {
      const images = activeProjectGallery.filter((item) => item.image_type === imageType);
      const imagesMarkup = images.length
        ? images.map((item) => `<div class="upload-preview-card"><img src="${escapeHtml(buildPublicUrlForBucket(item.image_url, PROJECT_STORAGE_BUCKET))}" alt="${escapeHtml(heading)}" /></div>`).join('')
        : '<div class="project-view-empty">No images uploaded.</div>';
      return `<div class="project-view-card"><strong>${heading}</strong><div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:8px;">${imagesMarkup}</div></div>`;
    };

    const coverImageUrl = buildPublicUrlForBucket(coverImage, PROJECT_STORAGE_BUCKET);
    projectModalViewContent.innerHTML = `
      <div class="project-view-shell">
        <div class="project-view-hero">
          ${coverImageUrl ? `<img src="${escapeHtml(coverImageUrl)}" alt="${escapeHtml(getProjectValue(project, 'title', 'Project'))}" />` : '<div class="project-view-empty">No cover image yet.</div>'}
          <div>
            <div class="project-view-chip">${escapeHtml(getProjectValue(project, 'category', 'Project'))}</div>
            <h4 style="margin:8px 0 6px;">${escapeHtml(getProjectValue(project, 'title', 'Untitled Project'))}</h4>
            <p style="color:var(--muted);margin:0;">${escapeHtml(getProjectValue(project, 'overview', ''))}</p>
            <div class="project-view-list">
              <div class="project-view-chip">Client: ${escapeHtml(getProjectValue(project, 'client_name', 'N/A'))}</div>
              <div class="project-view-chip">Location: ${escapeHtml(getProjectValue(project, 'location', 'N/A'))}</div>
              <div class="project-view-chip">Duration: ${escapeHtml(getProjectValue(project, 'duration', 'N/A'))}</div>
            </div>
          </div>
        </div>
        <div class="project-view-grid">
          <div class="project-view-card"><strong>Challenge</strong><div style="color:var(--muted);margin-top:8px;">${escapeHtml(getProjectValue(project, 'challenge', ''))}</div></div>
          <div class="project-view-card"><strong>Solution</strong><div style="color:var(--muted);margin-top:8px;">${escapeHtml(getProjectValue(project, 'solution', ''))}</div></div>
        </div>
        <div class="project-view-grid">
          <div class="project-view-card"><strong>Result</strong><div style="color:var(--muted);margin-top:8px;">${escapeHtml(getProjectValue(project, 'result', ''))}</div></div>
          <div class="project-view-card"><strong>Features</strong><div style="margin-top:8px;display:grid;gap:8px;">${featuresMarkup}</div></div>
        </div>
        <div class="project-view-grid">
          ${renderGalleryGroup('before', 'Before Images')}
          ${renderGalleryGroup('progress', 'Progress Images')}
          ${renderGalleryGroup('after', 'After Images')}
        </div>
      </div>
    `;
  }

  // Login gate
  try {
    setBusy(true);
    const user = await requireAdmin();
    if (user) renderAdminHeaderUser(user);
  } catch (e) {
    logSupabaseError(e, 'Admin login failed');
    toast({ type: 'error', title: 'Access denied', message: e?.message || 'You are not authorized.' });
    // Soft-hide dashboard
    document.body.innerHTML = `
      <div style="padding:24px; font-family:system-ui; color:#eaf0ff; background: #0b1220; min-height:100vh;">
        <h2 style="margin:0 0 8px;">Admin access required</h2>
        <p style="margin:0 0 16px; color:rgba(234,240,255,.7)">Please sign in to access the dashboard.</p>
        <button id="retryLogin" style="padding:12px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.15); background: rgba(47,107,255,.18); color:#fff; font-weight:800; cursor:pointer;">Sign in</button>
      </div>
    `;

    const retryBtn = qs('#retryLogin');
    if (retryBtn) {
    retryBtn.addEventListener('click', () => {
        location.reload();
    });
    }
    return;
  } finally {
    setBusy(false);
  }

  // Load categories for filter
  async function loadAndRenderCategories() {
    const cats = await fetchCategories();
    categoryFilter.innerHTML = cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  async function refreshTable() {
    if (!productsTbodyEl) return;

    try {
      hide(productsErrorEl);
      hide(productsEmptyEl);
      hide(productsTableWrapEl);
      show(productsLoadingEl);

      const search = searchInput?.value || '';
      const category = categoryFilter?.value || 'All';

      const [products] = await Promise.all([
        fetchProducts({ search, category }),
      ]);

      if (!products.length) {
        productsTbodyEl.innerHTML = '';
        hide(productsTableWrapEl);
        show(productsEmptyEl);
        return;
      }

      productsTbodyEl.innerHTML = products.map((p) => productRowHtml(p)).join('');
      show(productsTableWrapEl);
    } catch (e) {
      logSupabaseError(e, 'Products refresh failed');
      productsErrorEl.textContent = e?.message || 'Failed to load products.';
      show(productsErrorEl);
    } finally {
      hide(productsLoadingEl);
    }
  }

  // Sidebar navigation
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.mobile-sidebar-toggle');
  const closeSidebar = () => sidebar?.classList.remove('open');

  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-link[data-route]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const route = btn.getAttribute('data-route');
      if (route === 'projects') {
        show(projectsSection);
        hide(productsSection);
        hide(reviewsSection);
      } else if (route === 'reviews') {
        show(reviewsSection);
        hide(productsSection);
        hide(projectsSection);
      } else {
        show(productsSection);
        hide(projectsSection);
        hide(reviewsSection);
      }

      if (window.innerWidth <= 980) {
        closeSidebar();
      }
    });
  });

  document.querySelectorAll('[data-review-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeReviewFilter = button.dataset.reviewFilter || 'all';
      document.querySelectorAll('[data-review-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderReviewsTable();
    });
  });

  const reviewsTbody = qs('#reviewsTbody');
  if (reviewsTbody) {
    reviewsTbody.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-review-action]');
      if (!button) return;
      const id = button.dataset.reviewId;
      const action = button.dataset.reviewAction;
      const review = reviewsCache.find((item) => String(item.id) === String(id));
      if (!id || !review) return;

      if (action === 'delete' && !confirm('Delete this review permanently? This cannot be undone.')) return;

      try {
        button.disabled = true;
        if (action === 'toggle') {
          const nextApproved = !review.approved;
          const { error } = await supabase.from(REVIEWS_TABLE).update({ approved: nextApproved }).eq('id', id);
          if (error) throw error;
          review.approved = nextApproved;
          toast({ type: 'success', title: nextApproved ? 'Review approved' : 'Review unapproved', message: nextApproved ? 'The review is now visible on the homepage.' : 'The review is no longer public.' });
        }

        if (action === 'delete') {
          const { error } = await supabase.from(REVIEWS_TABLE).delete().eq('id', id);
          if (error) throw error;
          reviewsCache = reviewsCache.filter((item) => String(item.id) !== String(id));
          toast({ type: 'success', title: 'Review deleted', message: 'The review has been removed permanently.' });
        }

        renderReviewsTable();
      } catch (error) {
        logSupabaseError(error, 'Review action failed');
        toast({ type: 'error', title: 'Review update failed', message: error?.message || 'Could not complete this review action.' });
        button.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ type: 'error', title: 'Logout failed', message: error.message });
        return;
      }
      location.reload();
    });
  }

  // Image preview
  if (imageInput && imagePreview && imagePreviewMeta) {
    imagePreview.style.display = 'block';
    imageInput.addEventListener('change', () => {
      const file = imageInput.files?.[0];
      if (!file) {
        imagePreview.src = '';
        imagePreviewMeta.textContent = 'Choose an image to preview.';
        return;
      }
      imagePreview.src = URL.createObjectURL(file);
      imagePreviewMeta.textContent = `Ready: ${file.name} (${Math.round(file.size / 1024)} KB)`;
    });
  }

  if (projectCoverInput && projectCoverPreview) {
    projectCoverInput.addEventListener('change', () => {
      setProjectUploadPreview(projectCoverPreview, Array.from(projectCoverInput.files || []));
      if (projectCoverInput.files?.length) {
        setProjectUploadProgress(projectCoverUploadProgressLabel, projectCoverUploadProgressBar, `${projectCoverInput.files.length} file selected`, 0);
      } else {
        setProjectUploadProgress(projectCoverUploadProgressLabel, projectCoverUploadProgressBar, 'No file selected', 0);
      }
    });
  }

  if (projectBeforeInput && projectBeforePreview) {
    projectBeforeInput.addEventListener('change', () => {
      setProjectUploadPreview(projectBeforePreview, Array.from(projectBeforeInput.files || []));
      const count = projectBeforeInput.files?.length || 0;
      setProjectUploadProgress(projectBeforeUploadProgressLabel, projectBeforeUploadProgressBar, count ? `${count} file${count === 1 ? '' : 's'} selected` : 'No files selected', 0);
    });
  }

  if (projectProgressInput && projectProgressPreview) {
    projectProgressInput.addEventListener('change', () => {
      setProjectUploadPreview(projectProgressPreview, Array.from(projectProgressInput.files || []));
      const count = projectProgressInput.files?.length || 0;
      setProjectUploadProgress(projectProgressUploadProgressLabel, projectProgressUploadProgressBar, count ? `${count} file${count === 1 ? '' : 's'} selected` : 'No files selected', 0);
    });
  }

  if (projectAfterInput && projectAfterPreview) {
    projectAfterInput.addEventListener('change', () => {
      setProjectUploadPreview(projectAfterPreview, Array.from(projectAfterInput.files || []));
      const count = projectAfterInput.files?.length || 0;
      setProjectUploadProgress(projectAfterUploadProgressLabel, projectAfterUploadProgressBar, count ? `${count} file${count === 1 ? '' : 's'} selected` : 'No files selected', 0);
    });
  }

  if (addProjectFeaturesRowBtn) {
    addProjectFeaturesRowBtn.addEventListener('click', () => addProjectFeaturesRow());
  }

  if (projectFeaturesRows) {
    projectFeaturesRows.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('button[data-remove="feature"]');
      if (!removeBtn) return;
      removeBtn.closest('.dynamic-row')?.remove();
    });
  }

  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      openProjectModal('create');
    });
  }

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', closeProjectModal);
  }

  if (cancelProjectModalBtn) {
    cancelProjectModalBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModalBackdrop) {
    projectModalBackdrop.addEventListener('click', (event) => {
      if (event.target === projectModalBackdrop) closeProjectModal();
    });
  }

  if (projectForm) {
    projectForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const title = normalizeText(projectTitleInput?.value);
      const clientName = normalizeText(projectClientNameInput?.value);
      const category = normalizeText(projectCategoryInput?.value);
      const location = normalizeText(projectLocationInput?.value);
      const duration = normalizeText(projectDurationInput?.value);
      const overview = normalizeText(projectShortDescriptionInput?.value);
      const challenge = normalizeText(projectFullDescriptionInput?.value);
      const solution = normalizeText(projectSolutionInput?.value);
      const result = normalizeText(projectResultInput?.value);

      if (!title || !clientName || !category || !location || !overview || !challenge) {
        toast({ type: 'error', title: 'Missing project details', message: 'Please fill the required project information before saving.' });
        return;
      }

      if (projectModalMode === 'create' && !(projectCoverInput?.files?.length)) {
        toast({ type: 'error', title: 'Cover image required', message: 'Please upload a cover image for the new project.' });
        return;
      }

      try {
        setProjectModalLoading(true);

        const featureRows = Array.from(projectFeaturesRows?.querySelectorAll('.dynamic-row') || []);
        const features = featureRows
          .map((row) => normalizeText(row.querySelector('.project-feature-input')?.value))
          .filter(Boolean);

        const coverFiles = Array.from(projectCoverInput?.files || []);
        const beforeFiles = Array.from(projectBeforeInput?.files || []);
        const progressFiles = Array.from(projectProgressInput?.files || []);
        const afterFiles = Array.from(projectAfterInput?.files || []);

        let cover_image = '';
        if (coverFiles.length) {
          const coverUploads = await logProjectSaveStep(
            'Uploading cover image...',
            'Cover uploaded.',
            () => uploadProjectFiles(coverFiles, projectCoverUploadProgressLabel, projectCoverUploadProgressBar)
          );
          cover_image = coverUploads[0]?.publicUrl || '';
          if (!cover_image) throw new Error('Cover upload completed but did not return a public URL.');
        } else if (projectModalMode === 'edit') {
          cover_image = getProjectValue(activeProjectData, 'cover_image', '');
        }

        const projectPayload = {
          title,
          client_name: clientName,
          category,
          location,
          duration,
          overview,
          challenge,
          solution,
          result,
          cover_image,
        };

        let projectId = activeProjectId;
        let createdProject = null;

        if (projectModalMode === 'edit' && activeProjectId) {
          const { data, error } = await logProjectSaveStep(
            'Updating project...',
            'Project updated.',
            () => supabase
              .from(PROJECTS_TABLE)
              .update(projectPayload)
              .eq('id', activeProjectId)
              .select()
              .maybeSingle()
          );
          if (error) {
            logSupabaseError(error, 'Project update failed');
            toast({ type: 'error', title: 'Save failed', message: error.message });
            return;
          }
          createdProject = data;
          projectId = activeProjectId;
        } else {
          const { data, error } = await logProjectSaveStep(
            'Creating project...',
            'Project created.',
            () => supabase.from(PROJECTS_TABLE).insert(projectPayload).select().maybeSingle()
          );
          if (error) {
            logSupabaseError(error, 'Project insert failed');
            toast({ type: 'error', title: 'Save failed', message: error.message });
            return;
          }
          createdProject = data;
          projectId = createdProject?.id;
        }

        if (!projectId) throw new Error('Project ID was not returned.');

        const beforeUploads = beforeFiles.length ? await logProjectSaveStep(
          'Uploading before images...',
          'Before images uploaded.',
          () => uploadProjectFiles(beforeFiles, projectBeforeUploadProgressLabel, projectBeforeUploadProgressBar)
        ) : [];
        const progressUploads = progressFiles.length ? await logProjectSaveStep(
          'Uploading progress images...',
          'Progress images uploaded.',
          () => uploadProjectFiles(progressFiles, projectProgressUploadProgressLabel, projectProgressUploadProgressBar)
        ) : [];
        const afterUploads = afterFiles.length ? await logProjectSaveStep(
          'Uploading after images...',
          'After images uploaded.',
          () => uploadProjectFiles(afterFiles, projectAfterUploadProgressLabel, projectAfterUploadProgressBar)
        ) : [];

        const existingFeatures = activeProjectFeatures.map((item) => normalizeText(item.feature)).filter(Boolean);
        const featuresChanged = projectModalMode !== 'edit'
          || features.length !== existingFeatures.length
          || features.some((feature, index) => feature !== existingFeatures[index]);
        const galleryTypesToReplace = [
          { files: beforeFiles, type: 'before' },
          { files: progressFiles, type: 'progress' },
          { files: afterFiles, type: 'after' },
        ].filter((section) => section.files.length).map((section) => section.type);

        if (projectModalMode === 'edit' && featuresChanged) {
          const { error: featuresDeleteError } = await logProjectSaveStep(
            'Deleting existing project features...',
            'Existing project features deleted.',
            () => supabase.from(PROJECT_FEATURES_TABLE).delete().eq('project_id', projectId)
          );
          if (featuresDeleteError) {
            logSupabaseError(featuresDeleteError, 'Project features delete failed');
            toast({ type: 'error', title: 'Save failed', message: featuresDeleteError.message });
            return;
          }
        }

        if (featuresChanged && features.length) {
          const featurePayload = features.map((feature) => ({
            project_id: projectId,
            feature,
          }));
          const { error: featureError } = await logProjectSaveStep(
            'Saving project features...',
            'Project features saved.',
            () => supabase.from(PROJECT_FEATURES_TABLE).insert(featurePayload)
          );
          if (featureError) throw featureError;
        }

        if (projectModalMode === 'edit' && galleryTypesToReplace.length) {
          const { error: galleryDeleteError } = await logProjectSaveStep(
            'Replacing selected project gallery images...',
            'Selected project gallery images replaced.',
            () => supabase.from(PROJECT_GALLERY_TABLE).delete().eq('project_id', projectId).in('image_type', galleryTypesToReplace)
          );
          if (galleryDeleteError) {
            logSupabaseError(galleryDeleteError, 'Project gallery delete failed');
            toast({ type: 'error', title: 'Save failed', message: galleryDeleteError.message });
            return;
          }
        }

        const existingDisplayOrder = activeProjectGallery.reduce((max, item) => Math.max(max, Number(item.display_order) || 0), 0);
        const galleryEntries = [];
        [
          { files: beforeUploads, type: 'before' },
          { files: progressUploads, type: 'progress' },
          { files: afterUploads, type: 'after' },
        ].forEach((section) => {
          section.files.forEach((item) => {
            galleryEntries.push({
              project_id: projectId,
              image_url: item.publicUrl,
              image_type: section.type,
              display_order: existingDisplayOrder + galleryEntries.length + 1,
            });
          });
        });

        if (galleryEntries.length) {
          const { error: galleryError } = await logProjectSaveStep(
            'Saving project gallery...',
            'Project gallery saved.',
            () => supabase.from(PROJECT_GALLERY_TABLE).insert(galleryEntries)
          );
          if (galleryError) throw galleryError;
        }

        toast({ type: 'success', title: projectModalMode === 'edit' ? 'Project updated' : 'Project created', message: projectModalMode === 'edit' ? 'The project has been updated successfully.' : 'Project created successfully.' });
        closeProjectModal();
        await logProjectSaveStep('Refreshing projects list...', 'Projects list refreshed.', loadProjectsView);
      } catch (error) {
        logSupabaseError(error, 'Project save workflow failed');
        toast({ type: 'error', title: 'Save failed', message: error?.message || 'Could not save project.' });
      } finally {
        setProjectModalLoading(false);
      }
    });
  }

  // Product CRUD - form submit
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = normalizeText(nameInput?.value);
      const description = normalizeText(descInput?.value);
      const price = Number(priceInput?.value);
      const category = normalizeCategory(categoryInput?.value);
      const file = imageInput?.files?.[0];

      if (!name || !description || !Number.isFinite(price) || price < 0 || !category || !file) {
        toast({ type: 'error', title: 'Missing fields', message: 'Fill all required fields and upload an image.' });
        return;
      }

      try {
        setBusy(true);
        imageInput.disabled = true;
        qs('#submitProductBtn').innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Uploading…`;

        const { imagePath, imageUrl } = await uploadImageToStorage(file);

        await createProduct({
        name,
        description,
        price,
        category,
        imagePath, // Fix: pass the path string variable
        imageUrl,
        });

        toast({ type: 'success', title: 'Product added', message: 'The website will update automatically.' });
        addForm.reset();
        if (imagePreview) imagePreview.src = '';
        if (imagePreviewMeta) imagePreviewMeta.textContent = 'Choose an image to preview.';

        await refreshTable();
        // Also refresh categories to include new category
        await loadAndRenderCategories();
      } catch (err) {
        logSupabaseError(err, 'Product save failed');
        toast({ type: 'error', title: 'Add failed', message: err?.message || 'Could not add product.' });
      } finally {
        setBusy(false);
        if (imageInput) imageInput.disabled = false;
        qs('#submitProductBtn').innerHTML = `<i class="fa-solid fa-plus" aria-hidden="true"></i> Submit Product`;
      }
    });
  }

  // Search + filter
  if (searchInput) {
    let t = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => refreshTable(), 250);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => refreshTable());
  }

  if (projectsSearchInput) {
    let t = null;
    projectsSearchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => renderProjectsTable(), 250);
    });
  }

  [projectsCategoryFilter].forEach((filterEl) => {
    if (filterEl) {
      filterEl.addEventListener('change', () => renderProjectsTable());
    }
  });

  // Row actions (edit/delete)
  if (projectsTbodyEl) {
    projectsTbodyEl.addEventListener('click', async (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;

      const clickedRow = btn.closest('tr');
      if (!clickedRow) return;

      const tr = clickedRow.classList.contains('product-edit-row')
        ? clickedRow.previousElementSibling
        : clickedRow;
      if (!tr) return;

      const id = tr.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (!id || !action) return;

      try {
        if (action === 'view') {
          const project = projectsCache.find((item) => String(item.id) === String(id));
          if (!project) return;
          const relations = await loadProjectRelations(project.id);
          activeProjectFeatures = relations.features || [];
          activeProjectGallery = relations.gallery || [];
          openProjectModal('view', project);
          return;
        }

        if (action === 'edit') {
          const project = projectsCache.find((item) => String(item.id) === String(id));
          if (!project) return;
          const relations = await loadProjectRelations(project.id);
          activeProjectFeatures = relations.features || [];
          activeProjectGallery = relations.gallery || [];
          openProjectModal('edit', project);
          return;
        }

        if (action === 'duplicate') {
          const project = projectsCache.find((item) => String(item.id) === String(id));
          if (!project) return;
          const relations = await loadProjectRelations(project.id);
          const duplicatePayload = {
            title: `${getProjectValue(project, 'title', 'Project')} Copy`,
            client_name: getProjectValue(project, 'client_name', ''),
            category: getProjectValue(project, 'category', ''),
            location: getProjectValue(project, 'location', ''),
            duration: getProjectValue(project, 'duration', ''),
            overview: getProjectValue(project, 'overview', ''),
            challenge: getProjectValue(project, 'challenge', ''),
            solution: getProjectValue(project, 'solution', ''),
            result: getProjectValue(project, 'result', ''),
            cover_image: getProjectValue(project, 'cover_image', ''),
          };
          const { data: createdProject, error } = await supabase.from(PROJECTS_TABLE).insert(duplicatePayload).select().maybeSingle();
          if (error) throw error;
          const projectId = createdProject?.id;
          if (!projectId) throw new Error('Duplicate failed.');
          if ((relations.features || []).length) {
            const { error: featuresInsertError } = await supabase.from(PROJECT_FEATURES_TABLE).insert((relations.features || []).map((item) => ({ project_id: projectId, feature: item.feature })));
            if (featuresInsertError) {
              logSupabaseError(featuresInsertError, 'Duplicate project features insert failed');
              toast({ type: 'error', title: 'Duplicate failed', message: featuresInsertError.message });
              return;
            }
          }
          if ((relations.gallery || []).length) {
            const { error: galleryInsertError } = await supabase.from(PROJECT_GALLERY_TABLE).insert((relations.gallery || []).map((item, index) => ({ project_id: projectId, image_url: item.image_url, image_type: item.image_type, display_order: index + 1 })));
            if (galleryInsertError) {
              logSupabaseError(galleryInsertError, 'Duplicate project gallery insert failed');
              toast({ type: 'error', title: 'Duplicate failed', message: galleryInsertError.message });
              return;
            }
          }
          toast({ type: 'success', title: 'Project duplicated', message: 'The duplicate project has been created.' });
          await loadProjectsView();
          return;
        }

        if (action === 'delete') {
          const confirmed = confirm('Delete this project? This cannot be undone.');
          if (!confirmed) return;
          const project = projectsCache.find((item) => String(item.id) === String(id));
          if (!project) return;
          const relations = await loadProjectRelations(project.id);
          const { error: galleryDelError } = await supabase.from(PROJECT_GALLERY_TABLE).delete().eq('project_id', project.id);
          if (galleryDelError) {
            logSupabaseError(galleryDelError, 'Project gallery delete failed');
            toast({ type: 'error', title: 'Delete failed', message: galleryDelError.message });
            return;
          }
          const { error: featuresDelError } = await supabase.from(PROJECT_FEATURES_TABLE).delete().eq('project_id', project.id);
          if (featuresDelError) {
            logSupabaseError(featuresDelError, 'Project features delete failed');
            toast({ type: 'error', title: 'Delete failed', message: featuresDelError.message });
            return;
          }
          const { error: projectDelError } = await supabase.from(PROJECTS_TABLE).delete().eq('id', project.id);
          if (projectDelError) {
            logSupabaseError(projectDelError, 'Project delete failed');
            toast({ type: 'error', title: 'Delete failed', message: projectDelError.message });
            return;
          }
          if (getProjectValue(project, 'cover_image', '')) {
            try {
              const coverStoragePath = getStoragePathFromProjectImageUrl(getProjectValue(project, 'cover_image', ''));
              if (coverStoragePath) await supabase.storage.from(PROJECT_STORAGE_BUCKET).remove([coverStoragePath]);
            } catch (storageError) {
              logSupabaseError(storageError, 'Project cover storage remove failed');
            }
          }
          if (relations.gallery?.length) {
            const paths = relations.gallery
              .map((item) => getStoragePathFromProjectImageUrl(item.image_url))
              .filter(Boolean);
            if (paths.length) {
              try {
                await supabase.storage.from(PROJECT_STORAGE_BUCKET).remove(paths);
              } catch (storageError) {
                logSupabaseError(storageError, 'Project gallery storage remove failed');
              }
            }
          }
          toast({ type: 'success', title: 'Project deleted', message: 'The project and related data were removed.' });
          await loadProjectsView();
        }
      } catch (error) {
        logSupabaseError(error, 'Project action failed');
        toast({ type: 'error', title: 'Project action failed', message: error?.message || 'Could not complete the requested action.' });
      }
    });
  }

  if (productsTbodyEl) {
    productsTbodyEl.addEventListener('click', async (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;

      const tr = btn.closest('tr');
      if (!tr) return;

      const id = tr.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (!id || !action) return;

      if (action === 'edit') {
        setEditOpen(tr, true);
        return;
      }

      if (action === 'cancel') {
        setEditOpen(tr, false);
        return;
      }

      if (action === 'save') {
        try {
          setBusy(true);

          const editName = clickedRow.querySelector('.edit-name')?.value;
          const editDescription = clickedRow.querySelector('.edit-description')?.value;
          const editPrice = Number(clickedRow.querySelector('.edit-price')?.value);
          const editCategory = clickedRow.querySelector('.edit-category')?.value;

          await updateProduct(id, {
            name: normalizeText(editName),
            description: normalizeText(editDescription),
            price: editPrice,
            category: normalizeCategory(editCategory),
          });

          toast({ type: 'success', title: 'Updated', message: 'Changes saved.' });
          await refreshTable();
        } catch (err) {
          logSupabaseError(err, 'Product update failed');
          toast({ type: 'error', title: 'Update failed', message: err?.message || 'Could not update product.' });
        } finally {
          setBusy(false);
        }

        return;
      }

      if (action === 'delete') {
        const confirmed = confirm('Delete this product? This cannot be undone.');
        if (!confirmed) return;

        try {
          setBusy(true);
          await deleteProduct(id);
          toast({ type: 'success', title: 'Deleted', message: 'Product removed.' });
          await refreshTable();
          await loadAndRenderCategories();
        } catch (err) {
          logSupabaseError(err, 'Product delete failed');
          toast({ type: 'error', title: 'Delete failed', message: err?.message || 'Could not delete product.' });
        } finally {
          setBusy(false);
        }

        return;
      }
    });
  }

  // Initial load
  await loadAndRenderCategories();
  await refreshTable();
  await loadProjectsView();
  await loadReviewsView();
}

// Ensure DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}

