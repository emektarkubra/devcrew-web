import { useEffect, useState, useContext } from 'react'
import { Table, Input, Button, Tag, Avatar, Card, Row, Col, Space, Typography, Tooltip, Flex, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { RiGitRepositoryLine } from 'react-icons/ri'
import { GoStar, GoGitPullRequest, GoRepoForked, GoIssueOpened, GoEye, GoLocation, GoOrganization, GoMail, GoLinkExternal } from 'react-icons/go'
import { VscCode, VscBeaker } from 'react-icons/vsc'
import { MdLockOpen } from 'react-icons/md'
import { TbZoomCode } from 'react-icons/tb'
import withLayout from '../../layout/withLayout'
import { AuthContext } from '../../context/authContext'
import { api } from '../../services'
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

const Profile = () => {
    const { user, token } = useContext(AuthContext)
    const [repos, setRepos] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [languageFilter, setLanguageFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('updated')

    useEffect(() => {
        if (!token) return
        setLoading(true)
        api.login.getRepos(token)
            .then((r: any) => setRepos(r.data || []))
            .finally(() => setLoading(false))
    }, [token])

    const languages = ['all', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean)))]

    const statItems = [
        {
            label: 'Total Repositories',
            value: repos.length,
            icon: <RiGitRepositoryLine size={20} />,
            iconBg: '#ddf4ff',
            iconColor: '#0969da',
            sub: `${repos.filter(r => r.private).length} private`,
        },
        {
            label: 'Languages',
            value: [...new Set(repos.map(r => r.language).filter(Boolean))].length,
            icon: <VscCode size={20} />,
            iconBg: '#fbefff',
            iconColor: '#8250df',
            sub: 'different languages',
        },
        {
            label: 'Total Stars',
            value: repos.reduce((a, r) => a + r.stargazers_count, 0),
            icon: <GoStar size={20} />,
            iconBg: '#fff1e5',
            iconColor: '#bc4c00',
            sub: 'across all repos',
        },
        {
            label: 'Public Repos',
            value: repos.filter(r => !r.private).length,
            icon: <MdLockOpen size={20} />,
            iconBg: '#ffeff7',
            iconColor: '#bf3989',
            sub: `${repos.filter(r => r.private).length} private repos`,
        },
    ]

    const columns = [
        {
            title: 'Repository',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, repo: any) => (
                <div>
                    <Link href={repo.html_url} target="_blank" className="repo-name">{repo.name}</Link>
                    <div className="repo-desc">{repo.description || '—'}</div>
                    {repo.topics?.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {repo.topics.slice(0, 3).map((topic: string) => (
                                <Tag key={topic} style={{ fontSize: 11, borderRadius: 20, margin: 0, background: '#ddf4ff', color: '#0550ae', borderColor: '#54aeff66' }}>
                                    {topic}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Language',
            dataIndex: 'language',
            key: 'language',
            render: (lang: string) => lang ? (
                <span className="lang-badge">
                    <span className="lang-dot" style={{ background: languageColors[lang] || '#8b949e' }} />
                    {lang}
                </span>
            ) : '—',
        },
        {
            title: 'Branch',
            dataIndex: 'default_branch',
            key: 'default_branch',
            render: (branch: string) => (
                <Tag style={{ fontSize: 11, borderRadius: 20, background: '#f6f8fa', color: '#656d76', borderColor: '#d0d7de' }}>
                    {branch || 'main'}
                </Tag>
            ),
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
            sorter: (a: any, b: any) => a.stargazers_count - b.stargazers_count,
            render: (count: number) => (
                <Space size={4}>
                    <GoStar size={13} style={{ color: '#bc4c00' }} />
                    <Text style={{ fontSize: 12, color: '#656d76' }}>{count}</Text>
                </Space>
            ),
        },
        {
            title: 'Forks',
            dataIndex: 'forks_count',
            key: 'forks_count',
            sorter: (a: any, b: any) => a.forks_count - b.forks_count,
            render: (count: number) => (
                <Space size={4}>
                    <GoRepoForked size={13} style={{ color: '#8250df' }} />
                    <Text style={{ fontSize: 12, color: '#656d76' }}>{count}</Text>
                </Space>
            ),
        },
        {
            title: 'Issues',
            dataIndex: 'open_issues_count',
            key: 'open_issues_count',
            sorter: (a: any, b: any) => a.open_issues_count - b.open_issues_count,
            render: (count: number) => (
                <Space size={4}>
                    <GoIssueOpened size={13} style={{ color: count > 0 ? '#0969da' : '#8c959f' }} />
                    <Text style={{ fontSize: 12, color: count > 0 ? '#0969da' : '#656d76' }}>{count}</Text>
                </Space>
            ),
        },
        {
            title: 'Watchers',
            dataIndex: 'watchers_count',
            key: 'watchers_count',
            render: (count: number) => (
                <Space size={4}>
                    <GoEye size={13} style={{ color: '#656d76' }} />
                    <Text style={{ fontSize: 12, color: '#656d76' }}>{count}</Text>
                </Space>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            sorter: (a: any, b: any) => a.size - b.size,
            render: (size: number) => (
                <Text style={{ fontSize: 12, color: '#656d76' }}>
                    {size > 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size} KB`}
                </Text>
            ),
        },
        {
            title: 'Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a: any, b: any) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
            render: (date: string) => (
                <Text className="date">{new Date(date).toLocaleDateString('en-US')}</Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, repo: any) => (
                <Space>
                    <Tooltip title="Analyze codebase">
                        <Button size="small" type="text" icon={<TbZoomCode size={20} />} />
                    </Tooltip>
                    <Tooltip title="Write tests">
                        <Button size="small" type="text" icon={<VscBeaker size={20} />} />
                    </Tooltip>
                    <Tooltip title="PR Review">
                        <Button size="small" type="text" icon={<GoGitPullRequest size={20} />} />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <div className="container profile-page">
            <Card className="profile-page__user-card">
                <Flex align="flex-start" gap={20}>
                    <Avatar size={80} src={user?.avatar_url} className="profile-page__user-avatar" />
                    <Flex vertical style={{ flex: 1 }}>
                        <Typography.Title level={3} className="profile-page__user-name">
                            {user?.name || user?.username}
                        </Typography.Title>
                        <Text className="profile-page__user-meta">@{user?.username}</Text>
                        {user?.bio && (
                            <Text className="profile-page__user-meta" style={{ marginBottom: 10 }}>{user.bio}</Text>
                        )}
                        {user?.email && (
                            <Flex align="center" gap={6}>
                                <GoMail size={14} className="profile-page__user-icon" />
                                <Text className="profile-page__user-meta">{user.email}</Text>
                            </Flex>
                        )}
                        {user?.location && (
                            <Flex align="center" gap={6}>
                                <GoLocation size={14} className="profile-page__user-icon" />
                                <Text className="profile-page__user-meta">{user.location}</Text>
                            </Flex>
                        )}
                        {user?.company && (
                            <Flex align="center" gap={6}>
                                <GoOrganization size={14} className="profile-page__user-icon" />
                                <Text className="profile-page__user-meta">{user.company}</Text>
                            </Flex>
                        )}
                    </Flex>
                    <Flex align="center" gap={6}>
                        <GoLinkExternal size={14} className="profile-page__user-icon" />
                        <Link href={user?.html_url} target="_blank" className="profile-page__user-link">View on GitHub</Link>
                    </Flex>
                </Flex>
            </Card>

            <div className="profile-page__scroll-container">
                <Row gutter={12} className="profile-page__stat-row">
                    {statItems.map(({ label, value, icon, iconBg, iconColor }) => (
                        <Col span={6} key={label}>
                            <Card className="profile-page__stats__card" loading={loading}>
                                <Flex gap={12} align="flex-start">
                                    <Flex
                                        align="center"
                                        justify="center"
                                        className="profile-page__stat-icon"
                                        style={{ background: iconBg, color: iconColor }}
                                    >
                                        {icon}
                                    </Flex>
                                    <Flex vertical justify="flex-start" align="flex-start" style={{ marginLeft: 10 }}>
                                        <Typography.Title level={2} className="profile-page__stat-value">{value}</Typography.Title>
                                        <div className="profile-page__stat-label">{label}</div>
                                    </Flex>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card
                    className="profile-page__table-container"
                    extra={
                        <div className="profile-page__filters">
                            <Input
                                prefix={<SearchOutlined style={{ color: '#8b949e' }} />}
                                placeholder="Search repositories..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: 180 }}
                                className="repo-search"
                            />
                            <Select
                                value={typeFilter}
                                onChange={setTypeFilter}
                                style={{ width: 120 }}
                                options={[
                                    { value: 'all', label: 'All types' },
                                    { value: 'public', label: 'Public' },
                                    { value: 'private', label: 'Private' },
                                    { value: 'forks', label: 'Forks' },
                                    { value: 'archived', label: 'Archived' },
                                ]}
                            />
                            <Select
                                value={languageFilter}
                                onChange={setLanguageFilter}
                                style={{ width: 140 }}
                                options={languages?.map(lang => ({
                                    value: lang,
                                    label: lang === 'all' ? 'All languages' : lang,
                                }))}
                            />
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                style={{ width: 140 }}
                                options={[
                                    { value: 'updated', label: 'Last updated' },
                                    { value: 'created', label: 'Newest' },
                                    { value: 'name', label: 'Name' },
                                    { value: 'stars', label: 'Stars' },
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
                        className="repo-table"
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </div>
        </div>
    )
}

export default withLayout(<Profile />)