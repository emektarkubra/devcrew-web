import { createSlice } from '@reduxjs/toolkit';

const sidebarSlice = createSlice({
  name: 'collapsed',
  initialState: {
    collapsed: false,
  },
  reducers: {
    handleCollapsedMenu(state) {
      state.collapsed = !state.collapsed;
    },
  },
});

export const { handleCollapsedMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;
