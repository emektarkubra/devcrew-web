import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Select, Avatar } from 'antd'
import { SearchOutlined, GithubOutlined, LoadingOutlined, FileOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import ApplyDebugFixModal from './components/ApplyDebugFixModal'
import './index.scss'

const { Text, Paragraph } = Typography

type IndexStatus = 'idle' | 'indexing' | 'ready'

const Debugging = () => {
    const { t } = useTranslation()
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [selectedHistory, setSelectedHistory] = useState<number | null>(null)


    const [indexStatus, setIndexStatus] = useState<IndexStatus>('idle')
    const [indexedFileCount, setIndexedFileCount] = useState(0)
    const [applyLoading, setApplyLoading] = useState(false)
    const [applyModalOpen, setApplyModalOpen] = useState(false)

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

    // get history
    const getHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.debugHistory(token, owner, repo)
        if (error) {
            toast.error(error)
        } else {
            setHistory(data)
        }
    }

    // select repo
    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setResult(null)
        setInput('')
        setHistory([])
        setSelectedHistory(null)

        const [owner, repo] = value.split('/')

        // control indexing status
        setIndexStatus('indexing')

        try {
            const { data: checkData, error: checkError } = await api.agents.checkIndex(token, owner, repo)

            if (checkError) {
                toast.error(checkError)
                setIndexStatus('idle')
                return
            }

            if (checkData?.indexed) {
                setIndexedFileCount(checkData.file_count)
                setIndexStatus('ready')
                await getHistory(owner, repo)
                return
            }

            // if not indexed, start indexing
            const { data, error } = await api.agents.indexRepo(token, owner, repo)
            if (error) {
                toast.error(error)
                setIndexStatus('idle')
            } else {
                setIndexedFileCount(data?.files_indexed)
                setIndexStatus('ready')
                await getHistory(owner, repo)
            }
        } catch (error) {
            console.error('Indexing error:', error)
        }
    }

    // analyze error log
    const handleAnalyze = async () => {
        if (!input.trim() || !selectedRepo) return

        setLoading(true)
        setResult(null)

        const [owner, repo] = selectedRepo.split('/')

        try {
            const { data, error } = await api.agents.debug(token, owner, repo, input)
            if (error) {
                toast.error(error)
                return
            } else {
                setResult(data)
                await getHistory(owner, repo)
            }
        } catch (error) {
            console.error('Debugging error:', error)
        } finally {
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
            fixSuggestion: item.fixSuggestion ?? '',
            explanation: item.explanation ?? '',
            confidence: null,
        })
    }

    const getSeverityLabel = (severity?: string) => {
        if (!severity) return t('debugging.severity.unknown')
        return t(`debugging.severity.${severity}`)
    }


    // handleApplyFix 
    const handleApplyFix = async () => {
        if (!selectedRepo || !result) return
        setApplyLoading(true)

        const [owner, repo] = selectedRepo.split('/')

        try {
            const { data, error } = await api.agents.applyDebugFix(
                token, owner, repo,
                result.fixSuggestion,
                result.affectedFiles,
                input,
            )
            if (error) {
                toast.error(error); return
            } else {
                toast.success(`PR opened: ${data.pr_url}`)
                window.open(data?.pr_url, '_blank')
                setApplyModalOpen(false)
            }
        } catch {
            toast.error('Failed to apply fix')
        } finally {
            setApplyLoading(false)
        }
    }


    useEffect(() => {
        getRepos()
    }, [])

    return (
        <div className="debugging">
            <Flex align="center" justify="space-between" className="debugging__header">
                <Flex align="center" gap={10} className="debugging__header-left">
                    <div className={`debugging__dot debugging__dot--${indexStatus}`} />
                    <Flex vertical align="flex-start" gap={2} className="debugging__header-texts">
                        <Text strong className="debugging__title">
                            {t('debugging.title')}
                        </Text>
                        <Text type="secondary" className="debugging__subtitle">
                            {indexStatus === 'ready'
                                ? `${selectedRepo} · ${indexedFileCount} files indexed`
                                : selectedRepo
                                    ? t('debugging.subtitle')
                                    : t('debugging.subtitle')
                            }
                        </Text>
                    </Flex>
                </Flex>

                <Flex align="center" gap={8}>
                    {result && (
                        <Tag className={`debugging__severity-tag debugging__severity-tag--${result?.severity}`}>
                            {t('debugging.severity.label', {
                                severity: getSeverityLabel(result?.severity),
                            })}
                        </Tag>
                    )}
                    {indexStatus === 'idle' && (
                        <Tag className="debugging__status-tag debugging__status-tag--idle">
                            {t('debugging.noRepoSelected')}
                        </Tag>
                    )}
                    {indexStatus === 'indexing' && (
                        <Tag
                            className="debugging__status-tag debugging__status-tag--indexing"
                            icon={<LoadingOutlined spin />}
                        >
                            {t('debugging.indexing')}
                        </Tag>
                    )}
                    {indexStatus === 'ready' && (
                        <Tag
                            className="debugging__status-tag debugging__status-tag--ready"
                            icon={<CheckCircleOutlined />}
                        >
                            {t('debugging.ready')}
                        </Tag>
                    )}
                </Flex>
            </Flex>

            <Flex vertical gap={16} className="debugging__body">
                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">{t('debugging.repo')}</Text>

                    <Select
                        className="debugging__select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>{t('debugging.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        showSearch
                        popupClassName="debugging__select-dropdown"
                        options={repos?.map((repo) => ({
                            value: repo.full_name,
                            label: (
                                <div className="debugging__repo-option">
                                    <div className="debugging__repo-option-left">
                                        <GithubOutlined />
                                        <span className="debugging__repo-option-name">{repo?.full_name}</span>
                                        {repo?.is_private && <Tag className="pr-review__tag--private">Private</Tag>}
                                    </div>

                                    {repo?.language && (
                                        <div className="debugging__repo-option-right">
                                            <div
                                                className="debugging__lang-dot"
                                                style={{ ['--lang-dot-color' as any]: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="debugging__lang-text">{repo?.language}</Text>
                                        </div>
                                    )}
                                </div>
                            ),
                        }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">{t('debugging.errorLog')}</Text>
                    <Input.TextArea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            !selectedRepo
                                ? t('debugging.selectRepoFirst')
                                : t('debugging.pasteError')
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
                    disabled={!selectedRepo || !input.trim() || indexStatus !== 'ready'}
                    className="debugging__analyze-btn"
                    icon={<SearchOutlined />}
                >
                    {t('debugging.analyze')}
                </Button>

                {result && !loading && (
                    <>
                        <Flex gap={16} className="debugging__stretch-row debugging__stack-on-mobile">
                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">{t('debugging.rootCause')}</Text>

                                <Card size="small" className="debugging__root-card">
                                    <Text className="debugging__root-text">{result?.rootCause}</Text>
                                </Card>

                                {result?.confidence && (
                                    <Card size="small" className="debugging__stat-card">
                                        <Text className="debugging__card-label">{t('debugging.confidence')}</Text>
                                        <Text className="debugging__confidence">%{result?.confidence}</Text>
                                    </Card>
                                )}
                            </Flex>

                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">{t('debugging.explanation')}</Text>

                                <Card size="small" className="debugging__explanation-card">
                                    <Paragraph className="debugging__explanation-text">
                                        {result?.explanation}
                                    </Paragraph>
                                </Card>
                            </Flex>
                        </Flex>

                        <Flex gap={16} className="debugging__stretch-row debugging__stack-on-mobile">
                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">{t('debugging.suggestedFix')}</Text>

                                <Card size="small" className="debugging__fix-card debugging__fix-card--padded">
                                    {result?.fixSuggestion}
                                </Card>
                            </Flex>

                            <Flex vertical gap={8} className="debugging__col">
                                <Text className="debugging__section-label">{t('debugging.affectedFiles')}</Text>

                                <div className="debugging__files-scroll">
                                    {result?.affectedFiles?.length > 0 ? (
                                        result?.affectedFiles?.map((file: any) => (
                                            <Flex
                                                key={file?.path}
                                                align="center"
                                                gap={10}
                                                className="debugging__file-item"
                                            >
                                                <Avatar
                                                    icon={<FileOutlined />}
                                                    className="debugging__file-avatar"
                                                    size={32}
                                                />
                                                <Flex vertical gap={2} className="debugging__file-info">
                                                    <Text code className="debugging__file-name">
                                                        {file?.name}
                                                    </Text>
                                                    <Text type="secondary" className="debugging__file-meta">
                                                        {file?.path}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        ))
                                    ) : (
                                        <Text type="secondary" className="debugging__card-label">
                                            {t('debugging.noAffectedFiles')}
                                        </Text>
                                    )}
                                </div>
                            </Flex>
                        </Flex>

                        <Flex vertical gap={8}>
                            <Text className="debugging__section-label">{t('debugging.actions')}</Text>

                            <Flex gap={8} className="debugging__actions-row">
                                <Button
                                    type="primary"
                                    disabled={!result?.fixSuggestion || !result?.affectedFiles?.length}
                                    onClick={() => setApplyModalOpen(true)}
                                    className="debugging__action-btn-primary"
                                >
                                    {t('debugging.applyFixOpenPr')}
                                </Button>
                                <Button className="debugging__action-btn">
                                    {t('debugging.viewFile')}
                                </Button>
                            </Flex>
                        </Flex>
                    </>
                )}

                {selectedRepo && (
                    <Flex gap={16} className="debugging__stretch-row debugging__stack-on-mobile">
                        <Flex vertical gap={4} className="debugging__col">
                            <Text className="debugging__section-label">{t('debugging.history')}</Text>

                            <div className="debugging__history-scroll">
                                <List
                                    dataSource={history}
                                    split
                                    locale={{ emptyText: t('debugging.noHistory') }}
                                    renderItem={(item, index: any) => (
                                        <List.Item className="debugging__history-list-item">
                                            <Flex
                                                align="flex-start"
                                                gap={10}
                                                className={`debugging__history-item ${selectedHistory === index
                                                    ? 'debugging__history-item--active'
                                                    : ''
                                                    }`}
                                                onClick={() => handleHistoryClick(item, index)}
                                            >
                                                <div
                                                    className={`debugging__history-dot debugging__history-dot--${item?.resolved === 'true' ? 'resolved' : 'unresolved'
                                                        }`}
                                                />
                                                <Flex vertical gap={2} className="debugging__history-content">
                                                    <Text className="debugging__history-error">{item?.error}</Text>
                                                    <Text type="secondary" className="debugging__history-meta">
                                                        {item?.rootCause} · {timeAgo(item?.timeAgo)}
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

            <ApplyDebugFixModal
                open={applyModalOpen}
                onClose={() => setApplyModalOpen(false)}
                onConfirm={handleApplyFix}
                loading={applyLoading}
                affectedFiles={result?.affectedFiles ?? []}
                fixSuggestion={result?.fixSuggestion ?? ''}
            />
        </div>
    )
}

export default withLayout(<Debugging />)