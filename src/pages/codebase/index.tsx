import { useState } from 'react'
import { Button, Card, Flex, Input, Space, Tag, Typography, List, Avatar, Spin } from 'antd'
import { FileOutlined, SearchOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text, Paragraph } = Typography

const QUICK_CHIPS = [
    'Rate limiting nasıl çalışıyor?',
    'Payment flow hangi servisleri çağırıyor?',
    'Utility fonksiyonlar neler?',
    'Database bağlantısı nerede?',
]

const MOCK_HISTORY = [
    { question: 'Payment flow hangi dosyaları kullanıyor?', filesFound: 5, timeAgo: '12 dk önce' },
    { question: 'Rate limiting middleware nerede?', filesFound: 2, timeAgo: '28 dk önce' },
    { question: 'Config dosyası nasıl yükleniyor?', filesFound: 1, timeAgo: '1 saat önce' },
]

const DEFAULT_RESULT = {
    answer:
        "Authentication 3 katmanda implement edilmiş: JWT token üretimi auth_service.py'de, " +
        "token doğrulama middleware'i jwt_middleware.py'de, endpoint koruması ise user_controller.py'de yapılmış.",
    files: [
        { name: 'auth_service.py', path: 'app/services/', lines: 'satır 12–89', tag: 'Ana logic' },
        { name: 'jwt_middleware.py', path: 'app/core/', lines: 'satır 4–41', tag: 'Middleware' },
        { name: 'user_controller.py', path: 'app/routes/', lines: 'satır 23–67', tag: 'Endpoint guard' },
    ],
}

const CodebaseQA = () => {
    const [query, setQuery] = useState('Authentication nerede implement edilmiş?')
    const [result, setResult] = useState<any>(DEFAULT_RESULT)
    const [loading, setLoading] = useState(false)

    const handleAsk = async () => {
        if (!query.trim()) return
        setLoading(true)
        setResult({ answer: 'Analiz ediliyor...', files: [] })

        // TODO: API CALL

        await new Promise((r) => setTimeout(r, 800))
        setResult({
            answer: `"${query}" sorusu için ilgili dosyalar bulundu.`,
            files: [{ name: 'ilgili_dosya.py', path: 'app/', lines: 'satır 1–50', tag: 'Eşleşme' }],
        })
        setLoading(false)
    }

    return (
        <div className="codebase-qa">

            {/* Header */}
            <Flex align="center" justify="space-between" className="codebase-qa__header">
                <Flex align="center" gap={10}>
                    <div className="codebase-qa__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Codebase Q&A</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            myorg/backend-api · 248 dosya indekslendi
                        </Text>
                    </Flex>
                </Flex>
                <Tag color="blue">Hazır</Tag>
            </Flex>

            {/* Body */}
            <Flex vertical gap={16} className="codebase-qa__body">

                {/* Arama */}
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onPressEnter={handleAsk}
                        placeholder="Repo hakkında bir şey sor... (ör: authentication nerede?)"
                        prefix={<SearchOutlined className="codebase-qa__search-prefix" />}
                    />
                    <Button
                        type="primary"
                        onClick={handleAsk}
                        loading={loading}
                        className="codebase-qa__btn"
                    >
                        Sor
                    </Button>
                </Space.Compact>

                {/* Chip'ler */}
                <Flex wrap gap={6}>
                    {QUICK_CHIPS.map((chip) => (
                        <Tag
                            key={chip}
                            className="codebase-qa__chip"
                            onClick={() => setQuery(chip)}
                        >
                            {chip}
                        </Tag>
                    ))}
                </Flex>

                {/* Response */}
                <Flex vertical gap={8} className="codebase-qa__response">
                    <Text className="codebase-qa__response-label">RESPONSE</Text>
                    <Card size="small" className="codebase-qa__response-card">
                        {loading ? (
                            <Flex justify="center" className="codebase-qa__spin">
                                <Spin size="small" />
                            </Flex>
                        ) : (
                            <>
                                <Paragraph
                                    className="codebase-qa__response-paragraph"
                                    style={{ marginBottom: result.files.length ? 12 : 0 }}
                                >
                                    {result.answer}
                                </Paragraph>
                                {result.files.map((item: any) => (
                                    <Flex key={item?.name} className="codebase-qa__file-item">
                                        <Flex align="center" gap={10}>
                                            <Avatar
                                                icon={<FileOutlined />}
                                                className="codebase-qa__file-avatar"
                                                size={32}
                                            />
                                            <Flex vertical gap={2} style={{ flex: 1 }}>
                                                <Text code className="codebase-qa__file-name">{item?.name}</Text>
                                                <Text type="secondary" className="codebase-qa__file-meta">
                                                    {item?.path} · {item?.lines}
                                                </Text>
                                            </Flex>
                                            <Tag color="blue">{item?.tag}</Tag>
                                        </Flex>
                                    </Flex>
                                ))}
                            </>
                        )}
                    </Card>
                </Flex>

                {/* History */}
                <Flex vertical gap={4}>
                    <Text className="codebase-qa__history-label">HISTORY</Text>
                    <List
                        dataSource={MOCK_HISTORY}
                        split
                        renderItem={(item) => (
                            <List.Item style={{ padding: 0 }}>
                                <Flex align="flex-start" gap={10} className="codebase-qa__history-item">
                                    <div className="codebase-qa__history-dot" />
                                    <Flex align="center" gap={30}>
                                        <Text className="codebase-qa__history-question">{item.question}</Text>
                                        <Text type="secondary" className="codebase-qa__history-meta">
                                            {item.filesFound} dosya · {item.timeAgo}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                    />
                </Flex>

            </Flex>
        </div>
    )
}

export default withLayout(<CodebaseQA />)