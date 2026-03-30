import { useEffect, useState, useContext } from 'react'
import { Table, Input, Button, Tag, Avatar, Card, Row, Col, Space, Typography, Tooltip, Flex, Select } from 'antd'
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons'
import { RiGitRepositoryLine } from 'react-icons/ri'
import { GoStar, GoGitPullRequest, GoRepoForked, GoEye, GoLocation, GoOrganization, GoMail, GoLinkExternal } from 'react-icons/go'
import { VscCode, VscBeaker } from 'react-icons/vsc'
import { MdLockOpen } from 'react-icons/md'
import { TbZoomCode } from 'react-icons/tb'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { AuthContext } from '../../context/authContext'
import { api } from '../../services'
import toast from 'react-hot-toast'
import { LuFilterX } from "react-icons/lu"
import './index.scss'

const { Text, Link } = Typography

const languageColors: Record<string, string> = {
    Python: 'lang-dot--python',
    TypeScript: 'lang-dot--typescript',
    JavaScript: 'lang-dot--javascript',
    Go: 'lang-dot--go',
    Rust: 'lang-dot--rust',
    Java: 'lang-dot--java',
}

const normalizeSearch = (text: string) =>
    text
        .replace(/ı/g, 'i').replace(/İ/g, 'i')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/Ü/g, 'u')
        .replace(/ş/g, 's').replace(/Ş/g, 's')
        .replace(/ö/g, 'o').replace(/Ö/g, 'o')
        .replace(/ç/g, 'c').replace(/Ç/g, 'c')
        .toLowerCase()

