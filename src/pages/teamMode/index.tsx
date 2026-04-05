import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, Select, List, Tooltip, Collapse } from 'antd'
import { GithubOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import { getLanguageColor } from '../../utils/languageColors'
import { timeAgo } from '../../utils/timeAgo'
import toast from 'react-hot-toast'
import './index.scss'

const { Text } = Typography

const AGENTS = [
    { key: 'codebase', label: 'Codebase Analysis', tooltip: 'Analyzes codebase structure, dependencies, and code quality. Detects circular imports and anti-patterns.', color: '#0969da' },
    { key: 'pr_review', label: 'PR Review', tooltip: 'Reviews all open pull requests, checks for issues, missing tests, and suggests improvements.', color: '#8250df' },
    { key: 'test', label: 'Test Generator', tooltip: 'Generates unit, edge case, and integration tests for the most critical files in the repo.', color: '#1a7f37' },
    { key: 'documentation', label: 'Documentation', tooltip: 'Generates README, API reference, architecture overview, and onboarding guide.', color: '#bc4c00' },
]

const MOCK_HISTORY = [
    { repo: 'emektarkubra/devcrew-be', agents: ['codebase', 'pr_review', 'test', 'documentation'], score: 87, timeAgo: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { repo: 'emektarkubra/devcrew-web', agents: ['codebase', 'test'], score: 91, timeAgo: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { repo: 'emektarkubra/devcrew-be', agents: ['pr_review', 'documentation'], score: 78, timeAgo: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
]

const MOCK_OUTPUTS: Record<string, { summary: string; actions: string[] }> = {
    codebase: { summary: 'Well-organized FastAPI project · 2 circular imports detected · Code quality: 87/100', actions: ['Fix circular import between app/services/agents/ and app/core/', 'Add type hints to 3 functions in app/routes/agents.py'] },
    pr_review: { summary: '3 PRs analyzed · PR #12: missing error handling · PR #11: fix looks correct', actions: ['Add error handling to generate_tests() in PR #12', 'Add input validation for framework field in PR #12'] },
    test: { summary: '24 tests generated · 91% estimated coverage · 8 unit · 9 edge · 7 integration', actions: ['Run generated tests: pytest tests/generated/', 'Review edge cases for charge_customer() function'] },
    documentation: { summary: 'README · API reference · Architecture overview · Onboarding guide generated', actions: ['Review and publish generated README.md', 'Add environment variables section to onboarding guide'] },
}

type AgentStatus = 'idle' | 'running' | 'done' | 'waiting'

interface AgentState {
    status: AgentStatus
    output: { summary: string; actions: string[] } | null
    elapsed: number | null
}

const TeamMode = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [reposLoading, setReposLoading] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [running, setRunning] = useState(false)
    const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({})
    const [summary, setSummary] = useState<any>(null)
    const [history, setHistory] = useState(MOCK_HISTORY)

    const token = localStorage.getItem('dt-token') || ''

    const allDone = selectedAgents.length > 0 && selectedAgents.every(k => agentStates[k]?.status === 'done')
    const hasStarted = Object.keys(agentStates).length > 0

    useEffect(() => {
        const fetchRepos = async () => {
            setReposLoading(true)
            const { data, error } = await api.profile.getRepos(token)
            if (error) { toast.error(error); setReposLoading(false); return }
            setRepos(data)
            setReposLoading(false)
        }
        fetchRepos()
    }, [])

    const handleSelectAll = () => setSelectedAgents(AGENTS.map(a => a.key))

    const handleRun = async () => {
        if (!selectedRepo || selectedAgents.length === 0) return
        setRunning(true)
        setSummary(null)

        const initial: Record<string, AgentState> = {}
        selectedAgents.forEach((k, i) => {
            initial[k] = { status: i === 0 ? 'running' : 'waiting', output: null, elapsed: null }
        })
        setAgentStates(initial)

        for (const key of selectedAgents) {
            const start = Date.now()
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
            const elapsed = ((Date.now() - start) / 1000).toFixed(1)

            setAgentStates(prev => {
                const next = { ...prev, [key]: { status: 'done' as AgentStatus, output: MOCK_OUTPUTS[key], elapsed: Number(elapsed) } }
                const idx = selectedAgents.indexOf(key)
                if (selectedAgents[idx + 1]) {
                    next[selectedAgents[idx + 1]] = { status: 'running', output: null, elapsed: null }
                }
                return next
            })
        }

        setSummary({ score: 87, prs: 3, tests: 24, docs: selectedAgents.includes('documentation') ? 4 : 0 })
        setRunning(false)
    }

    const handleReset = () => {
        setAgentStates({})
        setSummary(null)
        setRunning(false)
    }

    const handleHistoryClick = (item: any) => {
        setSelectedRepo(item.repo)
        setSelectedAgents(item.agents)
        setSummary({ score: item.score, prs: 3, tests: 24, docs: 4 })
        const states: Record<string, AgentState> = {}
        item.agents.forEach((k: string) => {
            states[k] = { status: 'done', output: MOCK_OUTPUTS[k], elapsed: 2.1 }
        })
        setAgentStates(states)
    }

    const getStatusIcon = (status: AgentStatus) => {
        if (status === 'running') return <AiOutlineLoading3Quarters className="team-mode__spin" />
        if (status === 'done') return <CheckCircleOutlined className="team-mode__icon--done" />
        return <ClockCircleOutlined className="team-mode__icon--waiting" />
    }

    const getStatusTag = (status: AgentStatus) => {
        if (status === 'running') return <Tag className="team-mode__tag--running">Running</Tag>
        if (status === 'done') return <Tag className="team-mode__tag--done">Done</Tag>
        return <Tag className="team-mode__tag--waiting">Waiting</Tag>
    }

    return (
        <div className="team-mode">

            {/* Header */}
            <Flex align="center" justify="space-between" className="team-mode__header">
                <Flex align="center" gap={10}>
                    <div className={`team-mode__dot team-mode__dot--${running ? 'active' : allDone ? 'ready' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="team-mode__title">Team Mode</Text>
                        <Text type="secondary" className="team-mode__subtitle">
                            {running ? 'Agents are running...' : allDone ? 'All agents completed' : 'Run multiple agents simultaneously on a repo'}
                        </Text>
                    </Flex>
                </Flex>
                {allDone && (
                    <Tag className="team-mode__tag--complete">{selectedAgents.length} agents completed</Tag>
                )}
            </Flex>

            {/* How it works */}
            {!hasStarted && !running && (
                <div className="team-mode__how-it-works">
                    <Flex gap={0} align="center" className="team-mode__how-steps">
                        {[
                            { icon: '1', label: 'Select a repo' },
                            { icon: '2', label: 'Choose agents' },
                            { icon: '3', label: 'Run agents' },
                            { icon: '4', label: 'Get health report' },
                        ].map((step, idx) => (
                            <Flex key={step.icon} align="center" style={{ flex: 1 }}>
                                <Flex vertical align="center" gap={6} style={{ flex: 1 }}>
                                    <div className="team-mode__how-step-num">{step.icon}</div>
                                    <Text className="team-mode__how-step-label">{step.label}</Text>
                                </Flex>
                                {idx < 3 && <div className="team-mode__how-connector" />}
                            </Flex>
                        ))}
                    </Flex>
                    <Text className="team-mode__how-desc">
                        Select the agents you want to run on your repo. Each agent runs in sequence and results appear as they complete. At the end you get a combined health report.
                    </Text>
                </div>
            )}

            {/* Body */}
            <Flex vertical gap={20} className="team-mode__body">

                {/* Config */}
                <Flex gap={12} className="team-mode__config-row">
                    <Flex vertical gap={6} style={{ flex: 1 }}>
                        <Text className="team-mode__section-label">REPO</Text>
                        <Select
                            className="team-mode__select"
                            placeholder={<Flex align="center" gap={8}><GithubOutlined /><span>Select repo...</span></Flex>}
                            value={selectedRepo}
                            onChange={setSelectedRepo}
                            showSearch
                            loading={reposLoading}
                            disabled={running}
                            options={repos.map(r => ({
                                value: r.full_name,
                                label: (
                                    <Flex align="center" justify="space-between">
                                        <Flex align="center" gap={8}>
                                            <GithubOutlined />
                                            <span>{r.full_name}</span>
                                        </Flex>
                                        {r.language && (
                                            <Flex align="center" gap={4}>
                                                <div className="team-mode__lang-dot" style={{ background: getLanguageColor(r.language) }} />
                                                <Text className="team-mode__lang-text">{r.language}</Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>

                    <Flex vertical gap={6} style={{ flex: 1 }}>
                        <Flex align="center" justify="space-between">
                            <Text className="team-mode__section-label">AGENTS</Text>
                            <Button
                                size="small"
                                type="link"
                                icon={<ThunderboltOutlined />}
                                onClick={handleSelectAll}
                                disabled={running}
                                className="team-mode__select-all-btn"
                            >
                                Select all
                            </Button>
                        </Flex>
                        <Select
                            mode="multiple"
                            className="team-mode__select"
                            placeholder="Select agents..."
                            value={selectedAgents}
                            onChange={setSelectedAgents}
                            disabled={running}
                            maxTagCount={2}
                            options={AGENTS.map(a => ({
                                value: a.key,
                                label: (
                                    <Flex align="center" justify="space-between">
                                        <span>{a.label}</span>
                                        <Tooltip title={a.tooltip} placement="right">
                                            <InfoCircleOutlined className="team-mode__info-icon" />
                                        </Tooltip>
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>
                </Flex>

                {/* Actions */}
                <Flex gap={8}>
                    <Button
                        type="primary"
                        onClick={handleRun}
                        loading={running}
                        disabled={!selectedRepo || selectedAgents.length === 0}
                        className="team-mode__run-btn"
                    >
                        {running ? 'Running...' : 'Run Team'}
                    </Button>
                    {hasStarted && !running && (
                        <Button onClick={handleReset} className="team-mode__reset-btn">Reset</Button>
                    )}
                </Flex>

                {/* Pipeline */}
                {hasStarted && (
                    <Flex vertical gap={8}>
                        <Flex align="center" gap={6}>
                            <Text className="team-mode__section-label">PIPELINE</Text>
                        </Flex>
                        <Flex gap={0} align="center" className="team-mode__pipeline">
                            {selectedAgents.map((key, idx) => {
                                const agent = AGENTS.find(a => a.key === key)!
                                const state = agentStates[key]
                                const status = state?.status ?? 'idle'
                                return (
                                    <Flex key={key} align="center" style={{ flex: 1 }}>
                                        <Flex vertical align="center" gap={6} className={`team-mode__step team-mode__step--${status}`}>
                                            <div
                                                className="team-mode__step-icon"
                                                style={{
                                                    background: status === 'done' ? '#dafbe1' : status === 'running' ? '#ddf4ff' : undefined,
                                                    borderColor: status === 'done' ? agent.color :
                                                        status === 'running' ? '#0969da' : undefined,
                                                }}
                                            >
                                                {getStatusIcon(status)}
                                            </div>
                                            <Text className="team-mode__step-label">{agent.label}</Text>
                                            {getStatusTag(status)}
                                            {state?.elapsed && (
                                                <Text className="team-mode__step-elapsed">{state.elapsed}s</Text>
                                            )}
                                        </Flex>
                                        {idx < selectedAgents.length - 1 && (
                                            <div className={`team-mode__connector team-mode__connector--${status === 'done' ? 'active' : 'inactive'}`} />
                                        )}
                                    </Flex>
                                )
                            })}
                        </Flex>
                    </Flex>
                )}

                {/* Summary */}
                {summary && (
                    <Flex vertical gap={8}>
                        <Text className="team-mode__section-label">REPO HEALTH REPORT — {selectedRepo}</Text>
                        <Flex gap={10} wrap="wrap">   {/* ← wrap ekle */}
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">Code quality</Text>
                                <Text className="team-mode__stat-value-green">{summary.score}/100</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">PRs reviewed</Text>
                                <Text className="team-mode__stat-value-green">{summary.prs}</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">Tests generated</Text>
                                <Text className="team-mode__stat-value-green">{summary.tests}</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">Docs generated</Text>
                                <Text className="team-mode__stat-value-green">{summary.docs}</Text>
                            </Card>
                        </Flex>
                    </Flex>
                )}

                {/* Outputs */}
                {selectedAgents.some(k => agentStates[k]?.status === 'done') && (
                    <Flex vertical gap={8}>
                        <Text className="team-mode__section-label">OUTPUTS</Text>
                        <Collapse
                            className="team-mode__collapse"
                            items={selectedAgents
                                .filter(k => agentStates[k]?.status === 'done')
                                .map(key => {
                                    const agent = AGENTS.find(a => a.key === key)!
                                    const state = agentStates[key]
                                    return {
                                        key,
                                        label: (
                                            <Flex align="center" gap={8}>
                                                <CheckCircleOutlined className="team-mode__icon--done" />
                                                <Text strong style={{ fontSize: 13 }}>{agent.label}</Text>
                                                {state.elapsed && (
                                                    <Text className="team-mode__step-elapsed" style={{ marginLeft: 'auto' }}>
                                                        completed in {state.elapsed}s
                                                    </Text>
                                                )}
                                            </Flex>
                                        ),
                                        children: (
                                            <Flex vertical gap={10}>
                                                <Text className="team-mode__output-summary">{state.output?.summary}</Text>
                                                {state.output?.actions && state.output.actions.length > 0 && (
                                                    <Flex vertical gap={4}>
                                                        <Text className="team-mode__output-actions-label">SUGGESTED ACTIONS</Text>
                                                        {state.output.actions.map((action, i) => (
                                                            <Flex key={i} align="flex-start" gap={8} className="team-mode__output-action">
                                                                <span className="team-mode__output-action-bullet">→</span>
                                                                <Text className="team-mode__output-action-text">{action}</Text>
                                                            </Flex>
                                                        ))}
                                                    </Flex>
                                                )}
                                            </Flex>
                                        ),
                                    }
                                })
                            }
                        />
                    </Flex>
                )}

                {/* History */}
                <Flex vertical gap={8} className="team-mode__history-col">
                    <Text className="team-mode__section-label">HISTORY</Text>
                    <div className="team-mode__history-scroll">
                        <List
                            dataSource={history}
                            split
                            locale={{ emptyText: 'No team runs yet' }}
                            renderItem={(item: any) => (
                                <List.Item style={{ padding: 0 }}>
                                    <Tooltip title="Click to restore this run" placement="right">
                                        <Flex
                                            align="flex-start"
                                            gap={10}
                                            className="team-mode__history-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="team-mode__history-dot" />
                                            <Flex align="center" gap={12} style={{ flex: 1, flexWrap: 'wrap' }}>
                                                <Text code className="team-mode__history-repo">{item.repo}</Text>
                                                <Flex gap={4} wrap="wrap">
                                                    {item.agents.map((k: string) => (
                                                        <Tag key={k} className="team-mode__history-agent">
                                                            {AGENTS.find(a => a.key === k)?.label}
                                                        </Tag>
                                                    ))}
                                                </Flex>
                                                <Flex align="center" gap={6} style={{ marginLeft: 'auto' }}>
                                                    <Tag className="team-mode__tag--done" style={{ margin: 0 }}>
                                                        {item.score}/100
                                                    </Tag>
                                                    <Text className="team-mode__history-meta">{timeAgo(item.timeAgo)}</Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                    </Tooltip>
                                </List.Item>
                            )}
                        />
                    </div>
                </Flex>

            </Flex>
        </div>
    )
}

export default withLayout(<TeamMode />)