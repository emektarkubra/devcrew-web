import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Space, Tag, Typography, List, Avatar, Spin, Select } from 'antd'
import { FileOutlined, SearchOutlined, GithubOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import './index.scss'

const { Text, Paragraph } = Typography

const QUICK_CHIPS = [
    'How does rate limiting work?',
    'Which services does the payment flow call?',
    'What are the utility functions?',
    'Where is the database connection?',
]

const INDEXING_STEPS = [
    'Connecting to repository...',
    'Scanning files...',
    'Analyzing code...',
    'Building index...',
]

type IndexStatus = 'idle' | 'indexing' | 'ready'

const CodebaseQA = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [indexStatus, setIndexStatus] = useState<IndexStatus>('idle')
    const [indexStep, setIndexStep] = useState(0)
    const [indexedFileCount, setIndexedFileCount] = useState(0)
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])

    const token = localStorage.getItem('dt-token') || ''

    // repo list
    const fetchRepos = async () => {
        const { data, error } = await api.login.getRepos(token)
        if (error) {
            toast.error(error)
            return
        }
        setRepos(data)
    }

    useEffect(() => {
        fetchRepos()
    }, [])

    // repo select
    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setIndexStatus('indexing')
        setIndexStep(0)
        setResult(null)

        const [owner, repo] = value.split('/')

        for (let i = 0; i < INDEXING_STEPS.length; i++) {
            setIndexStep(i)
            await new Promise((r) => setTimeout(r, 500))
        }

        try {
            const { data, error } = await api.agents.indexRepo(token, owner, repo)
            if (error) {
                toast.error(error)
                setIndexStatus('idle')
            } else {
                setIndexedFileCount(data?.files_indexed)
                setIndexStatus('ready')
                await fetchHistory(owner, repo)
            }
        } catch (err) {
            toast.error('Indexing failed')
            setIndexStatus('idle')
        }
    }

    // history
    const fetchHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.codebaseQAHistory(token, owner, repo)
        if (error) {
            toast.error(error)
            return
        }
        setHistory(data)
    }

    // query
    const handleAsk = async () => {
        if (!query.trim() || indexStatus !== 'ready' || !selectedRepo) return
        setLoading(true)
        setResult(null)

        const [owner, repo] = selectedRepo.split('/')

        const { data, error } = await api.agents.codebaseQA(token, owner, repo, query)
        if (error) {
            toast.error(error)
        } else {
            setResult(data)
            await fetchHistory(owner, repo)
        }

        setLoading(false)
    }

    // header tag
    const renderStatusTag = () => {
        if (indexStatus === 'idle') return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--idle">No Repo Selected</Tag>
        if (indexStatus === 'indexing') return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--indexing" icon={<LoadingOutlined spin />}>Indexing...</Tag>
        return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--ready" icon={<CheckCircleOutlined />}>Ready</Tag>
    }

    return (
        <div className="codebase-qa">

            <Flex align="center" justify="space-between" className="codebase-qa__header">
                <Flex align="center" gap={10}>
                    <div className={`codebase-qa__dot codebase-qa__dot--${indexStatus}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Codebase Q&A</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {indexStatus === 'ready'
                                ? `${selectedRepo} · ${indexedFileCount} files indexed`
                                : 'Select a repo to start asking questions'}
                        </Text>
                    </Flex>
                </Flex>
                {renderStatusTag()}
            </Flex>

            <Flex vertical gap={16} className="codebase-qa__body">

                <Flex vertical gap={6}>
                    <Text className="codebase-qa__section-label">REPO</Text>
                    <Select
                        className="codebase-qa__repo-select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>Select repo...</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        disabled={indexStatus === 'indexing'}
                        options={repos.map((r) => ({
                            value: r.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{r.full_name}</span>
                                    </Flex>
                                    <Flex gap={4}>
                                        {r.language && <Tag className="codebase-qa__repo-lang-tag">{r.language}</Tag>}
                                        {r.is_private && <Tag className="codebase-qa__repo-private-tag">Private</Tag>}
                                    </Flex>
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                {indexStatus === 'indexing' && (
                    <Flex align="center" gap={10} className="codebase-qa__indexing-status">
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                        <Text className="codebase-qa__indexing-text">
                            {INDEXING_STEPS[indexStep]}
                        </Text>
                    </Flex>
                )}

                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onPressEnter={handleAsk}
                        placeholder={
                            indexStatus === 'idle' ? 'Select a repo first...' :
                                indexStatus === 'indexing' ? 'Indexing in progress...' :
                                    'Ask anything about the repo...'
                        }
                        prefix={<SearchOutlined className="codebase-qa__search-prefix" />}
                        disabled={indexStatus !== 'ready'}
                        className={indexStatus !== 'ready' ? 'codebase-qa__input--disabled' : ''}
                    />
                    <Button
                        type="primary"
                        onClick={handleAsk}
                        loading={loading}
                        disabled={indexStatus !== 'ready'}
                        className="codebase-qa__btn"
                    >
                        Ask
                    </Button>
                </Space.Compact>

                {/* Quick Chips */}
                <Flex wrap gap={6}>
                    {QUICK_CHIPS.map((chip) => (
                        <Tag
                            key={chip}
                            className={`codebase-qa__chip ${indexStatus !== 'ready' ? 'codebase-qa__chip--disabled' : ''}`}
                            onClick={() => indexStatus === 'ready' && setQuery(chip)}
                        >
                            {chip}
                        </Tag>
                    ))}
                </Flex>

                <Flex vertical gap={8} className="codebase-qa__response">
                    <Text className="codebase-qa__section-label">RESPONSE</Text>
                    <Card size="small" className="codebase-qa__response-card">
                        {indexStatus === 'idle' && (
                            <Text className="codebase-qa__placeholder-text">
                                Query results will appear here.
                            </Text>
                        )}
                        {indexStatus === 'indexing' && (
                            <Flex justify="center" className="codebase-qa__spin">
                                <Spin size="small" />
                            </Flex>
                        )}
                        {indexStatus === 'ready' && (
                            loading ? (
                                <Flex justify="center" className="codebase-qa__spin">
                                    <Spin size="small" />
                                </Flex>
                            ) : result ? (
                                <>
                                    <Paragraph
                                        className="codebase-qa__response-paragraph"
                                        style={{ marginBottom: result.files?.length ? 12 : 0 }}
                                    >
                                        {result.answer}
                                    </Paragraph>
                                    {result.files?.map((filePath: string) => (
                                        <Flex key={filePath} className="codebase-qa__file-item">
                                            <Flex align="center" gap={10}>
                                                <Avatar
                                                    icon={<FileOutlined />}
                                                    className="codebase-qa__file-avatar"
                                                    size={32}
                                                />
                                                <Flex vertical gap={2} style={{ flex: 1 }}>
                                                    <Text code className="codebase-qa__file-name">
                                                        {filePath.split('/').pop()}
                                                    </Text>
                                                    <Text type="secondary" className="codebase-qa__file-meta">
                                                        {filePath}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                    ))}
                                </>
                            ) : (
                                <Text className="codebase-qa__placeholder-text">
                                    Ask a question, answer will appear here.
                                </Text>
                            )
                        )}
                    </Card>
                </Flex>

                {/* History */}
                <Flex vertical gap={4}>
                    <Text className="codebase-qa__section-label">HISTORY</Text>
                    <List
                        dataSource={history}
                        split
                        renderItem={(item: any) => (
                            <List.Item style={{ padding: 0 }}>
                                <Flex align="flex-start" gap={10} className="codebase-qa__history-item">
                                    <div className="codebase-qa__history-dot" />
                                    <Flex align="center" gap={30}>
                                        <Text className="codebase-qa__history-question">{item.question}</Text>
                                        <Text type="secondary" className="codebase-qa__history-meta">
                                            {item.filesFound} files · {item.timeAgo}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                    />
                </Flex>

            </Flex>
        </div>
    )
}

export default withLayout(<CodebaseQA />)