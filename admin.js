import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// NOTE:
// This dashboard is intentionally standalone (no React/Next/Vue) and uses the existing
// Supabase products/products-images setup. It gates access via Supabase Auth.

const SUPABASE_URL = window.__SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase config: window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_BUCKET = 'product-images';
const TABLE = 'products';

const qs = (sel) => document.querySelector(sel);

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

function buildPublicUrlForBucket(path) {
  // Works for public bucket. If your bucket is private, you must use signed URLs.
  const url = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return url?.data?.publicUrl;
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
    const numericPrice = p.price != null ? Number(p.price) : 0;
    const formattedPrice = isNaN(numericPrice) ? '₦0' : `₦${numericPrice.toLocaleString('en-NG')}`;
  
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
        <div style="font-weight:900">${escapeHtml(String(price))}</div>
      </td>
      <td>
        <div>${escapeHtml(p.category || '')}</div>
      </td>
      <td>
        <div class="actions">
          <button class="icon-btn icon-btn-primary" type="button" data-action="edit">Edit</button>
          <button class="icon-btn icon-btn-danger" type="button" data-action="delete">Delete</button>
        </div>

        <div class="inline-edit" aria-label="Edit form">
          <div class="form-row" style="margin-top:10px;">
            <label>Name</label>
            <input type="text" class="edit-name" value="${escapeHtml(p.name || '')}" />
          </div>
          <div class="form-row">
            <label>Description</label>
            <textarea class="edit-description" rows="3">${escapeHtml(p.description || '')}</textarea>
          </div>
          <div class="form-row" style="flex-direction:row;gap:12px;">
            <div style="flex:1">
              <label>Price (NGN)</label>
              <input type="number" class="edit-price" min="0" step="1" value="${escapeHtml(p.price ?? 0)}" />
            </div>
            <div style="flex:1">
              <label>Category</label>
              <input type="text" class="edit-category" value="${escapeHtml(p.category || '')}" />
            </div>
          </div>
          <div class="actions" style="margin-top:10px;">
            <button class="icon-btn" type="button" data-action="cancel">Cancel</button>
            <button class="icon-btn icon-btn-primary" type="button" data-action="save">Save</button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function setEditOpen(row, open) {
  const edit = row.querySelector('.inline-edit');
  if (!edit) return;
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

async function main() {
  const productsLoadingEl = qs('#productsLoading');
  const productsErrorEl = qs('#productsError');
  const productsTableWrapEl = qs('#productsTableWrap');
  const productsEmptyEl = qs('#productsEmpty');
  const productsTbodyEl = qs('#productsTbody');

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

  const logoutBtn = qs('#logoutBtn');

  // Login gate
  try {
    setBusy(true);
    const user = await requireAdmin();
    if (user) renderAdminHeaderUser(user);
  } catch (e) {
    console.error(e);
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
      console.error(e);
      productsErrorEl.textContent = e?.message || 'Failed to load products.';
      show(productsErrorEl);
    } finally {
      hide(productsLoadingEl);
    }
  }

  // Sidebar navigation (future routes)
  document.querySelectorAll('.nav-link[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-link[data-route]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      // Only products route exists for now.
    });
  });

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
        console.error(err);
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

  // Row actions (edit/delete)
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

          const editName = tr.querySelector('.edit-name')?.value;
          const editDescription = tr.querySelector('.edit-description')?.value;
          const editPrice = Number(tr.querySelector('.edit-price')?.value);
          const editCategory = tr.querySelector('.edit-category')?.value;

          await updateProduct(id, {
            name: normalizeText(editName),
            description: normalizeText(editDescription),
            price: editPrice,
            category: normalizeCategory(editCategory),
          });

          toast({ type: 'success', title: 'Updated', message: 'Changes saved.' });
          await refreshTable();
        } catch (err) {
          console.error(err);
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
          console.error(err);
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
}

// Ensure DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}

