import { useState, useCallback, useEffect } from 'react'
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, BackgroundVariant, Handle, Position, NodeProps } from 'reactflow'
import dagre from 'dagre'
import 'reactflow/dist/style.css'
import { Flex, Tag, Typography, Select, Spin } from 'antd'
import { GithubOutlined, LoadingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import withLayout from '../../layout/withLayout'
import { api } from '../../services/api'
import { getLanguageColor } from '../../utils/languageColors'
import toast from 'react-hot-toast'
import './index.scss'

const { Text } = Typography

interface NodeData {
    label: string
    type: 'service' | 'database' | 'external' | 'middleware'
    language?: string
    path?: string
    description?: string
}

const nodeConfig = {
    service: { bgClass: 'service-node__card--service', dotClass: 'service-node__dot--service', handleClass: 'service-node__handle--service', tagClass: 'service-node__tag--service' },
    database: { bgClass: 'service-node__card--database', dotClass: 'service-node__dot--database', handleClass: 'service-node__handle--database', tagClass: 'service-node__tag--database' },
    external: { bgClass: 'service-node__card--external', dotClass: 'service-node__dot--external', handleClass: 'service-node__handle--external', tagClass: 'service-node__tag--external' },
    middleware: { bgClass: 'service-node__card--middleware', dotClass: 'service-node__dot--middleware', handleClass: 'service-node__handle--middleware', tagClass: 'service-node__tag--middleware' },
}

// apply layout
const applyLayout = (nodes: any[], edges: any[]): any[] => {
    if (!nodes.length) return nodes

    const graph = new dagre.graphlib.Graph()
    graph?.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 100, marginx: 40, marginy: 40 })
    graph?.setDefaultEdgeLabel(() => ({}))

    nodes?.forEach(node => graph.setNode(node.id, { width: 160, height: 70 }))
    edges?.forEach(edge => graph.setEdge(edge.source, edge.target))
    dagre?.layout(graph)

    return nodes.map(n => {
        const pos = graph.node(n.id)
        if (!pos) return n
        return { ...n, position: { x: pos.x - 80, y: pos.y - 35 } }
    })
}

// service node
const ServiceNode = ({ data, selected }: NodeProps<NodeData>) => {
    const cfg = nodeConfig[data?.type] ?? nodeConfig.service
    return (
        <>
            <Handle type="target" position={Position.Top} className={`service-node__handle ${cfg.handleClass}`} />
            <Handle type="target" position={Position.Left} className={`service-node__handle ${cfg.handleClass}`} />
            <div className={`service-node__card ${cfg.bgClass} ${selected ? 'service-node__card--selected' : ''}`}>
                <Flex align="center" gap={6} className="service-node__head">
                    <div className={`service-node__dot ${cfg.dotClass}`} />
                    <Text className="service-node__label">{data?.label}</Text>
                </Flex>
                <Flex align="center" gap={4} wrap="wrap">
                    <Tag className={`service-node__tag ${cfg.tagClass}`}>{data?.type}</Tag>
                    {data?.language && (
                        <Tag className="service-node__tag service-node__tag--lang">
                            <Flex align="center" gap={4}>
                                <div
                                    className="service-node__lang-dot"
                                    style={{ background: getLanguageColor(data?.language) }}
                                />
                                {data?.language}
                            </Flex>
                        </Tag>
                    )}
                </Flex>
            </div>
            <Handle type="source" position={Position.Bottom} className={`service-node__handle ${cfg?.handleClass}`} />
            <Handle type="source" position={Position.Right} className={`service-node__handle ${cfg?.handleClass}`} />
        </>
    )
}

const nodeTypes = { serviceNode: ServiceNode }


