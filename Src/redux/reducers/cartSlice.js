import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      console.log('setCartItems action dispatched with payload:', action.payload);
      state.items = action.payload;
      console.log('Updated cart state:', state.items);
    },
    clearCart: (state) => {
      console.log('clearCart action dispatched');
      state.items = [];
      console.log('Cart cleared, new state:', state.items);
    },
  },
});

export const { setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;