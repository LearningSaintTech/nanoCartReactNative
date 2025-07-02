import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedItem: null,
};

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
});

export const { setSelectedItem, clearSelectedItem } = itemSlice.actions;
export default itemSlice.reducer;