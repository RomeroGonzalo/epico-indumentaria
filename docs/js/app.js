// ============================================================
// ÉPICO INDUMENTARIA — app.js
// ============================================================

// ---- STATE ----
let currentClientType = 'minorista';
let currentFilter     = 'all';
let cart              = [];

// ---- DOM REFS ----
const productsGrid   = document.getElementById('productsGrid');
const cartSidebar    = document.getElementById('cartSidebar');
const cartOverlay    = document.getElementById('cartOverlay');
const cartBody       = document.getElementById('cartBody');
const cartFoot       = document.getElementById('cartFoot');
const cartCountEl    = document.getElementById('cartCount');
const cartTotalEl    = document.getElementById('cartTotal');
const cartMinWarning = document.getElementById('cartMinWarning');
const minWarningText = document.getElementById('minWarningText');
const cartClientPill = document.getElementById('cartClientPill');
const priceModePill  = document.getElementById('priceModePill');
const pillText       = document.getElementById('pillText');
const modalOverlay   = document.getElementById('modalOverlay');
const btnFinalize    = document.getElementById('btnFinalize');

// ============================================================
// HERO CAROUSEL
// ============================================================
(function initCarousel() {
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

  startAuto();
})();

// ============================================================
// MOBILE MENU
// ============================================================
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('mainNav').classList.toggle('open');
});

// ============================================================
// CLIENT TYPE SELECTOR
// ============================================================
document.querySelectorAll('input[name="clientType"]').forEach(radio => {
  radio.addEventListener('change', function () {
    currentClientType = this.value;
    updatePriceUI();
    renderCart();
  });
});

function updatePriceUI() {
  const ct      = CLIENT_TYPES[currentClientType];
  const isCurva = currentClientType === 'curva-cerrada';

  // Pill en el catálogo
  if (ct.discount === 0) {
    pillText.innerHTML = 'Precios: <strong>Lista</strong>';
    priceModePill.querySelector('.pill-icon').textContent = '🛍️';
  } else {
    pillText.innerHTML = `Precios: <strong>${ct.label} (−${ct.discount * 100}%)</strong>`;
    priceModePill.querySelector('.pill-icon').textContent = ct.icon;
  }

  // Actualizar precios y modo en todas las tarjetas
  document.querySelectorAll('.product-card').forEach(card => {
    const basePrice = +card.dataset.basePrice;
    updateCardPrice(card, basePrice);

    const std   = card.querySelector('.variants-standard');
    const curva = card.querySelector('.variants-curva');
    if (std)   std.style.display   = isCurva ? 'none' : 'flex';
    if (curva) curva.style.display = isCurva ? 'flex' : 'none';
  });

  // Pill en el carrito
  cartClientPill.textContent = `${ct.icon} ${ct.label}`;
}

function calcPrice(basePrice) {
  return Math.round(basePrice * (1 - CLIENT_TYPES[currentClientType].discount));
}

function updateCardPrice(card, basePrice) {
  const finalPrice   = calcPrice(basePrice);
  const ct           = CLIENT_TYPES[currentClientType];
  const isCurva      = currentClientType === 'curva-cerrada';
  const totalInCurve = +card.dataset.curveTotal || 1;
  const priceOrig    = card.querySelector('.price-original');
  const priceCurrent = card.querySelector('.price-current');
  const discTag      = card.querySelector('.discount-tag');
  const savingTag    = card.querySelector('.saving-tag');

  priceCurrent.textContent = formatMoney(finalPrice);

  if (ct.discount > 0) {
    const saving = isCurva
      ? (basePrice - finalPrice) * totalInCurve
      : basePrice - finalPrice;
    priceOrig.textContent   = formatMoney(basePrice);
    priceOrig.style.display = 'inline';
    discTag.textContent     = `−${ct.discount * 100}%`;
    discTag.style.display   = 'inline';
    savingTag.textContent   = isCurva
      ? `Ahorrás ${formatMoney(saving)} por curva`
      : `Ahorrás ${formatMoney(saving)}`;
    savingTag.style.display = 'inline';
  } else {
    priceOrig.style.display = 'none';
    discTag.style.display   = 'none';
    savingTag.style.display = 'none';
  }

  // Actualizar precio por curva si existe la sección
  const curvaPriceVal = card.querySelector('.curva-price-value');
  if (curvaPriceVal) {
    curvaPriceVal.textContent = formatMoney(finalPrice * totalInCurve);
  }
}

