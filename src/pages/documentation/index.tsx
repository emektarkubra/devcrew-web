import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Select, Spin, Tooltip } from 'antd'
import { GithubOutlined, LoadingOutlined, FileOutlined, InfoCircleOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text } = Typography

const DOC_TYPES = [
    { value: 'function', label: 'Function docs', tooltip: 'Generates detailed documentation for functions and classes with params, returns, and usage examples.' },
    { value: 'readme', label: 'README', tooltip: 'Generates a full README.md with installation steps, usage guide, and architecture overview for the entire repo.' },
    { value: 'api', label: 'API reference', tooltip: 'Generates API reference documentation listing all endpoints, request params, and response formats.' },
    { value: 'onboard', label: 'Onboarding', tooltip: 'Generates an onboarding guide to help new developers quickly understand and set up the project.' },
    { value: 'guide', label: 'User guide', tooltip: 'Generates a user-facing guide explaining how to use the application or library.' },
    { value: 'arch', label: 'Architecture', tooltip: 'Generates an architecture document explaining system design, components, and their relationships.' },
    { value: 'changelog', label: 'Changelog', tooltip: 'Generates a changelog summarizing recent code changes and their impact.' },
]

const REPO_LEVEL_TYPES = ['readme', 'arch', 'onboard', 'changelog']

