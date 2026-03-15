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
        href: '/',
        icon: <Icon icon="mdi:home-outline" width='20px' />,
    },
    {
        key: '/profile',
        label: 'Profile',
        title: 'Profile',
        href: '/profile',
        icon: <Icon icon="mdi:home-outline" width='20px' />,
    }
];