// ============================================================
// CATALOG RENDER
// ============================================================
function renderCatalog() {
  productsGrid.innerHTML = '';
  PRODUCTS.forEach(p => productsGrid.appendChild(buildProductCard(p)));
  applyFilter(currentFilter);
}

function buildProductCard(p) {
  const card = document.createElement('div');
  card.className        = 'product-card';
  card.dataset.category = p.category;
  card.dataset.sku      = p.sku;
  card.dataset.basePrice = p.price;

  const totalInCurve  = p.curve.reduce((a, b) => a + b, 0);
  card.dataset.curveTotal = totalInCurve;

  const finalPrice    = calcPrice(p.price);
  const pricePerCurva = finalPrice * totalInCurve;
  const ct            = CLIENT_TYPES[currentClientType];
  const isCurva       = currentClientType === 'curva-cerrada';
  const savingUnit    = p.price - finalPrice;
  const savingCurva   = savingUnit * totalInCurve;

  // Standard: color swatches
  const colorSwatches = p.colors.map((c, i) => `
    <button class="color-swatch ${i === 0 ? 'active' : ''}"
            data-color="${c.name}"
            ${c.image ? `data-image="${c.image}"` : ''}
            style="background:${c.hex};${c.hex === '#f5f5f5' ? 'border:2px solid #555;' : ''}"
            title="${c.name}"></button>
  `).join('');

  // Standard: size buttons
  const sizeBtns = p.sizes.map((s, i) => `
    <button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
  `).join('');

  // Curva: read-only color chips
  const curvaColorChips = p.colors.map(c => `
    <span class="curva-color-chip" title="${c.name}"
          style="background:${c.hex};${c.hex === '#f5f5f5' ? 'border:1.5px solid #555;' : ''}"></span>
  `).join('');

  // Curva: talle breakdown
  const curvaBreakdown = p.sizes.map((s, i) => `${s}×${p.curve[i]}`).join(' | ');

  const imgContent = p.image
    ? `<img class="product-img" src="${p.image}" alt="${p.name}">`
    : `<div class="product-placeholder" style="background:linear-gradient(135deg,${p.gradientFrom},${p.gradientTo})">
         <span>${p.emoji}</span>
         <span class="label">${p.category}</span>
       </div>`;

  card.innerHTML = `
    <div class="product-img-wrap">${imgContent}</div>
    <div class="product-info">
      <span class="product-sku">${p.sku}</span>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-pricing">
        <span class="price-original" style="display:${ct.discount > 0 ? 'inline' : 'none'}">${formatMoney(p.price)}</span>
        <span class="price-current">${formatMoney(finalPrice)}</span>
        <span class="discount-tag" style="display:${ct.discount > 0 ? 'inline' : 'none'}">−${ct.discount * 100}%</span>
      </div>
      <span class="saving-tag" style="display:${ct.discount > 0 ? 'inline' : 'none'}">
        ${isCurva ? `Ahorrás ${formatMoney(savingCurva)} por curva` : `Ahorrás ${formatMoney(savingUnit)}`}
      </span>

      <div class="variants-standard" style="display:${isCurva ? 'none' : 'flex'}">
        <div class="variant-group">
          <label>Color: <strong class="selected-color-name">${p.colors[0].name}</strong></label>
          <div class="color-swatches">${colorSwatches}</div>
        </div>
        <div class="variant-group">
          <label>Talle: <strong class="selected-size-name">${p.sizes[0]}</strong></label>
          <div class="size-buttons">${sizeBtns}</div>
        </div>
        <div class="product-actions">
          <div class="qty-control">
            <button class="qty-btn qty-minus">−</button>
            <span class="qty-val">1</span>
            <button class="qty-btn qty-plus">+</button>
          </div>
          <button class="btn-add-cart">Agregar</button>
        </div>
      </div>

      <div class="variants-curva" style="display:${isCurva ? 'flex' : 'none'}">
        <div class="curva-info-group">
          <span class="curva-label-text">Viene surtido en colores:</span>
          <div class="curva-label-row">
            <div class="curva-color-chips">${curvaColorChips}</div>
            <span class="curva-colors-names">${p.colors.map(c => c.name).join(', ')}</span>
          </div>
        </div>
        <div class="curva-info-group">
          <span class="curva-label-text">Curva incluida:</span>
          <div class="curva-breakdown-row">${curvaBreakdown}</div>
          <span class="curva-total-text">${totalInCurve} prendas por curva</span>
        </div>
        <div class="curva-price-row">
          <span class="curva-price-label">Precio por curva:</span>
          <span class="curva-price-value">${formatMoney(pricePerCurva)}</span>
        </div>
        <div class="product-actions">
          <div class="curva-qty-wrap">
            <div class="qty-control">
              <button class="qty-btn qty-minus-curva">−</button>
              <span class="qty-val-curva">1</span>
              <button class="qty-btn qty-plus-curva">+</button>
            </div>
            <span class="curva-qty-unit">curva(s)</span>
          </div>
          <button class="btn-add-curva">Agregar curva</button>
        </div>
      </div>
    </div>`;

  // ---- Standard: color swatches ----
  card.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      card.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      card.querySelector('.selected-color-name').textContent = sw.dataset.color;
      if (sw.dataset.image) {
        card.querySelector('.product-img-wrap').innerHTML =
          `<img class="product-img" src="${sw.dataset.image}" alt="${sw.dataset.color}">`;
      }
    });
  });

  // ---- Standard: size buttons ----
  card.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.querySelector('.selected-size-name').textContent = btn.dataset.size;
    });
  });

  // ---- Standard: qty control ----
  const qtyVal = card.querySelector('.qty-val');
  card.querySelector('.qty-minus').addEventListener('click', () => {
    const v = +qtyVal.textContent; if (v > 1) qtyVal.textContent = v - 1;
  });
  card.querySelector('.qty-plus').addEventListener('click', () => {
    qtyVal.textContent = +qtyVal.textContent + 1;
  });

  // ---- Standard: add to cart ----
  card.querySelector('.btn-add-cart').addEventListener('click', () => {
    const color = card.querySelector('.color-swatch.active').dataset.color;
    const size  = card.querySelector('.size-btn.active').dataset.size;
    const qty   = +card.querySelector('.qty-val').textContent;
    addToCart(p, color, size, qty, calcPrice(p.price));
  });

  // ---- Curva: qty control ----
  const qtyValCurva = card.querySelector('.qty-val-curva');
  card.querySelector('.qty-minus-curva').addEventListener('click', () => {
    const v = +qtyValCurva.textContent; if (v > 1) qtyValCurva.textContent = v - 1;
  });
  card.querySelector('.qty-plus-curva').addEventListener('click', () => {
    qtyValCurva.textContent = +qtyValCurva.textContent + 1;
  });

  // ---- Curva: add curva ----
  card.querySelector('.btn-add-curva').addEventListener('click', () => {
    addCurvaToCart(p, +card.querySelector('.qty-val-curva').textContent);
  });

  return card;
}

