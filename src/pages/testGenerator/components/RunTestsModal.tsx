import { Modal, Button, Flex, Typography, Tabs } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface Props {
    open: boolean
    onClose: () => void
    framework: string
    target: string
    mergedCode: string
}

const setupCommands: Record<string, { install: string; run: string }> = {
    jest: {
        install: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`,
        run: `npx jest {filename}`,
    },
    vitest: {
        install: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom`,
        run: `npx vitest {filename}`,
    },
    mocha: {
        install: `npm install --save-dev mocha @testing-library/react`,
        run: `npx mocha {filename}`,
    },
    pytest: {
        install: `pip install pytest`,
        run: `pytest {filename}`,
    },
    unittest: {
        install: `# unittest is built-in, no install needed`,
        run: `python -m unittest {filename}`,
    },
}

const RunTestsModal = ({ open, onClose, framework, target, mergedCode }: Props) => {
    const { t } = useTranslation()
    const [copiedCode, setCopiedCode] = useState(false)
    const [copiedInstall, setCopiedInstall] = useState(false)
    const [copiedRun, setCopiedRun] = useState(false)

    const ext = target.split('.').pop() ?? 'tsx'
    const baseName = target.split('/').pop()?.replace(`.${ext}`, '') ?? 'test'
    const filename = `${baseName}.test.${ext}`

    const commands = setupCommands[framework] ?? setupCommands['jest']
    const install = commands.install
    const run = commands.run.replace('{filename}', filename)

    // copy clipboard
    const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text)
        setter(true)
        setTimeout(() => setter(false), 2000)
    }

    const CodeBlock = ({ code, onCopy, copied }: { code: string; onCopy: () => void; copied: boolean }) => (
        <div className="run-tests-modal__code-block">
            <pre className="run-tests-modal__pre">{code}</pre>
            <Button
                size="small"
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                className="run-tests-modal__copy-btn"
                onClick={onCopy}
            />
        </div>
    )

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={t('testGenerator.runTests')}
            width={640}
            footer={null}
        >
            <Flex vertical gap={16} className="run-tests-modal__body">
                <Text type="secondary" className="run-tests-modal__description">
                    {t('testGenerator.runTestsDescription', { framework, filename })}
                </Text>

                <Tabs
                    items={[
                        {
                            key: 'code',
                            label: t('testGenerator.testCode'),
                            children: (
                                <Flex vertical gap={8}>
                                    <Text className="run-tests-modal__step-label">
                                        {t('testGenerator.saveFileAs', { filename })}
                                    </Text>
                                    <CodeBlock
                                        code={mergedCode}
                                        onCopy={() => copyToClipboard(mergedCode, setCopiedCode)}
                                        copied={copiedCode}
                                    />
                                </Flex>
                            ),
                        },
                        {
                            key: 'setup',
                            label: t('testGenerator.setup'),
                            children: (
                                <Flex vertical gap={16}>
                                    <Flex vertical gap={6}>
                                        <Text className="run-tests-modal__step-label">
                                            1. {t('testGenerator.installDeps')}
                                        </Text>
                                        <CodeBlock
                                            code={install}
                                            onCopy={() => copyToClipboard(install, setCopiedInstall)}
                                            copied={copiedInstall}
                                        />
                                    </Flex>
                                    <Flex vertical gap={6}>
                                        <Text className="run-tests-modal__step-label">
                                            2. {t('testGenerator.runCommand')}
                                        </Text>
                                        <CodeBlock
                                            code={run}
                                            onCopy={() => copyToClipboard(run, setCopiedRun)}
                                            copied={copiedRun}
                                        />
                                    </Flex>
                                </Flex>
                            ),
                        },
                    ]}
                />
            </Flex>
        </Modal>
    )
}

export default RunTestsModal