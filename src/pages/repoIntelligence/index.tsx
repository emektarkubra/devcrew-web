import React, { useState, useEffect } from 'react'
import { Card, Flex, Tag, Typography, List, Select, Progress, Spin } from 'antd'
import { FileOutlined, BugOutlined, GithubOutlined, LoadingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
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

interface Metrics {
    totalBugs: number
    bugsThisWeek: number
    openPrs: number
    reviewsWaiting: number
    totalCommits: number
    riskScore: number
    riskLabel: string
}

interface IntelligenceData {
    metrics: Metrics
    modules: ModuleHealth[]
    hotspots: HotspotItem[]
    activity: ActivityItem[]
    contributors: ContributorItem[]
}

const RepoIntelligence: React.FC = () => {
    const { t } = useTranslation()

    const [period, setPeriod] = useState('30d')
    const [sortBy, setSortBy] = useState('bugRate')
    const [repos, setRepos] = useState<any[]>([])
    const [reposLoading, setReposLoading] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [data, setData] = useState<IntelligenceData | null>(null)
    const [loading, setLoading] = useState(false)

    const token = localStorage.getItem('dt-token') || ''

    // get repo
    const getRepos = async () => {
        setReposLoading(true)
        try {
            const { data: repoData, error } = await api.profile.getRepos(token)
            if (error) {
                toast.error(error)
            } else {
                setRepos(repoData)
                if (repoData?.length > 0) setSelectedRepo(repoData[0].full_name)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setReposLoading(false)
        }
    }

    // get intelligence
    const getIntelligenceData = async () => {
        if (!selectedRepo) return
        const [owner, repo] = selectedRepo.split('/')

        const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
        const since = dayjs()?.subtract(days, 'day').format('YYYY-MM-DD')
        const until = dayjs()?.format('YYYY-MM-DD')

        setLoading(true)
        setData(null)
        try {
            const { data: result, error } = await api.agents.getRepoIntelligence(token, owner, repo, since, until)
            if (error) {
                toast.error(error)
            } else {
                setData(result)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getRepos()
    }, [])

    useEffect(() => {
        getIntelligenceData()
    }, [selectedRepo, period])

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

    const sortedModules = [...(data?.modules ?? [])].sort((a, b) => {
        if (sortBy === 'bugRate') return b.bugRate - a.bugRate
        if (sortBy === 'changes') return b.changeCount - a.changeCount
        return 0
    })

    return (
        <div className="repo-intelligence">

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
                        options={repos?.map(repo => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{repo?.full_name}</span>
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="repo-intelligence__lang-dot"
                                                style={{ background: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="repo-intelligence__lang-text">{repo?.language}</Text>
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
                        disabled={!selectedRepo || loading}
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

            <Flex vertical gap={16} className="repo-intelligence__body">

                {loading ? (
                    <Flex align="center" justify="center" className="repo-intelligence__loading">
                        <Flex vertical align="center" gap={12}>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />
                            <Text type="secondary" className="repo-intelligence__loading-text">
                                {t('repoIntelligence.analyzing')}
                            </Text>
                        </Flex>
                    </Flex>
                ) : !data ? (
                    <Flex align="center" justify="center" className="repo-intelligence__loading">
                        <Flex vertical align="center" gap={8}>
                            <GithubOutlined className="repo-intelligence__empty-icon" />
                            <Text type="secondary" className="repo-intelligence__empty-text">
                                {t('repoIntelligence.selectRepoFirst')}
                            </Text>
                        </Flex>
                    </Flex>
                ) : (
                    <>
                        {/* ── Metrics ── */}
                        <Flex gap={10} wrap="wrap" className="repo-intelligence__metrics-row">
                            <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                                <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.totalBugs')}</Text>
                                <Text className="repo-intelligence__metric-value repo-intelligence__metric-value--success">{data?.metrics?.totalBugs}</Text>
                                <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.bugsThisWeek', { count: data?.metrics?.bugsThisWeek })}</Text>
                            </Card>
                            <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                                <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.openPr')}</Text>
                                <Text className="repo-intelligence__metric-value">{data?.metrics?.openPrs}</Text>
                                <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.reviewsWaiting', { count: data?.metrics?.reviewsWaiting })}</Text>
                            </Card>
                            <Card size="small" className="repo-intelligence__metric-card repo-intelligence__metric-card--success">
                                <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.totalCommits')}</Text>
                                <Text className="repo-intelligence__metric-value">{data?.metrics?.totalCommits}</Text>
                                <Text type="secondary" className="repo-intelligence__metric-footnote">{t('repoIntelligence.thisPeriod')}</Text>
                            </Card>
                            <Card size="small" className={`repo-intelligence__metric-card repo-intelligence__metric-card--${data?.metrics?.riskScore > 66 ? 'danger' :
                                data?.metrics?.riskScore > 33 ? 'warning' : 'success'
                                }`}>
                                <Text type="secondary" className="repo-intelligence__metric-label">{t('repoIntelligence.riskScore')}</Text>
                                <Text className={`repo-intelligence__metric-value ${data?.metrics?.riskScore > 66 ? 'repo-intelligence__metric-value--danger' :
                                    data?.metrics?.riskScore > 33 ? 'repo-intelligence__metric-value--warning' :
                                        'repo-intelligence__metric-value--success'
                                    }`}>
                                    {data?.metrics?.riskScore}
                                </Text>
                                <Text type="secondary" className="repo-intelligence__metric-footnote">{data?.metrics?.riskLabel}</Text>
                            </Card>
                        </Flex>

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
                                            { value: 'changes', label: t('repoIntelligence.sortChanges') },
                                        ]}
                                    />
                                </Flex>

                                <div className="repo-intelligence__modules-scroll">
                                    {sortedModules?.map((mod) => (
                                        <div key={mod?.name} className="repo-intelligence__module-item">
                                            <Flex align="center" justify="space-between" className="repo-intelligence__module-head">
                                                <Flex align="center" gap={8} className="repo-intelligence__module-head-left">
                                                    <FileOutlined className="repo-intelligence__file-icon" />
                                                    <Text code className="repo-intelligence__module-name">{mod?.name}</Text>
                                                    <Text type="secondary" className="repo-intelligence__module-path">{mod?.path}</Text>
                                                </Flex>
                                                <Flex align="center" gap={12} className="repo-intelligence__module-head-right">
                                                    <Tag className={`repo-intelligence__complexity-tag ${complexityConfig[mod?.complexity].className}`}>
                                                        {complexityConfig[mod?.complexity].label}
                                                    </Tag>
                                                    <Text type="secondary" className="repo-intelligence__module-time">{mod?.lastChanged}</Text>
                                                </Flex>
                                            </Flex>

                                            <Flex gap={16} className="repo-intelligence__module-metrics">
                                                <Flex align="center" gap={6} className="repo-intelligence__metric-inline">
                                                    <BugOutlined className="repo-intelligence__bug-icon" />
                                                    <Text type="secondary" className="repo-intelligence__inline-label">{t('repoIntelligence.bugRate')}</Text>
                                                    <Progress
                                                        percent={mod?.bugRate}
                                                        size="small"
                                                        showInfo={false}
                                                        className={`repo-intelligence__progress ${mod?.bugRate > 20 ? 'repo-intelligence__progress--danger' :
                                                            mod?.bugRate > 10 ? 'repo-intelligence__progress--warning' :
                                                                'repo-intelligence__progress--success'
                                                            }`}
                                                    />
                                                    <Text className="repo-intelligence__inline-value">%{mod?.bugRate}</Text>
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
                                        {data?.hotspots?.length === 0 ? (
                                            <Text type="secondary" className="repo-intelligence__empty-text">
                                                {t('repoIntelligence.noHotspots')}
                                            </Text>
                                        ) : data?.hotspots?.map((item) => (
                                            <div key={item?.file}>
                                                <Flex align="center" justify="space-between" className="repo-intelligence__hotspot-head">
                                                    <Text code className="repo-intelligence__hotspot-file">{item?.file}</Text>
                                                    <Flex align="center" gap={4}>
                                                        <BugOutlined className="repo-intelligence__bug-icon" />
                                                        <Text className="repo-intelligence__hotspot-count">{item?.bugCount}</Text>
                                                    </Flex>
                                                </Flex>
                                                <Progress
                                                    percent={item?.percentage}
                                                    size="small"
                                                    showInfo={false}
                                                    className="repo-intelligence__progress repo-intelligence__progress--danger"
                                                />
                                            </div>
                                        ))}
                                    </Flex>
                                </Card>
                            </Flex>
                        </Flex>

                        <Flex gap={16} className="repo-intelligence__bottom-row">

                            {/* Recent Activity */}
                            <Flex vertical gap={8} className="repo-intelligence__activity-col">
                                <Text className="repo-intelligence__section-title">{t('repoIntelligence.recentActivities')}</Text>
                                <div className="repo-intelligence__activity-scroll">
                                    <List
                                        dataSource={data.activity}
                                        split
                                        locale={{ emptyText: t('repoIntelligence.noActivity') }}
                                        renderItem={(item) => (
                                            <List.Item className="repo-intelligence__activity-list-item">
                                                <Flex align="flex-start" gap={10} className="repo-intelligence__activity-item">
                                                    <div className={`repo-intelligence__activity-dot ${activityConfig[item?.type]?.dotClass}`} />
                                                    <Flex align="center" justify="space-between" className="repo-intelligence__activity-content">
                                                        <Flex gap={2} className="repo-intelligence__activity-content-left">
                                                            <Flex align="center" gap={6} wrap="wrap">
                                                                <Tag className={`repo-intelligence__activity-tag ${activityConfig[item?.type]?.className}`}>
                                                                    {activityConfig[item?.type]?.label}
                                                                </Tag>
                                                                <Text className="repo-intelligence__activity-message">{item?.message}</Text>
                                                            </Flex>
                                                            {item?.file && (
                                                                <Text code className="repo-intelligence__activity-file">{item?.file}</Text>
                                                            )}
                                                        </Flex>
                                                        <Text type="secondary" className="repo-intelligence__activity-time">{item?.timeAgo}</Text>
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
                                    {data?.contributors?.map((c) => (
                                        <Flex vertical key={c?.name} className="repo-intelligence__contributor-item">
                                            <Flex align="center" justify="space-between" className="repo-intelligence__contributor-head">
                                                <Flex align="center" gap={8}>
                                                    <div className="repo-intelligence__avatar">
                                                        {c?.name?.slice(0, 2)?.toUpperCase()}
                                                    </div>
                                                    <Text className="repo-intelligence__contributor-name">{c?.name}</Text>
                                                </Flex>
                                                <Text type="secondary" className="repo-intelligence__contributor-meta">
                                                    {t('repoIntelligence.commitsAndPrs', { commits: c?.commits, prs: c?.prs })}
                                                </Text>
                                            </Flex>
                                            <Progress
                                                percent={c?.percentage}
                                                size="small"
                                                className="repo-intelligence__progress repo-intelligence__progress--brand"
                                                format={(p) => `%${p}`}
                                            />
                                        </Flex>
                                    ))}
                                </div>
                            </Flex>
                        </Flex>
                    </>
                )}
            </Flex>
        </div>
    )
}

export default withLayout(<RepoIntelligence />)