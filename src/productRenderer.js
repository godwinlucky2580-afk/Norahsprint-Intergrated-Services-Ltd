import { setupLazyProductImages } from './productImages.js';

function escapeHtml(str) {
  return (str ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

export function formatPrice(value) {
  // Keep existing visual behavior: shows a string with span NGN.
  // If backend uses numeric price, format it here.
  // If backend already returns a formatted string, just return it.
  if (value == null) return '₦0';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `₦${value.toLocaleString('en-NG')}`;

  // BigInt/other numeric
  try {
    const n = Number(value);
    if (!Number.isFinite(n)) return '₦0';
    return `₦${n.toLocaleString('en-NG')}`;
  } catch {
    return '₦0';
  }
}

export function renderProductGrid({ products, gridEl }) {
  if (!products.length) {
    gridEl.innerHTML = '<div class="no-results">🔍 No products found. Try a different search or filter.</div>';
    return;
  }

  gridEl.innerHTML = products
    .map((p, i) => {
      const cat = p.category ?? '';
      const name = p.name ?? '';
      const desc = p.description ?? '';
      const price = formatPrice(p.price);

      // product image URL expected in DB: image_url
      const imageUrl = p.image_url || '';

      // Keep same DOM structure/classes as existing UI.
      return `
        <div class="product-card reveal" style="transition-delay:${(i % 4) * 0.08}s">
          <div class="product-img">
            <img
              loading="lazy"
              alt="${escapeHtml(name)}"
              class="product-img-el"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23050c1c'/%3E%3C/svg%3E"
              data-src="${escapeHtml(imageUrl)}"
            />
            <div class="product-cat">${escapeHtml(cat)}</div>
          </div>
          <div class="product-info">
            <div class="product-name">${escapeHtml(name)}</div>
            <p class="product-desc">${escapeHtml(desc)}</p>
            <div class="product-footer">
              <div class="product-price">${escapeHtml(price)}<span> NGN</span></div>
              <button class="btn-order" type="button" data-order-name="${escapeHtml(name)}" data-order-price="${escapeHtml(price)}">
                <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="20px" height="20px" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
                  viewBox="0 0 6652.7 6652.87" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer"/>
                    <g id="_2534975432304">
                      <path fill="#FEFEFE" d="M2086.53 785.73c721.28,-400.41 1769.93,-367.33 2506.32,2.87l445.92 263.7c378.2,260.78 740.91,742.83 908.94,1160.79 425.28,1057.79 235.17,2270.61 -573.74,3072.34 -139.22,137.98 -217.98,220.16 -377.13,332.49 -1623.29,1145.79 -3017.4,118.35 -3193.22,118.35 -351.94,0 -812.68,259.18 -1123.56,266.11 2.32,-104.38 178.54,-603.29 232.17,-743.56 235.95,-617.1 -409.58,-688.59 -409.58,-1947.09 0,-404.38 121.81,-847.84 255.81,-1133.87 308.26,-658.01 683.85,-1034.52 1328.07,-1392.13zm-2000.93 1842.84c-35.43,179.12 -85.6,503.54 -85.6,712.72 0,270 81.02,677.16 147.47,916.96 254.26,917.53 430.86,424.02 158.98,1222.68l-289.99 865.29c-32.67,148.31 83.56,306.63 220.07,306.63 178.54,0 566.94,-141.83 751.99,-194.17 457.67,-129.47 634.85,-269.15 929.32,-127.03l512.85 196.76c1381.24,389.72 2873.55,-176.08 3595.54,-1241.21 549.85,-811.2 626.46,-1198.56 626.46,-2182.46 0,-874.28 -455.09,-1621.26 -1012.68,-2180.62 -995.08,-998.25 -2419.44,-1166.46 -3726.91,-607.52 -716.68,306.39 -1288.5,984.97 -1627.8,1683.78 -81.22,167.28 -160.02,427.46 -199.72,628.17z"/>
                      <path fill="#1A60D4" d="M4583.88 786.14c-736.39,-370.2 -1785.04,-403.28 -2506.32,-2.87 -644.22,357.61 -1019.8,734.12 -1328.07,1392.13 -134,286.02 -255.81,729.49 -255.81,1133.87 0,1258.5 645.53,1329.99 409.58,1947.09 -53.63,140.27 -229.85,639.18 -232.17,743.56 310.88,-6.93 771.62,-266.11 1123.56,-266.11 175.83,0 1569.93,1027.44 3193.22,-118.35 159.15,-112.33 237.91,-194.51 377.13,-332.49 808.91,-801.73 999.02,-2014.55 573.74,-3072.34 -168.04,-417.96 -530.74,-900.01 -908.94,-1160.79l-445.92 -263.7zm-2099.07 1241.61c163.02,269.36 395.57,498.6 298.7,670.52 -53.88,95.61 -220.11,246.67 -220.11,344.88 0,196.09 986.3,1003.88 1171.04,964.29 186.21,-39.91 206.94,-313.8 425.61,-313.8 84.07,0 374.61,142.98 469,181.5 325.74,132.92 358.9,150.17 358.9,439.42 0,75.25 -182.22,284.42 -235.21,326.58 -675.58,537.45 -1763.59,-263.94 -2167.53,-673.63l-442.97 -444.06 -357.79 -529.23c-56.47,-112.59 -137.64,-301.81 -137.64,-453.72 0,-361.55 480.47,-1103.52 838,-512.76z"/>
                      <path fill="#FEFEFE" d="M2792.49 2710.87c96.87,-171.92 -135.69,-401.16 -298.7,-670.52 -357.53,-590.76 -838,151.21 -838,512.76 0,151.91 81.17,341.13 137.64,453.72l357.79 529.23 442.97 444.06c403.94,409.68 1491.95,1211.08 2167.53,673.63 52.99,-42.16 235.21,-251.33 235.21,-326.58 0,-289.25 -33.16,-306.5 -358.9,-439.42 -94.39,-38.52 -384.92,-181.5 -469,-181.5 -218.67,0 -239.41,273.89 -425.61,313.8 -184.74,39.59 -1171.04,-768.2 -1171.04,-964.29 0,-98.21 166.24,-249.28 220.11,-344.88z"/>
                    </g>
                  </g>
                </svg>
                Order
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // IntersectionObserver-based lazy image loading + fade in
  setupLazyProductImages(gridEl);
}

