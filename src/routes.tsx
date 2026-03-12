import Analytics from "./pages/dashboard/analytics";
import Home from "./pages/dashboard/home";
import Detail from "./pages/dashboard/home/detail";
import Inside from "./pages/dashboard/home/detail/inside";
import Profile from "./pages/dashboard/profile";
import Trends from "./pages/dashboard/trends";
import Alerts from "./pages/management/alerts";
import Notifications from "./pages/management/notifications";
import Search from "./pages/management/search";
import Tasks from "./pages/management/tasks";
import Reports from "./pages/reports";
import Access from "./pages/security/access";
import Antivirus from "./pages/security/antivirus";
import GlobalSettings from "./pages/security/globalSettings";
import Settings from "./pages/security/settings";

export const MENU_ROUTES = [

    // Dashboard
    {
        path: "/",
        title: 'Main title',
        element: <Home />,
        requiredRoles: ['default-roles-kubra-realm'],
    },
    {
        path: "/detail-page",
        title: 'Detail title',
        element: <Detail />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/detail-page/inside",
        title: 'Inside title',
        element: <Inside />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/analytics",
        title: 'Analytics title',
        element: <Analytics />,
        // requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/trends",
        title: 'Trends title',
        element: <Trends />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/profile",
        title: 'Profile title',
        element: <Profile />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    // Security
    {
        path: "/settings",
        title: 'Settings title',
        element: <Settings />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/access",
        title: 'Access title',
        element: <Access />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/global-settings",
        title: 'Global settings title',
        element: <GlobalSettings />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/antivirus",
        title: 'Antivirus title',
        element: <Antivirus />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    // Management
    {
        path: "/tasks",
        title: 'Tasks title',
        element: <Tasks />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/alerts",
        title: 'Alerts title',
        element: <Alerts />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/search",
        title: 'Search title',
        element: <Search />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    {
        path: "/notifications",
        title: 'Notifications title',
        element: <Notifications />,
        requiredRoles: ['default-roles-kubra-realm']
    },
    // Reports
    {
        path: "/reports",
        title: 'Reports title',
        element: <Reports />,
        requiredRoles: ['default-roles-kubra-realm']
    },
]

// roles e gore route lara condition ekle
const getRoutesWithAuth = (userRoles: any) => {
    return MENU_ROUTES?.map(({ path, title, element, requiredRoles }) => {
        const hasAccess = requiredRoles?.some(role => userRoles?.includes(role))
        console.log(requiredRoles)
        console.log(hasAccess)
        if (hasAccess) {
            return {
                path,
                title,
                element,
                requiredRoles
            }
        } else {
            return null
        }

    })
}

export default getRoutesWithAuth;