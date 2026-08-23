// About carousel script — modular, no globals
document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = carousel.querySelector(".carousel-arrow.prev");
  const nextBtn = carousel.querySelector(".carousel-arrow.next");
  const dotsWrap = carousel.querySelector(".carousel-dots");

  // Clone first and last for seamless infinite loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.dataset.clone = "true";
  lastClone.dataset.clone = "true";
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);

  let allSlides = Array.from(track.querySelectorAll(".carousel-slide"));
  let index = 1; // start at first original slide (after lastClone)
  let isTransitioning = false;

  // set initial position
  const updatePosition = (instant) => {
    const offset = -index * 100;
    if (instant) {
      track.style.transition = "none";
    } else {
      track.style.transition = "";
    }
    track.style.transform = `translateX(${offset}%)`;
    requestAnimationFrame(() => {
      if (instant)
        track.style.transition = "transform 0.8s cubic-bezier(0.22,0.9,0.34,1)";
    });
  };

  // Build dots
  const realCount = slides.length;
  const dots = [];
  for (let i = 0; i < realCount; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = i === 0 ? "active" : "";
    btn.dataset.to = i + 1; // maps to index offset due to clone
    btn.addEventListener("click", () => goToSlide(i + 1));
    dotsWrap.appendChild(btn);
    dots.push(btn);
  }

  function setActiveDot() {
    const active = (((index - 1) % realCount) + realCount) % realCount;
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
  }

  function goToSlide(i) {
    if (isTransitioning) return;
    index = i;
    updatePosition(false);
    isTransitioning = true;
  }

  nextBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    index++;
    updatePosition(false);
    isTransitioning = true;
  });
  prevBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    index--;
    updatePosition(false);
    isTransitioning = true;
  });

  track.addEventListener("transitionend", () => {
    isTransitioning = false;
    // If at clones, jump without transition
    const current = allSlides[index];
    if (current && current.dataset && current.dataset.clone === "true") {
      if (index === 0) {
        // jumped to last clone -> real last
        index = realCount;
      } else if (index === allSlides.length - 1) {
        // jumped to first clone -> real first
        index = 1;
      }
      updatePosition(true);
    }
    setActiveDot();
  });

  // Initialize position
  updatePosition(true);

  // Autoplay (6-8s variable)
  let autoplayTimer = null;
  let paused = false;
  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => !!motionQuery?.matches;

  function scheduleNext() {
    if (reduceMotion()) return;
    clearTimeout(autoplayTimer);
    const delay = 6000 + Math.floor(Math.random() * 2000); // 6000-8000ms
    autoplayTimer = setTimeout(() => {
      if (!paused && !isTransitioning) {
        index++;
        updatePosition(false);
        isTransitioning = true;
      }
      scheduleNext();
    }, delay);
  }

  function syncAutoplayPreference() {
    if (reduceMotion()) {
      paused = true;
      clearTimeout(autoplayTimer);
      return;
    }

    paused = false;
    scheduleNext();
  }

  motionQuery?.addEventListener?.("change", syncAutoplayPreference);
  if (motionQuery && !motionQuery.addEventListener) {
    motionQuery.addListener(syncAutoplayPreference);
  }

  syncAutoplayPreference();

  // Pause on hover
  carousel.addEventListener("mouseenter", () => {
    if (reduceMotion()) return;
    paused = true;
    clearTimeout(autoplayTimer);
  });
  carousel.addEventListener("mouseleave", () => {
    if (reduceMotion()) return;
    paused = false;
    scheduleNext();
  });

  // Touch support
  let startX = 0;
  let deltaX = 0;
  carousel.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 1) return;
      startX = e.touches[0].clientX;
      deltaX = 0;
      paused = true;
      clearTimeout(autoplayTimer);
    },
    { passive: true },
  );

  carousel.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) return;
      deltaX = e.touches[0].clientX - startX;
      // small drag translation for feel
      const percent = (deltaX / carousel.clientWidth) * 100;
      track.style.transition = "none";
      track.style.transform = `translateX(${-index * 100 + percent}%)`;
    },
    { passive: true },
  );

  carousel.addEventListener("touchend", () => {
    track.style.transition = "";
    const threshold = carousel.clientWidth * 0.12; // 12% width
    if (deltaX > threshold) {
      // swipe right -> prev
      index = Math.max(0, index - 1);
    } else if (deltaX < -threshold) {
      // swipe left -> next
      index = Math.min(allSlides.length - 1, index + 1);
    }
    updatePosition(false);
    isTransitioning = true;
    paused = false;
    scheduleNext();
  });

  // Recompute slides array on window resize (in case of layout shifts)
  window.addEventListener("resize", () => {
    allSlides = Array.from(track.querySelectorAll(".carousel-slide"));
    updatePosition(true);
  });
});
