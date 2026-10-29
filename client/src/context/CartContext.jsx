import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_pc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_pc_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then(products => {
        if (cancelled) return;
        const productsById = new Map(products.map(product => [product.id, product]));
        let adjustedCart = false;
        setCart(prev => prev.flatMap(item => {
          const product = productsById.get(item.id);
          if (!product) return [item];

          const stock = Math.max(0, Number(product.stock ?? 10));
          if (stock === 0) {
            adjustedCart = true;
            return [];
          }
          if (item.quantity > stock) adjustedCart = true;
          return [{ ...item, stock, quantity: Math.min(item.quantity, stock) }];
        }));
        if (adjustedCart) {
          showToast('Giỏ hàng đã được cập nhật theo số lượng tồn kho hiện tại.', 'error');
        }
      })
      .catch(error => {
        console.error('Failed to refresh cart product stock:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (product, quantity = 1) => {
    const stock = Math.max(0, Number(product.stock ?? 10));
    const existing = cart.find(item => item.id === product.id);
    const currentQuantity = existing?.quantity || 0;
    const acceptedQuantity = Math.min(quantity, stock - currentQuantity);

    if (acceptedQuantity <= 0) {
      if (existing && existing.quantity > stock) {
        setCart(prev => prev.flatMap(item => {
          if (item.id !== product.id) return [item];
          return stock > 0 ? [{ ...item, stock, quantity: stock }] : [];
        }));
      }
      showToast(
        stock === 0
          ? `"${product.name}" hiện đã hết hàng.`
          : `Bạn chỉ có thể thêm tối đa ${stock} sản phẩm "${product.name}" vào giỏ.`,
        'error'
      );
      return false;
    }

    setCart(prev => {
      const currentItem = prev.find(item => item.id === product.id);
      if (currentItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, stock, quantity: item.quantity + acceptedQuantity }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        category_id: product.category_id,
        specs: product.specs,
        warranty: product.warranty,
        stock,
        quantity: acceptedQuantity
      }];
    });
    if (acceptedQuantity < quantity) {
      showToast(`Chỉ còn có thể thêm ${acceptedQuantity} sản phẩm "${product.name}" vào giỏ.`, 'error');
    } else {
      showToast(`Đã thêm "${product.name.slice(0, 32)}..." vào giỏ hàng`);
    }
    return true;
  };

  const addMultipleToCart = (products) => {
    if (!products || products.length === 0) return false;

    const requested = new Map();
    for (const product of products) {
      const entry = requested.get(product.id) || { product, quantity: 0 };
      entry.quantity += Number(product.buildQty) || 1;
      requested.set(product.id, entry);
    }

    let updated = [...cart];
    const rejectedNames = [];
    for (const { product, quantity } of requested.values()) {
      const stock = Math.max(0, Number(product.stock ?? 10));
      let itemIndex = updated.findIndex(item => item.id === product.id);
      let currentQuantity = itemIndex >= 0 ? updated[itemIndex].quantity : 0;
      if (currentQuantity > stock) {
        if (stock > 0) {
          updated[itemIndex] = { ...updated[itemIndex], stock, quantity: stock };
          currentQuantity = stock;
        } else {
          updated.splice(itemIndex, 1);
          itemIndex = -1;
          currentQuantity = 0;
        }
      }
      const acceptedQuantity = Math.min(quantity, stock - currentQuantity);

      if (acceptedQuantity <= 0) {
        rejectedNames.push(product.name);
        continue;
      }
      if (itemIndex >= 0) {
        updated[itemIndex] = {
          ...updated[itemIndex],
          stock,
          quantity: currentQuantity + acceptedQuantity
        };
      } else {
        updated.push({
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          category_id: product.category_id,
          specs: product.specs,
          warranty: product.warranty,
          stock,
          quantity: acceptedQuantity
        });
      }
      if (acceptedQuantity < quantity) rejectedNames.push(product.name);
    }

    setCart(updated);
    if (rejectedNames.length > 0) {
      showToast(`Không đủ tồn kho để thêm đủ: ${[...new Set(rejectedNames)].join(', ')}.`, 'error');
    } else {
      showToast(`Đã thêm ${products.length} linh kiện bộ máy vào giỏ hàng!`);
    }
    return rejectedNames.length === 0;
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find(cartItem => cartItem.id === productId);
    if (!item) return;
    const stock = Math.max(0, Number(item.stock ?? 10));
    if (quantity > stock) {
      showToast(`Chỉ còn ${stock} sản phẩm "${item.name}" trong kho.`, 'error');
      return;
    }
    setCart(prev => prev.map(cartItem =>
      cartItem.id === productId ? { ...cartItem, quantity } : cartItem
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
