import { useEffect, useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Select, Spin, Avatar } from 'antd'
import { GithubOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text } = Typography

const DOC_TYPES = [
    { value: 'function', label: 'Function docs' },
    { value: 'readme', label: 'README' },
    { value: 'api', label: 'API reference' },
    { value: 'onboard', label: 'Onboarding' },
    { value: 'guide', label: 'User guide' },
    { value: 'arch', label: 'Architecture' },
    { value: 'changelog', label: 'Changelog' },
]

const MOCK_RESULT = {
    fileName: 'auth_service.py',
    description: 'Handles user authentication and session management using JWT-based stateless auth pattern.',
    methods: [
        { name: 'login', params: 'email: str, password: str', returns: 'str', description: 'Authenticates user with email and password, returns JWT token on success.' },
        { name: 'logout', params: 'token: str', returns: 'None', description: 'Adds token to blacklist and terminates the session.' },
        { name: 'refresh', params: 'token: str', returns: 'str', description: 'Renews a token that is about to expire.' },
        { name: 'verify', params: 'token: str', returns: 'dict', description: 'Validates token and returns payload.' },
    ],
    markdown: `# AuthService\n\nHandles user authentication and session management.\n\n## Methods\n\n### login(email, password)\nAuthenticates user, returns JWT token.\n\n**Params:** email: str, password: str\n**Returns:** str (JWT token)\n\n### logout(token)\nAdds token to blacklist.\n\n**Params:** token: str\n**Returns:** None`,
}

const MOCK_HISTORY = [
    { target: 'auth_service.py', docType: 'function', timeAgo: '15 dk önce' },
    { target: 'user_controller.py', docType: 'api', timeAgo: '1 saat önce' },
    { target: 'Full repo', docType: 'readme', timeAgo: '1 gün önce' },
]

const Documentation = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [docType, setDocType] = useState('function')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [view, setView] = useState<'preview' | 'markdown'>('preview')

    const token = localStorage.getItem('dt-token') || ''

    useEffect(() => {
        const fetchRepos = async () => {
            const { data, error } = await api.login.getRepos(token)
            if (error) { toast.error(error); return }
            setRepos(data)
        }
        fetchRepos()
    }, [])

    const handleRepoSelect = (value: string) => {
        setSelectedRepo(value)
        setResult(null)
        setInput('')
        setHistory([])
        // TODO: fetchHistory(owner, repo)
    }

    const handleGenerate = async () => {
        if (!input.trim() || !selectedRepo) return
        setLoading(true)
        setResult(null)

        // TODO: API CALL
        // const [owner, repo] = selectedRepo.split('/')
        // const { data, error } = await api.agents.documentation(token, owner, repo, input, docType)
        // if (error) { toast.error(error); setLoading(false); return }
        // setResult(data)

        await new Promise((r) => setTimeout(r, 800))
        setResult(MOCK_RESULT)
        setLoading(false)
    }

    const handleHistoryClick = (item: any) => {
        setInput(item.target)
        setDocType(item.docType)
    }

    return (
        <div className="documentation">

            {/* Header */}
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

            {/* Body */}
            <Flex vertical gap={16} className="documentation__body">

                {/* Repo */}
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

                {/* Input */}
                <Flex vertical gap={6}>
                    <Text className="documentation__section-label">TARGET</Text>
                    <Flex gap={8}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleGenerate}
                            placeholder={
                                !selectedRepo
                                    ? 'Select a repo first...'
                                    : 'Enter file name or function... (e.g. auth_service.py)'
                            }
                            disabled={!selectedRepo}
                            className="documentation__input"
                        />
                        <Select
                            value={docType}
                            onChange={setDocType}
                            disabled={!selectedRepo}
                            className="documentation__type-select"
                            options={DOC_TYPES}
                        />

                    </Flex>
                </Flex>

                <Button
                    type="primary"
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={!selectedRepo || !input.trim()}
                    className="documentation__generate-btn"
                >
                    Generate
                </Button>

                {loading && (
                    <Flex justify="center" className="documentation__spin-wrap">
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                    </Flex>
                )}

                {result && !loading && (
                    <Flex gap={16} className="documentation__stretch-row">

                        {/* Preview */}
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
                                        <div>
                                            <Text className="documentation__methods-label">Methods</Text>
                                            <Flex vertical gap={6}>
                                                {result.methods?.map((item: any) => (
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
                                    </Flex>
                                ) : (
                                    <pre className="documentation__markdown">{result.markdown}</pre>
                                )}
                            </Card>

                            <Flex gap={8}>
                                <Button type="primary" className="documentation__export-btn">
                                    Export as Markdown
                                </Button>
                                <Button className="documentation__repo-btn">
                                    Document full repo
                                </Button>
                            </Flex>
                        </Flex>

                        {/* File Status + History */}
                        <Flex vertical gap={16} className="documentation__side-col">

                            <Flex vertical gap={8}>
                                <Text className="documentation__section-label">FILE STATUS</Text>
                                <div className="documentation__file-status-scroll">
                                    <List
                                        dataSource={MOCK_RESULT.methods}
                                        split
                                        renderItem={(item: any) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="center" justify="space-between" className="documentation__file-status-item">
                                                    <Flex align="center" gap={8}>
                                                        <Avatar
                                                            icon={<FileOutlined />}
                                                            className="documentation__file-avatar"
                                                            size={24}
                                                        />
                                                        <Text code className="documentation__file-code">{item.name}</Text>
                                                    </Flex>
                                                    <Tag className="documentation__tag--done">Done</Tag>
                                                </Flex>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Flex>

                            <Flex vertical gap={8}>
                                <Text className="documentation__section-label">HISTORY</Text>
                                <div className="documentation__history-scroll">
                                    <List
                                        dataSource={history.length > 0 ? history : MOCK_HISTORY}
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
                                                            {DOC_TYPES.find(d => d.value === item.docType)?.label ?? item.docType} · {item.timeAgo}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Flex>

                        </Flex>
                    </Flex>
                )}

                {/* History — repo seçilince her zaman görünür */}
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
                                                    {DOC_TYPES.find(d => d.value === item.docType)?.label ?? item.docType} · {item.timeAgo}
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