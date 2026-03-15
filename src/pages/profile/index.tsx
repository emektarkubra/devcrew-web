import { useEffect, useState } from 'react'
import { Table, Input, Button, Tag, Avatar, Card, Row, Col, Statistic, Space, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text, Link } = Typography

const DUMMY_REPOS = [
    { id: 1, name: 'devcrew-backend', description: 'FastAPI + PostgreSQL + GitHub OAuth', language: 'Python', private: false, stargazers_count: 4, updated_at: '2024-03-10T10:00:00Z', html_url: '#' },
    { id: 2, name: 'react-keycloak-integration', description: 'React + TypeScript + Ant Design UI', language: 'TypeScript', private: true, stargazers_count: 7, updated_at: '2024-03-09T10:00:00Z', html_url: '#' },
    { id: 3, name: 'python-base', description: 'Base Python project with Docker and SQLAlchemy', language: 'Python', private: false, stargazers_count: 2, updated_at: '2024-03-08T10:00:00Z', html_url: '#' },
    { id: 4, name: 'portfolio', description: 'Personal portfolio with React + Tailwind CSS', language: 'JavaScript', private: false, stargazers_count: 12, updated_at: '2024-03-01T10:00:00Z', html_url: '#' },
    { id: 5, name: 'go-microservice', description: 'Microservice template with Go and Docker', language: 'Go', private: false, stargazers_count: 5, updated_at: '2024-02-20T10:00:00Z', html_url: '#' },
    { id: 6, name: 'rust-cli-tool', description: 'Command line tool built with Rust', language: 'Rust', private: true, stargazers_count: 3, updated_at: '2024-02-15T10:00:00Z', html_url: '#' },
]

const DUMMY_USER = {
    username: 'kubraemektar',
    email: 'kubra@github.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/124355274',
    github_id: 124355274,
}

const langColors: Record<string, string> = {
    Python: '#3572A5',
    TypeScript: '#2b7489',
    JavaScript: '#f1e05a',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
}

const columns = [
    {
        title: 'Repository',
        dataIndex: 'name',
        key: 'name',
        render: (_: any, repo: any) => (
            <div>
                <Link href={repo.html_url} target="_blank" className="repo-name">{repo.name}</Link>
                <div className="repo-desc">{repo.description || '—'}</div>
            </div>
        ),
    },
    {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        render: (lang: string) => lang ? (
            <span className="lang-badge">
                <span className="lang-dot" style={{ background: langColors[lang] || '#8b949e' }} />
                {lang}
            </span>
        ) : '—',
    },
    {
        title: 'Visibility',
        dataIndex: 'private',
        key: 'private',
        render: (isPrivate: boolean) => (
            <Tag className={`visibility ${isPrivate ? 'private' : 'public'}`}>
                {isPrivate ? 'Private' : 'Public'}
            </Tag>
        ),
    },
    {
        title: 'Stars',
        dataIndex: 'stargazers_count',
        key: 'stargazers_count',
        render: (count: number) => <Text className="date">⭐ {count}</Text>,
    },
    {
        title: 'Last Updated',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (date: string) => (
            <Text className="date">{new Date(date).toLocaleDateString('en-US')}</Text>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_: any, repo: any) => (
            <Space>
                <Button size="small" className="btn-analyze">Analyze</Button>
                <Button size="small" className="btn-test">Write Test</Button>
                <Button size="small" className="btn-review">PR Review</Button>
            </Space>
        ),
    },
]

const Profile = () => {
    const [repos, setRepos] = useState<any[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        setRepos(DUMMY_REPOS)
    }, [])

    const filteredRepos = repos.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="profile-page">

            <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <Avatar size={72} src={DUMMY_USER.avatar_url} />
                    <div>
                        <Typography.Title level={4} style={{ margin: 0, color: '#1f2328' }}>
                            {DUMMY_USER.username}
                        </Typography.Title>
                        <Text type="secondary">{DUMMY_USER.email}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                GitHub ID: {DUMMY_USER.github_id}
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            <Row gutter={12} style={{ marginBottom: 12 }}>
                {[
                    { label: 'Repositories', value: repos.length },
                    { label: 'Total Stars', value: repos.reduce((a, r) => a + r.stargazers_count, 0) },
                    { label: 'Languages', value: [...new Set(repos.map(r => r.language).filter(Boolean))].length },
                    { label: 'Public Repos', value: repos.filter(r => !r.private).length },
                ].map(({ label, value }) => (
                    <Col span={6} key={label}>
                        <Card className="profile-page__stats__card">
                            <Statistic title={label} value={value} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card
                className="profile-page__table-container"
                extra={
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8b949e' }} />}
                        placeholder="Search repos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 200 }}
                        className="repo-search"
                    />
                }
            >
                <Table
                    dataSource={filteredRepos}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className="repo-table"
                />
            </Card>
        </div>
    )
}

export default withLayout(<Profile />)