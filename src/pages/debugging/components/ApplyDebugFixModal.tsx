import { Modal, Button, Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
    affectedFiles: any[]
    fixSuggestion: string
}

const ApplyDebugFixModal = ({ open, onClose, onConfirm, loading, affectedFiles, fixSuggestion }: Props) => {
    const { t } = useTranslation()

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={t('debugging.applyFixOpenPr')}
            width={560}
            footer={
                <Flex gap={8} justify="flex-end">
                    <Button onClick={onClose}>{t('debugging.cancel')}</Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={onConfirm}
                        className="debugging__action-btn-primary"
                    >
                        {t('debugging.confirmApply')}
                    </Button>
                </Flex>
            }
        >
            <Flex vertical gap={16} style={{ padding: '8px 0' }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('debugging.applyFixDescription')}
                </Text>

                {/* Fix suggestion */}
                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">{t('debugging.suggestedFix')}</Text>
                    <div style={{
                        background: '#f6f8fa',
                        border: '1px solid #d0d7de',
                        borderRadius: 6,
                        padding: '10px 14px',
                        fontSize: 13,
                        color: '#24292f',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        maxHeight: 150,
                        overflowY: 'auto',
                    }}>
                        {fixSuggestion}
                    </div>
                </Flex>

                {/* Affected files */}
                <Flex vertical gap={6}>
                    <Text className="debugging__section-label">{t('debugging.affectedFiles')}</Text>
                    <Flex vertical gap={4}>
                        {affectedFiles.map((file: any) => (
                            <Flex
                                key={file.path}
                                align="center"
                                gap={8}
                                style={{
                                    padding: '6px 10px',
                                    border: '1px solid #d0d7de',
                                    borderRadius: 6,
                                    fontSize: 12,
                                }}
                            >
                                <Text code style={{ fontSize: 12 }}>{file.name}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{file.path}</Text>
                            </Flex>
                        ))}
                    </Flex>
                </Flex>

                <Text type="warning" style={{ fontSize: 12 }}>
                    ⚠️ {t('debugging.applyFixWarning')}
                </Text>
            </Flex>
        </Modal>
    )
}

export default ApplyDebugFixModal