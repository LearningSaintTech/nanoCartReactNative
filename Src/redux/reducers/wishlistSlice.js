import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      state.items.push(action.payload);
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.itemId !== action.payload);
    },
  },
});

export const { addToWishlist, setWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;