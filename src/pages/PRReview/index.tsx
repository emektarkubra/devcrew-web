import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Avatar, Spin, Select } from 'antd'
import { FileOutlined, GithubOutlined, LoadingOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import { FiGitPullRequest } from 'react-icons/fi'
import './index.scss'

const { Text } = Typography

const RISK_CONFIG: Record<string, { label: string }> = {
    high: { label: 'High risk' },
    medium: { label: 'Medium risk' },
    low: { label: 'Low risk' },
}

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

    useEffect(() => {
        const fetchRepos = async () => {
            const { data, error } = await api.login.getRepos(token)
            if (error) {
                toast.error(error);
            } else {
                setRepos(data)
            }
        }
        fetchRepos()
    }, [])

    // repo select
    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setSelectedPR(null)
        setResult(null)
        setPrs([])
        setPrsLoading(true)

        const [owner, repo] = value.split('/')

        const { data, error } = await api.agents.prList(token, owner, repo)
        try {
            if (error) {
                toast.error(error);
                setPrsLoading(false);
            } else {
                setPrs(data)
                await fetchHistory(owner, repo)
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

        const { data, error } = await api.agents.prReview(token, owner, repo, selectedPR)
        try {
            if (error) {
                toast.error(error);
                setLoading(false);
            } else {
                setResult(data)
                await fetchHistory(owner, repo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // fetch history
    const fetchHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.prReviewHistory(token, owner, repo)
        if (error) {
            toast.error(error)
        } else {
            setHistory(data)
        }
    }


    // history click
    const handleHistoryClick = async (item: any, index: any) => {
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
            <Text className="pr-review__section-label">HISTORY</Text>
            <div className="pr-review__history-scroll">
                <List
                    dataSource={history}
                    split
                    locale={{ emptyText: 'No review history yet' }}
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
                                        <Text>{item.pr}</Text>
                                        <Text className="pr-review__history-title">{item.title}</Text>
                                    </Flex>
                                    <Text type="secondary" className="pr-review__history-meta">
                                        {item.issueCount} issues · {timeAgo(item.timeAgo)}
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
                        <Text strong className="pr-review__title">PR Review Agent</Text>
                        <Text type="secondary" className="pr-review__subtitle">
                            {selectedRepo ?? 'Select a repo to review PRs'}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className="pr-review__tag--warning">{result.criticalIssues} critical issues</Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="pr-review__body">
                <Flex vertical gap={6}>
                    <Text className="pr-review__section-label">REPO</Text>
                    <Select
                        className="pr-review__select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>Select repo...</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        showSearch
                        options={repos.map((r) => ({
                            value: r.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{r.full_name}</span>
                                        {r.is_private && <Tag className="pr-review__tag--private">Private</Tag>}
                                    </Flex>
                                    {r.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="pr-review__lang-dot"
                                                style={{ background: getLanguageColor(r.language) }}
                                            />
                                            <Text className="pr-review__lang-text">{r.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Text className="pr-review__section-label">PULL REQUEST</Text>
                    <Select
                        className="pr-review__select"
                        placeholder={
                            !selectedRepo
                                ? 'Select a repo first...'
                                : prsLoading
                                    ? 'Loading PRs...'
                                    : prs.length === 0
                                        ? 'No PRs found'
                                        : 'Select a PR...'
                        }
                        value={selectedPR}
                        onChange={handlePRSelect}
                        disabled={!selectedRepo || prsLoading || prs.length === 0}
                        loading={prsLoading}
                        suffixIcon={
                            prsLoading
                                ? <Spin indicator={<LoadingOutlined spin />} size="small" />
                                : undefined
                        }
                        options={prs.map((pr) => ({
                            value: pr.number,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <Text code className="pr-review__pr-number">#{pr.number}</Text>
                                        <span>{pr.title}</span>
                                    </Flex>
                                    <Flex align="center" gap={8}>
                                        <Text className="pr-review__pr-author">{pr.author}</Text>
                                        <Tag
                                            color={pr.state === 'open' ? 'green' : 'default'}
                                            className="pr-review__pr-state-tag"
                                        >
                                            {pr.state}
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
                    Review PR
                </Button>

                {loading && (
                    <Flex justify="center" style={{ padding: '24px 0' }}>
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                    </Flex>
                )}

                {selectedRepo && !result && !loading && (
                    <Flex gap={16} className="pr-review__stretch-row">
                        <HistoryList />
                    </Flex>
                )}

                {result && !loading && (
                    <>
                        <Flex align="center" gap={8} className="pr-review__meta">
                            <Text code>{result.number}</Text>
                            <Text strong className="pr-review__meta-title">{result.title}</Text>
                            <Text type="secondary" className="pr-review__meta-sub">
                                {result.author} · {result.timeAgo}
                            </Text>
                        </Flex>

                        <Flex gap={10}>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--danger">
                                <Text type="secondary" className="pr-review__score-label">Risk score</Text>
                                <Text className="pr-review__score-value pr-review__score-value--danger">{result.riskScore}</Text>
                            </Card>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--neutral">
                                <Text type="secondary" className="pr-review__score-label">Changed files</Text>
                                <Text className="pr-review__score-value">{result.changedFiles}</Text>
                            </Card>
                            <Card size="small" className="pr-review__score-card pr-review__score-card--warning">
                                <Text type="secondary" className="pr-review__score-label">Critical issues</Text>
                                <Text className="pr-review__score-value pr-review__score-value--warning">{result.criticalIssues}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} className="pr-review__stretch-row">
                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">RESPONSE</Text>
                                <div className="pr-review__issues-scroll">
                                    {result.issues.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`pr-review__issue-item ${SEVERITY_CLASS[item.severity] || ''}`}
                                        >
                                            <Text strong className="pr-review__issue-title">
                                                {item.title}
                                            </Text>
                                            <Text type="secondary" className="pr-review__issue-desc">
                                                {item.description}
                                            </Text>
                                            <Text className="pr-review__issue-file">{item.file}</Text>
                                        </div>
                                    ))}
                                </div>
                            </Flex>

                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">DIFF</Text>
                                <Card size="small" className="pr-review__diff-card" styles={{ body: { padding: '12px 14px' } }}>
                                    {result.diff.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`pr-review__diff-line ${diffLineClass(item.type)}`}
                                        >
                                            {item.content}
                                        </div>
                                    ))}
                                </Card>
                            </Flex>
                        </Flex>

                        <Flex gap={16} className="pr-review__stretch-row">
                            <Flex vertical gap={8} className="pr-review__col">
                                <Text className="pr-review__section-label">FILES</Text>
                                <div className="pr-review__files-scroll">
                                    {result.files.map((file: any) => (
                                        <Flex key={file.name} align="center" gap={10} className="pr-review__file-item">
                                            <Avatar
                                                icon={<FileOutlined />}
                                                className="pr-review__file-avatar"
                                                size={32}
                                            />
                                            <Flex vertical gap={2} className="pr-review__file-info">
                                                <Text code className="pr-review__file-name">{file.name}</Text>
                                                <Text type="secondary" className="pr-review__file-meta">
                                                    {file.path} · {file.changes}
                                                </Text>
                                            </Flex>
                                            <Tag className={`pr-review__risk-tag pr-review__risk-tag--${file.risk}`}>
                                                {RISK_CONFIG[file?.risk]?.label}
                                            </Tag>
                                        </Flex>
                                    ))}
                                </div>
                                <Flex gap={8} className="pr-review__actions">
                                    <Button type="primary" className="pr-review__btn pr-review__btn--flex">
                                        Apply fix suggestions
                                    </Button>
                                    <Button className="pr-review__btn--flex">View full report</Button>
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