// ============================================================
// CATALOG FILTER
// ============================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    applyFilter(currentFilter);
  });
});

function applyFilter(filter) {
  document.querySelectorAll('.product-card').forEach(card => {
    if (filter === 'all' || card.dataset.category === filter) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// ============================================================
// CART
// ============================================================
function addToCart(product, color, size, qty, unitPrice) {
  const key      = `${product.sku}-${color}-${size}`;
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.qty += qty;
    existing.unitPrice = unitPrice;
  } else {
    cart.push({
      key, sku: product.sku, name: product.name, emoji: product.emoji,
      color, size, qty, unitPrice, basePrice: product.price,
    });
  }

  renderCart();
  bumpCartBadge();
  showToast(`${product.emoji} <strong>${product.name}</strong> agregado al carrito`);
}

function addCurvaToCart(product, qtyCurvas) {
  const totalInCurve = product.curve.reduce((a, b) => a + b, 0);
  const key          = `${product.sku}-curva`;
  const unitPrice    = calcPrice(product.price);
  const existing     = cart.find(i => i.key === key);

  if (existing) {
    existing.qty += qtyCurvas;
    existing.unitPrice = unitPrice;
  } else {
    cart.push({
      key,
      sku:         product.sku,
      name:        product.name,
      emoji:       product.emoji,
      isCurva:     true,
      curveData:   { sizes: product.sizes, curve: product.curve },
      totalInCurve,
      qty:         qtyCurvas,
      unitPrice,
      basePrice:   product.price,
      colors:      product.colors.map(c => c.name),
    });
  }

  renderCart();
  bumpCartBadge();
  showToast(`${product.emoji} <strong>${product.name}</strong> — ${qtyCurvas} curva${qtyCurvas > 1 ? 's' : ''} agregada${qtyCurvas > 1 ? 's' : ''}`);
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  renderCart();
}

function changeCartQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  const next = item.qty + delta;
  if (next < 1) {
    cart = cart.filter(i => i.key !== key);
  } else {
    item.qty = next;
  }
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const mult = item.isCurva ? item.totalInCurve : 1;
    return sum + item.unitPrice * mult * item.qty;
  }, 0);
}

