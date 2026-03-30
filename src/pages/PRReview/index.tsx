import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Avatar, Spin, Select } from 'antd'
import { FileOutlined, GithubOutlined, LoadingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import { FiGitPullRequest } from 'react-icons/fi'
import './index.scss'

const { Text } = Typography

const SEVERITY_CLASS: Record<string, string> = {
    high: 'severity--high',
    medium: 'severity--medium',
    low: 'severity--low',
}

const diffLineClass = (type: string): string => {
    if (type === 'add') return 'diff-line--add'
    if (type === 'remove') return 'diff-line--remove'
    return 'diff-line--context'
}

const PRReview = () => {
    const { t } = useTranslation()

    const RISK_CONFIG: Record<string, { label: string }> = {
        high: { label: t('prReview.riskHigh') },
        medium: { label: t('prReview.riskMedium') },
        low: { label: t('prReview.riskLow') },
    }

    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [prs, setPrs] = useState<any[]>([])
    const [prsLoading, setPrsLoading] = useState(false)
    const [selectedPR, setSelectedPR] = useState<number | null>(null)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [selectedHistory, setSelectedHistory] = useState<string | null>(null)

    const token = localStorage.getItem('dt-token') || ''


    // get repos
    const getRepos = async () => {
        const { data, error } = await api.profile.getRepos(token)
        if (error) {
            toast.error(error)
        } else {
            setRepos(data)
        }
    }

    useEffect(() => {
        getRepos()
    }, [])

    // repo select
    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setSelectedPR(null)
        setResult(null)
        setPrs([])
        setPrsLoading(true)

        const [owner, repo] = value.split('/')

        try {
            const { data, error } = await api.agents.prList(token, owner, repo)
            if (error) {
                toast.error(error)
            } else {
                setPrs(data)
                await getHistory(owner, repo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setPrsLoading(false)
        }
    }

    // pr select
    const handlePRSelect = (prNumber: number) => {
        setSelectedPR(prNumber)
        setResult(null)
    }

    // review
    const handleReview = async () => {
        if (!selectedRepo || !selectedPR) return
        setLoading(true)
        setResult(null)

        const [owner, repo] = selectedRepo.split('/')

        try {
            const { data, error } = await api.agents.prReview(token, owner, repo, selectedPR)
            if (error) {
                toast.error(error)
            } else {
                setResult(data)
                await getHistory(owner, repo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // get history
    const getHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.prReviewHistory(token, owner, repo)
        if (error) {
            toast.error(error)
        } else {
            setHistory(data)
        }
    }

    // click history
    const handleHistoryClick = (item: any, index: any) => {
        setSelectedHistory(index)
        setSelectedPR(parseInt(item.pr.replace('#', '')))
        setResult({
            title: item.title,
            number: item.pr,
            author: '',
            timeAgo: timeAgo(item.timeAgo),
            riskScore: item.riskScore,
            changedFiles: item.changedFiles,
            criticalIssues: item.issues?.filter((i: any) => i.severity === 'high').length ?? 0,
            issues: item.issues ?? [],
            diff: item.diff ?? [],
            files: item.files ?? [],
            summary: item.summary ?? '',
        })
    }

    const HistoryList = () => (
        <Flex vertical gap={4} className="pr-review__col">
            <Text className="pr-review__section-label">{t('prReview.historyLabel')}</Text>
            <div className="pr-review__history-scroll">
                <List
                    dataSource={history}
                    split
                    locale={{ emptyText: t('prReview.noHistory') }}
                    renderItem={(item: any, index: any) => (
                        <List.Item style={{ padding: 0 }}>
                            <Flex
                                align="flex-start"
                                gap={10}
                                className={`pr-review__history-item ${selectedHistory === index ? 'pr-review__history-item--active' : ''}`}
                                onClick={() => handleHistoryClick(item, index)}
                            >
                                <div className="pr-review__history-dot" />
                                <Flex vertical gap={2}>
                                    <Flex align="center" gap={8}>
                                        <Text>{item?.pr}</Text>
                                        <Text className="pr-review__history-title">{item?.title}</Text>
                                    </Flex>
                                    <Text type="secondary" className="pr-review__history-meta">
                                        {t('prReview.issuesCount', { count: item?.issueCount })} · {timeAgo(item?.timeAgo)}
                                    </Text>
                                </Flex>
                            </Flex>
                        </List.Item>
                    )}
                />
            </div>
        </Flex>
    )

    return (
        <div className="pr-review">
            <Flex align="center" justify="space-between" className="pr-review__header">
                <Flex align="center" gap={10}>
                    <div className={`pr-review__dot pr-review__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="pr-review__title">{t('prReview.title')}</Text>
                        <Text type="secondary" className="pr-review__subtitle">
                            {selectedRepo ?? t('prReview.subtitle')}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className="pr-review__tag--warning">
                        {t('prReview.criticalIssuesTag', { count: result?.criticalIssues })}
                    </Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="pr-review__body">

                {/* Repo */}
                <Flex vertical gap={6}>
                    <Text className="pr-review__section-label">{t('prReview.repoLabel')}</Text>
                    <Select
                        className="pr-review__select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>{t('prReview.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        showSearch
                        options={repos?.map((repo) => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{repo?.full_name}</span>
                                        {repo?.is_private && <Tag className="pr-review__tag--private">Private</Tag>}
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="pr-review__lang-dot"
                                                style={{ background: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="pr-review__lang-text">{repo?.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                {/* PR */}
                <Flex vertical gap={6}>
                    <Text className="pr-review__section-label">{t('prReview.prLabel')}</Text>
                    <Select
                        className="pr-review__select"
                        placeholder={
                            !selectedRepo
                                ? t('prReview.selectRepoFirst')
                                : prsLoading
                                    ? t('prReview.loadingPRs')
                                    : prs.length === 0
                                        ? t('prReview.noPRsFound')
                                        : t('prReview.selectPR')
                        }
                        value={selectedPR}
                        onChange={handlePRSelect}
                        disabled={!selectedRepo || prsLoading || prs?.length === 0}
                        loading={prsLoading}
                        suffixIcon={prsLoading ? <Spin indicator={<LoadingOutlined spin />} size="small" /> : undefined}
                        options={prs?.map((pr) => ({
                            value: pr.number,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <Text code className="pr-review__pr-number">#{pr?.number}</Text>
                                        <span>{pr?.title}</span>
                                    </Flex>
                                    <Flex align="center" gap={8}>
                                        <Text className="pr-review__pr-author">{pr?.author}</Text>
                                        <Tag
                                            color={pr?.state === 'open' ? 'green' : 'default'}
                                            className="pr-review__pr-state-tag"
                                        >
                                            {pr?.state}
                                        </Tag>
                                    </Flex>
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Button
                    type="primary"
                    onClick={handleReview}
                    loading={loading}
                    disabled={!selectedRepo || !selectedPR || loading}
                    className="pr-review__btn"
                    icon={<FiGitPullRequest />}
                >
                    {t('prReview.reviewBtn')}
                </Button>

                {selectedRepo && !result && !loading && (
                    <Flex gap={16} className="pr-review__stretch-row">
                        <HistoryList />
                    </Flex>
                )}

                {result && !loading && (
                    <>
                        <Flex align="center" gap={8} className="pr-review__meta">
                            <Text code>{result?.number}</Text>
                            <Text strong className="pr-review__meta-title">{result?.title}</Text>
                            <Text type="secondary" className="pr-review__meta-sub">
                                {result?.author} · {result?.timeAgo}
                            </Text>
                        </Flex>

                        <Flex gap={10}>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--danger">
                                <Text type="secondary" className="pr-review__score-label">{t('prReview.riskScore')}</Text>
                                <Text className="pr-review__score-value pr-review__score-value--danger">{result?.riskScore}</Text>
                            </Card>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--neutral">
                                <Text type="secondary" className="pr-review__score-label">{t('prReview.changedFiles')}</Text>
                                <Text className="pr-review__score-value">{result?.changedFiles}</Text>
                            </Card>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--warning">
                                <Text type="secondary" className="pr-review__score-label">{t('prReview.criticalIssues')}</Text>
                                <Text className="pr-review__score-value pr-review__score-value--warning">{result?.criticalIssues}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} className="pr-review__stretch-row">
                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">{t('prReview.responseLabel')}</Text>
                                <div className="pr-review__issues-scroll">
                                    {result?.issues?.map((item: any, index: number) => (
                                        <div key={index} className={`pr-review__issue-item ${SEVERITY_CLASS[item.severity] || ''}`}>
                                            <Text strong className="pr-review__issue-title">{item?.title}</Text>
                                            <Text type="secondary" className="pr-review__issue-desc">{item?.description}</Text>
                                            {item?.suggestion && (
                                                <Text className="pr-review__issue-suggestion">💡 {item?.suggestion}</Text>
                                            )}
                                            <Text className="pr-review__issue-file">{item?.file}</Text>
                                        </div>
                                    ))}
                                </div>
                            </Flex>

                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">{t('prReview.diffLabel')}</Text>
                                <Card size="small" className="pr-review__diff-card" styles={{ body: { padding: '12px 14px' } }}>
                                    {result?.diff?.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`pr-review__diff-line ${diffLineClass(item?.type)}`}
                                        >
                                            {item?.content}
                                        </div>
                                    ))}
                                </Card>
                            </Flex>
                        </Flex>

                        <Flex gap={16} className="pr-review__stretch-row">
                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">{t('prReview.filesLabel')}</Text>
                                <div className="pr-review__files-scroll">
                                    {result?.files?.map((file: any) => (
                                        <Flex key={file?.name} align="center" gap={10} className="pr-review__file-item">
                                            <Avatar
                                                icon={<FileOutlined />}
                                                className="pr-review__file-avatar"
                                                size={32}
                                            />
                                            <Flex vertical gap={2} className="pr-review__file-info">
                                                <Text code className="pr-review__file-name">{file?.name}</Text>
                                                <Text type="secondary" className="pr-review__file-meta">
                                                    {file?.path} · {file?.changes}
                                                </Text>
                                            </Flex>
                                            <Tag className={`pr-review__risk-tag pr-review__risk-tag--${file?.risk}`}>
                                                {RISK_CONFIG[file?.risk]?.label}
                                            </Tag>
                                        </Flex>
                                    ))}
                                </div>
                                <Flex gap={8} className="pr-review__actions">
                                    <Button type="primary" className="pr-review__btn pr-review__btn--flex">
                                        {t('prReview.applyFix')}
                                    </Button>
                                    <Button className="pr-review__btn--flex">
                                        {t('prReview.fullReport')}
                                    </Button>
                                </Flex>
                            </Flex>

                            <HistoryList />
                        </Flex>
                    </>
                )}

            </Flex>
        </div>
    )
}

export default withLayout(<PRReview />)