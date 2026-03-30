import { useState } from 'react'
import { Modal, Button, Flex, Typography, Checkbox, Tag } from 'antd'
import { api } from '../../../services/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import '../index.scss'

const { Text } = Typography

interface Props {
    open: boolean
    onClose: () => void
    result: any
    token: string
    owner: string
    repo: string
}

const ApplyFixModal = ({ open, onClose, result, token, owner, repo }: Props) => {
    const { t } = useTranslation()

    const [fixes, setFixes] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedFixes, setSelectedFixes] = useState<number[]>([])
    const [generated, setGenerated] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const { data, error } = await api.agents.applyFixes(
                token,
                owner,
                repo,
                result.number.replace('#', ''),
                result.issues,
            )

            if (error) {
                toast.error(error)
                return
            }

            setFixes(data.fixes || [])
            setSelectedFixes(
                data.fixes
                    .map((_: any, i: number) => i)
                    .filter((_: any, i: number) => !data.fixes[i].error)
            )
            setGenerated(true)
        } catch {
            toast.error(t('prReview.failedGenerateFixes'))
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPatch = () => {
        const selected = fixes.filter((_, i) => selectedFixes.includes(i))

        const patch = selected
            .map(fix => [
                `--- a/${fix.file}`,
                `+++ b/${fix.file}`,
                `-${fix.original}`,
                `+${fix.fixed}`,
            ].join('\n'))
            .join('\n\n')

        const blob = new Blob([patch], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `fixes-${result.number}.patch`
        a.click()

        URL.revokeObjectURL(url)
    }

    const handleApplyToBranch = async () => {
        const selected = fixes.filter((_, i) => selectedFixes.includes(i))

        setLoading(true)
        try {
            const { data, error } = await api.agents.applyFixesToBranch(
                token,
                owner,
                repo,
                result.number.replace('#', ''),
                selected,
            )

            if (error) {
                toast.error(error)
                return
            }

            if (data.applied.length > 0) {
                toast.success(
                    t('prReview.fixApplied', {
                        count: data.applied.length,
                        branch: data.branch,
                    })
                )
            }

            if (data.failed.length > 0) {
                toast.error(
                    t('prReview.fixFailed', {
                        count: data.failed.length,
                    })
                )
            }

            onClose()
        } catch {
            toast.error(t('prReview.failedApplyFixes'))
        } finally {
            setLoading(false)
        }
    }

    const toggleFix = (index: number) => {
        setSelectedFixes(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={t('prReview.applyFix')}
            width={760}
            className="apply-fix-modal"
            footer={
                <Flex gap={8} justify="flex-end">
                    {!generated ? (
                        <Button loading={loading} onClick={handleGenerate}>
                            {t('prReview.generateFixes')}
                        </Button>
                    ) : (
                        <Flex gap={8} className="apply-fix-modal__code-row">
                            <Button
                                className="pr-report-modal__download-btn"
                                disabled={selectedFixes?.length === 0}
                                onClick={handleDownloadPatch}
                            >
                                {t('prReview.downloadPatch')}
                            </Button>

                            <Button
                                type="primary"
                                className="pr-review__btn"
                                loading={loading}
                                disabled={selectedFixes?.length === 0}
                                onClick={handleApplyToBranch}
                            >
                                {t('prReview.applyToBranch')} ({selectedFixes?.length})
                            </Button>
                        </Flex>
                    )}
                </Flex>
            }
        >
            {!generated ? (
                <Flex vertical gap={8} className="apply-fix-modal__intro">
                    <Text type="secondary" className="apply-fix-modal__intro-text">
                        {t('prReview.introText', {
                            count: result?.issues?.length,
                        })}
                    </Text>
                </Flex>
            ) : (
                <Flex vertical gap={12} className="apply-fix-modal__list">
                    {fixes?.map((fix: any, index: number) => (
                        <Flex
                            key={index}
                            vertical
                            gap={8}
                            className={`apply-fix-modal__item ${selectedFixes?.includes(index)
                                ? ''
                                : 'apply-fix-modal__item--inactive'
                                }`}
                        >
                            <Flex align="center" gap={10}>
                                <Checkbox
                                    checked={selectedFixes?.includes(index)}
                                    onChange={() => toggleFix(index)}
                                />

                                <Text strong className="apply-fix-modal__item-title">
                                    {fix?.issue_title}
                                </Text>

                                <Tag className="apply-fix-modal__item-tag">
                                    {fix?.file}
                                </Tag>
                            </Flex>

                            <Flex gap={8}>
                                <Flex vertical gap={4} className="apply-fix-modal__code-col">
                                    <Text className="apply-fix-modal__code-label">
                                        {t('prReview.before')}
                                    </Text>
                                    <pre className="apply-fix-modal__code-block apply-fix-modal__code-block--before">
                                        {fix?.original}
                                    </pre>
                                </Flex>

                                <Flex vertical gap={4} className="apply-fix-modal__code-col">
                                    <Text className="apply-fix-modal__code-label">
                                        {t('prReview.after')}
                                    </Text>
                                    <pre className="apply-fix-modal__code-block apply-fix-modal__code-block--after">
                                        {fix?.fixed}
                                    </pre>
                                </Flex>
                            </Flex>

                            <Text className="apply-fix-modal__explanation">
                                💡 {fix?.explanation}
                            </Text>
                        </Flex>
                    ))}
                </Flex>
            )}
        </Modal>
    )
}

export default ApplyFixModal