function renderCart() {
  // Recalc unit prices on client type change
  cart.forEach(item => { item.unitPrice = calcPrice(item.basePrice); });

  cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);

  if (cart.length === 0) {
    cartBody.innerHTML = `<div class="cart-empty-state"><span>🛒</span><p>Tu carrito está vacío</p></div>`;
    cartFoot.style.display = 'none';
    return;
  }

  cartFoot.style.display = 'flex';

  cartBody.innerHTML = cart.map(item => {
    if (item.isCurva) {
      const totalPrice  = item.unitPrice * item.totalInCurve * item.qty;
      const curvaLabel  = item.qty === 1 ? '1 curva' : `${item.qty} curvas`;
      return `
        <div class="cart-item" data-key="${item.key}">
          <div class="cart-item-icon">${item.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${item.totalInCurve} prendas/curva · Surtido en colores</div>
            <div class="cart-item-price">${formatMoney(totalPrice)}</div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-qty-control">
              <button class="cart-qty-btn" data-key="${item.key}" data-delta="-1">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn" data-key="${item.key}" data-delta="1">+</button>
            </div>
            <span class="cart-qty-unit-label">${curvaLabel}</span>
            <button class="cart-item-remove" data-key="${item.key}" title="Eliminar">✕</button>
          </div>
        </div>`;
    }
    return `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-icon">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Talle: ${item.size} · Color: ${item.color}</div>
          <div class="cart-item-price">${formatMoney(item.unitPrice * item.qty)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty-control">
            <button class="cart-qty-btn" data-key="${item.key}" data-delta="-1">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" data-key="${item.key}" data-delta="1">+</button>
          </div>
          <button class="cart-item-remove" data-key="${item.key}" title="Eliminar">✕</button>
        </div>
      </div>`;
  }).join('');

  // Qty buttons
  cartBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.key, +btn.dataset.delta));
  });

  // Remove buttons
  cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
  });

  const total     = getCartTotal();
  const baseTotal = cart.reduce((s, i) => {
    const mult = i.isCurva ? i.totalInCurve : 1;
    return s + i.basePrice * mult * i.qty;
  }, 0);
  const saving = baseTotal - total;
  cartTotalEl.textContent = formatMoney(total);

  let savingRow = document.getElementById('cartSavingRow');
  if (saving > 0) {
    if (!savingRow) {
      savingRow = document.createElement('div');
      savingRow.id        = 'cartSavingRow';
      savingRow.className = 'cart-saving-row';
      cartTotalEl.closest('.cart-total-row').insertAdjacentElement('afterend', savingRow);
    }
    savingRow.innerHTML    = `<span>Tu ahorro</span><span class="cart-saving-amount">−${formatMoney(saving)}</span>`;
    savingRow.style.display = 'flex';
  } else if (savingRow) {
    savingRow.style.display = 'none';
  }

  // Mínimo para curva-abierta
  if (currentClientType === 'curva-abierta' && total < MINIMUM_MAYORISTA) {
    const falta = MINIMUM_MAYORISTA - total;
    cartMinWarning.style.display = 'block';
    minWarningText.textContent   = `⚠️ Te faltan ${formatMoney(falta)} para llegar al mínimo de ${formatMoney(MINIMUM_MAYORISTA)} (Mayorista Curva Abierta).`;
    btnFinalize.disabled = true;
  } else {
    cartMinWarning.style.display = 'none';
    btnFinalize.disabled = false;
  }

  const ct = CLIENT_TYPES[currentClientType];
  cartClientPill.textContent = `${ct.icon} ${ct.label}`;
}

