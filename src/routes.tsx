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
  },
  {
    path: "/agents/codebase-qa",
    title: "Codebase Q&A",
    element: <div>Codebase Q&A</div>,  // ilerleyen aşamada component gelir
},
{
    path: "/agents/pr-review",
    title: "PR Review",
    element: <div>PR Review</div>,
},
{
    path: "/agents/debugging",
    title: "Debugging",
    element: <div>Debugging</div>,
},
{
    path: "/agents/test-generator",
    title: "Test Generator",
    element: <div>Test Generator</div>,
},
{
    path: "/agents/documentation",
    title: "Documentation",
    element: <div>Documentation</div>,
},
{
    path: "/analysis/architecture",
    title: "Architecture Graph",
    element: <div>Architecture Graph</div>,
},
{
    path: "/analysis/intelligence",
    title: "Repo Intelligence",
    element: <div>Repo Intelligence</div>,
},
];

const getRoutes = () => {
  return MENU_ROUTES;
};

export default getRoutes;