import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { VscAccount, VscSearch, VscBug, VscBook, VscGraph } from 'react-icons/vsc';
import { GoGitPullRequest } from 'react-icons/go';
import { TbTestPipe, TbHierarchy } from 'react-icons/tb';

export type MenuTypes = {
    key: string;
    label: string | React.ReactNode;
    title: string;
    href?: string;
    icon?: React.ReactNode;
    children?: MenuTypes[];
    type?: 'group';
}

export const createModifiedMenu = () => {
    const navigate = useNavigate();
    const collapsed = useSelector((state: any) => state.collapsed.collapsed);

    return MENU_ELEMENTS.map((element) => {
        if (element.type === 'group') {
            return {
                key: element.key,
                label: element.label,
                type: 'group',
                children: element.children?.map((subElement) => ({
                    key: subElement.key,
                    label: subElement.label,
                    title: subElement.title,
                    icon: subElement.icon,
                    onClick: () => {
                        if (subElement?.href) navigate(subElement.href);
                    }
                })) || null,
            };
        }

        return {
            key: element.key,
            label: element.label,
            title: element.title,
            href: element.href,
            icon: element.icon,
            onClick: () => {
                if (!element.children && element.href) navigate(element.href);
            },
            children: element.children?.map((subElement) => ({
                key: subElement.key,
                label: subElement.label,
                title: subElement.title,
                icon: subElement.icon,
                onClick: () => {
                    if (subElement?.href) navigate(subElement.href);
                }
            })) || null,
        };
    });
};


export const MENU_ELEMENTS: MenuTypes[] = [
    {
        key: 'group-general',
        label: 'Genel',
        title: 'Genel',
        type: 'group',
        children: [
            {
                key: '/dashboard',
                label: 'Dashboard',
                title: 'Dashboard',
                href: '/',
                icon: <MdOutlineSpaceDashboard size={18} />,
            },
            {
                key: '/profile',
                label: 'Profile',
                title: 'Profile',
                href: '/profile',
                icon: <VscAccount size={18} />,
            },
        ]
    },
    {
        key: 'group-agents',
        label: 'AI Agents',
        title: 'AI Agents',
        type: 'group',
        children: [
            {
                key: '/agents/codebase-qa',
                label: 'Codebase Q&A',
                title: 'Codebase Q&A',
                href: '/agents/codebase-qa',
                icon: <VscSearch size={18} />,
            },
            {
                key: '/agents/pr-review',
                label: 'PR Review',
                title: 'PR Review',
                href: '/agents/pr-review',
                icon: <GoGitPullRequest size={18} />,
            },
            {
                key: '/agents/debugging',
                label: 'Debugging',
                title: 'Debugging',
                href: '/agents/debugging',
                icon: <VscBug size={18} />,
            },
            {
                key: '/agents/test-generator',
                label: 'Test Generator',
                title: 'Test Generator',
                href: '/agents/test-generator',
                icon: <TbTestPipe size={18} />,
            },
            {
                key: '/agents/documentation',
                label: 'Documentation',
                title: 'Documentation',
                href: '/agents/documentation',
                icon: <VscBook size={18} />,
            },
        ]
    },
    {
        key: 'group-analysis',
        label: 'Analiz',
        title: 'Analiz',
        type: 'group',
        children: [
            {
                key: '/analysis/architecture',
                label: 'Architecture Graph',
                title: 'Architecture Graph',
                href: '/analysis/architecture',
                icon: <TbHierarchy size={18} />,
            },
            {
                key: '/analysis/intelligence',
                label: 'Repo Intelligence',
                title: 'Repo Intelligence',
                href: '/analysis/intelligence',
                icon: <VscGraph size={18} />,
            },
        ]
    },
];