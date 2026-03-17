import { useState } from 'react'
import { Button, Card, Flex, Input, Space, Tag, Typography, List, Avatar } from 'antd'
import { FileOutlined, SearchOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'

const { Text } = Typography



const MOCK_HISTORY = [
    { pr: '#41', title: 'Add user profile page', issueCount: 1, timeAgo: '1 saat önce' },
    { pr: '#40', title: 'Fix login redirect bug', issueCount: 0, timeAgo: '3 saat önce' },
    { pr: '#39', title: 'Refactor auth middleware', issueCount: 4, timeAgo: '1 gün önce' },
]

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
    high:   { color: 'red',    label: 'Yüksek risk' },
    medium: { color: 'orange', label: 'Orta risk'   },
    low:    { color: 'green',  label: 'Düşük risk'  },
}

const DEFAULT_RESULT = {
    title: 'Add Stripe payment integration',
    number: '#42',
    author: 'sumeyra',
    timeAgo: '2 saat önce',
    riskScore: 72,
    changedFiles: 8,
    criticalIssues: 3,
    issues: [
        {
            title: 'Timeout hatası handle edilmemiş',
            description: 'Stripe API çağrısında timeout durumunda exception fırlatılıyor, retry logic yok.',
            file: 'payment_service.py · satır 142',
            severity: 'high',
        },
        {
            title: "API key environment'dan okunmuyor",
            description: 'Stripe secret key hardcode edilmiş görünüyor, env variable kullanılmalı.',
            file: 'config.py · satır 17',
            severity: 'medium',
        },
        {
            title: 'Eksik unit test',
            description: 'payment_validator fonksiyonu için test coverage %0.',
            file: 'tests/ · test yok',
            severity: 'low',
        },
    ],
    diff: [
        { type: 'context', content: '  def charge_customer(amount, card_token):' },
        { type: 'remove', content: '-   stripe.Charge.create(amount=amount, source=card_token)' },
        { type: 'add', content: '+   try:' },
        { type: 'add', content: '+     stripe.Charge.create(amount=amount, source=card_token)' },
        { type: 'add', content: '+   except stripe.error.Timeout as e:' },
        { type: 'add', content: '+     retry_with_backoff(charge_customer, amount, card_token)' },
    ],
    files: [
        { name: 'payment_service.py', path: 'app/services/', changes: '+47 -12', risk: 'high' },
        { name: 'auth_middleware.py', path: 'app/core/', changes: '+8 -3', risk: 'medium' },
        { name: 'user_controller.py', path: 'app/routes/', changes: '+5 -1', risk: 'low' },
        { name: 'config.py', path: 'app/', changes: '+2 -0', risk: 'low' },
    ],
}

