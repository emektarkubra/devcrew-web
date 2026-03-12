import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './Sidebar/sidebarSlice';

export const store = configureStore({
  reducer: {
    collapsed: sidebarReducer,
  }
});
