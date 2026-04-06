import React, { useMemo, useState, useEffect } from 'react'
import { Card, Flex, Tag, Typography, List, Select, Progress } from 'antd'
import { FileOutlined, BugOutlined, GithubOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import { getLanguageColor } from '../../utils/languageColors'
import toast from 'react-hot-toast'
import './index.scss'

const { Text } = Typography

interface ModuleHealth {
    name: string
    path: string
    bugRate: number
    coverage: number
    complexity: 'low' | 'medium' | 'high'
    lastChanged: string
    changeCount: number
}

interface ActivityItem {
    type: 'bug' | 'pr' | 'commit' | 'review'
    message: string
    file: string
    timeAgo: string
}

interface ContributorItem {
    name: string
    commits: number
    prs: number
    percentage: number
}

interface HotspotItem {
    file: string
    bugCount: number
    percentage: number
}

const RepoIntelligence: React.FC = () => {
    const { t } = useTranslation()
    const [period, setPeriod] = useState('30d')
    const [sortBy, setSortBy] = useState('bugRate')
    const [repos, setRepos] = useState<any[]>([])
    const [reposLoading, setReposLoading] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

    const token = localStorage.getItem('dt-token') || ''

    useEffect(() => {
        const fetchRepos = async () => {
            setReposLoading(true)
            const { data, error } = await api.profile.getRepos(token)
            if (error) { toast.error(error); setReposLoading(false); return }
            setRepos(data)
            if (data?.length > 0) setSelectedRepo(data[0].full_name)
            setReposLoading(false)
        }
        fetchRepos()
    }, [])

    const complexityConfig = {
        low: { label: t('repoIntelligence.complexityLow'), className: 'repo-intelligence__complexity-tag--low' },
        medium: { label: t('repoIntelligence.complexityMedium'), className: 'repo-intelligence__complexity-tag--medium' },
        high: { label: t('repoIntelligence.complexityHigh'), className: 'repo-intelligence__complexity-tag--high' },
    }

    const activityConfig = {
        bug: { label: t('repoIntelligence.activityBug'), className: 'repo-intelligence__activity-tag--bug', dotClass: 'repo-intelligence__activity-dot--bug' },
        pr: { label: t('repoIntelligence.activityPr'), className: 'repo-intelligence__activity-tag--pr', dotClass: 'repo-intelligence__activity-dot--pr' },
        commit: { label: t('repoIntelligence.activityCommit'), className: 'repo-intelligence__activity-tag--commit', dotClass: 'repo-intelligence__activity-dot--commit' },
        review: { label: t('repoIntelligence.activityReview'), className: 'repo-intelligence__activity-tag--review', dotClass: 'repo-intelligence__activity-dot--review' },
    }

    const modules: ModuleHealth[] = [
        { name: 'payment_service.py', path: 'app/services/', bugRate: 30, coverage: 42, complexity: 'high', lastChanged: t('repoIntelligence.time2HoursAgo'), changeCount: 47 },
        { name: 'auth_service.py', path: 'app/services/', bugRate: 8, coverage: 88, complexity: 'medium', lastChanged: t('repoIntelligence.time1DayAgo'), changeCount: 23 },
        { name: 'user_controller.py', path: 'app/routes/', bugRate: 12, coverage: 74, complexity: 'medium', lastChanged: t('repoIntelligence.time3DaysAgo'), changeCount: 31 },
        { name: 'jwt_middleware.py', path: 'app/core/', bugRate: 4, coverage: 91, complexity: 'low', lastChanged: t('repoIntelligence.time1WeekAgo'), changeCount: 9 },
        { name: 'config.py', path: 'app/', bugRate: 2, coverage: 95, complexity: 'low', lastChanged: t('repoIntelligence.time2WeeksAgo'), changeCount: 5 },
    ]

    const activity: ActivityItem[] = useMemo(() => [
        { type: 'bug', message: t('repoIntelligence.activity1'), file: 'payment_service.py', timeAgo: t('repoIntelligence.time2HoursAgo') },
        { type: 'pr', message: t('repoIntelligence.activity2'), file: 'auth_service.py', timeAgo: t('repoIntelligence.time4HoursAgo') },
        { type: 'commit', message: t('repoIntelligence.activity3'), file: 'jwt_middleware.py', timeAgo: t('repoIntelligence.time6HoursAgo') },
        { type: 'review', message: t('repoIntelligence.activity4'), file: 'user_controller.py', timeAgo: t('repoIntelligence.time8HoursAgo') },
        { type: 'bug', message: t('repoIntelligence.activity5'), file: 'user_controller.py', timeAgo: t('repoIntelligence.time1DayAgo') },
        { type: 'commit', message: t('repoIntelligence.activity6'), file: 'config.py', timeAgo: t('repoIntelligence.time2DaysAgo') },
    ], [t])

    const contributors: ContributorItem[] = [
        { name: 'sumeyra', commits: 89, prs: 14, percentage: 52 },
        { name: 'ahmet', commits: 43, prs: 8, percentage: 25 },
        { name: 'elif', commits: 28, prs: 5, percentage: 16 },
        { name: 'mehmet', commits: 12, prs: 2, percentage: 7 },
    ]

    const hotspots: HotspotItem[] = [
        { file: 'payment_service.py', bugCount: 12, percentage: 30 },
        { file: 'user_controller.py', bugCount: 7, percentage: 18 },
        { file: 'auth_service.py', bugCount: 4, percentage: 10 },
        { file: 'jwt_middleware.py', bugCount: 2, percentage: 5 },
    ]

    const sortedModules = [...modules].sort((a, b) => {
        if (sortBy === 'bugRate') return b.bugRate - a.bugRate
        if (sortBy === 'coverage') return a.coverage - b.coverage
        if (sortBy === 'changes') return b.changeCount - a.changeCount
        return 0
    })

    const getBugRateClass = (value: number) => {
        if (value > 20) return 'repo-intelligence__progress--danger'
        if (value > 10) return 'repo-intelligence__progress--warning'
        return 'repo-intelligence__progress--success'
    }

    const getCoverageClass = (value: number) => {
        if (value > 80) return 'repo-intelligence__progress--success'
        if (value > 60) return 'repo-intelligence__progress--warning'
        return 'repo-intelligence__progress--danger'
    }

    return (
        <div className="repo-intelligence">

            {/* ── Header ── */}
            <Flex align="center" justify="space-between" className="repo-intelligence__header">
                <Flex align="center" gap={10} className="repo-intelligence__header-left">
                    <div className={`repo-intelligence__dot ${selectedRepo ? 'repo-intelligence__dot--active' : ''}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="repo-intelligence__title">
                            {t('repoIntelligence.title')}
                        </Text>
                        <Text type="secondary" className="repo-intelligence__subtitle">
                            {selectedRepo
                                ? t('repoIntelligence.subtitle', { repo: selectedRepo })
                                : t('repoIntelligence.selectRepoFirst')
                            }
                        </Text>
                    </Flex>
                </Flex>

                <Flex align="center" gap={8} className="repo-intelligence__header-actions">
                    <Select
                        className="repo-intelligence__repo-select"
                        placeholder={
                            <Flex align="center" gap={6}>
                                <GithubOutlined />
                                <span>{t('repoIntelligence.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={setSelectedRepo}
                        showSearch
                        loading={reposLoading}
                        options={repos.map(r => ({
                            value: r.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{r.full_name}</span>
                                    </Flex>
                                    {r.language && (
                                        <Flex align="center" gap={4}>
                                            <div className="repo-intelligence__lang-dot" style={{ background: getLanguageColor(r.language) }} />
                                            <Text className="repo-intelligence__lang-text">{r.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                    <Select
                        value={period}
                        onChange={setPeriod}
                        size="small"
                        disabled={!selectedRepo}
                        className="repo-intelligence__period-select"
                        options={[
                            { value: '7d', label: t('repoIntelligence.period7d') },
                            { value: '30d', label: t('repoIntelligence.period30d') },
                            { value: '90d', label: t('repoIntelligence.period90d') },
                        ]}
                    />
                    <Tag className="repo-intelligence__live-tag">
                        {t('repoIntelligence.live')}
                    </Tag>
                </Flex>
            </Flex>

            {/* ── Body ── */}
            <Flex vertical gap={16} className="repo-intelligence__body">

                {/* ── Metrics ── */}
                <Flex gap={10} wrap="wrap" className="repo-intelligence__metrics-row">
                    <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                        <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.totalBugs')}</Text>
                        <Text className="repo-intelligence__metric-value repo-intelligence__metric-value--success">38</Text>
                        <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.bugsThisWeek', { count: 4 })}</Text>
                    </Card>
                    <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                        <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.averageCoverage')}</Text>
                        <Text className="repo-intelligence__metric-value repo-intelligence__metric-value--success">%78</Text>
                        <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.coverageThisMonth', { count: 3 })}</Text>
                    </Card>
                    <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                        <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.openPr')}</Text>
                        <Text className="repo-intelligence__metric-value">7</Text>
                        <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.reviewsWaiting', { count: 2 })}</Text>
                    </Card>
                    <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                        <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.totalCommits')}</Text>
                        <Text className="repo-intelligence__metric-value">172</Text>
                        <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.thisMonth')}</Text>
                    </Card>
                    <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                        <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.riskScore')}</Text>
                        <Text className="repo-intelligence__metric-value repo-intelligence__metric-value--success">64</Text>
                        <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.riskMedium')}</Text>
                    </Card>
                </Flex>

                {/* ── Top Row ── */}
                <Flex gap={16} className="repo-intelligence__top-row">

                    {/* Module Health */}
                    <Flex vertical gap={8} className="repo-intelligence__modules-col">
                        <Flex align="center" justify="space-between" className="repo-intelligence__section-head">
                            <Text className="repo-intelligence__section-title">{t('repoIntelligence.moduleHealth')}</Text>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                size="small"
                                className="repo-intelligence__sort-select"
                                options={[
                                    { value: 'bugRate', label: t('repoIntelligence.sortBugRate') },
                                    { value: 'coverage', label: t('repoIntelligence.sortCoverage') },
                                    { value: 'changes', label: t('repoIntelligence.sortChanges') },
                                ]}
                            />
                        </Flex>

                        <div className="repo-intelligence__modules-scroll">
                            {sortedModules.map((mod) => (
                                <div key={mod.name} className="repo-intelligence__module-item">
                                    <Flex align="center" justify="space-between" className="repo-intelligence__module-head">
                                        <Flex align="center" gap={8} className="repo-intelligence__module-head-left">
                                            <FileOutlined className="repo-intelligence__file-icon" />
                                            <Text code className="repo-intelligence__module-name">{mod.name}</Text>
                                            <Text type="secondary" className="repo-intelligence__module-path">{mod.path}</Text>
                                        </Flex>
                                        <Flex align="center" gap={12} className="repo-intelligence__module-head-right">
                                            <Tag className={`repo-intelligence__complexity-tag ${complexityConfig[mod.complexity].className}`}>
                                                {complexityConfig[mod.complexity].label}
                                            </Tag>
                                            <Text type="secondary" className="repo-intelligence__module-time">{mod.lastChanged}</Text>
                                        </Flex>
                                    </Flex>

                                    <Flex gap={16} className="repo-intelligence__module-metrics">
                                        <Flex align="center" gap={6} className="repo-intelligence__metric-inline">
                                            <BugOutlined className="repo-intelligence__bug-icon" />
                                            <Text type="secondary" className="repo-intelligence__inline-label">{t('repoIntelligence.bugRate')}</Text>
                                            <Progress percent={mod.bugRate} size="small" showInfo={false} className={`repo-intelligence__progress ${getBugRateClass(mod.bugRate)}`} />
                                            <Text className="repo-intelligence__inline-value">%{mod.bugRate}</Text>
                                        </Flex>
                                        <Flex align="center" gap={6} className="repo-intelligence__metric-inline">
                                            <Text type="secondary" className="repo-intelligence__inline-label">{t('repoIntelligence.coverage')}</Text>
                                            <Progress percent={mod.coverage} size="small" showInfo={false} className={`repo-intelligence__progress ${getCoverageClass(mod.coverage)}`} />
                                            <Text className="repo-intelligence__inline-value">%{mod.coverage}</Text>
                                        </Flex>
                                    </Flex>
                                </div>
                            ))}
                        </div>
                    </Flex>

                    {/* Bug Hotspots */}
                    <Flex vertical gap={8} className="repo-intelligence__hotspots-col">
                        <Text className="repo-intelligence__section-title">{t('repoIntelligence.bugHotspots')}</Text>
                        <Card size="small" className="repo-intelligence__hotspots-card">
                            <Text type="secondary" className="repo-intelligence__hotspots-summary">{t('repoIntelligence.hotspotSummary')}</Text>
                            <Flex vertical gap={10}>
                                {hotspots.map((h) => (
                                    <div key={h.file}>
                                        <Flex align="center" justify="space-between" className="repo-intelligence__hotspot-head">
                                            <Text code className="repo-intelligence__hotspot-file">{h.file}</Text>
                                            <Flex align="center" gap={4}>
                                                <BugOutlined className="repo-intelligence__bug-icon" />
                                                <Text className="repo-intelligence__hotspot-count">{h.bugCount}</Text>
                                            </Flex>
                                        </Flex>
                                        <Progress percent={h.percentage} size="small" showInfo={false} className="repo-intelligence__progress repo-intelligence__progress--danger" />
                                    </div>
                                ))}
                            </Flex>
                        </Card>
                    </Flex>
                </Flex>

                {/* ── Bottom Row ── */}
                <Flex gap={16} className="repo-intelligence__bottom-row">

                    {/* Recent Activity */}
                    <Flex vertical gap={8} className="repo-intelligence__activity-col">
                        <Text className="repo-intelligence__section-title">{t('repoIntelligence.recentActivities')}</Text>
                        <div className="repo-intelligence__activity-scroll">
                            <List
                                dataSource={activity}
                                split
                                renderItem={(item) => (
                                    <List.Item className="repo-intelligence__activity-list-item">
                                        <Flex align="flex-start" gap={10} className="repo-intelligence__activity-item">
                                            <div className={`repo-intelligence__activity-dot ${activityConfig[item.type].dotClass}`} />
                                            <Flex align="center" justify="space-between" className="repo-intelligence__activity-content">
                                                <Flex gap={2} className="repo-intelligence__activity-content-left">
                                                    <Flex align="center" gap={6} wrap="wrap">
                                                        <Tag className={`repo-intelligence__activity-tag ${activityConfig[item.type].className}`}>
                                                            {activityConfig[item.type].label}
                                                        </Tag>
                                                        <Text className="repo-intelligence__activity-message">{item.message}</Text>
                                                    </Flex>
                                                    <Text code className="repo-intelligence__activity-file">{item.file}</Text>
                                                </Flex>
                                                <Text type="secondary" className="repo-intelligence__activity-time">{item.timeAgo}</Text>
                                            </Flex>
                                        </Flex>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Flex>

                    {/* Contributors */}
                    <Flex vertical gap={8} className="repo-intelligence__contributors-col">
                        <Text className="repo-intelligence__section-title">{t('repoIntelligence.contributors')}</Text>
                        <div className="repo-intelligence__contributors-scroll">
                            {contributors.map((c) => (
                                <Flex vertical key={c.name} className="repo-intelligence__contributor-item">
                                    <Flex align="center" justify="space-between" className="repo-intelligence__contributor-head">
                                        <Flex align="center" gap={8}>
                                            <div className="repo-intelligence__avatar">
                                                {c.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <Text className="repo-intelligence__contributor-name">{c.name}</Text>
                                        </Flex>
                                        <Text type="secondary" className="repo-intelligence__contributor-meta">
                                            {t('repoIntelligence.commitsAndPrs', { commits: c.commits, prs: c.prs })}
                                        </Text>
                                    </Flex>
                                    <Progress
                                        percent={c.percentage}
                                        size="small"
                                        className="repo-intelligence__progress repo-intelligence__progress--brand"
                                        format={(p) => `%${p}`}
                                    />
                                </Flex>
                            ))}
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        </div>
    )
}

export default withLayout(<RepoIntelligence />)