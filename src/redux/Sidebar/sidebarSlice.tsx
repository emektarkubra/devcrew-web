import { createSlice } from '@reduxjs/toolkit'

const sidebarSlice = createSlice({
  name: 'collapsed',
  initialState: {
    collapsed: false,
  },
  reducers: {
    handleCollapsedMenu(state) {
      state.collapsed = !state.collapsed
    },
    setCollapsed(state, action) {
      state.collapsed = action.payload
    },
  },
})

export const { handleCollapsedMenu, setCollapsed } = sidebarSlice.actions
export default sidebarSlice.reducer