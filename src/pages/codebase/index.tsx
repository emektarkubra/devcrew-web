import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Space, Tag, Typography, List, Avatar, Spin, Select } from 'antd'
import { FileOutlined, SearchOutlined, GithubOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text, Paragraph } = Typography

type IndexStatus = 'idle' | 'indexing' | 'ready'

const CodebaseQA = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [indexStatus, setIndexStatus] = useState<IndexStatus>('idle')
    const [indexedFileCount, setIndexedFileCount] = useState(0)
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [selectedHistory, setSelectedHistory] = useState<number | null>(null)

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
        setResult(null)
        setSelectedHistory(null)

        const [owner, repo] = value.split('/')

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
        setSelectedHistory(null)

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

    // history click
    const handleHistoryClick = (item: any, index: number) => {
        setSelectedHistory(index)
        setQuery(item.question)
        setResult({
            answer: item.response,
            files: [],
            suggestions: [],
        })
    }

    // header tag
    const renderStatusTag = () => {
        if (indexStatus === 'idle') return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--idle">No Repo Selected</Tag>
        if (indexStatus === 'indexing') return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--indexing" icon={<LoadingOutlined spin />}>Indexing...</Tag>
        return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--ready" icon={<CheckCircleOutlined />}>Ready</Tag>
    }

    return (
        <div className="codebase-qa">

            {/* Header */}
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

            {/* Body */}
            <Flex vertical gap={16} className="codebase-qa__body">

                {/* Repo Select */}
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
                        showSearch
                        options={repos.map((r) => ({
                            value: r.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{r.full_name}</span>
                                        {r.is_private && <Tag className="codebase-qa__repo-private-tag">Private</Tag>}
                                    </Flex>
                                    <Flex align="center" gap={8}>
                                        {r.language && (
                                            <Flex align="center" gap={4}>
                                                <div style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    background: getLanguageColor(r.language),
                                                    flexShrink: 0,
                                                }} />
                                                <Text style={{ fontSize: 12, color: '#6b7280' }}>{r.language}</Text>
                                            </Flex>
                                        )}

                                    </Flex>
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                {/* Search */}
                <Flex vertical gap={6}>
                    <Text className="codebase-qa__section-label">SEARCH</Text>
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
                </Flex>

                {/* Suggestions */}
                {result?.suggestions?.length > 0 && (
                    <Flex wrap gap={6}>
                        {result.suggestions.map((s: string) => (
                            <Tag
                                key={s}
                                className="codebase-qa__chip"
                                onClick={() => setQuery(s)}
                            >
                                {s}
                            </Tag>
                        ))}
                    </Flex>
                )}

                {/* Response */}
                {(loading || result) && (<>
                    <Flex vertical gap={8} className="codebase-qa__response">
                        <Text className="codebase-qa__section-label">RESPONSE</Text>
                        <Card size="small" className="codebase-qa__response-card">
                            {loading ? (
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
                            ) : null}
                        </Card>
                    </Flex>



                    {/* History */}
                    <Flex vertical gap={4}>
                        <Text className="codebase-qa__section-label">HISTORY</Text>
                        <List
                            dataSource={history}
                            split
                            renderItem={(item: any, index: number) => (
                                <List.Item style={{ padding: 0 }}>
                                    <Flex
                                        align="flex-start"
                                        gap={10}
                                        className={`codebase-qa__history-item ${selectedHistory === index ? 'codebase-qa__history-item--active' : ''}`}
                                        onClick={() => handleHistoryClick(item, index)}
                                    >
                                        <div className={`codebase-qa__history-dot ${selectedHistory === index ? 'codebase-qa__history-dot--active' : ''}`} />
                                        <Flex align="center" gap={30}>
                                            <Text className="codebase-qa__history-question">{item.question}</Text>
                                            <Text type="secondary" className="codebase-qa__history-meta">
                                                {item.filesFound} files · {timeAgo(item.timeAgo)}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </List.Item>
                            )}
                        />
                    </Flex>
                </>)}



            </Flex>
        </div>
    )
}

export default withLayout(<CodebaseQA />)