import React, { useState } from 'react'
import { Button, Card, Flex, Input, Tag, Typography, List, Steps, Select, Badge } from 'antd'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text } = Typography

const MOCK_FILE_STATUS = [
    { name: 'auth_service.py', status: 'done' },
    { name: 'jwt_middleware.py', status: 'done' },
    { name: 'payment_service.py', status: 'pending' },
    { name: 'user_controller.py', status: 'pending' },
]

const MOCK_HISTORY = [
    { target: 'auth_service.py', docType: 'Fonksiyon docs', timeAgo: '15 dk önce' },
    { target: 'user_controller.py', docType: 'API referansı', timeAgo: '1 saat önce' },
    { target: 'Tüm repo', docType: 'README', timeAgo: '1 gün önce' },
]

const PIPELINE_STEPS = [
    { title: 'Kod analizi' },
    { title: 'AST parse' },
    { title: 'Doc üret' },
    { title: 'Format' },
]

const DOC_TYPES = [
    { value: 'function', label: 'Fonksiyon docs' },
    { value: 'readme', label: 'README' },
    { value: 'api', label: 'API referansı' },
    { value: 'onboard', label: 'Onboarding' },
]

const DEFAULT_RESULT = {
    fileName: 'auth_service.py',
    description: 'Kullanıcı kimlik doğrulama ve oturum yönetimi işlemlerini yürütür. JWT tabanlı stateless auth pattern kullanır.',
    methods: [
        { name: 'login', params: 'email: str, password: str', returns: 'str', description: 'Email ve şifre ile giriş yapar, başarılıysa JWT token döner.' },
        { name: 'logout', params: 'token: str', returns: 'None', description: "Token'ı blacklist'e ekler, oturumu sonlandırır." },
        { name: 'refresh', params: 'token: str', returns: 'str', description: "Süresi dolmak üzere olan token'ı yeniler." },
        { name: 'verify', params: 'token: str', returns: 'dict', description: 'Token geçerliliğini kontrol eder, payload döner.' },
    ],
    markdown: `# AuthService\n\nKullanıcı kimlik doğrulama ve oturum yönetimi işlemlerini yürütür.\n\n## Methods\n\n### login(email, password)\nEmail ve şifre ile giriş yapar, başarılıysa JWT token döner.\n\n**Params:** email: str, password: str\n**Returns:** str (JWT token)\n\n### logout(token)\nToken'ı blacklist'e ekler, oturumu sonlandırır.\n\n**Params:** token: str\n**Returns:** None\n\n### refresh(token)\nSüresi dolmak üzere olan token'ı yeniler.\n\n**Params:** token: str\n**Returns:** str (yeni JWT token)\n\n### verify(token)\nToken geçerliliğini kontrol eder, payload döner.\n\n**Params:** token: str\n**Returns:** dict`,
}

