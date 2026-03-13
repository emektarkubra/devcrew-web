import Analytics from "./pages/dashboard/analytics";
import Home from "./pages/dashboard/home";
import Detail from "./pages/dashboard/home/detail";
import Inside from "./pages/dashboard/home/detail/inside";
import Alerts from "./pages/management/alerts";
import Tasks from "./pages/management/tasks";


export const MENU_ROUTES = [
  // Dashboard
  {
    path: "/",
    title: "Main title",
    element: <Home />,
  },
  {
    path: "/detail-page",
    title: "Detail title",
    element: <Detail />,
  },
  {
    path: "/detail-page/inside",
    title: "Inside title",
    element: <Inside />,
  },
  {
    path: "/analytics",
    title: "Analytics title",
    element: <Analytics />,
  },


  // Management
  {
    path: "/tasks",
    title: "Tasks title",
    element: <Tasks />,
  },
  {
    path: "/alerts",
    title: "Alerts title",
    element: <Alerts />,
  },
];


const getRoutes = () => {
  return MENU_ROUTES;
};

export default getRoutes;