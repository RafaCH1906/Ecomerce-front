const CART_STORAGE_KEY = 'ecomerce_cart';

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getCartItems = () => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  const items = safeParse(raw, []);
  return Array.isArray(items) ? items : [];
};

const saveCartItems = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

export const getCartCount = () => {
  const items = getCartItems();
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

export const addToCart = (product) => {
  if (!product?.id) return;

  const items = getCartItems();
  const index = items.findIndex((item) => item.id === product.id);

  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: (items[index].quantity || 1) + 1,
    };
  } else {
    items.push({
      id: product.id,
      nombre: product.nombre,
      precio: Number(product.precio) || 0,
      imageUrl: product.imageUrl || '',
      quantity: 1,
    });
  }

  saveCartItems(items);
};

export const updateCartItemQuantity = (productId, quantity) => {
  const items = getCartItems();

  if (quantity <= 0) {
    const filtered = items.filter((item) => item.id !== productId);
    saveCartItems(filtered);
    return;
  }

  const updated = items.map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );

  saveCartItems(updated);
};

export const removeFromCart = (productId) => {
  const items = getCartItems();
  const filtered = items.filter((item) => item.id !== productId);
  saveCartItems(filtered);
};

export const clearCart = () => {
  saveCartItems([]);
};
