import { Modal, Button, Flex, Typography, Checkbox, Tag } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface Issue {
    title: string
    description: string
    affectedFile: { path: string; name: string }
    fixSuggestion: string
}

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: (selectedIssues: Issue[]) => void
    loading: boolean
    issues: Issue[]
    error: string
}

const ApplyDebugFixModal = ({ open, onClose, onConfirm, loading, issues }: Props) => {
    const { t } = useTranslation()
    const [selected, setSelected] = useState<Set<number>>(new Set(issues.map((_, i) => i)))

    const toggleIssue = (index: number) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(index) ? next.delete(index) : next.add(index)
            return next
        })
    }

    const selectedIssues = issues?.filter((_, i) => selected.has(i))

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={t('debugging.applyFixOpenPr')}
            width={600}
            footer={
                <Flex gap={8} justify="flex-end">
                    <Button
                        type="primary"
                        loading={loading}
                        disabled={selected.size === 0}
                        onClick={() => onConfirm(selectedIssues)}
                        className="debugging__action-btn-primary"
                    >
                        {t('debugging.confirmApply')} ({selected.size})
                    </Button>
                </Flex>
            }
        >
            <Flex vertical gap={16} className="apply-debug-fix-modal__body">
                <Text type="secondary" className="apply-debug-fix-modal__description">
                    {t('debugging.applyFixDescription')}
                </Text>

                <Flex vertical gap={8}>
                    {issues?.map((issue, i) => (
                        <Flex
                            key={i}
                            gap={12}
                            align="flex-start"
                            className={`apply-debug-fix-modal__issue ${selected.has(i) ? 'apply-debug-fix-modal__issue--selected' : ''}`}
                            onClick={() => toggleIssue(i)}
                        >
                            <Checkbox
                                checked={selected?.has(i)}
                                onChange={() => toggleIssue(i)}
                                onClick={e => e.stopPropagation()}
                                style={{ marginTop: 2 }}
                            />
                            <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
                                <Flex align="center" gap={8} wrap="wrap">
                                    <Text strong className="apply-debug-fix-modal__issue-title">
                                        {issue?.title}
                                    </Text>
                                    <Tag className="apply-debug-fix-modal__file-tag">
                                        {issue?.affectedFile?.name}
                                    </Tag>
                                </Flex>
                                <Text className="apply-debug-fix-modal__issue-desc">
                                    {issue?.description}
                                </Text>
                                <div className="apply-debug-fix-modal__fix-snippet">
                                    {issue?.fixSuggestion}
                                </div>
                            </Flex>
                        </Flex>
                    ))}
                </Flex>

                <Text className="apply-debug-fix-modal__warning">
                    ⚠️ {t('debugging.applyFixWarning')}
                </Text>
            </Flex>
        </Modal>
    )
}

export default ApplyDebugFixModal