const ArchitectureGraph = () => {
    const { t } = useTranslation()

    const legend = [
        { type: 'service', label: t('architectureGraph.service') },
        { type: 'database', label: t('architectureGraph.database') },
        { type: 'external', label: t('architectureGraph.external') },
        { type: 'middleware', label: t('architectureGraph.middleware') },
    ]

    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [filter, setFilter] = useState<string>('all')
    const [repos, setRepos] = useState<any[]>([])
    const [reposLoading, setReposLoading] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const token = localStorage.getItem('dt-token') || ''

    // get repo
    const getRepos = async () => {
        setReposLoading(true)
        try {
            const { data, error } = await api.profile.getRepos(token)
            if (error) {
                toast.error(error)
            } else {
                setRepos(data)
                if (data?.length > 0) setSelectedRepo(data[0].full_name)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setReposLoading(false)
        }
    }

    // get architecture
    const getArchitecture = async (owner: string, repo: string) => {
        setLoading(true)
        setNodes([])
        setEdges([])
        try {
            const { data, error } = await api.agents.getArchitecture(token, owner, repo)
            if (error) {
                toast.error(error)
            } else {
                const laid = applyLayout(data.nodes ?? [], data.edges ?? [])
                setNodes(laid)
                setEdges(data.edges ?? [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getRepos()
    }, [])

    useEffect(() => {
        if (!selectedRepo) return
        const [owner, repo] = selectedRepo.split('/')
        getArchitecture(owner, repo)
    }, [selectedRepo])

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges(eds => addEdge({ ...params, animated: true, className: 'architecture-graph__edge' }, eds)),
        [setEdges]
    )


    const visibleNodes = filter === 'all'
        ? nodes
        : nodes?.map(n => ({ ...n, hidden: n.data.type !== filter }))

    const nodeCount = visibleNodes?.filter(n => !n.hidden)?.length
    const edgeCount = edges?.length

    return (
        <div className="architecture-graph">

            <Flex align="center" justify="space-between" className="architecture-graph__header">
                <Flex align="center" gap={10} className="architecture-graph__header-left">
                    <div className={`architecture-graph__dot ${selectedRepo ? 'architecture-graph__dot--active' : ''}`} />
                    <Flex vertical align="flex-start" gap={2}>
                        <Text strong className="architecture-graph__title">
                            {t('architectureGraph.title')}
                        </Text>
                        <Text type="secondary" className="architecture-graph__subtitle">
                            {selectedRepo
                                ? t('architectureGraph.subtitle', { repo: selectedRepo, nodes: nodeCount, edges: edgeCount })
                                : t('architectureGraph.selectRepo')
                            }
                        </Text>
                    </Flex>
                </Flex>

                <Flex align="center" gap={8} className="architecture-graph__header-actions">
                    <Select
                        className="architecture-graph__repo-select"
                        placeholder={
                            <Flex align="center" gap={6}>
                                <GithubOutlined />
                                <span>{t('architectureGraph.selectRepo')}</span>
                            </Flex>
                        }
                        value={selectedRepo}
                        onChange={setSelectedRepo}
                        showSearch
                        loading={reposLoading}
                        disabled={loading}
                        options={repos?.map(repo => ({
                            value: repo?.full_name,
                            label: (
                                <Flex align="center" justify="space-between">
                                    <Flex align="center" gap={8}>
                                        <GithubOutlined />
                                        <span>{repo?.full_name}</span>
                                    </Flex>
                                    {repo?.language && (
                                        <Flex align="center" gap={4}>
                                            <div
                                                className="pr-review__lang-dot"
                                                style={{ background: getLanguageColor(repo?.language) }}
                                            />
                                            <Text className="pr-review__lang-text">{repo?.language}</Text>
                                        </Flex>
                                    )}
                                </Flex>
                            ),
                        }))}
                    />
                    <Tag className="architecture-graph__live-tag">
                        {t('architectureGraph.live')}
                    </Tag>
                </Flex>
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
                        disabled={loading || !selectedRepo}
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
                    {legend?.map(l => (
                        <Flex key={l?.type} align="center" gap={5}>
                            <div className={`architecture-graph__legend-dot architecture-graph__legend-dot--${l?.type}`} />
                            <Text type="secondary" className="architecture-graph__legend-label">{l?.label}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Flex>

            <div className="architecture-graph__graph">
                {loading ? (
                    <Flex align="center" justify="center" className="architecture-graph__loading">
                        <Flex vertical align="center" gap={12}>
                            <Spin indicator={<LoadingOutlined className="architecture-graph__spin-icon" spin />} />
                            <Text type="secondary" className="architecture-graph__loading-text">
                                {t('architectureGraph.analyzing')}
                            </Text>
                        </Flex>
                    </Flex>
                ) : !selectedRepo ? (
                    <Flex align="center" justify="center" className="architecture-graph__loading">
                        <Flex vertical align="center" gap={8}>
                            <GithubOutlined className="architecture-graph__empty-icon" />
                            <Text type="secondary" className="architecture-graph__loading-text">
                                {t('architectureGraph.selectRepoFirst')}
                            </Text>
                        </Flex>
                    </Flex>
                ) : nodes.length === 0 ? (
                    <Flex align="center" justify="center" className="architecture-graph__loading">
                        <Text type="secondary" className="architecture-graph__loading-text">
                            {t('architectureGraph.noNodes')}
                        </Text>
                    </Flex>
                ) : (
                    <ReactFlow
                        nodes={visibleNodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
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
                            nodeColor={n => {
                                const map: Record<string, string> = {
                                    service: '#0969da',
                                    database: '#1a7f37',
                                    external: '#bc4c00',
                                    middleware: '#8250df',
                                }
                                return map[(n.data as NodeData).type] ?? '#8c959f'
                            }}
                            className="architecture-graph__minimap"
                        />
                    </ReactFlow>
                )}
            </div>
        </div>
    )
}

export default withLayout(<ArchitectureGraph />)