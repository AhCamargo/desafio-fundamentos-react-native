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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem('@GoMarketPlace');

      if (cartProducts) {
        setProducts([...JSON.parse(cartProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      let addProduct = [];

      const productExists = products.find(
        prodItem => prodItem.id === product.id,
      );

      if (productExists) {
        addProduct = products.map(prodItem =>
          prodItem.id === product.id
            ? { ...product, quantity: prodItem.quantity + 1 }
            : prodItem,
        );
      } else {
        addProduct = [...products, { ...product, quantity: 1 }];
      }

      setProducts([...addProduct]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const addProduct = products.map(prodItem =>
        prodItem.id === id
          ? {
              ...prodItem,
              quantity: prodItem.quantity + 1,
            }
          : prodItem,
      );

      setProducts(addProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(addProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const subtractedProduct = products.map(prodItem =>
        prodItem.id === id
          ? { ...prodItem, quantity: prodItem.quantity - 1 }
          : prodItem,
      );

      setProducts(subtractedProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(subtractedProduct),
      );
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
