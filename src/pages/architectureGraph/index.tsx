import React, { useState, useCallback } from 'react'
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    Handle,
    Position,
    NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button, Flex, Tag, Typography, Select, Drawer, List } from 'antd'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import './index.scss'

const { Text } = Typography

interface NodeData {
    label: string
    type: 'service' | 'database' | 'external' | 'middleware'
    language?: string
    dependencies?: number
    description?: string
}

const NODE_CONFIG = {
    service: {
        bgClass: 'service-node__card--service',
        dotClass: 'service-node__dot--service',
        handleClass: 'service-node__handle--service',
        tagClass: 'service-node__tag--service',
    },
    database: {
        bgClass: 'service-node__card--database',
        dotClass: 'service-node__dot--database',
        handleClass: 'service-node__handle--database',
        tagClass: 'service-node__tag--database',
    },
    external: {
        bgClass: 'service-node__card--external',
        dotClass: 'service-node__dot--external',
        handleClass: 'service-node__handle--external',
        tagClass: 'service-node__tag--external',
    },
    middleware: {
        bgClass: 'service-node__card--middleware',
        dotClass: 'service-node__dot--middleware',
        handleClass: 'service-node__handle--middleware',
        tagClass: 'service-node__tag--middleware',
    },
}

const ServiceNode = ({ data, selected }: NodeProps<NodeData>) => {
    const cfg = NODE_CONFIG[data.type]

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                className={`service-node__handle ${cfg.handleClass}`}
            />
            <Handle
                type="target"
                position={Position.Left}
                className={`service-node__handle ${cfg.handleClass}`}
            />

            <div
                className={`service-node__card ${cfg.bgClass} ${selected ? 'service-node__card--selected' : ''
                    }`}
            >
                <Flex align="center" gap={6} className="service-node__head">
                    <div className={`service-node__dot ${cfg.dotClass}`} />
                    <Text className="service-node__label">{data.label}</Text>
                </Flex>

                <Flex align="center" gap={4} wrap="wrap">
                    <Tag className={`service-node__tag ${cfg.tagClass}`}>{data.type}</Tag>
                    {data.language && <Tag className="service-node__tag">{data.language}</Tag>}
                </Flex>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={`service-node__handle ${cfg.handleClass}`}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={`service-node__handle ${cfg.handleClass}`}
            />
        </>
    )
}

const nodeTypes = { serviceNode: ServiceNode }

const INITIAL_NODES: Node<NodeData>[] = [
    {
        id: '1',
        type: 'serviceNode',
        position: { x: 320, y: 40 },
        data: {
            label: 'API Gateway',
            type: 'middleware',
            language: 'FastAPI',
            description: 'Tüm gelen istekleri yönlendirir.',
        },
    },
    {
        id: '2',
        type: 'serviceNode',
        position: { x: 80, y: 180 },
        data: {
            label: 'Auth Service',
            type: 'service',
            language: 'Python',
            description: 'JWT tabanlı kimlik doğrulama.',
        },
    },
    {
        id: '3',
        type: 'serviceNode',
        position: { x: 320, y: 180 },
        data: {
            label: 'User Service',
            type: 'service',
            language: 'Python',
            description: 'Kullanıcı CRUD işlemleri.',
        },
    },
    {
        id: '4',
        type: 'serviceNode',
        position: { x: 560, y: 180 },
        data: {
            label: 'Payment Service',
            type: 'service',
            language: 'Python',
            description: 'Stripe entegrasyonu.',
        },
    },
    {
        id: '5',
        type: 'serviceNode',
        position: { x: 80, y: 340 },
        data: {
            label: 'PostgreSQL',
            type: 'database',
            description: 'Ana veritabanı.',
        },
    },
    {
        id: '6',
        type: 'serviceNode',
        position: { x: 320, y: 340 },
        data: {
            label: 'Redis',
            type: 'database',
            description: 'Cache ve session.',
        },
    },
    {
        id: '7',
        type: 'serviceNode',
        position: { x: 560, y: 340 },
        data: {
            label: 'Stripe API',
            type: 'external',
            description: 'Ödeme altyapısı.',
        },
    },
    {
        id: '8',
        type: 'serviceNode',
        position: { x: 180, y: 480 },
        data: {
            label: 'pgvector',
            type: 'database',
            description: 'Embedding vektörleri.',
        },
    },
    {
        id: '9',
        type: 'serviceNode',
        position: { x: 460, y: 480 },
        data: {
            label: 'GitHub API',
            type: 'external',
            description: 'Repo ve PR verileri.',
        },
    },
]

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, className: 'architecture-graph__edge architecture-graph__edge--service' },
    { id: 'e1-3', source: '1', target: '3', animated: true, className: 'architecture-graph__edge architecture-graph__edge--service' },
    { id: 'e1-4', source: '1', target: '4', animated: true, className: 'architecture-graph__edge architecture-graph__edge--service' },
    { id: 'e2-5', source: '2', target: '5', className: 'architecture-graph__edge architecture-graph__edge--database' },
    { id: 'e2-6', source: '2', target: '6', className: 'architecture-graph__edge architecture-graph__edge--database' },
    { id: 'e3-5', source: '3', target: '5', className: 'architecture-graph__edge architecture-graph__edge--database' },
    { id: 'e4-7', source: '4', target: '7', className: 'architecture-graph__edge architecture-graph__edge--external' },
    { id: 'e5-8', source: '5', target: '8', className: 'architecture-graph__edge architecture-graph__edge--database' },
    { id: 'e3-9', source: '3', target: '9', className: 'architecture-graph__edge architecture-graph__edge--external' },
]

