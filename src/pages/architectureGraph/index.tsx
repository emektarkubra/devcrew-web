import React, { useState, useCallback } from 'react'
import ReactFlow, {
    Node, Edge, Background, Controls, MiniMap,
    useNodesState, useEdgesState, addEdge,
    Connection, BackgroundVariant, Handle, Position, NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button, Flex, Tag, Typography, Select, Drawer, List } from 'antd'
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
    service: { bg: '#eff6ff', border: '#93c5fd', dot: '#185FA5', tag: 'blue' },
    database: { bg: '#f0fdf4', border: '#86efac', dot: '#16a34a', tag: 'green' },
    external: { bg: '#fffbeb', border: '#fcd34d', dot: '#d97706', tag: 'orange' },
    middleware: { bg: '#faf5ff', border: '#c4b5fd', dot: '#7c3aed', tag: 'purple' },
}

const ServiceNode = ({ data, selected }: NodeProps<NodeData>) => {
    const cfg = NODE_CONFIG[data.type]
    return (
        <>
            <Handle type="target" position={Position.Top} className="service-node__handle" style={{ background: cfg.dot }} />
            <Handle type="target" position={Position.Left} className="service-node__handle" style={{ background: cfg.dot }} />
            <div style={{
                background: cfg.bg,
                border: `1.5px solid ${selected ? cfg.dot : cfg.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                minWidth: 140,
                boxShadow: selected ? `0 0 0 2px ${cfg.dot}33` : 'none',
            }}>
                <Flex align="center" gap={6} style={{ marginBottom: 4 }}>
                    <div className="service-node__dot" style={{ background: cfg.dot }} />
                    <Text className="service-node__label">{data.label}</Text>
                </Flex>
                <Flex align="center" gap={4}>
                    <Tag color={cfg.tag} className="service-node__tag">{data.type}</Tag>
                    {data.language && (
                        <Tag className="service-node__tag">{data.language}</Tag>
                    )}
                </Flex>
            </div>
            <Handle type="source" position={Position.Bottom} className="service-node__handle" style={{ background: cfg.dot }} />
            <Handle type="source" position={Position.Right} className="service-node__handle" style={{ background: cfg.dot }} />
        </>
    )
}

const nodeTypes = { serviceNode: ServiceNode }

const INITIAL_NODES: Node<NodeData>[] = [
    { id: '1', type: 'serviceNode', position: { x: 320, y: 40 }, data: { label: 'API Gateway', type: 'middleware', language: 'FastAPI', description: 'Tüm gelen istekleri yönlendirir.' } },
    { id: '2', type: 'serviceNode', position: { x: 80, y: 180 }, data: { label: 'Auth Service', type: 'service', language: 'Python', description: 'JWT tabanlı kimlik doğrulama.' } },
    { id: '3', type: 'serviceNode', position: { x: 320, y: 180 }, data: { label: 'User Service', type: 'service', language: 'Python', description: 'Kullanıcı CRUD işlemleri.' } },
    { id: '4', type: 'serviceNode', position: { x: 560, y: 180 }, data: { label: 'Payment Service', type: 'service', language: 'Python', description: 'Stripe entegrasyonu.' } },
    { id: '5', type: 'serviceNode', position: { x: 80, y: 340 }, data: { label: 'PostgreSQL', type: 'database', description: 'Ana veritabanı.' } },
    { id: '6', type: 'serviceNode', position: { x: 320, y: 340 }, data: { label: 'Redis', type: 'database', description: 'Cache ve session.' } },
    { id: '7', type: 'serviceNode', position: { x: 560, y: 340 }, data: { label: 'Stripe API', type: 'external', description: 'Ödeme altyapısı.' } },
    { id: '8', type: 'serviceNode', position: { x: 180, y: 480 }, data: { label: 'pgvector', type: 'database', description: 'Embedding vektörleri.' } },
    { id: '9', type: 'serviceNode', position: { x: 460, y: 480 }, data: { label: 'GitHub API', type: 'external', description: 'Repo ve PR verileri.' } },
]

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#93c5fd' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#93c5fd' } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#93c5fd' } },
    { id: 'e2-5', source: '2', target: '5', style: { stroke: '#86efac' } },
    { id: 'e2-6', source: '2', target: '6', style: { stroke: '#86efac' } },
    { id: 'e3-5', source: '3', target: '5', style: { stroke: '#86efac' } },
    { id: 'e4-7', source: '4', target: '7', style: { stroke: '#fcd34d' } },
    { id: 'e5-8', source: '5', target: '8', style: { stroke: '#86efac' } },
    { id: 'e3-9', source: '3', target: '9', style: { stroke: '#fcd34d' } },
]

const LEGEND = [
    { type: 'service', label: 'Service' },
    { type: 'database', label: 'Database' },
    { type: 'external', label: 'External' },
    { type: 'middleware', label: 'Middleware' },
] as const

const ArchitectureGraph: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES)
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [filter, setFilter] = useState<string>('all')

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    )

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
        setSelectedNode(node)
        setDrawerOpen(true)
    }, [])

    const visibleNodes = filter === 'all'
        ? nodes
        : nodes.map((n) => ({ ...n, hidden: n.data.type !== filter }))

    return (
        <div className="architecture-graph">

            {/* Header */}
            <Flex align="center" justify="space-between" className="architecture-graph__header">
                <Flex align="center" gap={10}>
                    <div className="architecture-graph__dot" />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong style={{ fontSize: 15 }}>Architecture Graph</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            myorg/backend-api · {nodes.length} node · {edges.length} bağlantı
                        </Text>
                    </Flex>
                </Flex>
                <Tag className="architecture-graph__live-tag">Canlı</Tag>
            </Flex>

            {/* Toolbar */}
            <Flex align="center" justify="space-between" className="architecture-graph__toolbar">
                <Flex align="center" gap={8}>
                    <Text type="secondary" className="architecture-graph__filter-label">Filtre:</Text>
                    <Select
                        value={filter}
                        onChange={setFilter}
                        size="small"
                        style={{ width: 130 }}
                        options={[
                            { value: 'all', label: 'Tümü' },
                            { value: 'service', label: 'Service' },
                            { value: 'database', label: 'Database' },
                            { value: 'external', label: 'External' },
                            { value: 'middleware', label: 'Middleware' },
                        ]}
                    />
                </Flex>

                <Flex align="center" gap={12}>
                    {LEGEND.map((l) => (
                        <Flex key={l.type} align="center" gap={5}>
                            <div
                                className="architecture-graph__legend-dot"
                                style={{ background: NODE_CONFIG[l.type].dot }}
                            />
                            <Text type="secondary" className="architecture-graph__legend-label">{l.label}</Text>
                        </Flex>
                    ))}
                </Flex>

                <Flex gap={6}>
                    <Button size="small" onClick={() => setNodes(INITIAL_NODES)}>Sıfırla</Button>
                    <Button size="small" type="primary" className="architecture-graph__download-btn">
                        PNG olarak indir
                    </Button>
                </Flex>
            </Flex>

            {/* Graph */}
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
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
                    <Controls />
                    <MiniMap
                        nodeColor={(n) => NODE_CONFIG[(n.data as NodeData).type]?.dot ?? '#888'}
                        className="architecture-graph__minimap"
                    />
                </ReactFlow>
            </div>

            {/* Drawer */}
            <Drawer
                title={selectedNode?.data.label}
                placement="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={300}
            >
                {selectedNode && (
                    <Flex vertical gap={12}>
                        <Flex align="center" gap={8}>
                            <Tag color={NODE_CONFIG[selectedNode.data.type].tag}>
                                {selectedNode.data.type}
                            </Tag>
                            {selectedNode.data.language && (
                                <Tag>{selectedNode.data.language}</Tag>
                            )}
                        </Flex>

                        {selectedNode.data.description && (
                            <div>
                                <Text
                                    type="secondary"
                                    className="architecture-graph__drawer-label architecture-graph__drawer-desc-label"
                                >
                                    Açıklama
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
                                Bağlantılar
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
                                                <Text type="secondary" className="architecture-graph__drawer-conn-arrow">
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