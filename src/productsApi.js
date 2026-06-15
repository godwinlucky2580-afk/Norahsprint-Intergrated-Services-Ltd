import { createSupabaseClient } from './supabaseClient.js';

const DEFAULT_PAGE_SIZE = 20;

function normalizeTextQuery(q) {
  return (q ?? '').toString().trim();
}

function normalizeCategory(cat) {
  if (!cat || cat === 'All') return null;
  return cat;
}

function mapSort(sortValue) {
  // Keep values aligned with existing <select> options in index.html
  // newest, oldest, az, za, price_low, price_high
  switch (sortValue) {
    case 'oldest':
      return { column: 'id', ascending: true };
    case 'az':
      return { column: 'name', ascending: true };
    case 'za':
      return { column: 'name', ascending: false };
    case 'price_high':
      return { column: 'price', ascending: false };
    case 'price_low':
      return { column: 'price', ascending: true };
    case 'newest':
    default:
      return { column: 'id', ascending: false };
  }
}

export async function loadCategories() {
  const supabase = createSupabaseClient();

  // distinct categories for pills
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null)
    .order('category', { ascending: true });

  if (error) throw error;

  const cats = new Set((data || []).map((r) => (r.category ?? '').toString().trim()).filter(Boolean));
  return ['All', ...Array.from(cats)];
}

export async function getProductsCount({ category, search }) {
  const supabase = createSupabaseClient();

  let query = supabase.from('products').select('id', { count: 'exact' });

  const cat = normalizeCategory(category);
  const q = normalizeTextQuery(search);

  if (cat) query = query.eq('category', cat);

  if (q) {
    // Search by: name OR category OR description
    // Note: uses ilike for case-insensitive search.
    // For larger data sets, you may later add full-text search.
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `category.ilike.%${q}%`,
        `description.ilike.%${q}%`,
      ].join(',')
    );
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function loadProducts({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  category = 'All',
  search = '',
  sort = 'newest',
} = {}) {
  const supabase = createSupabaseClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select('id,name,price,description,category,image_url')
    .order(mapSort(sort).column, { ascending: mapSort(sort).ascending })
    .range(from, to);

  const cat = normalizeCategory(category);
  const q = normalizeTextQuery(search);

  if (cat) query = query.eq('category', cat);

  if (q) {
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `category.ilike.%${q}%`,
        `description.ilike.%${q}%`,
      ].join(',')
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}

