import { useState } from 'react'
import { Table, Input, Tag, Avatar, Card, Space, Typography, Flex, Select, Progress } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { GoLinkExternal } from 'react-icons/go'
import withLayout from '../../layout/withLayout'
import { VscCode, VscBeaker, VscShield } from 'react-icons/vsc'
import './index.scss'

const { Text, Link } = Typography

const languageColors: Record<string, string> = {
    Python: '#3572A5',
    TypeScript: '#2b7489',
    JavaScript: '#f1e05a',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
}

const user = {
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    html_url: 'https://github.com/kubraemektar'
}
const dummyRepos = [
    {
        id: 1,
        name: 'ai-code-reviewer',
        description: 'AI powered code review tool',
        html_url: 'https://github.com/example/ai-code-reviewer',
        language: 'TypeScript',
        agent: 'Code Review Agent',
        topics: ['ai', 'review', 'typescript'],
        result: '14 files analysed',
        status: 'Completed',
        time: '2 hours ago',
        activity: {
            status: 'Completed',
            detail: 'PR #14 - 3 critical issues found',
            time: '10 m ago',
        },
    },
    {
        id: 2,
        name: 'ml-agent',
        description: 'Autonomous ML pipeline agent',
        html_url: 'https://github.com/example/ml-agent',
        language: 'Python',
        agent: 'ML Analysis Agent',
        topics: ['ml', 'agent'],
        result: '8 files analysed',
        status: 'Running',
        time: '5 min ago',
        activity: {
            status: 'Running',
            detail: 'PR #7 - Analysing model outputs',
            time: '2 m ago',
        },
    },
    {
        id: 3,
        name: 'devops-automation',
        description: 'CI/CD automation scripts',
        html_url: 'https://github.com/example/devops',
        language: 'Go',
        agent: 'DevOps Security Agent',
        topics: ['devops', 'automation'],
        result: '21 files analysed',
        status: 'Failed',
        time: '1 day ago',
        activity: {
            status: 'Failed',
            detail: 'PR #22 - Timeout during pipeline scan',
            time: '1 h ago',
        },
    },
]

