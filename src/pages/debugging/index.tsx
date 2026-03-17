import React, { useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Steps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text, Paragraph } = Typography

interface DiffLine {
    type: 'add' | 'remove' | 'context'
    content: string
}

const MOCK_HISTORY = [
    { error: 'AttributeError: NoneType object', rootCause: 'user_id boş geldi', timeAgo: '30 dk önce', resolved: true },
    { error: 'sqlalchemy.exc.OperationalError', rootCause: 'DB bağlantısı kesildi', timeAgo: '2 saat önce', resolved: true },
    { error: 'jwt.exceptions.DecodeError', rootCause: 'Token imzası geçersiz', timeAgo: '1 gün önce', resolved: false },
]

const PIPELINE_STEPS = [
    { title: 'Log parse' },
    { title: 'Stacktrace' },
    { title: 'Code search' },
    { title: 'Reasoning' },
    { title: 'Fix üret' },
]

const DEFAULT_RESULT = {
    rootCause: 'Stripe API timeout işlenmiyor — retry logic eksik',
    confidence: 87,
    file: 'payment_service.py',
    line: 'satır 142',
    explanation: "charge_customer fonksiyonu Stripe API'ye istek atıyor ancak timeout durumunda herhangi bir hata yakalama veya retry mekanizması bulunmuyor. Stripe zaman aşımına uğradığında uygulama çöküyor.",
    fix: [
        { type: 'context', content: '  def charge_customer(amount, card_token):' },
        { type: 'remove', content: '-   stripe.Charge.create(amount=amount, source=card_token)' },
        { type: 'add', content: '+   max_retries = 3' },
        { type: 'add', content: '+   for attempt in range(max_retries):' },
        { type: 'add', content: '+     try:' },
        { type: 'add', content: '+       return stripe.Charge.create(amount=amount, source=card_token)' },
        { type: 'add', content: '+     except stripe.error.Timeout:' },
        { type: 'add', content: '+       if attempt == max_retries - 1: raise' },
        { type: 'add', content: '+       time.sleep(2 ** attempt)' },
    ],
}

const Debugging: React.FC = () => {
    const [input, setInput] = useState('stripe.error.Timeout: Request timed out after 30s\n  File "payment_service.py", line 142, in charge_customer\n    stripe.Charge.create(amount=amount, source=card_token)')
    const [result, setResult] = useState<any>(DEFAULT_RESULT)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(4)

    const handleAnalyze = async () => {
        if (!input.trim()) return
        setLoading(true)
        setResult(null)
        setCurrentStep(0)

        for (let i = 0; i <= 4; i++) {
            await new Promise((r) => setTimeout(r, 400))
            setCurrentStep(i)
        }
        setResult(DEFAULT_RESULT)
        setLoading(false)
    }

    const diffColor = (type: DiffLine['type']) => {
        if (type === 'add') return '#16a34a'
        if (type === 'remove') return '#dc2626'
        return '#6b7280'
    }

    return (
        <div className="debugging">

            {/* Header */}
            <Flex align="center" justify="space-between" className="debugging__header">
                <Flex align="center" gap={10}>
                    <div className="debugging__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Debug Agent</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Stacktrace · log · root cause analizi
                        </Text>
                    </Flex>
                </Flex>
                <Tag color="red">Root cause bulundu</Tag>
            </Flex>

            {/* Body */}
            <Flex vertical gap={16} className="debugging__body">

                {/* Pipeline */}
                <Steps current={currentStep} size="small" items={PIPELINE_STEPS} />

                {/* Input */}
                <Flex vertical gap={8}>
                    <Text className="debugging__section-label">INPUT</Text>
                    <Input.TextArea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Hata mesajı veya stacktrace yapıştırın..."
                        rows={4}
                        className="debugging__textarea"
                    />
                    <Button
                        type="primary"
                        onClick={handleAnalyze}
                        loading={loading}
                        className="debugging__analyze-btn"
                        icon={<SearchOutlined />}
                    >
                        Analiz et
                    </Button>
                </Flex>

                {result && !loading && (
                    <>
                        {/* Root cause + Confidence */}
                        <Flex gap={10}>
                            <Card size="small" className="debugging__root-card">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Root cause</Text>
                                <Text className="debugging__root-text">{result.rootCause}</Text>
                            </Card>
                            <Card size="small" className="debugging__stat-card">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Güven skoru</Text>
                                <Text className="debugging__confidence">%{result.confidence}</Text>
                            </Card>
                            <Card size="small" className="debugging__stat-card">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Etkilenen dosya</Text>
                                <Text code style={{ fontSize: 12 }}>{result.file}</Text>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{result.line}</Text>
                            </Card>
                        </Flex>

                        {/* Explanation + Fix yan yana */}
                        <Flex gap={16} style={{ alignItems: 'stretch' }}>

                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text className="debugging__section-label">AÇIKLAMA</Text>
                                <Card size="small" className="debugging__explanation-card">
                                    <Paragraph className="debugging__explanation-text">
                                        {result.explanation}
                                    </Paragraph>
                                </Card>
                            </Flex>

                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text className="debugging__section-label">ÖNERİLEN FIX</Text>
                                <Card
                                    size="small"
                                    className="debugging__fix-card"
                                    styles={{ body: { padding: '12px 14px' } }}
                                >
                                    {result.fix.map((item: any, i: number) => (
                                        <div
                                            key={i}
                                            className="debugging__diff-line"
                                            style={{ color: diffColor(item?.type) }}
                                        >
                                            {item?.content}
                                        </div>
                                    ))}
                                </Card>
                            </Flex>

                        </Flex>

                        {/* Butonlar + History yan yana */}
                        <Flex gap={16} style={{ alignItems: 'stretch' }}>

                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Text className="debugging__section-label">AKSİYONLAR</Text>
                                <Flex gap={8}>
                                    <Button type="primary" className="debugging__action-btn-primary">
                                        Fix'i uygula ve PR aç
                                    </Button>
                                    <Button className="debugging__action-btn">
                                        Dosyayı görüntüle
                                    </Button>
                                </Flex>
                                <Button block>Test yaz</Button>
                            </Flex>

                            <Flex vertical gap={4} style={{ flex: 1 }}>
                                <Text className="debugging__section-label">HISTORY</Text>
                                <div className="debugging__history-scroll">
                                    <List
                                        dataSource={MOCK_HISTORY}
                                        split
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="flex-start" gap={10} className="debugging__history-item">
                                                    <div className={`debugging__history-dot debugging__history-dot--${item.resolved ? 'resolved' : 'unresolved'}`} />
                                                    <Flex vertical gap={2}>
                                                        <Text className="debugging__history-error">{item.error}</Text>
                                                        <Text type="secondary" className="debugging__history-meta">
                                                            {item.rootCause} · {item.timeAgo}
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

export default withLayout(<Debugging />)