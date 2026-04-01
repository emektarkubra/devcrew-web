import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Avatar, Select } from 'antd'
import { FileOutlined, SearchOutlined, GithubOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { FiSearch } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text, Paragraph } = Typography

type IndexStatus = 'idle' | 'indexing' | 'ready'

const CodebaseQA = () => {
    const { t } = useTranslation()

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

    const fetchRepos = async () => {
        const { data, error } = await api.profile.getRepos(token)
        if (error) { toast.error(error); return }
        setRepos(data)
    }

    useEffect(() => { fetchRepos() }, [])

    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setIndexStatus('indexing')
        setResult(null)
        setSelectedHistory(null)

        const [owner, repo] = value.split('/')

        try {
            const { data: checkData, error: checkError } = await api.agents.checkIndex(token, owner, repo)

            if (checkError) {
                toast.error(checkError)
                setIndexStatus('idle')
                return
            }

            if (checkData?.indexed) {
                // zaten index li
                setIndexedFileCount(checkData.file_count)
                setIndexStatus('ready')
                await fetchHistory(owner, repo)
                return
            }

            // index yok, index le
            const { data, error } = await api.agents.indexRepo(token, owner, repo)
            if (error) {
                toast.error(error)
                setIndexStatus('idle')
            } else {
                setIndexedFileCount(data?.files_indexed)
                setIndexStatus('ready')
                await fetchHistory(owner, repo)
            }
        } catch {
            toast.error('Indexing failed')
            setIndexStatus('idle')
        }
    }

    const fetchHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.codebaseQAHistory(token, owner, repo)
        if (error) { toast.error(error); return }
        setHistory(data)
    }

    const handleAsk = async () => {
        if (!query.trim() || indexStatus !== 'ready' || !selectedRepo) return
        setLoading(true)
        setResult(null)
        setSelectedHistory(null)

        const [owner, repo] = selectedRepo.split('/')

        try {
            const { data, error } = await api.agents.codebaseQA(token, owner, repo, query)
            if (error) {
                toast.error(error)
            } else {
                setResult(data)
                await fetchHistory(owner, repo)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleHistoryClick = async (item: any, index: number) => {
        setSelectedHistory(index)
        setQuery(item.question)

        setResult((prev: any) => ({
            answer: item.response,
            files: item.files || [],
            suggestions: prev?.suggestions || [],
        }))

        if (!selectedRepo) return
        const [owner, repo] = selectedRepo.split('/')
        try {
            const { data } = await api.agents.codebaseQA(token, owner, repo, item.question)
            if (data?.suggestions) {
                setResult((prev: any) => ({ ...prev, suggestions: data.suggestions }))
            }
        } catch {
            // suggestions gelmezse sorun değil
        }
    }


    const renderStatusTag = () => {
        if (indexStatus === 'idle') {
            return <Tag className="codebase-qa__status-tag codebase-qa__status-tag--idle">{t('codebase.noRepoSelected')}</Tag>
        }
        if (indexStatus === 'indexing') {
            return (
                <Tag className="codebase-qa__status-tag codebase-qa__status-tag--indexing" icon={<LoadingOutlined spin />}>
                    {t('codebase.indexing')}
                </Tag>
            )
        }
        return (
            <Tag className="codebase-qa__status-tag codebase-qa__status-tag--ready" icon={<CheckCircleOutlined />}>
                {t('codebase.ready')}
            </Tag>
        )
    }

    return (
        <div className="codebase-qa">
            <Flex align="center" justify="space-between" className="codebase-qa__header">
                <Flex align="center" gap={10}>
                    <div className={`codebase-qa__dot codebase-qa__dot--${indexStatus}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="codebase-qa__title">{t('codebase.title')}</Text>
                        <Text type="secondary" className="codebase-qa__subtitle">
                            {indexStatus === 'ready'
                                ? t('codebase.subtitleReady', { repo: selectedRepo, count: indexedFileCount })
                                : t('codebase.subtitle')
                            }
                        </Text>
                    </Flex>
                </Flex>
                {renderStatusTag()}
            </Flex>

            <Flex vertical gap={16} className="codebase-qa__body">

                <Flex vertical gap={6}>
                    <Text className="codebase-qa__section-label">{t('codebase.repoLabel')}</Text>
                    <Select
                        className="codebase-qa__repo-select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>{t('codebase.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        disabled={indexStatus === 'indexing'}
                        showSearch
                        options={repos?.map((repo) => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{repo?.full_name}</span>
                                        {repo?.is_private && <Tag className="codebase-qa__repo-private-tag">Private</Tag>}
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4}>
                                            <div className="codebase-qa__lang-dot" style={{ background: getLanguageColor(repo?.language) }} />
                                            <Text className="codebase-qa__lang-text">{repo?.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                {/* Search */}
                <Flex vertical gap={10}>
                    <Text className="codebase-qa__section-label">{t('codebase.searchLabel')}</Text>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onPressEnter={handleAsk}
                        placeholder={
                            indexStatus === 'idle'
                                ? t('codebase.placeholderIdle')
                                : indexStatus === 'indexing'
                                    ? t('codebase.placeholderIndexing')
                                    : t('codebase.placeholderReady')
                        }
                        prefix={<SearchOutlined className="codebase-qa__search-prefix" />}
                        disabled={indexStatus !== 'ready'}
                        className={indexStatus !== 'ready' ? 'codebase-qa__input--disabled' : ''}
                    />
                </Flex>

                {Array.isArray(result?.suggestions) && result?.suggestions?.length > 0 && (
                    <Flex wrap gap={6}>
                        {result?.suggestions?.map((s: string) => (
                            <Tag key={s} className="codebase-qa__chip" onClick={() => setQuery(s)}>
                                {s}
                            </Tag>
                        ))}
                    </Flex>
                )}

                <Button
                    type="primary"
                    onClick={handleAsk}
                    loading={loading}
                    disabled={indexStatus !== 'ready' || !query.trim()}
                    className="codebase-qa__btn"
                    icon={<FiSearch />}
                >
                    {t('codebase.ask')}
                </Button>

                {(result) && (
                    <Flex vertical gap={8} className="codebase-qa__response">
                        <Text className="codebase-qa__section-label">{t('codebase.responseLabel')}</Text>
                        <Card size="small" className="codebase-qa__response-card">
                            <Paragraph
                                className="codebase-qa__response-paragraph"
                                style={{ marginBottom: result?.files?.length ? 12 : 0 }}
                            >
                                {result?.answer}
                            </Paragraph>
                            {result?.files?.map((filePath: string) => (
                                <Flex key={filePath} className="codebase-qa__file-item">
                                    <Flex align="center" gap={10}>
                                        <Avatar
                                            icon={<FileOutlined />}
                                            className="codebase-qa__file-avatar"
                                            size={32}
                                        />
                                        <Flex vertical gap={2} className="codebase-qa__file-info">
                                            <Text code className="codebase-qa__file-name">
                                                {filePath?.split('/')?.pop()}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            ))}
                        </Card>


                    </Flex>
                )}

                {indexStatus === 'ready' && history.length > 0 && (
                    <Flex vertical gap={4}>
                        <Text className="codebase-qa__section-label">{t('codebase.historyLabel')}</Text>
                        <div className="codebase-qa__history-scroll">
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
                                                <Text className="codebase-qa__history-question">{item?.question}</Text>
                                                <Text type="secondary" className="codebase-qa__history-meta">
                                                    {item?.filesFound} {t('codebase.files')} · {timeAgo(item?.timeAgo)}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Flex>
                )}

            </Flex>
        </div>
    )
}

export default withLayout(<CodebaseQA />)