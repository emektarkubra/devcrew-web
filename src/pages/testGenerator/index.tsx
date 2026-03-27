import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Select, Spin } from 'antd'
import { GithubOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import './index.scss'

const { Text } = Typography

const testFrameworks = [
    { value: 'pytest', label: 'pytest' },
    { value: 'jest', label: 'Jest' },
    { value: 'unittest', label: 'unittest' },
    { value: 'vitest', label: 'Vitest' },
    { value: 'mocha', label: 'Mocha' },
]

const typeConfig: Record<string, { color: string; label: string }> = {
    unit: { color: 'blue', label: 'unit' },
    integration: { color: 'purple', label: 'integration' },
    edge: { color: 'orange', label: 'edge case' },
}

const TestGenerator = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [repoFiles, setRepoFiles] = useState<string[]>([])
    const [filesLoading, setFilesLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [framework, setFramework] = useState('pytest')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [expanded, setExpanded] = useState<string | null>(null)
    const [filterType, setFilterType] = useState('all')

    const token = localStorage.getItem('dt-token') || ''

    // get repo list
    const getRepos = async () => {
        const { data, error } = await api.login.getRepos(token)
        if (error) {
            toast.error(error);
        } else {
            setRepos(data)
        }
    }


    useEffect(() => {
        getRepos()
    }, [])

    // history list
    const getHistoryList = async (owner: string, repo: string) => {
        const { data, error } = await api.agents.testHistory(token, owner, repo)
        if (error) {
            toast.error(error)
        } else {
            setHistory(data)
        }
    }

    // repo select
    const handleRepoSelect = async (value: string) => {
        setSelectedRepo(value)
        setSelectedFile(null)
        setResult(null)
        setRepoFiles([])
        setHistory([])

        const [owner, repo] = value.split('/')

        try {
            setFilesLoading(true)
            const { data, error } = await api.agents.repoFiles(token, owner, repo)
            if (error) {
                toast.error(error);
                setFilesLoading(false);
            } else {
                setRepoFiles(data.files ?? [])
                await getHistoryList(owner, repo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setFilesLoading(false)
        }
    }

    // generate tests
    const handleGenerateTest = async () => {
        if (!selectedFile || !selectedRepo) return
        setLoading(true)
        setResult(null)

        try {
            const [owner, repo] = selectedRepo.split('/')

            const { data, error } = await api.agents.generateTests(token, owner, repo, selectedFile, framework)
            if (error) {
                toast.error(error)
                setLoading(false)
                return
            } else {
                setResult(data)
                await getHistoryList(owner, repo)
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
        setFramework(item.framework ?? 'pytest')
        setResult({
            totalTests: item.testCount,
            coverage: item.coverage,
            unitCount: item.tests?.filter((t: any) => t.type === 'unit').length ?? 0,
            edgeCount: item.tests?.filter((t: any) => t.type === 'edge').length ?? 0,
            integrationCount: item.tests?.filter((t: any) => t.type === 'integration').length ?? 0,
            tests: item.tests ?? [],
        })
    }

    const filteredTests = result?.tests?.filter(
        (item: any) => filterType === 'all' || item.type === filterType
    ) ?? []

    return (
        <div className="test-generator">

            <Flex align="center" justify="space-between" className="test-generator__header">
                <Flex align="center" gap={10}>
                    <div className={`test-generator__dot test-generator__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="test-generator__title">Test Generator</Text>
                        <Text type="secondary" className="test-generator__subtitle">
                            {selectedRepo ?? 'Select a repo to generate tests'}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className="test-generator__tag--ready">{result.totalTests} tests generated</Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="test-generator__body">
                <Flex vertical gap={6}>
                    <Text className="test-generator__section-label">REPO</Text>
                    <Select
                        className="test-generator__select"
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
                                                className="test-generator__lang-dot"
                                                style={{ background: getLanguageColor(r.language) }}
                                            />
                                            <Text className="test-generator__lang-text">{r.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex gap={8}>
                    <Flex vertical gap={6} style={{ flex: 1 }}>
                        <Text className="test-generator__section-label">TARGET FILE</Text>
                        <Select
                            className="test-generator__select"
                            placeholder={
                                !selectedRepo
                                    ? 'Select a repo first...'
                                    : filesLoading
                                        ? 'Loading files...'
                                        : 'Select a file...'
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
                            options={repoFiles.map((f) => ({
                                value: f,
                                label: (
                                    <Flex align="center" gap={8}>
                                        <FileOutlined style={{ fontSize: 12, color: '#8c959f' }} />
                                        <span>{f}</span>
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>

                    <Flex vertical gap={6}>
                        <Text className="test-generator__section-label">FRAMEWORK</Text>
                        <Select
                            value={framework}
                            onChange={setFramework}
                            disabled={!selectedRepo}
                            className="test-generator__framework-select"
                            options={testFrameworks}
                        />
                    </Flex>
                </Flex>

                <Button
                    type="primary"
                    onClick={handleGenerateTest}
                    loading={loading}
                    disabled={!selectedFile}
                    className="test-generator__generate-btn"
                    style={{ alignSelf: 'flex-start' }}
                >
                    Generate Tests
                </Button>

                {loading && (
                    <Flex justify="center" className="test-generator__spin-wrap">
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                    </Flex>
                )}

                {result && !loading && (
                    <>
                        <Flex gap={10} className="test-generator__score-cards">
                            <Card size="small" className="test-generator__card-green">
                                <Text className="test-generator__card-label">Total tests</Text>
                                <Text className="test-generator__stat-value-green">{result.totalTests}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-green">
                                <Text className="test-generator__card-label">Est. coverage</Text>
                                <Text className="test-generator__stat-value-green">%{result.coverage}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">Unit</Text>
                                <Text className="test-generator__stat-value">{result.unitCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">Edge case</Text>
                                <Text className="test-generator__stat-value">{result.edgeCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">Integration</Text>
                                <Text className="test-generator__stat-value">{result.integrationCount}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} className="test-generator__stretch-row">

                            <Flex vertical gap={8} className="test-generator__tests-col">
                                <Flex align="center" justify="space-between">
                                    <Text className="test-generator__section-label">TESTS</Text>
                                    <Select
                                        value={filterType}
                                        onChange={setFilterType}
                                        size="small"
                                        className="test-generator__filter-select"
                                        options={[
                                            { value: 'all', label: 'All' },
                                            { value: 'unit', label: 'Unit' },
                                            { value: 'edge', label: 'Edge case' },
                                            { value: 'integration', label: 'Integration' },
                                        ]}
                                    />
                                </Flex>

                                <div className="test-generator__tests-scroll">
                                    {filteredTests.map((item: any) => (
                                        <div key={item.name} className="test-generator__test-item">
                                            <Flex
                                                align="center"
                                                justify="space-between"
                                                className={`test-generator__test-header ${expanded === item.name ? 'test-generator__test-header--expanded' : ''}`}
                                                onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                                            >
                                                <Flex align="center" gap={8}>
                                                    <Tag color={typeConfig[item.type]?.color} style={{ margin: 0 }}>
                                                        {typeConfig[item.type]?.label}
                                                    </Tag>
                                                    <Text code className="test-generator__test-name">{item.name}</Text>
                                                </Flex>
                                                <Text type="secondary" className="test-generator__test-chevron">
                                                    {expanded === item.name ? '▲' : '▼'}
                                                </Text>
                                            </Flex>
                                            {expanded === item.name && (
                                                <div className="test-generator__test-body">
                                                    <Text type="secondary" className="test-generator__test-description">
                                                        {item.description}
                                                    </Text>
                                                    <pre className="test-generator__test-code">{item.code}</pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Flex gap={8}>
                                    <Button type="primary" className="test-generator__save-btn">
                                        Save to tests/
                                    </Button>
                                    <Button className="test-generator__run-btn">
                                        Run tests
                                    </Button>
                                </Flex>
                            </Flex>

                            <Flex vertical gap={4} className="test-generator__history-col">
                                <Text className="test-generator__section-label">HISTORY</Text>
                                <div className="test-generator__history-scroll">
                                    <List
                                        dataSource={history}
                                        split
                                        locale={{ emptyText: 'No test history yet' }}
                                        renderItem={(item: any) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex
                                                    align="flex-start"
                                                    gap={10}
                                                    className="test-generator__history-item"
                                                    onClick={() => handleHistoryClick(item)}
                                                >
                                                    <div className="test-generator__history-dot" />
                                                    <Flex vertical gap={2}>
                                                        <Text code className="test-generator__history-file">{item.target}</Text>
                                                        <Text type="secondary" className="test-generator__history-meta">
                                                            {item.testCount} tests · %{item.coverage} · {timeAgo(item.timeAgo)}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Flex>

                        </Flex>
                    </>
                )}

                {selectedRepo && !result && !loading && (
                    <Flex vertical gap={4}>
                        <Text className="test-generator__section-label">HISTORY</Text>
                        <div className="test-generator__history-scroll">
                            <List
                                dataSource={history}
                                split
                                locale={{ emptyText: 'No test history yet' }}
                                renderItem={(item: any) => (
                                    <List.Item style={{ padding: 0 }}>
                                        <Flex
                                            align="flex-start"
                                            gap={10}
                                            className="test-generator__history-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="test-generator__history-dot" />
                                            <Flex vertical gap={2}>
                                                <Text code className="test-generator__history-file">{item.target}</Text>
                                                <Text type="secondary" className="test-generator__history-meta">
                                                    {item.testCount} tests · %{item.coverage} · {timeAgo(item.timeAgo)}
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

export default withLayout(<TestGenerator />)