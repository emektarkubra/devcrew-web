import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { VscAccount, VscSearch, VscBug, VscBook, VscGraph } from 'react-icons/vsc'
import { GoGitPullRequest } from 'react-icons/go'
import { TbTestPipe, TbHierarchy } from 'react-icons/tb'
import { RiTeamLine } from 'react-icons/ri'

export type MenuTypes = {
    key: string
    label: string | React.ReactNode
    title: string
    href?: string
    icon?: React.ReactNode
    children?: MenuTypes[]
    type?: 'group'
}

export const createModifiedMenu = () => {
    const navigate = useNavigate()
    const collapsed = useSelector((state: any) => state.collapsed.collapsed)
    const { t } = useTranslation()

    const wrapIcon = (icon: React.ReactNode, title: string) =>
        collapsed
            ? <Tooltip title={title} placement="right">{icon as React.ReactElement}</Tooltip>
            : icon

    return MENU_ELEMENTS.map((element) => {
        if (element.type === 'group') {
            return {
                key: element.key,
                label: t(element.label as string),
                type: 'group',
                children: element.children?.map((subElement) => ({
                    key: subElement.key,
                    label: t(subElement.label as string),
                    title: t(subElement.title),
                    icon: wrapIcon(subElement.icon, t(subElement.title)),
                    onClick: () => { if (subElement?.href) navigate(subElement.href) }
                })) || null,
            }
        }

        return {
            key: element.key,
            label: t(element.label as string),
            title: t(element.title),
            href: element.href,
            icon: wrapIcon(element.icon, t(element.title)),
            onClick: () => { if (!element.children && element.href) navigate(element.href) },
            children: element.children?.map((subElement) => ({
                key: subElement.key,
                label: t(subElement.label as string),
                title: t(subElement.title),
                icon: wrapIcon(subElement.icon, t(subElement.title)),
                onClick: () => { if (subElement?.href) navigate(subElement.href) }
            })) || null,
        }
    })
}

export const MENU_ELEMENTS: MenuTypes[] = [
    {
        key: 'group-general',
        label: 'layout.general',
        title: 'layout.general',
        type: 'group',
        children: [
            {
                key: '/',
                label: 'layout.overview',
                title: 'layout.overview',
                href: '/',
                icon: <VscAccount size={18} />,
            },
            {
                key: '/team-mode',
                label: 'layout.teamMode',
                title: 'layout.teamMode',
                href: '/team-mode',
                icon: <RiTeamLine size={18} />,
            },
        ]
    },
    {
        key: 'group-agents',
        label: 'layout.aiAgents',
        title: 'layout.aiAgents',
        type: 'group',
        children: [
            {
                key: '/agents/codebase-qa',
                label: 'layout.codebaseQA',
                title: 'layout.codebaseQA',
                href: '/agents/codebase-qa',
                icon: <VscSearch size={18} />,
            },
            {
                key: '/agents/pr-review',
                label: 'layout.prReview',
                title: 'layout.prReview',
                href: '/agents/pr-review',
                icon: <GoGitPullRequest size={18} />,
            },
            {
                key: '/agents/debugging',
                label: 'layout.debugging',
                title: 'layout.debugging',
                href: '/agents/debugging',
                icon: <VscBug size={18} />,
            },
            {
                key: '/agents/test-generator',
                label: 'layout.testGenerator',
                title: 'layout.testGenerator',
                href: '/agents/test-generator',
                icon: <TbTestPipe size={18} />,
            },
            {
                key: '/agents/documentation',
                label: 'layout.documentation',
                title: 'layout.documentation',
                href: '/agents/documentation',
                icon: <VscBook size={18} />,
            },
        ]
    },
    {
        key: 'group-analysis',
        label: 'layout.analysis',
        title: 'layout.analysis',
        type: 'group',
        children: [
            {
                key: '/analysis/architecture',
                label: 'layout.architectureGraph',
                title: 'layout.architectureGraph',
                href: '/analysis/architecture',
                icon: <TbHierarchy size={18} />,
            },
            {
                key: '/analysis/intelligence',
                label: 'layout.repoIntelligence',
                title: 'layout.repoIntelligence',
                href: '/analysis/intelligence',
                icon: <VscGraph size={18} />,
            },
        ]
    },
]