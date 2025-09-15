import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";

// Configuración de persistencia para productos (carrito)
const productsPersistConfig = {
  key: "products",
  storage,
  whitelist: ["cart"], // Solo persistir el carrito
};

// Configuración de persistencia para usuario
const userPersistConfig = {
  key: "user",
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  products: persistReducer(productsPersistConfig, productReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  // Evita errores durante la serialización
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
