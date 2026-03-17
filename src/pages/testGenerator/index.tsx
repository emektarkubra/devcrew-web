import { useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Steps, Select } from 'antd'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text } = Typography

const MOCK_HISTORY = [
    { target: 'auth_service.py', testCount: 6, coverage: 88, timeAgo: '20 dk önce' },
    { target: 'user_controller.py', testCount: 9, coverage: 74, timeAgo: '2 saat önce' },
    { target: 'config.py', testCount: 3, coverage: 95, timeAgo: '1 gün önce' },
]

const PIPELINE_STEPS = [
    { title: 'Kod analizi' },
    { title: 'Edge case' },
    { title: 'Test üret' },
    { title: 'Doğrula' },
]

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
    unit: { color: 'blue', label: 'unit' },
    integration: { color: 'purple', label: 'integration' },
    edge: { color: 'orange', label: 'edge case' },
}

const DEFAULT_RESULT = {
    totalTests: 8, coverage: 91, unitCount: 4, edgeCount: 3, integrationCount: 1,
    tests: [
        { name: 'test_charge_success', type: 'unit', description: 'Geçerli kart bilgisiyle başarılı ödeme senaryosu', code: `def test_charge_success():\n    result = charge_customer(1000, "tok_visa")\n    assert result.status == "succeeded"` },
        { name: 'test_charge_timeout_retry', type: 'edge', description: 'Stripe timeout durumunda retry tetiklenmeli', code: `def test_charge_timeout_retry():\n    with mock.patch("stripe.Charge.create",\n                    side_effect=stripe.error.Timeout):\n        with pytest.raises(stripe.error.Timeout):\n            charge_customer(1000, "tok_visa")` },
        { name: 'test_charge_invalid_card', type: 'edge', description: 'Geçersiz kart numarasında CardError fırlatılmalı', code: `def test_charge_invalid_card():\n    with pytest.raises(stripe.error.CardError):\n        charge_customer(1000, "tok_invalid")` },
        { name: 'test_charge_zero_amount', type: 'edge', description: 'Sıfır tutarlı ödeme reddedilmeli', code: `def test_charge_zero_amount():\n    with pytest.raises(ValueError):\n        charge_customer(0, "tok_visa")` },
        { name: 'test_charge_duplicate', type: 'integration', description: 'Aynı idempotency key ile ikinci istek reddedilmeli', code: `def test_charge_duplicate_idempotency():\n    charge_customer(1000, "tok_visa", idempotency_key="key_1")\n    with pytest.raises(stripe.error.IdempotencyError):\n        charge_customer(1000, "tok_visa", idempotency_key="key_1")` },
        { name: 'test_charge_missing_token', type: 'unit', description: 'Token eksikse ValueError fırlatılmalı', code: `def test_charge_missing_token():\n    with pytest.raises(ValueError):\n        charge_customer(1000, "")` },
        { name: 'test_charge_negative_amount', type: 'unit', description: 'Negatif tutar reddedilmeli', code: `def test_charge_negative_amount():\n    with pytest.raises(ValueError):\n        charge_customer(-100, "tok_visa")` },
        { name: 'test_charge_returns_charge_id', type: 'unit', description: 'Başarılı işlemde charge_id dönmeli', code: `def test_charge_returns_charge_id():\n    result = charge_customer(1000, "tok_visa")\n    assert result.id.startswith("ch_")` },
    ],
}