const Dashboard = () => {

    const [repos] = useState<any[]>(dummyRepos)
    const [loading] = useState(false)

    const [search, setSearch] = useState('')
    const [agentFilter, setAgentFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('updated')

    const agents = ['all', ...Array.from(new Set(repos.map(r => r.agent)))]

    const agentIcons: Record<string, React.ReactNode> = {
        'Code Review Agent': <VscCode size={14} style={{ color: '#0969da' }} />,
        'ML Analysis Agent': <VscBeaker size={14} style={{ color: '#8250df' }} />,
        'DevOps Security Agent': <VscShield size={14} style={{ color: '#cf222e' }} />,
    }

    const defaultAgentIcon = <VscCode size={14} style={{ color: '#57606a' }} />


    // language distribution
    const dummyLanguageStats = [
        { language: 'TypeScript', count: 12 },
        { language: 'Python', count: 8 },
        { language: 'Go', count: 5 },
        { language: 'JavaScript', count: 4 },
        { language: 'Rust', count: 2 },
        { language: 'Java', count: 1 },
    ]

    const totalLangCount = dummyLanguageStats?.reduce((sum, s) => sum + s.count, 0)
    const languageStats = dummyLanguageStats?.map(s => [s.language, s.count])

    // agent usage
    const dummyAgentStats = [
        { agent: 'Code Review Agent', count: 18 },
        { agent: 'ML Analysis Agent', count: 11 },
        { agent: 'DevOps Security Agent', count: 7 },
        { agent: 'Test Generator Agent', count: 4 },
    ]

    const totalAgentCount = dummyAgentStats.reduce((sum, s) => sum + s.count, 0)
    const agentStats = dummyAgentStats.map(s => [s.agent, s.count])

    const statusStyles: Record<string, { background: string; color: string }> = {
        Completed: { background: '#dafbe1', color: '#116329' },
        Running: { background: '#ddf4ff', color: '#0969da' },
        Failed: { background: '#ffebe9', color: '#cf222e' },
    }

    const statusColors: Record<string, string> = {
        Completed: 'green',
        Running: 'blue',
        Failed: 'red',
    }

    const recentActivtyColumns = [
        {
            title: 'Activity',
            key: 'activity',
            render: (_: any, repo: any) => {
                const { status, detail, time } = repo.activity
                const style = statusStyles[status] ?? { background: '#f0f0f0', color: '#555' }
                const icon = agentIcons[repo.agent] ?? defaultAgentIcon  // 👈

                return (
                    <Flex align="center" justify="space-between">
                        <Flex vertical>
                            <Flex align="center" gap={8}>
                                {icon}
                                <Text style={{ fontWeight: 600 }}>{repo.agent}</Text>
                                <Tag
                                    style={{
                                        fontSize: 11,
                                        borderRadius: 12,
                                        background: style.background,
                                        color: style.color,
                                        padding: '0 6px',
                                    }}
                                >
                                    {status}
                                </Tag>
                            </Flex>
                            <Text style={{ fontSize: 12, color: '#57606a', marginLeft: 22 }}>
                                {detail}
                            </Text>
                        </Flex>
                        <Text style={{ fontSize: 11, color: '#8c959f', whiteSpace: 'nowrap' }}>
                            {time}
                        </Text>
                    </Flex>
                )
            },
        },
    ]

    const columns = [
        {
            title: 'Repository',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, repo: any) => (
                <div>
                    <Link href={repo.html_url} target="_blank" className="repo-name">
                        {repo.name}
                    </Link>

                    <div className="repo-desc">
                        {repo.description || '—'}
                    </div>

                    {repo.topics?.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {repo.topics.slice(0, 3).map((topic: string) => (
                                <Tag key={topic}>{topic}</Tag>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
            render: (agent: string, repo: any) => (
                <span className="lang-badge">
                    <span
                        className="lang-dot"
                        style={{ background: languageColors[repo.language] || '#8b949e' }}
                    />
                    {agent}
                </span>
            ),
        },
        {
            title: 'Result',
            key: 'result',
            render: (_: any, repo: any) => (
                <Tag>{repo.result}</Tag>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, repo: any) => (
                <Tag color={statusColors[repo.status] ?? 'default'}>
                    {repo.status}
                </Tag>
            ),
        },
        {
            title: 'Time',
            key: 'time',
            render: (_: any, repo: any) => (
                <Space size={4}>
                    {repo.time}
                </Space>
            ),
        },
    ]

    return (
        <div className="container dashboard-page">

            <Card className="dashboard-page__user-card">
                <Flex align="flex-start" gap={20}>

                    <Avatar
                        size={80}
                        src={user.avatar_url}
                    />

                    <Flex vertical style={{ flex: 1 }}>
                        <Typography.Title level={3}>
                            Hoşgeldin, kubraemektar
                        </Typography.Title>
                    </Flex>

                    <Flex align="center" gap={6}>
                        <GoLinkExternal size={14} />
                        <Link href={user.html_url} target="_blank" />
                    </Flex>

                </Flex>
            </Card>

            <div className="dashboard-page__scroll-container">

                {/* ---------------- ANALYTICS SECTION ---------------- */}


                <Flex gap={16} style={{ marginBottom: 20 }}>

                    {/* Recent Activity */}


                    <Card title="Recent Activity" style={{ flex: 1 }}>
                        <Table
                            dataSource={repos}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={recentActivtyColumns}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>

                    <Flex vertical gap={16} style={{ flex: 1 }}>

                        {/* Language Distribution */}

                        <Card title="Language Distribution">

                            {languageStats.map(([lang, count]) => {
                                const percent = Math.round((Number(count) / totalLangCount) * 100)  // 👈 totalLangCount

                                return (
                                    <div key={lang} style={{ marginBottom: 12 }}>
                                        <Flex justify="space-between">
                                            <Text>{lang}</Text>
                                            <Text>{percent}%</Text>
                                        </Flex>
                                        <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={languageColors[lang as string]}
                                        />
                                    </div>
                                )
                            })}

                        </Card>

                        {/* Agent Usage */}

                        <Card title="Agent Usage">

                            {agentStats.map(([agent, count]) => {
                                const percent = Math.round((Number(count) / totalAgentCount) * 100)

                                return (
                                    <div key={agent} style={{ marginBottom: 12 }}>
                                        <Flex justify="space-between">
                                            <Text>{agent}</Text>
                                            <Text>{percent}%</Text>
                                        </Flex>
                                        <Progress
                                            percent={percent}
                                            showInfo={false}
                                        />
                                    </div>
                                )
                            })}

                        </Card>

                    </Flex>

                </Flex>

                {/* ---------------- TABLE ---------------- */}

                <Card
                    className="dashboard-page__table-container"
                    extra={
                        <div className="dashboard-page__filters">

                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Search repository..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: 200 }}
                            />

                            <Select
                                value={agentFilter}
                                onChange={setAgentFilter}
                                style={{ width: 200 }}
                                options={agents.map(agent => ({
                                    value: agent,
                                    label: agent === 'all' ? 'All agents' : agent,
                                }))}
                            />

                            <Select
                                style={{ width: 140 }}
                                defaultValue="all"
                                options={[
                                    { value: 'all', label: 'All status' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'failed', label: 'Failed' },
                                    { value: 'running', label: 'Running' },
                                ]}
                            />

                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                style={{ width: 140 }}
                                options={[
                                    { value: 'updated', label: 'Last scan' },
                                    { value: 'created', label: 'Newest' },
                                    { value: 'name', label: 'Name' },
                                ]}
                            />

                        </div>
                    }
                >

                    <Table
                        dataSource={repos}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                    />

                </Card>

            </div>
        </div>
    )
}

export default withLayout(<Dashboard />)