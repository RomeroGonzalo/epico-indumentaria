// ============================================================
// ÉPICO INDUMENTARIA — catalog-loader.js
// Carga el catálogo desde las respuestas de un Google Form
// (guardadas en un Google Sheet publicado como CSV) y arma el
// array PRODUCTS que usa app.js. Si algo falla, usa FALLBACK_PRODUCTS.
// ============================================================

// URL de exportación CSV del Google Sheet. Formato:
// https://docs.google.com/spreadsheets/d/TU_SHEET_ID/gviz/tq?tqx=out:csv&sheet=NOMBRE_HOJA
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/11jOD07c3WtSDcJ3hwGvrHdRGK5GmrLun5BIn3pqXufQ/gviz/tq?tqx=out:csv&sheet=Respuestas%20de%20formulario%201';

let PRODUCTS = typeof FALLBACK_PRODUCTS !== 'undefined' ? FALLBACK_PRODUCTS : [];

const COLOR_HEX = {
  negro: '#1a1a1a', negra: '#1a1a1a',
  blanco: '#f5f5f5', blanca: '#f5f5f5',
  azul: '#1E90FF',
  gris: '#808080', 'gris claro': '#D3D3D3', 'gris oscuro': '#404040',
  rosa: '#FF69B4',
  marron: '#8B4513',
  verde: '#39FF14',
  beige: '#F5F5DC',
  celeste: '#87CEEB',
  violeta: '#8B008B',
  bordo: '#800020',
  natural: '#F5DEB3',
  lila: '#C8A2C8',
  fucsia: '#FF00FF',
  amarillo: '#FFD700',
  naranja: '#FFA500',
  rojo: '#FF0000',
  tornasolado: '#C0C0C0',
};

const CATEGORY_MAP = {
  hombre: 'hombre',
  mujer: 'mujer',
  nino: 'ninos', ninos: 'ninos',
  nina: 'ninas', ninas: 'ninas',
  colegial: 'colegial',
};

const EMOJI_RULES = [
  [/campera|canguro|tapado|buzo/i, '🧥'],
  [/pantal|jean|palazzo|babucha|jogger/i, '👖'],
  [/conjunto/i, '👔'],
];

const FALLBACK_GRADIENTS = [
  ['#1a1a1a', '#2d2d2d'],
  ['#1a1a2e', '#0a0a1a'],
  ['#0a1a2e', '#0d2744'],
  ['#2d0a1a', '#1a0a14'],
  ['#0a2e1a', '#0a1a0a'],
];

// Quita acentos/diacríticos (rango Unicode 0x0300-0x036F) sin depender
// de escribir caracteres combinados directamente en el archivo fuente.
const DIACRITICS_RE = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g'
);

function normalize(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '');
}

// Parser CSV simple compatible con el formato que exporta Google Sheets
// (soporta campos entre comillas con comas y saltos de línea internos).
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function findCol(headers, ...keywords) {
  return headers.findIndex(h => keywords.some(k => normalize(h).includes(k)));
}

// Convierte un link de Google Drive (el que genera un Form al subir un
// archivo) en una URL de imagen que se puede usar directo en un <img>.
function driveImageUrl(raw) {
  if (!raw) return '';
  const match = raw.match(/[-\w]{25,}/); // los ID de archivo de Drive son largos
  if (!match) return raw.trim();
  return `https://lh3.googleusercontent.com/d/${match[0]}=w1000`;
}

function pickEmoji(name) {
  for (const [re, emoji] of EMOJI_RULES) if (re.test(name)) return emoji;
  return '👕';
}

function rowToProduct(headers, cells, index) {
  const get = (...keywords) => {
    const i = findCol(headers, ...keywords);
    return i === -1 ? '' : (cells[i] || '').trim();
  };

  const name = get('nombre', 'producto');
  const price = parseFloat(get('precio').replace(/[^\d.,]/g, '').replace(',', '.'));
  if (!name || !price) return null; // fila vacía o incompleta: se ignora

  // Columna "Precio promocional": si viene cargada y es menor al precio de
  // lista, el producto pasa a ser una "oportunidad" (ver rules en app.js).
  const promoRaw   = get('promocion').replace(/[^\d.,]/g, '').replace(',', '.');
  const promoPrice = promoRaw ? parseFloat(promoRaw) : 0;

  const sku = get('sku', 'codigo') || `PROD${index}`;

  const categories = get('categoria')
    .split(/[,|]/)
    .map(c => CATEGORY_MAP[normalize(c)])
    .filter(Boolean);
  const category = categories.length ? [...new Set(categories)].join('|') : 'hombre';

  const image = driveImageUrl(get('foto', 'imagen'));

  const colorNames = get('color').split(/[,|]/).map(c => c.trim()).filter(Boolean);
  const colors = (colorNames.length ? colorNames : ['Único']).map(cName => ({
    name: cName,
    hex: COLOR_HEX[normalize(cName)] || '#808080',
    image,
  }));

  const sizesRaw = get('talle').split(/[,|]/).map(s => s.trim()).filter(Boolean);
  const sizes = sizesRaw.length ? sizesRaw : ['Único'];

  let curve = get('curva').split(/[,|]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  if (curve.length !== sizes.length) curve = sizes.map(() => 1);

  const [gradientFrom, gradientTo] = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  // Precio promocional inválido (vacío, 0 o mayor/igual al de lista) se ignora.
  const validPromoPrice = (promoPrice > 0 && promoPrice < price) ? promoPrice : 0;

  return { sku, name, category, price, promoPrice: validPromoPrice, emoji: pickEmoji(name), gradientFrom, gradientTo, colors, sizes, curve, image };
}

function parseSheetToProducts(csvText) {
  const rows = parseCSV(csvText).filter(r => r.some(c => c.trim() !== ''));
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1)
    .map((cells, i) => rowToProduct(headers, cells, i + 1))
    .filter(Boolean);
}

async function loadCatalog() {
  if (!SHEET_CSV_URL) {
    console.warn('SHEET_CSV_URL no configurado todavía: usando catálogo de respaldo');
    return PRODUCTS;
  }
  try {
    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csvText = await res.text();
    const products = parseSheetToProducts(csvText);
    if (!products.length) throw new Error('El Sheet no tiene filas válidas');
    return products;
  } catch (err) {
    console.error('No se pudo cargar el catálogo desde Google Sheets, uso el de respaldo:', err);
    return PRODUCTS;
  }
}

loadCatalog().then(products => {
  PRODUCTS = products;
  initApp();
});
