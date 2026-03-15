import { Card, Row, Col, Statistic, Table, Tag, Typography, Avatar, List } from 'antd'
import ReactECharts from 'echarts-for-react'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text, Title } = Typography

const DUMMY_USER = {
    username: 'kubraemektar',
    avatar_url: 'https://avatars.githubusercontent.com/u/124355274',
}

const DUMMY_REPOS = [
    { id: 1, name: 'devcrew-backend', language: 'Python', stargazers_count: 4, private: false },
    { id: 2, name: 'react-keycloak-integration', language: 'TypeScript', stargazers_count: 7, private: true },
    { id: 3, name: 'python-base', language: 'Python', stargazers_count: 2, private: false },
    { id: 4, name: 'portfolio', language: 'JavaScript', stargazers_count: 12, private: false },
    { id: 5, name: 'go-microservice', language: 'Go', stargazers_count: 5, private: false },
    { id: 6, name: 'rust-cli-tool', language: 'Rust', stargazers_count: 3, private: true },
]

const DUMMY_RECENT_ANALYSES = [
    { id: 1, repo: 'devcrew-backend', agent: 'Codebase Q&A', status: 'completed', time: '2 saat önce', result: '14 dosya analiz edildi' },
    { id: 2, repo: 'react-keycloak-integration', agent: 'PR Review', status: 'completed', time: '5 saat önce', result: '3 kritik issue bulundu' },
    { id: 3, repo: 'python-base', agent: 'Test Generator', status: 'completed', time: '1 gün önce', result: '12 test oluşturuldu' },
    { id: 4, repo: 'portfolio', agent: 'Debugging', status: 'failed', time: '2 gün önce', result: 'Zaman aşımı' },
    { id: 5, repo: 'go-microservice', agent: 'Documentation', status: 'completed', time: '3 gün önce', result: 'README güncellendi' },
]

const DUMMY_ACTIVITIES = [
    { id: 1, agent: 'PR Review Agent', repo: 'devcrew-backend', action: 'PR #14 analiz etti', time: '10 dk önce', type: 'review' },
    { id: 2, agent: 'Test Generator', repo: 'python-base', action: '8 unit test yazdı', time: '1 saat önce', type: 'test' },
    { id: 3, agent: 'Codebase Q&A', repo: 'react-keycloak-integration', action: 'Auth modülünü analiz etti', time: '3 saat önce', type: 'analyze' },
    { id: 4, agent: 'Debugging Agent', repo: 'go-microservice', action: 'Memory leak tespit etti', time: '5 saat önce', type: 'debug' },
    { id: 5, agent: 'Documentation', repo: 'portfolio', action: 'API dokümanı oluşturdu', time: '1 gün önce', type: 'doc' },
]

const langColors: Record<string, string> = {
    Python: '#3572A5',
    TypeScript: '#2b7489',
    JavaScript: '#f1e05a',
    Go: '#00ADD8',
    Rust: '#dea584',
}

const agentColors: Record<string, string> = {
    review: '#58a6ff',
    test: '#3fb950',
    analyze: '#bc8cff',
    debug: '#d29922',
    doc: '#8b949e',
}

const agentBadgeClass: Record<string, string> = {
    review: 'badge-blue',
    test: 'badge-green',
    analyze: 'badge-purple',
    debug: 'badge-yellow',
    doc: 'badge-gray',
}

const langData = Object.entries(
    DUMMY_REPOS.reduce((acc: Record<string, number>, r) => {
        if (r.language) acc[r.language] = (acc[r.language] || 0) + 1
        return acc
    }, {})
).map(([name, value]) => ({ name, value }))

const langChartOption = {
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} repo ({d}%)',
    },
    legend: { show: false },
    series: [
        {
            type: 'pie',
            radius: ['50%', '75%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 6,
                borderWidth: 2,
                borderColor: '#f6f8fa',
            },
            label: { show: false },
            emphasis: {
                label: { show: false },
                scaleSize: 5,
            },
            data: langData.map(({ name, value }) => ({
                name,
                value,
                itemStyle: { color: langColors[name] || '#8b949e' },
            })),
        },
    ],
}

const recentColumns = [
    {
        title: 'Repo',
        dataIndex: 'repo',
        key: 'repo',
        render: (name: string) => <Text className="repo-name">{name}</Text>,
    },
    {
        title: 'Agent',
        dataIndex: 'agent',
        key: 'agent',
        render: (agent: string) => <Text style={{ fontSize: 13 }}>{agent}</Text>,
    },
    {
        title: 'Sonuç',
        dataIndex: 'result',
        key: 'result',
        render: (result: string) => <Text type="secondary" style={{ fontSize: 12 }}>{result}</Text>,
    },
    {
        title: 'Durum',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <Tag className={`status-tag ${status}`}>
                {status === 'completed' ? 'Tamamlandı' : 'Başarısız'}
            </Tag>
        ),
    },
    {
        title: 'Zaman',
        dataIndex: 'time',
        key: 'time',
        render: (time: string) => <Text className="date">{time}</Text>,
    },
]

const Dashboard = () => {
    const totalStars = DUMMY_REPOS.reduce((a, r) => a + r.stargazers_count, 0)
    const languages = [...new Set(DUMMY_REPOS.map(r => r.language).filter(Boolean))].length
    const completedAnalyses = DUMMY_RECENT_ANALYSES.filter(a => a.status === 'completed').length

    return (
        <div className="dashboard-page">

            <div className="dashboard-page__welcome">
                <Avatar size={40} src={DUMMY_USER.avatar_url} />
                <div>
                    <Title level={5} style={{ margin: 0 }}>Hoş geldin, {DUMMY_USER.username}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>DevCrew AI Dev Team hazır</Text>
                </div>
            </div>

            <Row gutter={12} style={{ marginBottom: 16 }}>
                {[
                    { label: 'Repositories', value: DUMMY_REPOS.length },
                    { label: 'Total Stars', value: totalStars },
                    { label: 'Languages', value: languages },
                    { label: 'AI Analyses', value: completedAnalyses },
                ].map(({ label, value }) => (
                    <Col span={6} key={label}>
                        <Card className="stat-card">
                            <Statistic title={label} value={value} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col span={10}>
                    <Card title="Dil Dağılımı" className="dashboard-card">
                        <ReactECharts
                            option={langChartOption}
                            style={{ height: 200 }}
                            opts={{ renderer: 'svg' }}
                        />
                        <div className="lang-legend">
                            {langData.map(({ name, value }) => (
                                <div key={name} className="lang-legend-item">
                                    <span className="lang-dot" style={{ background: langColors[name] || '#8b949e' }} />
                                    <Text style={{ fontSize: 12 }}>{name}</Text>
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>{value}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col span={14}>
                    <Card title="Agent Aktiviteleri" className="dashboard-card">
                        <List
                            dataSource={DUMMY_ACTIVITIES}
                            renderItem={(item) => (
                                <List.Item className="activity-item">
                                    <div className="activity-dot" style={{ background: agentColors[item.type] }} />
                                    <div className="activity-content">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Text style={{ fontSize: 13, fontWeight: 500 }}>{item.agent}</Text>
                                            <Tag className={`agent-tag ${agentBadgeClass[item.type]}`}>{item.repo}</Tag>
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{item.action}</Text>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{item.time}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Son Analizler" className="dashboard-card">
                <Table
                    dataSource={DUMMY_RECENT_ANALYSES}
                    columns={recentColumns}
                    rowKey="id"
                    pagination={false}
                    className="repo-table"
                />
            </Card>
        </div>
    )
}

export default withLayout(<Dashboard />)