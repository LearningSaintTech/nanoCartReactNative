import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, REHYDRATE, PERSIST, FLUSH } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "../redux/reducers/authReducer";
import itemReducer from "../redux/reducers/itemSlice";
import wishlistReducer from "../redux/reducers/wishlistSlice";
import cartReducer from "./reducers/cartSlice";

// Log initial setup
console.log('Configuring Redux store...');

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["token", "role", "user"],
};

const rootReducer = {
  auth: persistReducer(authPersistConfig, authReducer),
  item: itemReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [PERSIST, REHYDRATE, FLUSH],
      },
    }),
});

// Log initial state
console.log('Initial Redux store state:', store.getState());

// Subscribe to state changes for debugging
store.subscribe(() => {
  console.log('Redux store state updated:', store.getState());
});

export const persistor = persistStore(store);

// Log when rehydration is complete
persistor.subscribe(() => {
  console.log('Persistor state after rehydration:', store.getState());
});

export { store };