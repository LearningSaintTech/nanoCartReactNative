import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: {
    name: null,
    email: null,
    phoneNumber: null,
  },
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      console.log("🔐 setAuthToken payload:", action.payload);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    setUserDetails: (state, action) => {
      console.log("👤 setUserDetails payload:", action.payload);
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      console.log("🚪 Logout dispatched. Previous state:", {
        token: state.token,
        user: state.user,
        role: state.role,
      });
      state.token = null;
      state.user = {
        name: null,
        email: null,
        phoneNumber: null,
      };
      state.role = null;
    },
  },
});

export const { setAuthToken, logout, setUserDetails } = authSlice.actions;
export default authSlice.reducer;