const Documentation = () => {
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

    const token = localStorage.getItem('dt-token') || ''
    const isRepoLevel = REPO_LEVEL_TYPES?.includes(docType)

    // get repo list
    const getRepos = async () => {
        const { data, error } = await api.profile.getRepos(token)
        if (error) {
            toast.error(error);
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
            toast.error(error);
        } else {
            setHistory(data)
        }
    }

    // repo select
    const handleRepoSelect = async (value: string) => {

        try {
            setSelectedRepo(value)
            setSelectedFile(null)
            setResult(null)
            setRepoFiles([])
            setHistory([])

            const [owner, repo] = value.split('/')

            setFilesLoading(true)

            const { data, error } = await api.agents.repoFiles(token, owner, repo)
            if (error) {
                toast.error(error);
                setFilesLoading(false);
            } else {
                setRepoFiles(data.files ?? [])
                await getHistory(owner, repo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setFilesLoading(false)
        }
    }

    // onchange doc types
    const handleDocTypeChange = (value: string) => {
        setDocType(value)
        if (REPO_LEVEL_TYPES.includes(value)) {
            setSelectedFile(selectedRepo)
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
            const target = selectedFile === selectedRepo ? selectedRepo : selectedFile!

            const { data, error } = await api.agents.documentation(token, owner, repo, target, docType)
            if (error) {
                toast.error(error);
                setLoading(false);
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

    // history click
    const handleHistoryClick = (item: any) => {
        setSelectedFile(item.target)
        setDocType(item.docType)
        setResult({
            fileName: item.target,
            description: item.description,
            markdown: item.content,
            methods: [],
        })
    }


    const fileOptions = selectedRepo ? [
        {
            value: selectedRepo,
            label: (
                <Flex align="center" gap={8}>
                    <GithubOutlined style={{ fontSize: 12, color: '#8250df' }} />
                    <Text style={{ color: '#8250df' }}>Full repo</Text>
                </Flex>
            ),
        },
        ...repoFiles.map((f) => ({
            value: f,
            label: (
                <Flex align="center" gap={8}>
                    <FileOutlined style={{ fontSize: 12, color: '#8c959f' }} />
                    <span>{f}</span>
                </Flex>
            ),
        })),
    ] : []

    return (
        <div className="documentation">

            <Flex align="center" justify="space-between" className="documentation__header">
                <Flex align="center" gap={10}>
                    <div className={`documentation__dot documentation__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="documentation__title">Documentation Agent</Text>
                        <Text type="secondary" className="documentation__subtitle">
                            {selectedRepo ?? 'Select a repo to generate documentation'}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className="documentation__tag--ready">Generated</Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="documentation__body">
                <Flex vertical gap={6}>
                    <Text className="documentation__section-label">REPO</Text>
                    <Select
                        className="documentation__select"
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
                                    </Flex>
                                    {r.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="documentation__lang-dot"
                                                style={{ background: getLanguageColor(r.language) }}
                                            />
                                            <Text className="documentation__lang-text">{r.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Flex align="center" gap={6}>
                        <Text className="documentation__section-label">DOC TYPE</Text>

                    </Flex>
                    <Select
                        value={docType}
                        onChange={handleDocTypeChange}
                        disabled={!selectedRepo}
                        className="documentation__select"
                        options={DOC_TYPES.map((d) => ({
                            value: d.value,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <span>{d.label}</span>
                                    <Tooltip title={d.tooltip} placement="right">
                                        <InfoCircleOutlined className="documentation__info-icon" />
                                    </Tooltip>
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex vertical gap={6}>
                    <Text className="documentation__section-label">TARGET</Text>
                    <Select
                        className="documentation__select"
                        placeholder={
                            !selectedRepo
                                ? 'Select a repo first...'
                                : filesLoading
                                    ? 'Loading files...'
                                    : 'Select a file or full repo...'
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

                <Button
                    type="primary"
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={!selectedRepo || !selectedFile}
                    className="documentation__generate-btn"
                    style={{ alignSelf: 'flex-start' }}
                >
                    Generate
                </Button>

                {result && !loading && (
                    <Flex gap={16} className="documentation__stretch-row">

                        <Flex vertical gap={8} className="documentation__preview-col">
                            <Flex align="center" justify="space-between">
                                <Text className="documentation__section-label">PREVIEW</Text>
                                <Flex gap={6}>
                                    <Button
                                        size="small"
                                        type={view === 'preview' ? 'primary' : 'default'}
                                        onClick={() => setView('preview')}
                                        className={`documentation__view-btn ${view === 'preview' ? 'documentation__view-btn--active' : ''}`}
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        size="small"
                                        type={view === 'markdown' ? 'primary' : 'default'}
                                        onClick={() => setView('markdown')}
                                        className={`documentation__view-btn ${view === 'markdown' ? 'documentation__view-btn--active' : ''}`}
                                    >
                                        Markdown
                                    </Button>
                                </Flex>
                            </Flex>

                            <Card size="small" className="documentation__preview-card">
                                {view === 'preview' ? (
                                    <Flex vertical gap={12}>
                                        <div>
                                            <Text className="documentation__file-title">{result.fileName}</Text>
                                            <Text type="secondary" className="documentation__file-desc">
                                                {result.description}
                                            </Text>
                                        </div>
                                        {result.methods?.length > 0 ? (
                                            <div>
                                                <Text className="documentation__methods-label">Methods</Text>
                                                <Flex vertical gap={6}>
                                                    {result.methods.map((item: any) => (
                                                        <div key={item.name} className="documentation__method-item">
                                                            <Flex align="center" gap={8} className="documentation__method-header">
                                                                <Text code className="documentation__method-name">{item.name}</Text>
                                                                <Text type="secondary" className="documentation__method-params">
                                                                    ({item.params})
                                                                </Text>
                                                                <Text className="documentation__method-returns">
                                                                    → {item.returns}
                                                                </Text>
                                                            </Flex>
                                                            <Text type="secondary" className="documentation__method-desc">
                                                                {item.description}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Flex>
                                            </div>
                                        ) : (
                                            <pre className="documentation__markdown">{result.markdown}</pre>
                                        )}
                                    </Flex>
                                ) : (
                                    <pre className="documentation__markdown">{result.markdown}</pre>
                                )}
                            </Card>

                            <Flex gap={8}>
                                <Button type="primary" className="documentation__export-btn">
                                    Export as Markdown
                                </Button>
                            </Flex>
                        </Flex>

                        <Flex vertical gap={8} className="documentation__side-col">
                            <Text className="documentation__section-label">HISTORY</Text>
                            <div className="documentation__history-scroll">
                                <List
                                    dataSource={history}
                                    split
                                    locale={{ emptyText: 'No documentation history yet' }}
                                    renderItem={(item: any) => (
                                        <List.Item style={{ padding: 0 }}>
                                            <Flex
                                                align="flex-start"
                                                gap={10}
                                                className="documentation__history-item"
                                                onClick={() => handleHistoryClick(item)}
                                            >
                                                <div className="documentation__history-dot" />
                                                <Flex vertical gap={2}>
                                                    <Text code className="documentation__history-file">{item.target}</Text>
                                                    <Text type="secondary" className="documentation__history-meta">
                                                        {DOC_TYPES.find(d => d.value === item.docType)?.label ?? item.docType} · {timeAgo(item.timeAgo)}
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

                {selectedRepo && !result && !loading && (
                    <Flex vertical gap={8}>
                        <Text className="documentation__section-label">HISTORY</Text>
                        <div className="documentation__history-scroll">
                            <List
                                dataSource={history}
                                split
                                locale={{ emptyText: 'No documentation history yet' }}
                                renderItem={(item: any) => (
                                    <List.Item style={{ padding: 0 }}>
                                        <Flex
                                            align="flex-start"
                                            gap={10}
                                            className="documentation__history-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="documentation__history-dot" />
                                            <Flex vertical gap={2}>
                                                <Text code className="documentation__history-file">{item.target}</Text>
                                                <Text type="secondary" className="documentation__history-meta">
                                                    {DOC_TYPES.find(d => d.value === item.docType)?.label ?? item.docType} · {timeAgo(item.timeAgo)}
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

export default withLayout(<Documentation />)