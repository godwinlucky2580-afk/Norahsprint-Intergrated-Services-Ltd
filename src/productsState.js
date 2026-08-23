import { loadCategories, getProductsCount, loadProducts } from './productsApi.js';
import { renderProductGrid } from './productRenderer.js';

function debounce(fn, wait = 300) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function clampPage(page) {
  return Math.max(1, page | 0);
}

function updateIndicator({ page, pageSize, totalCount, indicatorEl }) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);
  indicatorEl.textContent = `Showing ${start}-${end} of ${totalCount} products`;
}

export async function initProductsModule({ orderProductHandler }) {
  const gridEl = document.getElementById('productsGrid');
  const loadingEl = document.getElementById('productsLoading');
  const paginationEl = document.getElementById('productsPagination');
  const prevBtn = document.getElementById('productsPrevBtn');
  const nextBtn = document.getElementById('productsNextBtn');
  const indicatorEl = document.getElementById('productsPageIndicator');

  const filterBtnsEl = document.getElementById('filterBtns');
  const searchInputEl = document.getElementById('searchInput');
  const sortSelectEl = document.getElementById('sortSelect');

  let state = {
    page: 1,
    pageSize: 6,
    category: 'All',
    search: '',
    sort: sortSelectEl?.value || 'newest',
    isLoading: false,
    totalCount: 0,
  };

  // simple request cache: key -> products
  const cache = new Map();

  function setLoading(isLoading) {
    state.isLoading = isLoading;
    if (!loadingEl) return;
    loadingEl.style.display = isLoading ? 'block' : 'none';
    if (prevBtn) prevBtn.disabled = isLoading;
    if (nextBtn) nextBtn.disabled = isLoading;
  }

  function setPaginationVisibility() {
    if (!paginationEl) return;
    paginationEl.style.display = state.totalCount > state.pageSize ? 'flex' : 'none';
  }

  function renderPagination(totalCount) {
    state.totalCount = totalCount;
    const totalPages = Math.max(1, Math.ceil(totalCount / state.pageSize));

    updateIndicator({
      page: state.page,
      pageSize: state.pageSize,
      totalCount,
      indicatorEl,
    });

    setPaginationVisibility();

    if (prevBtn) prevBtn.disabled = state.isLoading || state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.isLoading || state.page >= totalPages;
  }

  function setActiveFilter(category) {
    state.category = category;
    if (!filterBtnsEl) return;
    filterBtnsEl.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-category') === category);
    });
  }

  async function retry(fn, tries = 3) {
    let lastErr;
    for (let i = 0; i < tries; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        const delay = 300 * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }

  async function refresh() {
    if (state.isLoading) return;

    setLoading(true);

    try {
      const totalCount = await retry(() => getProductsCount({ category: state.category, search: state.search }));
      renderPagination(totalCount);

      const key = JSON.stringify({
        page: state.page,
        pageSize: state.pageSize,
        category: state.category,
        search: state.search,
        sort: state.sort,
      });

      let products = cache.get(key);
      if (!products) {
        products = await retry(() => loadProducts({
          page: state.page,
          pageSize: state.pageSize,
          category: state.category,
          search: state.search,
          sort: state.sort,
        }));
        cache.set(key, products);
      }

      renderProductGrid({ products, gridEl });

      // re-run reveal observer for newly rendered cards
      if (typeof window.initScrollAnimations === 'function') {
        // current code observes reveal nodes on load, so this is optional but safe.
        window.initScrollAnimations();
      }
    } catch (e) {
      gridEl.innerHTML = '<div class="no-results">🔴 Failed to load products. Please try again.</div>';
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Event delegation for order buttons
  if (gridEl) {
    gridEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button.btn-order');
      if (!btn) return;

      const name = btn.getAttribute('data-order-name') || '';
      const price = btn.getAttribute('data-order-price') || '';
      orderProductHandler(name, price);
    });
  }

  // Pagination buttons
  prevBtn?.addEventListener('click', () => {
    if (state.isLoading) return;
    state.page = clampPage(state.page - 1);
    cache.clear();
    refresh();
  });

  nextBtn?.addEventListener('click', () => {
    if (state.isLoading) return;
    state.page = clampPage(state.page + 1);
    cache.clear();
    refresh();
  });

  // Search (debounced 300ms)
  const onSearch = debounce((value) => {
    state.search = value;
    state.page = 1;
    cache.clear();
    refresh();
  }, 300);

  searchInputEl?.addEventListener('input', (e) => {
    onSearch(e.target.value);
  });

  // Sort
  sortSelectEl?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    cache.clear();
    refresh();
  });

  // Categories (dynamic)
  try {
    const cats = await retry(() => loadCategories());

    filterBtnsEl.innerHTML = cats
      .map((c) => {
        const active = c === 'All';
        return `<button class="filter-btn ${active ? 'active' : ''}" type="button" data-category="${c}" aria-pressed="${active ? 'true' : 'false'}">${c}</button>`;
      })
      .join('');

    filterBtnsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button.filter-btn');
      if (!btn) return;
      setActiveFilter(btn.getAttribute('data-category'));
      state.page = 1;
      cache.clear();
      refresh();
    });

    // initialize first render
    await refresh();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed loading categories:', e);
    gridEl.innerHTML = '<div class="no-results">🔴 Failed to load categories. Check Supabase config.</div>';
  }
}