const PRReview = () => {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<any>(DEFAULT_RESULT)
    const [loading, setLoading] = useState(false)

    const handleReview = async () => {
        if (!query.trim()) return
        setLoading(true)
        setResult(null)

        // TODO: API CALL

        await new Promise((r) => setTimeout(r, 900))
        setResult(DEFAULT_RESULT)
        setLoading(false)
    }

    const diffColor = (type: any['type']) => {
        if (type === 'add') return '#16a34a'
        if (type === 'remove') return '#dc2626'
        return '#6b7280'
    }

    return (
        <div style={{ borderRadius: 6, overflow: 'hidden', backgroundColor: '#fff', margin: 20 }}>

            <Flex
                align="center"
                justify="space-between"
                style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}
            >
                <Flex align="center" gap={10}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#BA7517', flexShrink: 0 }} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>PR Review Agent</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Diff analizi · risk skoru · önerilen fix
                        </Text>
                    </Flex>
                </Flex>
                <Tag color="orange">3 issue</Tag>
            </Flex>

            {/* Body */}
            <Flex vertical gap={16} style={{ padding: 20 }}>

                {/* Arama */}
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onPressEnter={handleReview}
                        placeholder="PR numarası veya branch adı girin... (ör: #42)"
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                    />
                    <Button
                        type="primary"
                        onClick={handleReview}
                        loading={loading}
                        style={{ background: '#BA7517' }}
                    >
                        İncele
                    </Button>
                </Space.Compact>

                {result && !loading && (
                    <>
                        <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                            <Text code>{result.number}</Text>
                            <Text strong style={{ fontSize: 14 }}>{result.title}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {result.author} · {result.timeAgo}
                            </Text>
                        </Flex>

                        {/* Skor kartları */}
                        <Flex gap={10}>
                            <Card size="small" style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca' }}>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Risk skoru</Text>
                                <Text style={{ fontSize: 22, fontWeight: 500, color: '#dc2626' }}>{result.riskScore}</Text>
                            </Card>
                            <Card size="small" style={{ flex: 1, background: '#f9fafb' }}>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Değişen dosya</Text>
                                <Text style={{ fontSize: 22, fontWeight: 500 }}>{result.changedFiles}</Text>
                            </Card>
                            <Card size="small" style={{ flex: 1, background: '#fffbeb', border: '1px solid #fde68a' }}>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Kritik issue</Text>
                                <Text style={{ fontSize: 22, fontWeight: 500, color: '#d97706' }}>{result.criticalIssues}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} style={{ alignItems: 'stretch' }}>
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>RESPONSE</Text>
                                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {result.issues.map((item: any, index: any) => (
                                        <div
                                            key={index}
                                            style={{
                                                borderLeft: `3px solid ${item.severity === 'high' ? '#dc2626' : item.severity === 'medium' ? '#d97706' : '#16a34a'}`,
                                                background: item.severity === 'high' ? '#fef2f2' : item.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                                                padding: '10px 12px',
                                            }}
                                        >
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 13,
                                                    display: 'block',
                                                    color: item.severity === 'high' ? '#dc2626' : item.severity === 'medium' ? '#d97706' : '#16a34a',
                                                }}
                                            >
                                                {item.title}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                                                {item.description}
                                            </Text>
                                            <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 4, fontFamily: 'monospace' }}>
                                                {item.file}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            </Flex>

                            {/* Diff */}
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>DIFF</Text>
                                <Card
                                    size="small"
                                    style={{ background: '#f9fafb', flex: 1, maxHeight: 300, overflowY: 'auto' }}
                                    styles={{ body: { padding: '12px 14px' } }}
                                >
                                    {result?.diff?.map((item: any, index: any) => (
                                        <div
                                            key={index}
                                            style={{
                                                fontFamily: 'monospace',
                                                fontSize: 12,
                                                lineHeight: '1.8',
                                                color: diffColor(item.type),
                                            }}
                                        >
                                            {item.content}
                                        </div>
                                    ))}
                                </Card>
                            </Flex>

                        </Flex>

                        {/* Files + History yan yana */}
                        <Flex gap={16} style={{ alignItems: 'stretch' }}>

                            {/* Dosyalar + Butonlar */}
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>FILES</Text>
                                <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {result.files.map((file: any) => (
                                        <Flex
                                            key={file?.name}
                                            align="center"
                                            gap={10}
                                            style={{ padding: '8px 10px', border: '1px solid #f0f0f0', borderRadius: 6 }}
                                        >
                                            <Avatar
                                                icon={<FileOutlined />}
                                                style={{ background: '#fef9c3', color: '#a16207', flexShrink: 0 }}
                                                size={32}
                                            />
                                            <Flex vertical gap={2} style={{ flex: 1 }}>
                                                <Text code style={{ fontSize: 12, fontWeight: 500 }}>{file.name}</Text>
                                                <Text type="secondary" style={{ fontSize: 11 }}>{file.path} · {file.changes}</Text>
                                            </Flex>
                                            <Tag color={RISK_CONFIG[file.risk]?.color}>{RISK_CONFIG[file.risk]?.label}</Tag>
                                        </Flex>
                                    ))}
                                </div>
                                <Flex gap={8} style={{ marginTop: 4 }}>
                                    <Button type="primary" style={{ flex: 1, background: '#BA7517' }}>
                                        Fix önerilerini uygula
                                    </Button>
                                    <Button style={{ flex: 1 }}>
                                        Tam raporu gör
                                    </Button>
                                </Flex>
                            </Flex>

                            {/* Geçmiş */}
                            <Flex vertical gap={4} style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>HISTORY</Text>
                                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                                    <List
                                        dataSource={MOCK_HISTORY}
                                        split
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="flex-start" gap={10} style={{ padding: '10px 0', cursor: 'pointer', width: '100%' }}>
                                                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db', marginTop: 6, flexShrink: 0 }} />
                                                    <Flex vertical gap={2}>
                                                        <Flex align="center" gap={8}>
                                                            <Text code style={{ fontSize: 11 }}>{item.pr}</Text>
                                                            <Text style={{ fontSize: 13 }}>{item.title}</Text>
                                                        </Flex>
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            {item.issueCount} issue · {item.timeAgo}
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

            </Flex>
        </div>
    )
}

export default withLayout(<PRReview />)