const TestGenerator = () => {
    const [input, setInput] = useState('payment_service.py · charge_customer fonksiyonu')
    const [result, setResult] = useState<any | null>(DEFAULT_RESULT)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(3)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<string>('all')

    const handleGenerate = async () => {
        if (!input.trim()) return
        setLoading(true)
        setResult(null)
        setCurrentStep(0)
        for (let i = 0; i <= 3; i++) {
            await new Promise((r) => setTimeout(r, 400))
            setCurrentStep(i)
        }
        setResult(DEFAULT_RESULT)
        setLoading(false)
    }

    const filteredTests = result?.tests?.filter(
        (item: any) => filterType === 'all' || item.type === filterType
    ) ?? []

    return (
        <div className="test-generator">

            {/* Header */}
            <Flex align="center" justify="space-between" className="test-generator__header">
                <Flex align="center" gap={10}>
                    <div className="test-generator__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Test Generator</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Unit · integration · edge case testleri
                        </Text>
                    </Flex>
                </Flex>
                <Tag color="green">8 test üretildi</Tag>
            </Flex>

            {/* Body */}
            <Flex vertical gap={16} className="test-generator__body">

                <Steps current={currentStep} size="small" items={PIPELINE_STEPS} />

                {/* Input */}
                <Flex vertical gap={8}>
                    <Text className="test-generator__section-label">INPUT</Text>
                    <Flex gap={8}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleGenerate}
                            placeholder="Dosya adı, fonksiyon adı veya açıklama girin..."
                            className="test-generator__input"
                        />
                        <Button
                            type="primary"
                            onClick={handleGenerate}
                            loading={loading}
                            className="test-generator__generate-btn"
                        >
                            Üret
                        </Button>
                    </Flex>
                </Flex>

                {result && !loading && (
                    <>
                        {/* Skor kartları */}
                        <Flex gap={10}>
                            <Card size="small" className="test-generator__card-green">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Toplam test</Text>
                                <Text className="test-generator__stat-value-green">{result.totalTests}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-green">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tahmini coverage</Text>
                                <Text className="test-generator__stat-value-green">%{result.coverage}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Unit</Text>
                                <Text className="test-generator__stat-value">{result.unitCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Edge case</Text>
                                <Text className="test-generator__stat-value">{result.edgeCount}</Text>
                            </Card>
                            <Card size="small" className="test-generator__card-neutral">
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Integration</Text>
                                <Text className="test-generator__stat-value">{result.integrationCount}</Text>
                            </Card>
                        </Flex>

                        <Flex gap={16} style={{ alignItems: 'stretch' }}>

                            {/* Test listesi */}
                            <Flex vertical gap={8} style={{ flex: 2 }}>
                                <Flex align="center" justify="space-between">
                                    <Text className="test-generator__section-label">TESTLER</Text>
                                    <Select
                                        value={filterType}
                                        onChange={setFilterType}
                                        size="small"
                                        style={{ width: 130 }}
                                        options={[
                                            { value: 'all', label: 'Tümü' },
                                            { value: 'unit', label: 'Unit' },
                                            { value: 'edge', label: 'Edge case' },
                                            { value: 'integration', label: 'Integration' },
                                        ]}
                                    />
                                </Flex>
                                <div className="test-generator__tests-scroll">
                                    {filteredTests.map((item: any) => (
                                        <div key={item?.name} className="test-generator__test-item">
                                            <Flex
                                                align="center"
                                                justify="space-between"
                                                className={`test-generator__test-header ${expanded === item?.name ? 'test-generator__test-header--expanded' : ''}`}
                                                onClick={() => setExpanded(expanded === item?.name ? null : item?.name)}
                                            >
                                                <Flex align="center" gap={8}>
                                                    <Tag color={TYPE_CONFIG[item?.type].color} style={{ margin: 0 }}>
                                                        {TYPE_CONFIG[item?.type].label}
                                                    </Tag>
                                                    <Text code style={{ fontSize: 12 }}>{item?.name}</Text>
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {expanded === item?.name ? '▲' : '▼'}
                                                </Text>
                                            </Flex>
                                            {expanded === item?.name && (
                                                <div className="test-generator__test-body">
                                                    <Text type="secondary" className="test-generator__test-description">
                                                        {item?.description}
                                                    </Text>
                                                    <div className="test-generator__test-code">
                                                        {item?.code}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Flex gap={8} style={{ marginTop: 4 }}>
                                    <Button type="primary" className="test-generator__save-btn">
                                        tests/ klasörüne kaydet
                                    </Button>
                                    <Button className="test-generator__run-btn">
                                        Testleri çalıştır
                                    </Button>
                                </Flex>
                            </Flex>

                            {/* History */}
                            <Flex vertical gap={4} style={{ flex: 1 }}>
                                <Text className="test-generator__section-label">HISTORY</Text>
                                <div className="test-generator__history-scroll">
                                    <List
                                        dataSource={MOCK_HISTORY}
                                        split
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="flex-start" gap={10} className="test-generator__history-item">
                                                    <div className="test-generator__history-dot" />
                                                    <Flex vertical gap={2}>
                                                        <Text code className="test-generator__history-file">{item.target}</Text>
                                                        <Text type="secondary" className="test-generator__history-meta">
                                                            {item.testCount} test · %{item.coverage} coverage · {item.timeAgo}
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

export default withLayout(<TestGenerator />)