const ArchitectureGraph: React.FC = () => {
    const { t } = useTranslation()

    const LEGEND = [
        { type: 'service', label: t('architectureGraph.service') },
        { type: 'database', label: t('architectureGraph.database') },
        { type: 'external', label: t('architectureGraph.external') },
        { type: 'middleware', label: t('architectureGraph.middleware') },
    ] as const

    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES)
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [filter, setFilter] = useState<string>('all')

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: true, className: 'architecture-graph__edge' }, eds)
            ),
        [setEdges]
    )

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
        setSelectedNode(node)
        setDrawerOpen(true)
    }, [])

    const visibleNodes =
        filter === 'all' ? nodes : nodes.map((n) => ({ ...n, hidden: n.data.type !== filter }))

    return (
        <div className="architecture-graph">
            <Flex align="center" justify="space-between" className="architecture-graph__header">
                <Flex align="center" gap={10} className="architecture-graph__header-left">
                    <div className="architecture-graph__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="architecture-graph__title">
                            {t('architectureGraph.title')}
                        </Text>
                        <Text type="secondary" className="architecture-graph__subtitle">
                            {t('architectureGraph.subtitle', {
                                repo: 'myorg/backend-api',
                                nodes: nodes.length,
                                edges: edges.length,
                            })}
                        </Text>
                    </Flex>
                </Flex>

                <Tag className="architecture-graph__live-tag">
                    {t('architectureGraph.live')}
                </Tag>
            </Flex>

            <Flex align="center" justify="space-between" className="architecture-graph__toolbar">
                <Flex align="center" gap={8} className="architecture-graph__toolbar-group">
                    <Text type="secondary" className="architecture-graph__filter-label">
                        {t('architectureGraph.filter')}
                    </Text>
                    <Select
                        value={filter}
                        onChange={setFilter}
                        size="small"
                        className="architecture-graph__filter-select"
                        options={[
                            { value: 'all', label: t('architectureGraph.all') },
                            { value: 'service', label: t('architectureGraph.service') },
                            { value: 'database', label: t('architectureGraph.database') },
                            { value: 'external', label: t('architectureGraph.external') },
                            { value: 'middleware', label: t('architectureGraph.middleware') },
                        ]}
                    />
                </Flex>

                <Flex align="center" gap={12} className="architecture-graph__legend">
                    {LEGEND.map((l) => (
                        <Flex key={l.type} align="center" gap={5}>
                            <div
                                className={`architecture-graph__legend-dot architecture-graph__legend-dot--${l.type}`}
                            />
                            <Text type="secondary" className="architecture-graph__legend-label">
                                {l.label}
                            </Text>
                        </Flex>
                    ))}
                </Flex>

                <Flex gap={6} className="architecture-graph__toolbar-actions">
                    <Button
                        size="small"
                        className="architecture-graph__reset-btn"
                        onClick={() => setNodes(INITIAL_NODES)}
                    >
                        {t('architectureGraph.reset')}
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        className="architecture-graph__download-btn"
                    >
                        {t('architectureGraph.downloadPng')}
                    </Button>
                </Flex>
            </Flex>

            <div className="architecture-graph__graph">
                <ReactFlow
                    nodes={visibleNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        className="architecture-graph__background"
                    />
                    <Controls />
                    <MiniMap
                        nodeColor={(n) => {
                            const type = (n.data as NodeData).type
                            const map: Record<string, string> = {
                                service: '#0969da',
                                database: '#1a7f37',
                                external: '#bc4c00',
                                middleware: '#8250df',
                            }
                            return map[type] ?? '#8c959f'
                        }}
                        className="architecture-graph__minimap"
                    />
                </ReactFlow>
            </div>

            <Drawer
                title={selectedNode?.data.label}
                placement="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={300}
                className="architecture-graph__drawer"
            >
                {selectedNode && (
                    <Flex vertical gap={12}>
                        <Flex align="center" gap={8} wrap="wrap">
                            <Tag className={`service-node__tag service-node__tag--${selectedNode.data.type}`}>
                                {t(`architectureGraph.${selectedNode.data.type}`)}
                            </Tag>
                            {selectedNode.data.language && (
                                <Tag className="service-node__tag">{selectedNode.data.language}</Tag>
                            )}
                        </Flex>

                        {selectedNode.data.description && (
                            <div>
                                <Text
                                    type="secondary"
                                    className="architecture-graph__drawer-label architecture-graph__drawer-desc-label"
                                >
                                    {t('architectureGraph.description')}
                                </Text>
                                <Text className="architecture-graph__drawer-description">
                                    {selectedNode.data.description}
                                </Text>
                            </div>
                        )}

                        <div>
                            <Text
                                type="secondary"
                                className="architecture-graph__drawer-label architecture-graph__drawer-conn-label"
                            >
                                {t('architectureGraph.connections')}
                            </Text>
                            <List
                                size="small"
                                dataSource={edges.filter(
                                    (e) => e.source === selectedNode.id || e.target === selectedNode.id
                                )}
                                renderItem={(edge) => {
                                    const isSource = edge.source === selectedNode.id
                                    const otherId = isSource ? edge.target : edge.source
                                    const otherNode = nodes.find((n) => n.id === otherId)

                                    return (
                                        <List.Item className="architecture-graph__drawer-conn-item">
                                            <Flex align="center" gap={6}>
                                                <Text
                                                    type="secondary"
                                                    className="architecture-graph__drawer-conn-arrow"
                                                >
                                                    {isSource ? '→' : '←'}
                                                </Text>
                                                <Text className="architecture-graph__drawer-conn-label-text">
                                                    {otherNode?.data.label}
                                                </Text>
                                            </Flex>
                                        </List.Item>
                                    )
                                }}
                            />
                        </div>
                    </Flex>
                )}
            </Drawer>
        </div>
    )
}

export default withLayout(<ArchitectureGraph />)