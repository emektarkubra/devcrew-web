import ArchitectureGraph from "./pages/architectureGraph";
import CodebaseQA from "./pages/codebase";
import Dashboard from "./pages/dashboard";
import Debugging from "./pages/debugging";
import Documentation from "./pages/documentation";
import Profile from "./pages/profile";
import PrReview from "./pages/PRReview";
import RepoIntelligence from "./pages/repoIntelligence";
import TestGenerator from "./pages/testGenerator";


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
    element: <CodebaseQA/>,  // ilerleyen aşamada component gelir
},
{
    path: "/agents/pr-review",
    title: "PR Review",
    element: <PrReview/>,
},
{
    path: "/agents/debugging",
    title: "Debugging",
    element: <Debugging/>,
},
{
    path: "/agents/test-generator",
    title: "Test Generator",
    element: <TestGenerator/>,
},
{
    path: "/agents/documentation",
    title: "Documentation",
    element: <Documentation/>,
},
{
    path: "/analysis/architecture",
    title: "Architecture Graph",
    element: <ArchitectureGraph/>,
},
{
    path: "/analysis/intelligence",
    title: "Repo Intelligence",
    element: <RepoIntelligence/>,
},
];

const getRoutes = () => {
  return MENU_ROUTES;
};

export default getRoutes;