const Documentation: React.FC = () => {
    const [input, setInput] = useState('auth_service.py')
    const [result, setResult] = useState<any>(DEFAULT_RESULT)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(3)
    const [docType, setDocType] = useState('function')
    const [view, setView] = useState<'preview' | 'markdown'>('preview')

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

    return (
        <div className="documentation">

            <Flex align="center" justify="space-between" className="documentation__header">
                <Flex align="center" gap={10}>
                    <div className="documentation__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Documentation Agent</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Fonksiyon · mimari · onboarding dokümanı
                        </Text>
                    </Flex>
                </Flex>
                <Tag color="purple">Oluşturuldu</Tag>
            </Flex>

            <Flex vertical gap={16} className="documentation__body">

                <Steps current={currentStep} size="small" items={PIPELINE_STEPS} />

                <Flex vertical gap={8}>
                    <Text className="documentation__section-label">INPUT</Text>
                    <Flex gap={8}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleGenerate}
                            placeholder="Dosya adı veya fonksiyon girin... (ör: auth_service.py)"
                            className="documentation__input"
                        />
                        <Select
                            value={docType}
                            onChange={setDocType}
                            style={{ width: 160 }}
                            options={DOC_TYPES}
                        />
                        <Button
                            type="primary"
                            onClick={handleGenerate}
                            loading={loading}
                            className="documentation__generate-btn"
                        >
                            Üret
                        </Button>
                    </Flex>
                </Flex>

                {result && !loading && (
                    <Flex gap={16} style={{ alignItems: 'stretch' }}>

                        <Flex vertical gap={8} style={{ flex: 2 }}>
                            <Flex align="center" justify="space-between">
                                <Text className="documentation__section-label">ÖNİZLEME</Text>
                                <Flex gap={6}>
                                    <Button
                                        size="small"
                                        type={view === 'preview' ? 'primary' : 'default'}
                                        onClick={() => setView('preview')}
                                        className={view === 'preview' ? 'documentation__preview-btn--active' : ''}
                                    >
                                        Önizleme
                                    </Button>
                                    <Button
                                        size="small"
                                        type={view === 'markdown' ? 'primary' : 'default'}
                                        onClick={() => setView('markdown')}
                                        className={view === 'markdown' ? 'documentation__preview-btn--active' : ''}
                                    >
                                        Markdown
                                    </Button>
                                </Flex>
                            </Flex>

                            <Card size="small" className="documentation__preview-card">
                                {view === 'preview' ? (
                                    <Flex vertical gap={12}>
                                        <div>
                                            <Text className="documentation__file-title">{result.fileName}</Text>
                                            <Text type="secondary" className="documentation__file-desc">
                                                {result.description}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text className="documentation__methods-label">Methods</Text>
                                            <Flex vertical gap={6}>
                                                {result.methods.map((item: any) => (
                                                    <div key={item?.name} className="documentation__method-item">
                                                        <Flex align="center" gap={8} className="documentation__method-header">
                                                            <Text code className="documentation__method-name">{item?.name}</Text>
                                                            <Text type="secondary" className="documentation__method-params">
                                                                ({item?.params})
                                                            </Text>
                                                            <Text className="documentation__method-returns">
                                                                → {item?.returns}
                                                            </Text>
                                                        </Flex>
                                                        <Text type="secondary" className="documentation__method-desc">
                                                            {item?.description}
                                                        </Text>
                                                    </div>
                                                ))}
                                            </Flex>
                                        </div>
                                    </Flex>
                                ) : (
                                    <pre className="documentation__markdown">{result.markdown}</pre>
                                )}
                            </Card>

                            <Flex gap={8}>
                                <Button type="primary" className="documentation__export-btn">
                                    Markdown olarak dışa aktar
                                </Button>
                                <Button className="documentation__repo-btn">
                                    Tüm repo'yu belgele
                                </Button>
                            </Flex>
                        </Flex>

                        {/* File Status + History */}
                        <Flex vertical gap={16} style={{ flex: 1 }}>

                            <Flex vertical gap={8}>
                                <Text className="documentation__section-label">DOSYA DURUMU</Text>
                                <div className="documentation__file-status-scroll">
                                    <List
                                        dataSource={MOCK_FILE_STATUS}
                                        split
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="center" justify="space-between" className="documentation__file-status-item">
                                                    <Flex align="center" gap={8}>
                                                        <Badge status={item.status === 'done' ? 'success' : 'default'} />
                                                        <Text code className="documentation__file-code">{item.name}</Text>
                                                    </Flex>
                                                    <Tag color={item.status === 'done' ? 'green' : 'default'}>
                                                        {item.status === 'done' ? 'Tamamlandı' : 'Bekliyor'}
                                                    </Tag>
                                                </Flex>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Flex>

                            <Flex vertical gap={8}>
                                <Text className="documentation__section-label">HISTORY</Text>
                                <div className="documentation__history-scroll">
                                    <List
                                        dataSource={MOCK_HISTORY}
                                        split
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: 0 }}>
                                                <Flex align="flex-start" gap={10} className="documentation__history-item">
                                                    <div className="documentation__history-dot" />
                                                    <Flex vertical gap={2}>
                                                        <Text code className="documentation__history-file">{item.target}</Text>
                                                        <Text type="secondary" className="documentation__history-meta">
                                                            {item.docType} · {item.timeAgo}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Flex>

                        </Flex>

                    </Flex>
                )}

            </Flex>
        </div>
    )
}

export default withLayout(<Documentation />)