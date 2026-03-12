import { Icon } from '@iconify-icon/react';
import { MenuTypes } from "../types/menuTypes";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const createModifiedMenu = ({ userRoles }: any) => {
    const navigate = useNavigate();
    const collapsed = useSelector((state: any) => state.collapsed.collapsed);

    // filtered items
    const filteredMenuItems = MENU_ELEMENTS?.filter(item => {
        return item.roles?.some(role => userRoles?.includes(role));
    });


    return filteredMenuItems.map((element) => {
        // filtered item children
        const filteredChildren = element.children?.filter(child =>
            child.roles?.some(role => userRoles?.includes(role))
        );

        return {
            key: element.key,
            label: element.label,
            title: element.title,
            href: element.href,
            icon: collapsed ? element.icon : '',
            onClick: () => {
                if (!element.children && element.href) {
                    navigate(element.href);
                }
            },
            children: filteredChildren?.map((subElement) => {
                return {
                    key: subElement.key,
                    label: subElement.label,
                    title: subElement.title,
                    icon: subElement.icon,
                    onClick: (_item: { key: string, domEvent: Event }) => {
                        console.log(subElement.href)
                        if (subElement?.href) {
                            navigate(subElement.href);
                        }
                    }
                };
            }) || null,
        };
    });
};

export const MENU_ELEMENTS: MenuTypes[] = [
    {
        key: '/dashboard',
        label: 'Dashboard',
        title: 'Dashboard',
        href: '',
        icon: <Icon icon="mdi:home-outline" width='20px' />,
        roles: ['default-roles-myrealm'],
        children: [
            {
                key: '/',
                label: 'Main',
                title: 'Main',
                href: '/',
                icon: <Icon icon="mdi:home-outline" width='16px' />,
                roles: ['default-roles-myrealm']

            },
            {
                key: '/analytics',
                label: 'Analytics',
                title: 'Analytics',
                href: '/analytics',
                icon: <Icon icon="mdi:view-dashboard-outline" width='16px' />,
                // roles: ['default-roles-myrealm']
            },
            {
                key: '/trends',
                label: 'Trends',
                title: 'Trends',
                href: '/trends',
                icon: <Icon icon="mdi:chart-line" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/profile',
                label: 'Profile',
                title: 'Profile',
                href: '/profile',
                icon: <Icon icon="mdi:account-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
        ],
    },
    {
        key: '/security',
        label: 'Security',
        title: 'Security',
        href: '',
        icon: <Icon icon="mdi:shield-outline" width='20px' />,
        roles: ['default-roles-myrealm'],
        children: [
            {
                key: '/settings',
                label: 'Settings',
                title: 'Settings',
                href: '/settings',
                icon: <Icon icon="mdi:shield-outline" width='16px' />,
                roles: ['default-roles-myrealm'],
            },
            {
                key: '/access',
                label: 'Access',
                title: 'Access',
                href: '/access',
                icon: <Icon icon="mdi:lock-open-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/global-settings',
                label: 'Global Settings',
                title: 'Global Settings',
                href: '/global-settings',
                icon: <Icon icon="mdi:globe" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/antivirus',
                label: 'Antivirus',
                title: 'Antivirus',
                href: '/antivirus',
                icon: <Icon icon="mdi:antivirus-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
        ],
    },
    {
        key: '/management',
        label: 'Management',
        title: 'Management',
        href: '',
        icon: <Icon icon="mdi:cog-outline" width='20px' />,
        roles: ['default-roles-myrealm'],
        children: [
            {
                key: '/tasks',
                label: 'Tasks',
                title: 'Tasks',
                href: '/tasks',
                icon: <Icon icon="mdi:cog-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/alerts',
                label: 'Alerts',
                title: 'Alerts',
                href: '/alerts',
                icon: <Icon icon="mdi:bell-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/search',
                label: 'Search',
                title: 'Search',
                href: '/search',
                icon: <Icon icon="mdi:magnify" width='16px' />,
                roles: ['default-roles-myrealm']
            },
            {
                key: '/notifications',
                label: 'Notifications',
                title: 'Notifications',
                href: '/notifications',
                icon: <Icon icon="mdi:alert-circle-outline" width='16px' />,
                roles: ['default-roles-myrealm']
            },
        ],
    },
    {
        key: '/reports',
        label: 'Reports',
        title: 'Reports',
        href: '/reports',
        icon: <Icon icon="mdi:alert-circle-outline" width='20px' />,
        roles: ['default-roles-myrealm']
    },
];