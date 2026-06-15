const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23050c1c'/%3E%3C/svg%3E";

export function setupLazyProductImages(rootEl) {
  const images = rootEl.querySelectorAll('img[data-src]');
  if (!images.length) return;

  // IntersectionObserver: load only when visible
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const img = entry.target;
        const realSrc = img.getAttribute('data-src');
        if (!realSrc) continue;

        // placeholder already set via src
        img.addEventListener(
          'load',
          () => {
            img.classList.add('product-img-fade-in');
          },
          { once: true }
        );

        img.src = realSrc;
        img.removeAttribute('data-src');
        io.unobserve(img);
      }
    },
    { rootMargin: '200px 0px', threshold: 0.01 }
  );

  images.forEach((img) => {
    // placeholder while waiting
    img.src = img.getAttribute('src') || PLACEHOLDER_SVG;
    img.classList.remove('product-img-fade-in');
    io.observe(img);
  });
}

