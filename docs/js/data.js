// Catálogo de productos — Épico Indumentaria
// Generado automáticamente desde Google Drive + Google Sheet
// Para actualizar: sincronizá el catálogo desde Claude Code

const PRODUCTS = [
  {
    sku: 'CAMOSNE',
    name: 'Campera Nena Canelon',
    category: 'ninas',
    price: 35000,
    emoji: '🧥',
    gradientFrom: '#2d0a1a',
    gradientTo: '#1a0a14',
    colors: [
      { name: 'Rosa', hex: '#ff69b4', image: 'assets/products/CAMOSNE.jpeg' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    curve: [1, 1, 1, 1, 1],
    image: 'assets/products/CAMOSNE.jpeg',
  },
  {
    sku: 'MLJIPRO',
    name: 'Remera Mario Bross',
    category: 'ninos',
    price: 7000,
    emoji: '👕',
    gradientFrom: '#0a1a2e',
    gradientTo: '#0d2744',
    colors: [
      { name: 'Celeste', hex: '#87CEEB', image: 'assets/products/MLJIPRO.jpeg' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    curve: [1, 2, 2, 2, 1],
    image: 'assets/products/MLJIPRO.jpeg',
  },
  {
    sku: 'BUMAYDAR',
    name: 'Sweater',
    category: 'ninos',
    price: 15000,
    emoji: '🧥',
    gradientFrom: '#0a1a0a',
    gradientTo: '#1a2e1a',
    colors: [
      { name: 'Verde', hex: '#39FF14', image: 'assets/products/BUMAYDAR.jpeg' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    curve: [1, 1, 1, 1],
    image: 'assets/products/BUMAYDAR.jpeg',
  },
  {
    sku: 'MLJIGAS',
    name: 'Buzo Maltinto 23',
    category: 'ninos|ninas',
    price: 17000,
    emoji: '🧥',
    gradientFrom: '#1a1a1a',
    gradientTo: '#2d2d2d',
    colors: [
      { name: 'Negro', hex: '#1a1a1a', image: 'assets/products/MLJIGAS.jpeg' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    curve: [1, 1, 1, 1],
    image: 'assets/products/MLJIGAS.jpeg',
  },
];

const CLIENT_TYPES = {
  minorista: {
    label: 'Público General',
    icon: '🛍️',
    discount: 0,
    bulkDiscount: 0.10,
    bulkMinQty: 4,
    minimum: 0,
  },
  'curva-abierta': {
    label: 'Mayorista — Curva Abierta',
    icon: '📦',
    discount: 0.20,
    minimum: 300000,
  },
  'curva-cerrada': {
    label: 'Mayorista — Curva Cerrada',
    icon: '🏭',
    discount: 0.35,
    minimum: 0,
  },
};

const WHATSAPP_NUMBER = '5493412268086';
const MINIMUM_MAYORISTA = 300000;
