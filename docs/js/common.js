// ============================================================
// ÉPICO INDUMENTARIA — common.js
// Lo que comparten la home y el catálogo: carrusel, menú, header, zoom de fotos.
// ============================================================

// ============================================================
// HERO CAROUSEL
// ============================================================
(function initCarousel() {
  if (!document.querySelector('.hero-section')) return;
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.slide-dots .dot');
  let current   = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() { interval = setInterval(() => goTo(current + 1), 5000); }
  function resetAuto()  { clearInterval(interval); startAuto(); }

  document.getElementById('slideNext').addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  document.getElementById('slidePrev').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.index); resetAuto(); }));

  // Swipe en mobile
  const hero = document.querySelector('.hero-section');
  let touchX = null;
  hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); resetAuto(); }
  });

  startAuto();
})();

// ============================================================
// MOBILE MENU
// ============================================================
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('mainNav').classList.toggle('open');
});

// ============================================================
// UTILS
// ============================================================
function formatMoney(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

// ============================================================
// HEADER SCROLL SHRINK
// ============================================================
(function initScrollHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ============================================================
// IMAGE LIGHTBOX
// ============================================================
(function initLightbox() {
  const lb = document.createElement('div');
  lb.className = 'img-lightbox';
  lb.innerHTML = '<button class="lightbox-close" aria-label="Cerrar">✕</button><img alt="">';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('img');

  function open(src) {
    lbImg.src = src;
    lb.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('visible');
    document.body.style.overflow = '';
  }

  lb.querySelector('.lightbox-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.addEventListener('click', e => {
    const wrap = e.target.closest('.product-img-wrap');
    if (!wrap) return;
    const img = wrap.querySelector('.product-img');
    if (img && img.src) open(img.src);
  });
})();

// ============================================================
// INIT
// ============================================================
// Se llama desde catalog-loader.js una vez que PRODUCTS está listo
// (cargado desde Google Sheets o desde el catálogo de respaldo).
