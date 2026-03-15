import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";


export const MENU_ROUTES = [
  // Dashboard
  {
    path: "/",
    title: "Main title",
    element: <Dashboard />,
  },

  // Profile
  {
    path: "/profile",
    title: "Main title",
    element: <Profile />,
  }
];

const getRoutes = () => {
  return MENU_ROUTES;
};

export default getRoutes;