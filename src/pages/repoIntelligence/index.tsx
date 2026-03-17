import React, { useState } from 'react'
import {
    Card,
    Flex,
    Tag,
    Typography,
    List,
    Select,
    Progress,
} from 'antd'
import {
    FileOutlined,
    BugOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons'
import withLayout from '../../layout/withLayout'

const { Text } = Typography

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModuleHealth {
    name: string
    path: string
    bugRate: number
    coverage: number
    complexity: 'low' | 'medium' | 'high'
    lastChanged: string
    changeCount: number
}

interface ActivityItem {
    type: 'bug' | 'pr' | 'commit' | 'review'
    message: string
    file: string
    timeAgo: string
}

interface ContributorItem {
    name: string
    commits: number
    prs: number
    percentage: number
}

interface HotspotItem {
    file: string
    bugCount: number
    percentage: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COMPLEXITY_CONFIG = {
    low:    { color: 'green',  label: 'Düşük'  },
    medium: { color: 'orange', label: 'Orta'   },
    high:   { color: 'red',    label: 'Yüksek' },
}

const ACTIVITY_CONFIG = {
    bug:    { color: '#dc2626', label: 'Bug'    },
    pr:     { color: '#185FA5', label: 'PR'     },
    commit: { color: '#16a34a', label: 'Commit' },
    review: { color: '#d97706', label: 'Review' },
}

const MOCK_MODULES: ModuleHealth[] = [
    { name: 'payment_service.py', path: 'app/services/', bugRate: 30, coverage: 42, complexity: 'high',   lastChanged: '2 saat önce',  changeCount: 47 },
    { name: 'auth_service.py',    path: 'app/services/', bugRate: 8,  coverage: 88, complexity: 'medium', lastChanged: '1 gün önce',   changeCount: 23 },
    { name: 'user_controller.py', path: 'app/routes/',   bugRate: 12, coverage: 74, complexity: 'medium', lastChanged: '3 gün önce',   changeCount: 31 },
    { name: 'jwt_middleware.py',  path: 'app/core/',     bugRate: 4,  coverage: 91, complexity: 'low',    lastChanged: '1 hafta önce', changeCount: 9  },
    { name: 'config.py',          path: 'app/',          bugRate: 2,  coverage: 95, complexity: 'low',    lastChanged: '2 hafta önce', changeCount: 5  },
]

const MOCK_ACTIVITY: ActivityItem[] = [
    { type: 'bug',    message: 'Stripe timeout handle edilmedi',    file: 'payment_service.py', timeAgo: '2 saat önce'  },
    { type: 'pr',     message: 'PR #42 merge edildi',               file: 'auth_service.py',    timeAgo: '4 saat önce'  },
    { type: 'commit', message: 'JWT refresh logic güncellendi',     file: 'jwt_middleware.py',  timeAgo: '6 saat önce'  },
    { type: 'review', message: 'PR #41 review bekleniyor',          file: 'user_controller.py', timeAgo: '8 saat önce'  },
    { type: 'bug',    message: 'Null pointer — user_id boş geldi',  file: 'user_controller.py', timeAgo: '1 gün önce'   },
    { type: 'commit', message: 'Config env variable refactor',      file: 'config.py',          timeAgo: '2 gün önce'   },
]

const MOCK_CONTRIBUTORS: ContributorItem[] = [
    { name: 'sumeyra',  commits: 89, prs: 14, percentage: 52 },
    { name: 'ahmet',    commits: 43, prs: 8,  percentage: 25 },
    { name: 'elif',     commits: 28, prs: 5,  percentage: 16 },
    { name: 'mehmet',   commits: 12, prs: 2,  percentage: 7  },
]

const MOCK_HOTSPOTS: HotspotItem[] = [
    { file: 'payment_service.py', bugCount: 12, percentage: 30 },
    { file: 'user_controller.py', bugCount: 7,  percentage: 18 },
    { file: 'auth_service.py',    bugCount: 4,  percentage: 10 },
    { file: 'jwt_middleware.py',  bugCount: 2,  percentage: 5  },
]

// ── Main Component ────────────────────────────────────────────────────────────

const RepoIntelligence: React.FC = () => {
    const [period, setPeriod]         = useState('30d')
    const [sortBy, setSortBy]         = useState('bugRate')

    const sortedModules = [...MOCK_MODULES].sort((a, b) => {
        if (sortBy === 'bugRate')    return b.bugRate - a.bugRate
        if (sortBy === 'coverage')  return a.coverage - b.coverage
        if (sortBy === 'changes')   return b.changeCount - a.changeCount
        return 0
    })

    return (
        <div style={{ borderRadius: 6, overflow: 'hidden', backgroundColor: '#fff', margin: 20 }}>

            {/* Header */}
            <Flex
                align="center"
                justify="space-between"
                style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}
            >
                <Flex align="center" gap={10}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#0F6E56', flexShrink: 0 }} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Repo Intelligence</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            myorg/backend-api · engineering dashboard
                        </Text>
                    </Flex>
                </Flex>
                <Flex align="center" gap={8}>
                    <Select
                        value={period}
                        onChange={setPeriod}
                        size="small"
                        style={{ width: 110 }}
                        options={[
                            { value: '7d',  label: 'Son 7 gün'  },
                            { value: '30d', label: 'Son 30 gün' },
                            { value: '90d', label: 'Son 90 gün' },
                        ]}
                    />
                    <Tag style={{ background: '#e1f5ee', color: '#0F6E56', border: '1px solid #9FE1CB' }}>
                        Canlı
                    </Tag>
                </Flex>
            </Flex>

            <Flex vertical gap={16} style={{ padding: 20 }}>

                {/* Üst metrik kartlar */}
                <Flex gap={10}>
                    <Card size="small" style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Toplam bug</Text>
                        <Text style={{ fontSize: 22, fontWeight: 500, color: '#dc2626' }}>38</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>+4 bu hafta</Text>
                    </Card>
                    <Card size="small" style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ortalama coverage</Text>
                        <Text style={{ fontSize: 22, fontWeight: 500, color: '#16a34a' }}>%78</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>+3% bu ay</Text>
                    </Card>
                    <Card size="small" style={{ flex: 1, background: '#f9fafb' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Açık PR</Text>
                        <Text style={{ fontSize: 22, fontWeight: 500 }}>7</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>2 review bekliyor</Text>
                    </Card>
                    <Card size="small" style={{ flex: 1, background: '#f9fafb' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Toplam commit</Text>
                        <Text style={{ fontSize: 22, fontWeight: 500 }}>172</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>bu ay</Text>
                    </Card>
                    <Card size="small" style={{ flex: 1, background: '#fffbeb', border: '1px solid #fde68a' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Risk skoru</Text>
                        <Text style={{ fontSize: 22, fontWeight: 500, color: '#d97706' }}>64</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Orta seviye</Text>
                    </Card>
                </Flex>

                {/* Module health + Hotspots yan yana */}
                <Flex gap={16} style={{ alignItems: 'stretch' }}>

                    {/* Module health tablosu */}
                    <Flex vertical gap={8} style={{ flex: 2 }}>
                        <Flex align="center" justify="space-between">
                            <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>MODULE HEALTH</Text>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                size="small"
                                style={{ width: 140 }}
                                options={[
                                    { value: 'bugRate',  label: 'Bug rate'   },
                                    { value: 'coverage', label: 'Coverage'   },
                                    { value: 'changes',  label: 'Değişiklik' },
                                ]}
                            />
                        </Flex>
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {sortedModules.map((mod) => (
                                <div
                                    key={mod.name}
                                    style={{
                                        padding: '10px 12px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Flex align="center" justify="space-between" style={{ marginBottom: 6 }}>
                                        <Flex align="center" gap={8}>
                                            <FileOutlined style={{ color: '#9ca3af', fontSize: 13 }} />
                                            <Text code style={{ fontSize: 12 }}>{mod.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>{mod.path}</Text>
                                        </Flex>
                                        <Flex align="center" gap={6}>
                                            <Tag color={COMPLEXITY_CONFIG[mod.complexity].color} style={{ margin: 0, fontSize: 10 }}>
                                                {COMPLEXITY_CONFIG[mod.complexity].label}
                                            </Tag>
                                            <Flex align="center" gap={4}>
                                                <ClockCircleOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
                                                <Text type="secondary" style={{ fontSize: 10 }}>{mod.lastChanged}</Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                    <Flex gap={16}>
                                        <Flex align="center" gap={6} style={{ flex: 1 }}>
                                            <BugOutlined style={{ fontSize: 11, color: '#dc2626' }} />
                                            <Text type="secondary" style={{ fontSize: 11 }}>Bug rate</Text>
                                            <Progress
                                                percent={mod.bugRate}
                                                size="small"
                                                showInfo={false}
                                                strokeColor={mod.bugRate > 20 ? '#dc2626' : mod.bugRate > 10 ? '#d97706' : '#16a34a'}
                                                style={{ flex: 1, margin: 0 }}
                                            />
                                            <Text style={{ fontSize: 11, fontWeight: 500, minWidth: 28 }}>%{mod.bugRate}</Text>
                                        </Flex>
                                        <Flex align="center" gap={6} style={{ flex: 1 }}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>Coverage</Text>
                                            <Progress
                                                percent={mod.coverage}
                                                size="small"
                                                showInfo={false}
                                                strokeColor={mod.coverage > 80 ? '#16a34a' : mod.coverage > 60 ? '#d97706' : '#dc2626'}
                                                style={{ flex: 1, margin: 0 }}
                                            />
                                            <Text style={{ fontSize: 11, fontWeight: 500, minWidth: 28 }}>%{mod.coverage}</Text>
                                        </Flex>
                                    </Flex>
                                </div>
                            ))}
                        </div>
                    </Flex>

                    {/* Hotspots */}
                    <Flex vertical gap={8} style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>BUG HOTSPOTS</Text>
                        <Card size="small" style={{ background: '#fef2f2', flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                Payment module toplam bugların %30'una neden oluyor
                            </Text>
                            <Flex vertical gap={10}>
                                {MOCK_HOTSPOTS.map((h) => (
                                    <div key={h.file}>
                                        <Flex align="center" justify="space-between" style={{ marginBottom: 4 }}>
                                            <Text code style={{ fontSize: 11 }}>{h.file}</Text>
                                            <Flex align="center" gap={4}>
                                                <BugOutlined style={{ fontSize: 10, color: '#dc2626' }} />
                                                <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>{h.bugCount}</Text>
                                            </Flex>
                                        </Flex>
                                        <Progress
                                            percent={h.percentage}
                                            size="small"
                                            showInfo={false}
                                            strokeColor="#dc2626"
                                        />
                                    </div>
                                ))}
                            </Flex>
                        </Card>
                    </Flex>

                </Flex>

                {/* Activity + Contributors yan yana */}
                <Flex gap={16} style={{ alignItems: 'stretch' }}>

                    {/* Son aktiviteler */}
                    <Flex vertical gap={8} style={{ flex: 2 }}>
                        <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>SON AKTİVİTELER</Text>
                        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                            <List
                                dataSource={MOCK_ACTIVITY}
                                split
                                renderItem={(item) => (
                                    <List.Item style={{ padding: 0 }}>
                                        <Flex align="flex-start" gap={10} style={{ padding: '10px 0', width: '100%' }}>
                                            <div style={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                background: ACTIVITY_CONFIG[item.type].color,
                                                marginTop: 5, flexShrink: 0,
                                            }} />
                                            <Flex align="center" justify="space-between" style={{ flex: 1 }}>
                                                <Flex vertical gap={2}>
                                                    <Flex align="center" gap={6}>
                                                        <Tag
                                                            style={{
                                                                fontSize: 10,
                                                                margin: 0,
                                                                padding: '0 5px',
                                                                color: ACTIVITY_CONFIG[item.type].color,
                                                                borderColor: ACTIVITY_CONFIG[item.type].color,
                                                                background: 'transparent',
                                                            }}
                                                        >
                                                            {ACTIVITY_CONFIG[item.type].label}
                                                        </Tag>
                                                        <Text style={{ fontSize: 13 }}>{item.message}</Text>
                                                    </Flex>
                                                    <Text code style={{ fontSize: 11 }}>{item.file}</Text>
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, marginLeft: 12 }}>
                                                    {item.timeAgo}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Flex>

                    {/* Contributors */}
                    <Flex vertical gap={8} style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>CONTRIBUTORS</Text>
                        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                            {MOCK_CONTRIBUTORS.map((c) => (
                                <div key={c.name} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <Flex align="center" justify="space-between" style={{ marginBottom: 6 }}>
                                        <Flex align="center" gap={8}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: '#e1f5ee',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 500, color: '#0F6E56', flexShrink: 0,
                                            }}>
                                                {c.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <Text style={{ fontSize: 13 }}>{c.name}</Text>
                                        </Flex>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {c.commits} commit · {c.prs} PR
                                        </Text>
                                    </Flex>
                                    <Progress
                                        percent={c.percentage}
                                        size="small"
                                        strokeColor="#0F6E56"
                                        format={(p) => `%${p}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </Flex>

                </Flex>

            </Flex>
        </div>
    )
}

export default withLayout(<RepoIntelligence />)