import { useEffect, useState } from 'react'
import { Button, Card, Flex, Tag, Typography, Select, List, Tooltip, Collapse } from 'antd'
import { GithubOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import { getLanguageColor } from '../../utils/languageColors'
import { timeAgo } from '../../utils/timeAgo'
import toast from 'react-hot-toast'
import './index.scss'

const { Text } = Typography

const agentDoneClass: Record<string, string> = {
    codebase: 'team-mode__step-icon--done-green',
    pr_review: 'team-mode__step-icon--done-green',
    test: 'team-mode__step-icon--done-green',
    documentation: 'team-mode__step-icon--done-green',
}

type AgentStatus = 'idle' | 'running' | 'done' | 'waiting'

interface AgentState {
    status: AgentStatus
    output: { summary: string; actions: string[] } | null
    elapsed: number | null
}

const TeamMode = () => {
    const { t } = useTranslation()
    const [repos, setRepos] = useState<any[]>([])
    const [reposLoading, setReposLoading] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [running, setRunning] = useState(false)
    const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({})
    const [summary, setSummary] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const token = localStorage.getItem('dt-token') || ''
    const allDone = selectedAgents.length > 0 && selectedAgents.every(k => agentStates[k]?.status === 'done')
    const hasStarted = Object.keys(agentStates).length > 0

    const agents = [
        {
            key: 'codebase',
            label: t('teamMode.agents_codebase'),
            tooltip: t('teamMode.tooltip_codebase')
        },
        {
            key: 'pr_review', label: t('teamMode.agents_pr_review'),
            tooltip: t('teamMode.tooltip_pr_review')
        },
        {
            key: 'test',
            label: t('teamMode.agents_test'),
            tooltip: t('teamMode.tooltip_test')
        },
        {
            key: 'documentation',
            label: t('teamMode.agents_documentation'),
            tooltip: t('teamMode.tooltip_documentation')
        },
    ]

    const steps = [
        { icon: '1', label: t('teamMode.step1') },
        { icon: '2', label: t('teamMode.step2') },
        { icon: '3', label: t('teamMode.step3') },
        { icon: '4', label: t('teamMode.step4') },
    ]

    // get repos
    const getRepos = async () => {
        setReposLoading(true)

        try {
            const { data, error } = await api.profile.getRepos(token)
            if (error) {
                toast.error(error)
            } else {
                setRepos(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setReposLoading(false)
        }
    }


    // get history
    const getHistory = async () => {
        setHistoryLoading(true)
        try {
            const { data, error } = await api.agents.teamModeHistory(token)
            if (error) {
                toast.error(error)
            } else {
                setHistory(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        getRepos()
        getHistory()
    }, [])


    // run team mode
    const handleRun = () => {
        if (!selectedRepo || selectedAgents.length === 0) return

        const [owner, repo] = selectedRepo.split('/')
        setRunning(true)
        setSummary(null)

        const initial: Record<string, AgentState> = {}
        selectedAgents.forEach((k, i) => {
            initial[k] = { status: i === 0 ? 'running' : 'waiting', output: null, elapsed: null }
        })
        setAgentStates(initial)

        const agentStartTimes: Record<string, number> = {}
        const response = api.agents.teamModeStream(token, owner, repo, selectedAgents)

        response.addEventListener('agent_start', (e) => {
            const { agent } = JSON.parse((e as MessageEvent).data)
            agentStartTimes[agent] = Date.now()
            setAgentStates(prev => {
                const next = { ...prev }
                next[agent] = { status: 'running', output: null, elapsed: null }
                const idx = selectedAgents.indexOf(agent)
                if (selectedAgents[idx + 1] && next[selectedAgents[idx + 1]]?.status !== 'done') {
                    next[selectedAgents[idx + 1]] = { status: 'waiting', output: null, elapsed: null }
                }
                return next
            })
        })

        response.addEventListener('agent_done', (e) => {
            const { agent, summary: agentSummary, actions } = JSON.parse((e as MessageEvent).data)
            const elapsed = agentStartTimes[agent]
                ? Number(((Date.now() - agentStartTimes[agent]) / 1000).toFixed(1))
                : null
            setAgentStates(prev => ({
                ...prev,
                [agent]: { status: 'done', elapsed, output: { summary: agentSummary, actions } },
            }))
        })

        response.addEventListener('complete', (e) => {
            const data = JSON.parse((e as MessageEvent).data)
            setSummary({
                score: data?.health_score ?? 0,
                text: data?.summary ?? '',
                top_actions: data?.top_actions ?? [],
                prs: data?.results?.pr_review?.pr_count ?? 0,
                tests: data?.results?.test?.test_count ?? 0,
                docs: data?.results?.documentation?.docs_generated ?? 0,
            })
            getHistory()
            response.close()
            setRunning(false)
        })

        response.addEventListener('error', (e: any) => {
            try {
                const data = JSON.parse(e.data ?? '{}')
                toast.error(data.message ?? 'Team run failed')
            } catch {
                toast.error('Connection lost')
            }
            response.close()
            setRunning(false)
        })
    }

    // history click
    const handleHistoryClick = (item: any) => {
        setSelectedRepo(item?.repo)
        setSelectedAgents(item?.agents)
        setSummary({
            score: item?.health_score ?? item?.score ?? 0,
            text: item?.summary ?? '',
            top_actions: item?.top_actions ?? [],
            prs: item?.results?.pr_review?.pr_count ?? 0,
            tests: item?.results?.test?.test_count ?? 0,
            docs: item?.results?.documentation?.docs_generated ?? 0,
        })
        const states: Record<string, AgentState> = {}
        item?.agents.forEach((k: string) => {
            const r = item?.results?.[k]
            states[k] = {
                status: 'done',
                elapsed: null,
                output: r ? { summary: r.summary ?? '', actions: r.actions ?? [] } : null,
            }
        })
        setAgentStates(states)
    }

    const getStatusIcon = (status: AgentStatus) => {
        if (status === 'running') return <AiOutlineLoading3Quarters className="team-mode__spin" />
        if (status === 'done') return <CheckCircleOutlined className="team-mode__icon--done" />
        return <ClockCircleOutlined className="team-mode__icon--waiting" />
    }

    const getStatusTag = (status: AgentStatus) => {
        if (status === 'running') return <Tag className="team-mode__tag--running">{t('teamMode.tagRunning')}</Tag>
        if (status === 'done') return <Tag className="team-mode__tag--done">{t('teamMode.tagDone')}</Tag>
        return <Tag className="team-mode__tag--waiting">{t('teamMode.tagWaiting')}</Tag>
    }

    const getStepIconClass = (key: string, status: AgentStatus) => {
        if (status === 'done') return `team-mode__step-icon ${agentDoneClass[key] ?? 'team-mode__step-icon--done'}`
        if (status === 'running') return 'team-mode__step-icon team-mode__step-icon--running'
        return 'team-mode__step-icon'
    }

    return (
        <div className="team-mode">

            <Flex align="center" justify="space-between" className="team-mode__header">
                <Flex align="center" gap={10}>
                    <div className={`team-mode__dot team-mode__dot--${running ? 'active' : allDone ? 'ready' : 'idle'}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="team-mode__title">{t('teamMode.title')}</Text>
                        <Text type="secondary" className="team-mode__subtitle">
                            {running ? t('teamMode.running') : allDone ? t('teamMode.allDone') : t('teamMode.subtitle')}
                        </Text>
                    </Flex>
                </Flex>
                {allDone && (
                    <Tag className="team-mode__tag--complete">
                        {t('teamMode.agentsCompleted', { count: selectedAgents?.length })}
                    </Tag>
                )}
            </Flex>

            {!hasStarted && !running && (
                <div className="team-mode__how-it-works">
                    <Flex gap={0} align="center" className="team-mode__how-steps">
                        {steps?.map((step, idx) => (
                            <Flex key={step?.icon} align="center" style={{ flex: 1 }}>
                                <Flex vertical align="center" gap={6} style={{ flex: 1 }}>
                                    <div className="team-mode__how-step-num">{step?.icon}</div>
                                    <Text className="team-mode__how-step-label">{step?.label}</Text>
                                </Flex>
                                {idx < 3 && <div className="team-mode__how-connector" />}
                            </Flex>
                        ))}
                    </Flex>
                    <Text className="team-mode__how-desc">{t('teamMode.howItWorks')}</Text>
                </div>
            )}

            <Flex vertical gap={20} className="team-mode__body">

                <Flex vertical gap={12} className="team-mode__config-row" >
                    <Text className="team-mode__section-label">{t('teamMode.repo')}</Text>
                    <Flex gap={6} style={{ flex: 1 }}>
                        <Select
                            className="team-mode__select"
                            placeholder={<Flex align="center" gap={8}><GithubOutlined /><span>{t('teamMode.selectRepo')}</span></Flex>}
                            value={selectedRepo}
                            onChange={setSelectedRepo}
                            showSearch
                            loading={reposLoading}
                            disabled={running}
                            options={repos?.map(repo => ({
                                value: repo?.full_name,
                                label: (
                                    <Flex align="center" justify="space-between">
                                        <Flex align="center" gap={8}>
                                            <GithubOutlined />
                                            <span>{repo?.full_name}</span>
                                        </Flex>
                                        {repo?.language && (
                                            <Flex align="center" gap={4}>
                                                <div className="team-mode__lang-dot" style={{ background: getLanguageColor(repo?.language) }} />
                                                <Text className="team-mode__lang-text">{repo?.language}</Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                ),
                            }))}
                        />
                        <Select
                            mode="multiple"
                            className="team-mode__select"
                            placeholder={t('teamMode.selectAgents')}
                            value={selectedAgents}
                            onChange={setSelectedAgents}
                            disabled={running}
                            maxTagCount="responsive"
                            options={agents?.map(agent => ({
                                value: agent?.key,
                                label: (
                                    <Flex align="center" justify="space-between">
                                        <span>{agent?.label}</span>
                                    </Flex>
                                ),
                            }))}
                        />
                    </Flex>

                </Flex>

                <Flex gap={8}>
                    <Button
                        type="primary"
                        onClick={handleRun}
                        disabled={!selectedRepo || selectedAgents.length === 0 || running}
                        className="team-mode__run-btn"
                    >
                        {t('teamMode.runTeam')}
                    </Button>
                    {hasStarted && !running && (
                        <Button
                            onClick={() => {
                                setAgentStates({})
                                setSummary(null)
                                setRunning(false)
                            }}
                            className="team-mode__reset-btn">
                            {t('teamMode.reset')}
                        </Button>
                    )}
                </Flex>

                {hasStarted && (
                    <Flex vertical gap={8}>
                        <Text className="team-mode__section-label">{t('teamMode.pipeline')}</Text>
                        <Flex gap={0} align="center" className="team-mode__pipeline">
                            {selectedAgents?.map((key, idx) => {
                                const agent = agents?.find(a => a.key === key)
                                const state = agentStates[key]
                                const status = state?.status ?? 'idle'
                                return (
                                    <Flex key={key} align="center" style={{ flex: idx === selectedAgents.length - 1 ? 'unset' : 1 }} justify='space-between'>
                                        <Flex vertical align="center" gap={6} className={`team-mode__step team-mode__step--${status}`}>
                                            <div className={getStepIconClass(key, status)}>
                                                {getStatusIcon(status)}
                                            </div>
                                            <Text className="team-mode__step-label">{agent?.label}</Text>
                                            {getStatusTag(status)}
                                            {state?.elapsed && (
                                                <Text className="team-mode__step-elapsed">
                                                    {t('teamMode.completedIn', { elapsed: state.elapsed })}
                                                </Text>
                                            )}
                                        </Flex>
                                        {idx < selectedAgents?.length - 1 && (
                                            <div className={`team-mode__connector team-mode__connector--${status === 'done' ? 'active' : 'inactive'}`} />
                                        )}
                                    </Flex>
                                )
                            })}
                        </Flex>
                    </Flex>
                )}

                {summary && (
                    <Flex vertical gap={8}>
                        <Text className="team-mode__section-label">
                            {t('teamMode.healthReport')} — {selectedRepo}
                        </Text>
                        <Flex gap={10} wrap="wrap">
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">{t('teamMode.healthScore')}</Text>
                                <Text className="team-mode__stat-value-green">{summary?.score}/100</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">{t('teamMode.prsReviewed')}</Text>
                                <Text className="team-mode__stat-value-green">{summary?.prs}</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">{t('teamMode.testsGenerated')}</Text>
                                <Text className="team-mode__stat-value-green">{summary?.tests}</Text>
                            </Card>
                            <Card size="small" className="team-mode__card-green">
                                <Text className="team-mode__card-label">{t('teamMode.docsGenerated')}</Text>
                                <Text className="team-mode__stat-value-green">{summary?.docs}</Text>
                            </Card>
                        </Flex>

                        {summary?.text && (
                            <Text className="team-mode__summary-text">{summary?.text}</Text>
                        )}

                        {summary?.top_actions?.length > 0 && (
                            <Flex vertical gap={4}>
                                <Text className="team-mode__output-actions-label">{t('teamMode.topActions')}</Text>
                                {summary?.top_actions.map((action: string, i: number) => (
                                    <Flex key={i} align="center" gap={8} className="team-mode__output-action">
                                        <span className="team-mode__output-action-bullet">→</span>
                                        <Text className="team-mode__output-action-text">{action}</Text>
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                )}

                {selectedAgents?.some(k => agentStates[k]?.status === 'done') && (
                    <Flex vertical gap={8}>
                        <Text className="team-mode__section-label">{t('teamMode.outputs')}</Text>
                        <Collapse
                            className="team-mode__collapse"
                            items={selectedAgents
                                ?.filter(k => agentStates[k]?.status === 'done')
                                ?.map(key => {
                                    const agent = agents?.find(a => a.key === key)
                                    const state = agentStates[key]
                                    return {
                                        key,
                                        label: (
                                            <Flex align="center" gap={8}>
                                                <CheckCircleOutlined className="team-mode__icon--done" />
                                                <Text strong className="team-mode__step-label">{agent?.label}</Text>
                                                {state?.elapsed && (
                                                    <Text className="team-mode__step-elapsed" style={{ marginLeft: 'auto' }}>
                                                        {t('teamMode.completedIn', { elapsed: state?.elapsed })}
                                                    </Text>
                                                )}
                                            </Flex>
                                        ),
                                        children: (
                                            <Flex vertical gap={10}>
                                                <Text className="team-mode__output-summary">{state?.output?.summary}</Text>
                                                {state?.output?.actions && state.output.actions.length > 0 && (
                                                    <Flex vertical gap={4}>
                                                        <Text className="team-mode__output-actions-label">
                                                            {t('teamMode.suggestedActions')}
                                                        </Text>
                                                        {state?.output?.actions?.map((action, i) => (
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

                <Flex vertical gap={8} className="team-mode__history-col">
                    <Text className="team-mode__section-label">{t('teamMode.history')}</Text>
                    <div className="team-mode__history-scroll">
                        <List
                            dataSource={history}
                            loading={historyLoading}
                            split
                            locale={{ emptyText: t('teamMode.noHistory') }}
                            renderItem={(item: any) => (
                                <List.Item style={{ padding: 0 }}>
                                    <Tooltip title={t('teamMode.restoreRun')} placement="right">
                                        <Flex
                                            align="flex-start"
                                            gap={10}
                                            className="team-mode__history-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <div className="team-mode__history-dot" />
                                            <Flex align="center" gap={12} style={{ flex: 1, flexWrap: 'wrap' }}>
                                                <Text code className="team-mode__history-repo">{item?.repo}</Text>
                                                <Flex gap={4} wrap="wrap">
                                                    {item?.agents?.map((k: string) => (
                                                        <Tag key={k} className="team-mode__history-agent">
                                                            {agents?.find(a => a.key === k)?.label}
                                                        </Tag>
                                                    ))}
                                                </Flex>
                                                <Flex align="center" gap={6} style={{ marginLeft: 'auto' }}>
                                                    <Tag className="team-mode__tag--done" style={{ margin: 0 }}>
                                                        {item?.health_score ?? item?.score ?? 0}/100
                                                    </Tag>
                                                    <Text className="team-mode__history-meta">{timeAgo(item?.timeAgo)}</Text>
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