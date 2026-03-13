import { Icon } from '@iconify-icon/react';
import { MenuTypes } from "../types/menuTypes";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const createModifiedMenu = () => {
    const navigate = useNavigate();
    const collapsed = useSelector((state: any) => state.collapsed.collapsed);

    return MENU_ELEMENTS.map((element) => {

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
            children: element.children?.map((subElement) => {
                return {
                    key: subElement.key,
                    label: subElement.label,
                    title: subElement.title,
                    icon: subElement.icon,
                    onClick: () => {
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
        children: [
            {
                key: '/',
                label: 'Main',
                title: 'Main',
                href: '/',
                icon: <Icon icon="mdi:home-outline" width='16px' />,
            },
            {
                key: '/analytics',
                label: 'Analytics',
                title: 'Analytics',
                href: '/analytics',
                icon: <Icon icon="mdi:view-dashboard-outline" width='16px' />,
            }
        ],
    },
    {
        key: '/management',
        label: 'Management',
        title: 'Management',
        href: '',
        icon: <Icon icon="mdi:cog-outline" width='20px' />,
        children: [
            {
                key: '/tasks',
                label: 'Tasks',
                title: 'Tasks',
                href: '/tasks',
                icon: <Icon icon="mdi:cog-outline" width='16px' />,
            },
            {
                key: '/alerts',
                label: 'Alerts',
                title: 'Alerts',
                href: '/alerts',
                icon: <Icon icon="mdi:bell-outline" width='16px' />,
            },
        ],
    },
];