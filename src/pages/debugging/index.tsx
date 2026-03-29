import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Select, Spin, Avatar } from 'antd'
import { SearchOutlined, GithubOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text, Paragraph } = Typography

const SEVERITY_CONFIG: Record<string, { label: string }> = {
    critical: { label: 'Critical' },
    high: { label: 'High' },
    medium: { label: 'Medium' },
    low: { label: 'Low' },
    unknown: { label: 'Unknown' },
}

const Debugging = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [selectedHistory, setSelectedHistory] = useState<number | null>(null)

    const token = localStorage.getItem('dt-token') || ''

    useEffect(() => {
        const fetchRepos = async () => {
            const { data, error } = await api.profile.getRepos(token)
            if (error) {
                toast.error(error);
            } else {
                setRepos(data)
            }
        }
        fetchRepos()
    }, [])

    // fetch history
    const fetchHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.debugHistory(token, owner, repo)
        if (error) {
            toast.error(error);
        } else {
            setHistory(data)
        }
    }

    // repo select
    const handleRepoSelect = (value: string) => {
        setSelectedRepo(value)
        setResult(null)
        setInput('')
        setHistory([])
        const [owner, repo] = value.split('/')
        fetchHistory(owner, repo)
    }

    // analyze
    const handleAnalyze = async () => {
        if (!input.trim() || !selectedRepo) return
        setLoading(true)
        setResult(null)

        const [owner, repo] = selectedRepo.split('/')

        const { data, error } = await api.agents.debug(token, owner, repo, input)
        if (error) {
            toast.error(error)
            setLoading(false)
            return
        } else {
            setResult(data)
            await fetchHistory(owner, repo)
            setLoading(false)
        }
    }


    // click history
    const handleHistoryClick = (item: any, index: number) => {
        setSelectedHistory(index)
        setInput(item.error)
        setResult({
            rootCause: item.rootCause,
            severity: item.severity,
            affectedFiles: item.affectedFiles ?? [],
            fix: item.fix ?? [],
            explanation: item.explanation ?? '',
            confidence: null,
        })
    }

    return (
        <div className="debugging">

            <Flex align="center" justify="space-between" className="debugging__header">
                <Flex align="center" gap={10}>
                    <div className={`debugging__dot debugging__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="debugging__title">Debug Agent</Text>
                        <Text type="secondary" className="debugging__subtitle">
                            {selectedRepo ?? 'Select a repo to start debugging'}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className={`debugging__severity-tag debugging__severity-tag--${result.severity}`}>
                        {SEVERITY_CONFIG[result.severity]?.label} severity
                    </Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="debugging__body">
                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">REPO</Text>
                    <Select
                        className="debugging__select"
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
                                                className="debugging__lang-dot"
                                                style={{ background: getLanguageColor(r.language) }}
                                            />
                                            <Text className="debugging__lang-text">{r.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">ERROR / LOG</Text>
                    <Input.TextArea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            !selectedRepo
                                ? 'Select a repo first...'
                                : 'Paste your error message or stacktrace here...'
                        }
                        rows={4}
                        disabled={!selectedRepo}
                        className="debugging__textarea"
                    />
                </Flex>

                <Button
                    type="primary"
                    onClick={handleAnalyze}
                    loading={loading}
                    disabled={!selectedRepo || !input.trim()}
                    className="debugging__analyze-btn"
                    icon={<SearchOutlined />}
                >
                    Analyze
                </Button>

                {loading && (
                    <Flex justify="center" className="debugging__spin-wrap">
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                    </Flex>
                )}

                {result && !loading && (
                    <>
                        <Flex gap={16} className="debugging__stretch-row">
                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">ROOT CAUSE</Text>
                                <Card size="small" className="debugging__root-card">
                                    <Text className="debugging__root-text">{result.rootCause}</Text>
                                </Card>
                                {result.confidence && (
                                    <Card size="small" className="debugging__stat-card">
                                        <Text className="debugging__card-label">Confidence</Text>
                                        <Text className="debugging__confidence">%{result.confidence}</Text>
                                    </Card>
                                )}
                            </Flex>

                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">EXPLANATION</Text>
                                <Card size="small" className="debugging__explanation-card">
                                    <Paragraph className="debugging__explanation-text">
                                        {result.explanation}
                                    </Paragraph>
                                </Card>
                            </Flex>
                        </Flex>
                        <Flex gap={16} className="debugging__stretch-row">
                            {/* Suggested Fix */}
                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">SUGGESTED FIX</Text>
                                <Card size="small" className="debugging__fix-card" styles={{ body: { padding: '12px 14px' } }}>
                                    {result.fix?.map((item: any, i: number) => (
                                        <div key={i} className={`debugging__diff-line debugging__diff-line--${item.type}`}>
                                            {item.content}
                                        </div>
                                    ))}
                                </Card>
                            </Flex>

                            {result && !loading && (
                                <Flex vertical gap={8} className="debugging__col">
                                    <Text className="debugging__section-label">AFFECTED FILES</Text>
                                    <div className="debugging__files-scroll">
                                        {result.affectedFiles?.length > 0 ? (
                                            result.affectedFiles.map((f: any) => (
                                                <Flex key={f.path} align="center" gap={10} className="debugging__file-item">
                                                    <Avatar
                                                        icon={<FileOutlined />}
                                                        className="debugging__file-avatar"
                                                        size={32}
                                                    />
                                                    <Flex vertical gap={2} className="debugging__file-info">
                                                        <Text code className="debugging__file-name">{f.name}</Text>
                                                        <Text type="secondary" className="debugging__file-meta">{f.path}</Text>
                                                    </Flex>
                                                </Flex>
                                            ))
                                        ) : (
                                            <Text type="secondary" className="debugging__card-label">
                                                No affected files found
                                            </Text>
                                        )}
                                    </div>
                                </Flex>
                            )}

                        </Flex>
                        <Flex vertical gap={8}>
                            <Text className="debugging__section-label">ACTIONS</Text>
                            <Flex gap={8} className="debugging__actions-row">
                                <Button type="primary" className="debugging__action-btn-primary">
                                    Apply fix & open PR
                                </Button>
                                <Button className="debugging__action-btn">View file</Button>
                                <Button>Generate test</Button>
                            </Flex>
                        </Flex>
                    </>
                )}

                {selectedRepo && (
                    <Flex gap={16} className="debugging__stretch-row">
                        <Flex vertical gap={4} className="debugging__col">
                            <Text className="debugging__section-label">HISTORY</Text>
                            <div className="debugging__history-scroll">
                                <List
                                    dataSource={history}
                                    split
                                    locale={{ emptyText: 'No debug history yet' }}
                                    renderItem={(item, index: any) => (
                                        <List.Item style={{ padding: 0 }}>
                                            <Flex
                                                align="flex-start"
                                                gap={10}
                                                className={`debugging__history-item ${selectedHistory === index ? 'debugging__history-item--active' : ''}`}
                                                onClick={() => handleHistoryClick(item, index)}
                                            >
                                                <div className={`debugging__history-dot debugging__history-dot--${item.resolved === 'true' ? 'resolved' : 'unresolved'}`} />
                                                <Flex vertical gap={2}>
                                                    <Text className="debugging__history-error">{item.error}</Text>
                                                    <Text type="secondary" className="debugging__history-meta">
                                                        {item.rootCause} · {timeAgo(item.timeAgo)}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Flex>

                    </Flex>
                )}

            </Flex>
        </div>
    )
}

export default withLayout(<Debugging />)