// ---- Cart open/close ----
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function bumpCartBadge() {
  cartCountEl.classList.add('bump');
  setTimeout(() => cartCountEl.classList.remove('bump'), 300);
}

// ---- Toast ----
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast    = document.createElement('div');
    toast.id = 'cartToast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-check">✓</span> ${msg}`;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

btnFinalize.addEventListener('click', openOrderModal);

// ============================================================
// ORDER MODAL
// ============================================================
function openOrderModal() {
  modalOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeOrderModal() {
  modalOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeOrderModal);
modalOverlay.addEventListener('click', function (e) {
  if (e.target === this) closeOrderModal();
});

document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name     = document.getElementById('fName').value.trim();
  const phone    = document.getElementById('fPhone').value.trim();
  const city     = document.getElementById('fCity').value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked').value;

  let valid = true;
  ['fName', 'fPhone', 'fCity'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    else el.classList.remove('error');
  });
  if (!valid) return;

  const message = buildWhatsAppMessage(name, phone, city, delivery);
  const url     = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');

  closeOrderModal();
  closeCart();
});

// ============================================================
// WHATSAPP MESSAGE BUILDER
// ============================================================
function buildWhatsAppMessage(name, phone, city, delivery) {
  const ct            = CLIENT_TYPES[currentClientType];
  const total         = getCartTotal();
  const deliveryLabel = delivery === 'envio' ? 'Envío a domicilio' : 'Retiro en sucursal';

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━',
    '🛍️ *NUEVO PEDIDO — ÉPICO INDUMENTARIA*',
    '━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `👤 *Cliente:* ${name}`,
    `📱 *Teléfono:* ${phone}`,
    `📍 *Localidad:* ${city}`,
    `🏷️ *Tipo de cliente:* ${ct.label}`,
    `🚚 *Entrega:* ${deliveryLabel}`,
    '',
    '📦 *DETALLE DEL PEDIDO:*',
    '───────────────────────',
  ];

  cart.forEach(item => {
    if (item.isCurva) {
      const subtotal   = item.unitPrice * item.totalInCurve * item.qty;
      const breakdown  = item.curveData.sizes.map((s, i) => `${s}×${item.curveData.curve[i]}`).join(' | ');
      const curvaLabel = item.qty === 1 ? '1 curva' : `${item.qty} curvas`;
      lines.push(`• ${curvaLabel} × ${item.name} (${item.sku})`);
      lines.push(`  Curva: ${breakdown} (${item.totalInCurve} prendas/curva)`);
      lines.push(`  Colores: surtido (${item.colors.join(', ')})`);
      lines.push(`  Subtotal: ${formatMoney(subtotal)}`);
    } else {
      lines.push(`• ${item.qty}× ${item.name} (${item.sku})`);
      lines.push(`  Talle: ${item.size} | Color: ${item.color}`);
      lines.push(`  Subtotal: ${formatMoney(item.unitPrice * item.qty)}`);
    }
    lines.push('');
  });

  lines.push('───────────────────────');

  if (ct.discount > 0) {
    const baseTotal = cart.reduce((s, i) => {
      const mult = i.isCurva ? i.totalInCurve : 1;
      return s + i.basePrice * mult * i.qty;
    }, 0);
    const saved = baseTotal - total;
    lines.push(`💰 Precio lista: ${formatMoney(baseTotal)}`);
    lines.push(`🎉 Descuento aplicado (${ct.discount * 100}%): −${formatMoney(saved)}`);
  }

  lines.push(`✅ *TOTAL FINAL: ${formatMoney(total)}*`);
  lines.push('');
  lines.push('⚠️ _Este pedido está sujeto a disponibilidad de stock. Los confirmaremos a la brevedad._');
  lines.push('');
  lines.push('_Pedido generado desde epico-indumentaria.com_');

  return lines.join('\n');
}

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
// INIT
// ============================================================
renderCatalog();
updatePriceUI();
