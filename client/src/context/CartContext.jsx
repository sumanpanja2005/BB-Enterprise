import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'bb_cart';

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const id = product._id;
      const i = prev.findIndex((x) => x.productId === id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i],
          qty: Math.min(next[i].qty + qty, product.stock ?? 99),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0] || '',
          stock: product.stock,
          qty,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((x) =>
        x.productId === productId
          ? { ...x, qty: Math.min(qty, x.stock ?? 99) }
          : x
      )
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((a, x) => a + x.qty, 0);
  const subtotal = items.reduce((a, x) => a + x.price * x.qty, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clear,
      count,
      subtotal,
    }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
