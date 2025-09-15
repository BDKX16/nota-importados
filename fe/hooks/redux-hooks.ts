import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  decreaseQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
} from "@/redux/slices/productSlice";
import type { Product } from "@/redux/slices/productSlice";

// Hooks tipados para Redux
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hook personalizado para el carrito
export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.products.cart);
  const isCartOpen = useAppSelector((state) => state.products.isCartOpen);
  const cartTotal = useAppSelector((state) => state.products.cartTotal);
  const cartCount = useAppSelector((state) => state.products.cartCount);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleDecreaseQuantity = (productId: string) => {
    dispatch(decreaseQuantity(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleToggleCart = () => {
    dispatch(toggleCart());
  };

  const handleSetCartOpen = (isOpen: boolean) => {
    dispatch(setCartOpen(isOpen));
  };

  // Helper function to check if a product is in cart
  const isInCart = (productId: string) => {
    return cart.some((item) => item.id === productId);
  };

  // Helper function to get quantity of a product in cart
  const getQuantityInCart = (productId: string) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    isCartOpen,
    cartTotal,
    cartCount,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    decreaseQuantity: handleDecreaseQuantity,
    clearCart: handleClearCart,
    toggleCart: handleToggleCart,
    setCartOpen: handleSetCartOpen,
    isInCart,
    getQuantityInCart,
  };
};
