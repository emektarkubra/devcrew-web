import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Select, Spin, Tooltip, Alert } from 'antd'
import { GithubOutlined, LoadingOutlined, FileOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import './index.scss'

const { Text } = Typography

const REPO_LEVEL_TYPES = ['readme', 'arch', 'onboard', 'changelog', 'api', 'guide']
const FRONTEND_LANGUAGES = ['JavaScript', 'TypeScript', 'Vue', 'Svelte', 'HTML', 'CSS']

const Documentation = () => {
    const { t } = useTranslation()

    const DOC_TYPES = [
        { value: 'function', label: t('documentation.typeFunction'), tooltip: t('documentation.tooltipFunction') },
        { value: 'readme', label: t('documentation.typeReadme'), tooltip: t('documentation.tooltipReadme') },
        { value: 'api', label: t('documentation.typeApi'), tooltip: t('documentation.tooltipApi') },
        { value: 'onboard', label: t('documentation.typeOnboard'), tooltip: t('documentation.tooltipOnboard') },
        { value: 'guide', label: t('documentation.typeGuide'), tooltip: t('documentation.tooltipGuide') },
        { value: 'arch', label: t('documentation.typeArch'), tooltip: t('documentation.tooltipArch') },
        { value: 'changelog', label: t('documentation.typeChangelog'), tooltip: t('documentation.tooltipChangelog') },
    ]

    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [repoFiles, setRepoFiles] = useState<string[]>([])
    const [filesLoading, setFilesLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [docType, setDocType] = useState('function')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [view, setView] = useState<'preview' | 'markdown'>('preview')
    const [copied, setCopied] = useState(false)

    const token = localStorage.getItem('dt-token') || ''
    const isRepoLevel = REPO_LEVEL_TYPES.includes(docType)

    const selectedRepoData = repos.find(r => r.full_name === selectedRepo)
    const repoLanguage = selectedRepoData?.language ?? ''
    const isFrontendRepo = FRONTEND_LANGUAGES.includes(repoLanguage)
    const showGuideWarning = docType === 'guide' && selectedRepo && !isFrontendRepo


    // get repo
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

    // get history
    const getHistory = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.documentationHistory(token, owner, repo)
        if (error) {
            toast.error(error)
        } else {
            setHistory(data)
        }
    }

    // select repo
    const handleRepoSelect = async (value: string) => {
        try {
            setSelectedRepo(value)
            setResult(null)
            setRepoFiles([])
            setHistory([])
            setFilesLoading(true)

            if (isRepoLevel) {
                setSelectedFile(value)
            } else {
                setSelectedFile(null)
            }

            const [owner, repo] = value.split('/')

            const { data, error } = await api.agents.repoFiles(token, owner, repo)
            if (error) { toast.error(error) } else {
                setRepoFiles(data?.files ?? [])
                await getHistory(owner, repo)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFilesLoading(false)
        }
    }

    // onchange doc type
    const handleDocTypeChange = (value: string) => {
        setDocType(value)
        if (REPO_LEVEL_TYPES.includes(value)) {
            setSelectedFile(selectedRepo)
        } else {
            setSelectedFile(null)
        }
    }

    // generate documentation
    const handleGenerate = async () => {
        if (!selectedRepo) return
        if (!isRepoLevel && !selectedFile) return

        try {
            setLoading(true)
            setResult(null)

            const [owner, repo] = selectedRepo.split('/')
            const target = isRepoLevel ? selectedRepo : selectedFile!

            const { data, error } = await api.agents.documentation(token, owner, repo, target, docType)
            if (error) {
                toast.error(error)
            } else {
                setResult(data)
                await getHistory(owner, repo)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // history click
    const handleHistoryClick = (item: any) => {
        setSelectedFile(item?.target)
        setDocType(item?.docType)
        setResult({
            fileName: item?.target,
            description: item?.description,
            markdown: item?.content,
            methods: [],
        })
    }

    // export
    const handleExport = () => {
        if (!result?.markdown) return
        const blob = new Blob([result.markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${result.fileName ?? 'documentation'}.md`
        a.click()
        URL.revokeObjectURL(url)
    }


    // copy
    const handleCopy = async () => {
        if (!result?.markdown) return

        try {
            await navigator.clipboard.writeText(result.markdown)
            setCopied(true)
            toast.success(t('testGenerator.copied'))

            setTimeout(() => setCopied(false), 1500)
        } catch (e) {
            console.error(e)
        }
    }

    const isGenerateDisabled = !selectedRepo || (!isRepoLevel && !selectedFile)

    const fileOptions = selectedRepo ? [
        ...repoFiles?.map((file) => ({
            value: file,
            label: (
                <Flex align="center" gap={8}>
                    <FileOutlined className="documentation__file-icon" />
                    <span>{file}</span>
                </Flex>
            ),
        })),
    ] : []

    const renderHistory = () => (
        <List
            dataSource={history}
            split
            locale={{ emptyText: t('documentation.noHistory') }}
            renderItem={(item: any) => (
                <List.Item className="documentation__history-list-item">
                    <Flex
                        align="flex-start"
                        gap={10}
                        className="documentation__history-item"
                        onClick={() => handleHistoryClick(item)}
                    >
                        <div className="documentation__history-dot" />
                        <Flex vertical gap={2}>
                            <Text code className="documentation__history-file">{item?.target}</Text>
                            <Text type="secondary" className="documentation__history-meta">
                                {DOC_TYPES.find(d => d.value === item?.docType)?.label ?? item?.docType} · {timeAgo(item?.timeAgo)}
                            </Text>
                        </Flex>
                    </Flex>
                </List.Item>
            )}
        />
    )

    return (
        <div className="documentation">
            <Flex align="center" justify="space-between" className="documentation__header">
                <Flex align="center" gap={10}>
                    <div className={`documentation__dot documentation__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="documentation__title">{t('documentation.title')}</Text>
                        <Text type="secondary" className="documentation__subtitle">
                            {selectedRepo ?? t('documentation.subtitle')}
                        </Text>
                    </Flex>
                </Flex>
                {result && <Tag className="documentation__tag--ready">{t('documentation.generated')}</Tag>}
            </Flex>

            <Flex vertical gap={16} className="documentation__body">

                <Flex vertical gap={6}>
                    <Text className="documentation__section-label">{t('documentation.repo')}</Text>
                    <Select
                        className="documentation__select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>{t('documentation.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        showSearch
                        options={repos?.map((repo) => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between" className="documentation__repo-option">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{repo?.full_name}</span>
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="documentation__lang-dot"
                                                style={{ background: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="documentation__lang-text">{repo?.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex gap={8} className="documentation__controls-row">
                    <Flex vertical gap={6} className="documentation__doctype-col">
                        <Text className="documentation__section-label">{t('documentation.docType')}</Text>
                        <Select
                            value={docType}
                            onChange={handleDocTypeChange}
                            disabled={!selectedRepo}
                            className="documentation__select"
                            options={DOC_TYPES?.map((doc) => ({
                                value: doc?.value,
                                label: (
                                    <Flex align="center" justify="space-between">
                                        <span>{doc?.label}</span>
                                        <Tooltip title={doc?.tooltip} placement="right">
                                            <InfoCircleOutlined className="documentation__info-icon" />
                                        </Tooltip>
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>

                    {!isRepoLevel && (
                        <Flex vertical gap={6} className="documentation__target-col">
                            <Text className="documentation__section-label">{t('documentation.target')}</Text>
                            <Select
                                className="documentation__select"
                                placeholder={
                                    !selectedRepo
                                        ? t('documentation.selectRepoFirst')
                                        : filesLoading
                                            ? t('documentation.loadingFiles')
                                            : t('documentation.selectFile')
                                }
                                value={selectedFile}
                                onChange={setSelectedFile}
                                disabled={!selectedRepo || filesLoading}
                                loading={filesLoading}
                                showSearch
                                suffixIcon={
                                    filesLoading
                                        ? <Spin indicator={<LoadingOutlined spin />} size="small" />
                                        : <FileOutlined />
                                }
                                options={fileOptions}
                            />
                        </Flex>
                    )}
                </Flex>

                {isRepoLevel && selectedRepo && !showGuideWarning && (
                    <Flex align="center" gap={6} className="documentation__repo-level-info">
                        <GithubOutlined className="documentation__full-repo-icon" />
                        <Text className="documentation__full-repo-label">
                            {t('documentation.repoLevelInfo', { repo: selectedRepo })}
                        </Text>
                    </Flex>
                )}

                {showGuideWarning && (
                    <Alert
                        type="warning"
                        showIcon
                        message={t('documentation.guideWarning')}
                        className="documentation__guide-warning"
                    />
                )}

                <Button
                    type="primary"
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={isGenerateDisabled}
                    className="documentation__generate-btn"
                >
                    {t('documentation.generate')}
                </Button>

                {result && !loading && (
                    <Flex gap={16} className="documentation__stretch-row">
                        <Flex vertical gap={8} className="documentation__preview-col">
                            <Flex align="center" justify="space-between" className="documentation__preview-head">
                                <Text className="documentation__section-label">{t('documentation.preview')}</Text>
                                <Flex gap={6}>
                                    <Button
                                        size="small"
                                        type={view === 'preview' ? 'primary' : 'default'}
                                        onClick={() => setView('preview')}
                                        className={`documentation__view-btn ${view === 'preview' ? 'documentation__view-btn--active' : ''}`}
                                    >
                                        {t('documentation.previewBtn')}
                                    </Button>
                                    <Button
                                        size="small"
                                        type={view === 'markdown' ? 'primary' : 'default'}
                                        onClick={() => setView('markdown')}
                                        className={`documentation__view-btn ${view === 'markdown' ? 'documentation__view-btn--active' : ''}`}
                                    >
                                        {t('documentation.markdownBtn')}
                                    </Button>
                                </Flex>
                            </Flex>

                            <Card size="small" className="documentation__preview-card">
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={handleCopy}
                                    className="documentation__copy-btn"
                                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                                />
                                {view === 'preview' ? (
                                    <Flex vertical gap={12}>
                                        <div>
                                            <Text className="documentation__file-title">{result?.fileName}</Text>
                                            <Text type="secondary" className="documentation__file-desc">
                                                {result?.description}
                                            </Text>
                                        </div>
                                        {result?.methods?.length > 0 ? (
                                            <div>
                                                <Text className="documentation__methods-label">{t('documentation.methods')}</Text>
                                                <Flex vertical gap={6}>
                                                    {result?.methods?.map((item: any) => (
                                                        <div key={item?.name} className="documentation__method-item">
                                                            <Flex align="center" gap={8} className="documentation__method-header">
                                                                <Text code className="documentation__method-name">{item?.name}</Text>
                                                                <Text type="secondary" className="documentation__method-params">
                                                                    ({item?.params})
                                                                </Text>
                                                                <Text className="documentation__method-returns">
                                                                    → {item?.returns}
                                                                </Text>
                                                            </Flex>
                                                            <Text type="secondary" className="documentation__method-desc">
                                                                {item?.description}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Flex>
                                            </div>
                                        ) : (
                                            <pre className="documentation__markdown">{result?.markdown}</pre>
                                        )}
                                    </Flex>
                                ) : (
                                    <pre className="documentation__markdown">{result?.markdown}</pre>
                                )}
                            </Card>

                            <Button
                                type="primary"
                                className="documentation__export-btn"
                                onClick={handleExport}
                                disabled={!result?.markdown}
                            >
                                {t('documentation.exportMarkdown')}
                            </Button>
                        </Flex>

                        <Flex vertical gap={8} className="documentation__side-col">
                            <Text className="documentation__section-label">{t('documentation.history')}</Text>
                            <div className="documentation__history-scroll">
                                {renderHistory()}
                            </div>
                        </Flex>
                    </Flex>
                )}

                {selectedRepo && !result && !loading && (
                    <Flex vertical gap={8}>
                        <Text className="documentation__section-label">{t('documentation.history')}</Text>
                        <div className="documentation__history-scroll">
                            {renderHistory()}
                        </div>
                    </Flex>
                )}
            </Flex>
        </div>
    )
}

export default withLayout(<Documentation />)