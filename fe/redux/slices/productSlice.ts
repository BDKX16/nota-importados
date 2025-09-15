import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  brand?: string;
  volume?: string;
  concentration?: string;
  stock: number;
  category: string;
  categoryId: string;
  type: string;
  categories?: string[];
  categoryNames?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

interface ProductState {
  cart: CartItem[];
  isCartOpen: boolean;
  cartTotal: number;
  cartCount: number;
}

const initialState: ProductState = {
  cart: [],
  isCartOpen: false,
  cartTotal: 0,
  cartCount: 0,
};

// Helper function to calculate cart totals
const calculateCartTotals = (cart: CartItem[]) => {
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  return { cartTotal, cartCount };
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        // Check stock before adding
        if (existingItem.quantity < action.payload.stock) {
          existingItem.quantity += 1;
        }
      } else {
        // Add new item if stock is available
        if (action.payload.stock > 0) {
          state.cart.push({ ...action.payload, quantity: 1 });
        }
      }

      // Recalculate totals
      const totals = calculateCartTotals(state.cart);
      state.cartTotal = totals.cartTotal;
      state.cartCount = totals.cartCount;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);

      // Recalculate totals
      const totals = calculateCartTotals(state.cart);
      state.cartTotal = totals.cartTotal;
      state.cartCount = totals.cartCount;
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.find((item) => item.id === productId);

      if (item) {
        // Ensure quantity doesn't exceed stock
        const newQuantity = Math.min(Math.max(1, quantity), item.stock);
        item.quantity = newQuantity;

        // Recalculate totals
        const totals = calculateCartTotals(state.cart);
        state.cartTotal = totals.cartTotal;
        state.cartCount = totals.cartCount;
      }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cart.find((item) => item.id === action.payload);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity reaches 0
          state.cart = state.cart.filter((item) => item.id !== action.payload);
        }

        // Recalculate totals
        const totals = calculateCartTotals(state.cart);
        state.cartTotal = totals.cartTotal;
        state.cartCount = totals.cartCount;
      }
    },

    clearCart: (state) => {
      state.cart = [];
      state.cartTotal = 0;
      state.cartCount = 0;
    },

    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },

    // Action to sync cart state (useful for hydration)
    syncCartTotals: (state) => {
      const totals = calculateCartTotals(state.cart);
      state.cartTotal = totals.cartTotal;
      state.cartCount = totals.cartCount;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  decreaseQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  syncCartTotals,
} = productSlice.actions;

export default productSlice.reducer;
