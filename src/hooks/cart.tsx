import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      await AsyncStorage.removeItem('@goMarket:product');
      const productsStoraged = await AsyncStorage.getItem('@goMarket:product');

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existProduct = products.find(p => p.id === product.id);

      if (existProduct) {
        const attProducts = products.map(p => {
          if (p.id === existProduct.id) {
            p.quantity += 1;
            return p;
          }
          return p;
        });
        setProducts(attProducts);

        await AsyncStorage.setItem(
          '@goMarket:product',
          JSON.stringify(products),
        );

        return;
      }
      setProducts([
        ...products,
        {
          ...product,
          quantity: 1,
        },
      ]);

      await AsyncStorage.setItem('@goMarket:product', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const attProducts = products.map(p => {
        if (p.id === id) {
          p.quantity += 1;
          return p;
        }
        return p;
      });
      setProducts(attProducts);

      await AsyncStorage.setItem('@goMarket:product', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const attProducts = products.map(p => {
        if (p.id === id) {
          p.quantity -= 1;
          return p;
        }
        return p;
      });
      setProducts(attProducts);

      await AsyncStorage.setItem('@goMarket:product', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
