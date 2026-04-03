import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, List, Select, Spin } from 'antd'
import { GithubOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { timeAgo } from '../../utils/timeAgo'
import { getLanguageColor } from '../../utils/languageColors'
import RunTestsModal from './components/RunTestsModal'
import './index.scss'

const { Text } = Typography

const frameworksByExtension: Record<string, string[]> = {
    '.tsx': ['jest', 'vitest'],
    '.ts': ['jest', 'vitest'],
    '.jsx': ['jest', 'vitest', 'mocha'],
    '.js': ['jest', 'vitest', 'mocha'],
    '.py': ['pytest', 'unittest'],
}

const allFrameworks = [
    { value: 'pytest', label: 'pytest' },
    { value: 'jest', label: 'Jest' },
    { value: 'unittest', label: 'unittest' },
    { value: 'vitest', label: 'Vitest' },
    { value: 'mocha', label: 'Mocha' },
]

const getFrameworksForFile = (file: string) => {
    const ext = Object.keys(frameworksByExtension).find(e => file.endsWith(e))
    if (!ext) return allFrameworks
    return allFrameworks.filter(f => frameworksByExtension[ext].includes(f.value))
}

const getDefaultFramework = (file: string): string => {
    return getFrameworksForFile(file)[0]?.value ?? 'jest'
}

const TestGenerator = () => {
    const { t } = useTranslation()



    const [repos, setRepos] = useState<any[]>([])
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [repoFiles, setRepoFiles] = useState<string[]>([])
    const [filesLoading, setFilesLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [framework, setFramework] = useState('jest')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [expanded, setExpanded] = useState<string | null>(null)
    const [filterType, setFilterType] = useState('all')
    const [runTestsModalOpen, setRunTestsModalOpen] = useState(false)

    const token = localStorage.getItem('dt-token') || ''


    const typeConfig: Record<string, { color: string; label: string; className: string }> = {
        unit: {
            color: 'blue',
            label: t('testGenerator.unitLabel'),
            className: 'test-generator__type-tag--unit',
        },
        integration: {
            color: 'purple',
            label: t('testGenerator.integrationLabel'),
            className: 'test-generator__type-tag--integration',
        },
        edge: {
            color: 'orange',
            label: t('testGenerator.edgeLabel'),
            className: 'test-generator__type-tag--edge',
        },
    }

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
        setFramework('jest')

        const [owner, repo] = value.split('/')
        try {
            setFilesLoading(true)
            const { data, error } = await api.agents.repoFiles(token, owner, repo)
            if (error) { toast.error(error) } else {
                setRepoFiles(data?.files ?? [])
                await getHistoryList(owner, repo)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFilesLoading(false)
        }
    }

    // file select
    const handleFileSelect = (file: string) => {
        setSelectedFile(file)
        setFramework(getDefaultFramework(file))
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
            } else {
                setResult(data)
                await getHistoryList(owner, repo)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // history click
    const handleHistoryClick = (item: any) => {
        setSelectedFile(item.target)
        setFramework(item.framework ?? 'jest')
        setResult({
            totalTests: item.testCount,
            coverage: item.coverage,
            unitCount: item.tests?.filter((t: any) => t?.type === 'unit').length ?? 0,
            edgeCount: item.tests?.filter((t: any) => t?.type === 'edge').length ?? 0,
            integrationCount: item.tests?.filter((t: any) => t?.type === 'integration').length ?? 0,
            tests: item.tests ?? [],
            mergedCode: item.mergedCode ?? '',
        })
    }

    // save tests
    const handleSaveTests = () => {
        if (!result?.mergedCode || !selectedFile) return

        const ext = selectedFile?.split('.').pop() ?? 'tsx'
        const baseName = selectedFile?.split('/').pop()?.replace(`.${ext}`, '') ?? 'test'
        const filename = `${baseName}.test.${ext}`


        const blob = new Blob([result?.mergedCode], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const filteredTests = useMemo(
        () => result?.tests?.filter((item: any) => filterType === 'all' || item.type === filterType) ?? [],
        [result?.tests, filterType]
    )

    const availableFrameworks = selectedFile ? getFrameworksForFile(selectedFile) : allFrameworks

    const renderHistory = () => (
        <List
            dataSource={history}
            split
            locale={{ emptyText: t('testGenerator.noTestHistory') }}
            renderItem={(item: any) => (
                <List.Item className="test-generator__history-list-item">
                    <Flex
                        align="flex-start"
                        gap={10}
                        className="test-generator__history-item"
                        onClick={() => handleHistoryClick(item)}
                    >
                        <div className="test-generator__history-dot" />
                        <Flex vertical gap={2} className="test-generator__history-content">
                            <Text code className="test-generator__history-file">
                                {item?.target}
                            </Text>
                            <Text type="secondary" className="test-generator__history-meta">
                                {t('testGenerator.historyMeta', {
                                    count: item?.testCount,
                                    coverage: item?.coverage,
                                    time: timeAgo(item.timeAgo),
                                })}
                            </Text>
                        </Flex>
                    </Flex>
                </List.Item>
            )}
        />
    )

    return (
        <div className="test-generator">
            <Flex align="center" justify="space-between" className="test-generator__header">
                <Flex align="center" gap={10}>
                    <div className={`test-generator__dot test-generator__dot--${result ? 'ready' : selectedRepo ? 'active' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="test-generator__title">
                            {t('testGenerator.title')}
                        </Text>
                        <Text type="secondary" className="test-generator__subtitle">
                            {selectedRepo ?? t('testGenerator.subtitle')}
                        </Text>
                    </Flex>
                </Flex>
                {result && (
                    <Tag className="test-generator__tag--ready">
                        {t('testGenerator.testsGenerated', { count: result?.totalTests })}
                    </Tag>
                )}
            </Flex>

            <Flex vertical gap={16} className="test-generator__body">

                <Flex vertical gap={6}>
                    <Text className="test-generator__section-label">{t('testGenerator.repo')}</Text>
                    <Select
                        className="test-generator__select"
                        placeholder={
                            <Flex align="center" gap={8}>
                                <GithubOutlined />
                                <span>{t('testGenerator.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={handleRepoSelect}
                        showSearch
                        options={repos?.map((repo) => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between" className="test-generator__repo-option">
                                    <Flex align="center" gap={8} className="test-generator__repo-option-left">
                                        <GithubOutlined />
                                        <span className="test-generator__repo-name">{repo?.full_name}</span>
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4} className="test-generator__repo-option-right">
                                            <div
                                                className="test-generator__lang-dot"
                                                style={{ background: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="test-generator__lang-text">{repo?.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                </Flex>

                <Flex gap={8} className="test-generator__controls-row">
                    <Flex vertical gap={6} className="test-generator__target-col">
                        <Text className="test-generator__section-label">
                            {t('testGenerator.targetFile')}
                        </Text>
                        <Select
                            className="test-generator__select"
                            placeholder={
                                !selectedRepo
                                    ? t('testGenerator.selectRepoFirst')
                                    : filesLoading
                                        ? t('testGenerator.loadingFiles')
                                        : t('testGenerator.selectFile')
                            }
                            value={selectedFile}
                            onChange={handleFileSelect}
                            disabled={!selectedRepo || filesLoading}
                            loading={filesLoading}
                            showSearch
                            suffixIcon={
                                filesLoading
                                    ? <Spin indicator={<LoadingOutlined spin />} size="small" />
                                    : <FileOutlined className="test-generator__file-icon" />
                            }
                            options={repoFiles?.map((file) => ({
                                value: file,
                                label: (
                                    <Flex align="center" gap={8}>
                                        <FileOutlined className="test-generator__file-icon" />
                                        <span>{file}</span>
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>

                    <Flex vertical gap={6} className="test-generator__framework-col">
                        <Text className="test-generator__section-label">
                            {t('testGenerator.framework')}
                        </Text>
                        <Select
                            value={framework}
                            onChange={setFramework}
                            disabled={!selectedRepo}
                            className="test-generator__framework-select"
                            options={availableFrameworks}
                        />
                    </Flex>
                </Flex>

                <Button
                    type="primary"
                    onClick={handleGenerateTest}
                    loading={loading}
                    disabled={!selectedFile}
                    className="test-generator__generate-btn"
                >
                    {t('testGenerator.generateTests')}
                </Button>

                {result && !loading && (
                    <>
                        <Flex gap={10} className="test-generator__score-cards">
                            <Card size="small" className="test-generator__card-green">
                                <Text className="test-generator__card-label">{t('testGenerator.totalTests')}</Text>
                                <Text className="test-generator__stat-value-green">{result?.totalTests}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-green">
                                <Text className="test-generator__card-label">{t('testGenerator.estimatedCoverage')}</Text>
                                <Text className="test-generator__stat-value-green">%{result?.coverage}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">{t('testGenerator.unit')}</Text>
                                <Text className="test-generator__stat-value">{result?.unitCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">{t('testGenerator.edgeCase')}</Text>
                                <Text className="test-generator__stat-value">{result?.edgeCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text className="test-generator__card-label">{t('testGenerator.integration')}</Text>
                                <Text className="test-generator__stat-value">{result?.integrationCount}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} className="test-generator__stretch-row">
                            <Flex vertical gap={8} className="test-generator__tests-col">
                                <Flex align="center" justify="space-between" className="test-generator__tests-head">
                                    <Text className="test-generator__section-label">
                                        {t('testGenerator.tests')}
                                    </Text>
                                    <Select
                                        value={filterType}
                                        onChange={setFilterType}
                                        size="small"
                                        className="test-generator__filter-select"
                                        options={[
                                            { value: 'all', label: t('testGenerator.all') },
                                            { value: 'unit', label: t('testGenerator.unit') },
                                            { value: 'edge', label: t('testGenerator.edgeCase') },
                                            { value: 'integration', label: t('testGenerator.integration') },
                                        ]}
                                    />
                                </Flex>

                                <div className="test-generator__tests-scroll">
                                    {filteredTests?.map((item: any) => (
                                        <div key={item.name} className="test-generator__test-item">
                                            <Flex
                                                align="center"
                                                justify="space-between"
                                                className={`test-generator__test-header ${expanded === item?.name ? 'test-generator__test-header--expanded' : ''}`}
                                                onClick={() => setExpanded(expanded === item?.name ? null : item?.name)}
                                            >
                                                <Flex align="center" gap={8} className="test-generator__test-header-left">
                                                    <Tag
                                                        color={typeConfig[item?.type]?.color}
                                                        className={`test-generator__type-tag ${typeConfig[item?.type]?.className ?? ''}`}
                                                    >
                                                        {typeConfig[item?.type]?.label}
                                                    </Tag>
                                                    <Text code className="test-generator__test-name">
                                                        {item?.name}
                                                    </Text>
                                                </Flex>
                                                <Text type="secondary" className="test-generator__test-chevron">
                                                    {expanded === item?.name ? '▲' : '▼'}
                                                </Text>
                                            </Flex>

                                            {expanded === item?.name && (
                                                <div className="test-generator__test-body">
                                                    <Text type="secondary" className="test-generator__test-description">
                                                        {item?.description}
                                                    </Text>
                                                    <pre className="test-generator__test-code">{item?.code}</pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Flex gap={8} className="test-generator__actions-row">
                                    <Button
                                        type="primary"
                                        className="test-generator__save-btn"
                                        disabled={!result?.mergedCode}
                                        onClick={handleSaveTests}
                                    >
                                        {t('testGenerator.saveToTests')}
                                    </Button>
                                    <Button
                                        className="test-generator__run-btn"
                                        disabled={!result?.tests?.length}
                                        onClick={() => setRunTestsModalOpen(true)}
                                    >
                                        {t('testGenerator.runTests')}
                                    </Button>
                                </Flex>
                            </Flex>

                            <Flex vertical gap={4} className="test-generator__history-col">
                                <Text className="test-generator__section-label">
                                    {t('testGenerator.history')}
                                </Text>
                                <div className="test-generator__history-scroll">
                                    {renderHistory()}
                                </div>
                            </Flex>
                        </Flex>
                    </>
                )}

                {selectedRepo && !result && !loading && (
                    <Flex vertical gap={4}>
                        <Text className="test-generator__section-label">
                            {t('testGenerator.history')}
                        </Text>
                        <div className="test-generator__history-scroll">
                            {renderHistory()}
                        </div>
                    </Flex>
                )}
            </Flex>

            <RunTestsModal
                open={runTestsModalOpen}
                onClose={() => setRunTestsModalOpen(false)}
                framework={framework}
                target={selectedFile ?? ''}
                mergedCode={result?.mergedCode ?? ''}
            />
        </div>
    )
}

export default withLayout(<TestGenerator />)