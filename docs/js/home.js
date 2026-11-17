// ============================================================
// ÉPICO INDUMENTARIA — home.js
// Destacados de la home: los productos con una X en la columna
// "Favoritos" del Sheet (máximo 20). Si no hay ninguno marcado,
// muestra los primeros 8 para que la sección nunca quede vacía.
// El catálogo completo, los filtros y el pedido están en catalogo.html.
// ============================================================

const MAX_DESTACADOS      = 20;
const DESTACADOS_SIN_MARCA = 8;

function initApp() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const favoritos = PRODUCTS.filter(p => p.favorite);
  const lista = (favoritos.length ? favoritos : PRODUCTS.slice(0, DESTACADOS_SIN_MARCA)).slice(0, MAX_DESTACADOS);

  grid.innerHTML = '';
  lista.forEach(p => grid.appendChild(buildFeaturedCard(p)));
}

function buildFeaturedCard(p) {
  const isPromo = !!p.promoPrice && p.promoPrice > 0;
  const precio  = isPromo ? p.promoPrice : p.price;

  const card = document.createElement('article');
  card.className = 'product-card featured-card';

  const img = p.image
    ? `<img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">`
    : `<div class="product-placeholder"><span>${p.emoji}</span></div>`;

  const pct = isPromo ? Math.round((1 - p.promoPrice / p.price) * 100) : 0;

  card.innerHTML = `
    <div class="product-img-wrap">
      ${img}
      ${isPromo ? `<span class="promo-badge">oportunidad −${pct}%</span>` : ''}
      <span class="price-stamp${isPromo ? ' is-promo' : ''}">${formatMoney(precio)}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">${p.name}</h3>
      <a class="featured-link" href="catalogo.html#p-${encodeURIComponent(p.sku)}">Pedilo por mayor →</a>
    </div>`;
  return card;
}