const Profile = () => {
    const { t } = useTranslation()
    const { user, token } = useContext(AuthContext)

    const [allRepos, setAllRepos] = useState<any[]>([])
    const [repos, setRepos] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [allReposLoading, setAllReposLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [languageFilter, setLanguageFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('updated')
    const [currentPage, setCurrentPage] = useState(0)
    const [stats, setStats] = useState<any>(null)

    const isFiltered = search || typeFilter !== 'all' || languageFilter !== 'all' || sortBy !== 'updated'

    const clearFilters = () => {
        setSearch('')
        setTypeFilter('all')
        setLanguageFilter('all')
        setSortBy('updated')
        setCurrentPage(0)
    }

    const getRepos = async () => {
        if (!token) return
        try {
            const { data, error } = await api.profile.getRepos(token)
            if (error) toast.error(error)
            else setAllRepos(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching repositories:', error)
            toast.error(t('profile.fetchReposError'))
        }
    }

    const getStats = async () => {
        if (!token) return
        setAllReposLoading(true)
        try {
            const { data, error } = await api.profile.getRepoStats(token)
            if (error) toast.error(error)
            else setStats(data)
        } catch (err) {
            console.error(err)
        } finally {
            setAllReposLoading(false)
        }
    }

    const getReposWithSearch = async () => {
        if (!token) return
        setLoading(true)
        try {
            const payload = {
                type: typeFilter,
                language: languageFilter,
                sort: sortBy,
                search,
                page: currentPage,
                per_page: 10,
            }
            const { data, error } = await api.profile.getReposWithSearch(token, payload)
            if (error) toast.error(error)
            else {
                setRepos(Array.isArray(data?.items) ? data.items : [])
                setTotal(typeof data?.total === 'number' ? data.total : 0)
            }
        } catch (error) {
            console.error('Error fetching repositories with search:', error)
            toast.error(t('profile.fetchFilteredReposError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { getRepos(); getStats() }, [token])
    useEffect(() => { getReposWithSearch() }, [token, typeFilter, languageFilter, sortBy, search, currentPage])
    useEffect(() => { setCurrentPage(0) }, [typeFilter, languageFilter, sortBy, search])

    const languages = ['all', ...Array.from(new Set(allRepos.map(r => r.language).filter(Boolean)))]

    const statItems = [
        {
            label: t('profile.totalRepositories'),
            value: stats?.total ?? 0,
            icon: <RiGitRepositoryLine size={20} />,
            iconClass: 'stat-icon--blue'
        },
        {
            label: t('profile.languages'),
            value: stats?.languages ?? 0,
            icon: <VscCode size={20} />,
            iconClass: 'stat-icon--purple'
        },
        {
            label: t('profile.totalStars'),
            value: stats?.stars ?? 0,
            icon: <GoStar size={20} />,
            iconClass: 'stat-icon--orange'
        },
        {
            label: t('profile.publicRepos'),
            value: stats?.public ?? 0,
            icon: <MdLockOpen size={20} />,
            iconClass: 'stat-icon--pink'
        },
    ]

    const columns = [
        {
            title: t('profile.repository'), dataIndex: 'name', key: 'name',
            render: (_: any, repo: any) => (
                <div>
                    <Link href={repo.html_url} target="_blank" className="repo-name">{repo.name}</Link>
                    <div className="repo-desc">{repo.description || t('profile.noDescription')}</div>
                    {repo?.topics?.length > 0 && (
                        <div className="repo-topics">
                            {repo.topics.slice(0, 3).map((topic: string) => (
                                <Tag key={topic} className="repo-topic-tag">{topic}</Tag>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: t('profile.language'), dataIndex: 'language', key: 'language',
            render: (lang: string) => lang ? (
                <span className="lang-badge">
                    <span className={`lang-dot ${languageColors[lang] || 'lang-dot--default'}`} />
                    {lang}
                </span>
            ) : '—',
        },
        {
            title: t('profile.branch'), dataIndex: 'default_branch', key: 'default_branch',
            render: (branch: string) => <Tag className="branch-tag">{branch || 'main'}</Tag>,
        },
        {
            title: t('profile.visibility'), dataIndex: 'is_private', key: 'is_private',
            render: (isPrivate: boolean) => (
                <Tag className={`visibility ${isPrivate ? 'private' : 'public'}`}>
                    {isPrivate ? t('profile.privateLabel') : t('profile.publicLabel')}
                </Tag>
            ),
        },
        {
            title: t('profile.stars'), dataIndex: 'stars', key: 'stars',
            render: (count: number) => (
                <Space size={4} className="profile-page__cell">
                    <GoStar className="profile-page__cell-icon profile-page__cell-icon--orange" size={13} />
                    <Text className="profile-page__cell-text">{count}</Text>
                </Space>
            ),
        },
        {
            title: t('profile.forks'), dataIndex: 'forks_count', key: 'forks_count',
            render: (count: number) => (
                <Space size={4} className="profile-page__cell">
                    <GoRepoForked className="profile-page__cell-icon profile-page__cell-icon--purple" size={13} />
                    <Text className="profile-page__cell-text">{count}</Text>
                </Space>
            ),
        },
        {
            title: t('profile.watchers'), dataIndex: 'watchers_count', key: 'watchers_count',
            render: (count: number) => (
                <Space size={4} className="profile-page__cell">
                    <GoEye className="profile-page__cell-icon profile-page__cell-icon--muted" size={13} />
                    <Text className="profile-page__cell-text">{count}</Text>
                </Space>
            ),
        },
        {
            title: t('profile.size'), dataIndex: 'size', key: 'size',
            render: (size: number) => (
                <Text className="profile-page__cell-text">
                    {size > 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size} KB`}
                </Text>
            ),
        },
        {
            title: t('profile.updated'), dataIndex: 'updated_at', key: 'updated_at',
            render: (date: string) => <Text className="date">{new Date(date).toLocaleDateString('en-US')}</Text>,
        },
        {
            title: t('profile.actions'), key: 'actions',
            render: (_: any, _repo: any) => (
                <Space>
                    <Tooltip title={t('profile.analyzeCodebase')}><Button size="small" type="text" icon={<TbZoomCode size={20} />} /></Tooltip>
                    <Tooltip title={t('profile.writeTests')}><Button size="small" type="text" icon={<VscBeaker size={20} />} /></Tooltip>
                    <Tooltip title={t('profile.prReview')}><Button size="small" type="text" icon={<GoGitPullRequest size={20} />} /></Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <div className="profile-page">
            <Card className="profile-page__user-card">
                <Flex align="flex-start" justify='space-between' className="profile-page__user-header">
                    <Flex gap={20}>
                        <Avatar size={80} src={user?.avatar_url} className="profile-page__user-avatar" />
                        <Flex vertical className="profile-page__user-info">
                            <Typography.Title level={3} className="profile-page__user-name">{user?.name || user?.username}</Typography.Title>
                            <Text className="profile-page__user-meta">@{user?.username}</Text>
                            {user?.bio && <Text className="profile-page__user-meta profile-page__user-bio">{user.bio}</Text>}
                            {user?.email && <Flex align="center" gap={6} wrap="wrap"><GoMail size={14} className="profile-page__user-icon" /><Text className="profile-page__user-meta">{user.email}</Text></Flex>}
                            {user?.location && <Flex align="center" gap={6} wrap="wrap"><GoLocation size={14} className="profile-page__user-icon" /><Text className="profile-page__user-meta">{user.location}</Text></Flex>}
                            {user?.company && <Flex align="center" gap={6} wrap="wrap"><GoOrganization size={14} className="profile-page__user-icon" /><Text className="profile-page__user-meta">{user.company}</Text></Flex>}
                        </Flex>
                    </Flex>
                    <Flex align="center" gap={6} className="profile-page__user-link-wrap">
                        <GoLinkExternal size={14} className="profile-page__user-icon" />
                        <Link href={user?.html_url} target="_blank" className="profile-page__user-link">{t('profile.viewOnGithub')}</Link>
                    </Flex>
                </Flex>
            </Card>

            <div className="profile-page__scroll-container">
                <Row gutter={[12, 12]} className="profile-page__stat-row">
                    {statItems.map(({ label, value, icon, iconClass }) => (
                        <Col xs={24} sm={12} lg={6} key={label}>
                            <Card className="profile-page__stats__card" loading={allReposLoading}>
                                <Flex gap={12} align="flex-start">
                                    <Flex align="center" justify="center" className={`profile-page__stat-icon ${iconClass}`}>{icon}</Flex>
                                    <Flex vertical justify="flex-start" align="flex-start" className="profile-page__stat-content">
                                        <Typography.Title level={3} className="profile-page__stat-value">{value}</Typography.Title>
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
                        <Flex align="center" gap={8} wrap="wrap" className="profile-page__filters">
                            <Input
                                prefix={<SearchOutlined className="profile-page__search-icon" />}
                                suffix={search ? <CloseCircleFilled className="profile-page__search-clear" onClick={() => setSearch('')} /> : null}
                                placeholder={t('profile.searchRepositories')}
                                value={search}
                                onChange={e => setSearch(normalizeSearch(e.target.value))}
                                className="repo-search"
                            />
                            <Select
                                value={typeFilter}
                                onChange={v => { setTypeFilter(v); setCurrentPage(0) }}
                                placeholder={t('profile.selectType')}
                                className="profile-page__filter-select profile-page__filter-select--sm"
                                allowClear
                                onClear={() => { setTypeFilter('all'); setCurrentPage(0) }}
                                options={[
                                    { value: 'all', label: t('profile.allTypes') },
                                    { value: 'public', label: t('profile.public') },
                                    { value: 'private', label: t('profile.privateLabel') },
                                    { value: 'forks', label: t('profile.forksFilter') },
                                ]}
                            />
                            <Select
                                value={languageFilter}
                                onChange={v => { setLanguageFilter(v); setCurrentPage(0) }}
                                placeholder={t('profile.selectLanguage')}
                                className="profile-page__filter-select profile-page__filter-select--md"
                                allowClear
                                onClear={() => { setLanguageFilter('all'); setCurrentPage(0) }}
                                options={languages.map(lang => ({
                                    value: lang,
                                    label: lang === 'all' ? t('profile.allLanguages') : lang,
                                }))}
                            />
                            <Button
                                icon={<LuFilterX />}
                                size="small"
                                onClick={clearFilters}
                                type="text"
                                className="profile-page__clear-btn"
                                disabled={!isFiltered}
                            >
                                {t('profile.clear')}
                            </Button>
                        </Flex>
                    }
                >
                    <Table
                        dataSource={repos}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            current: currentPage + 1,
                            pageSize: 10,
                            total,
                            onChange: (page) => setCurrentPage(page - 1),
                        }}
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