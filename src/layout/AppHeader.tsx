import { Button, Flex, Layout, Select, Tooltip } from 'antd'
import { Icon } from '@iconify-icon/react'
import AppBreadcrumb from './AppBreadcrumb'
import ThemeSwitch from '../components/ThemeSwitch'
import LanguageSelect from '../components/LanguageSelect'
import { useDispatch, useSelector } from 'react-redux'
import { handleCollapsedMenu, setCollapsed } from '../redux/Sidebar/sidebarSlice'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/authContext'
import { useRepo } from '../context/repoContext'
import { getLanguageColor } from '../utils/languageColors'
import { TbLogout } from 'react-icons/tb'
import { GithubOutlined } from '@ant-design/icons'
import '../assets/style/layout/AppHeader.scss'
import { useTranslation } from 'react-i18next'

const { Header } = Layout

const AppHeader = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const collapsed = useSelector((state: any) => state.collapsed.collapsed)
    const { logout } = useContext(AuthContext)
    const { repos, selectedRepo, setSelectedRepo, reposLoading, fetchRepos } = useRepo()

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 881) {
                dispatch(setCollapsed(true))
            } else {
                dispatch(setCollapsed(false))
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [dispatch])

    return (
        <div className="header-container">
            <Header>
                <Flex className="header-container__inner" justify="space-between" align="center">
                    <Flex className="header-container__left" align="center">
                        <Button
                            type="text"
                            icon={collapsed
                                ? <Icon className="collapse-icon" icon="ant-design:menu-fold-outline" width="25px" height="18px" />
                                : <Icon className="collapse-icon" icon="ant-design:menu-unfold-outlined" width="25px" height="18px" />
                            }
                            onClick={() => dispatch(handleCollapsedMenu())}
                        />
                        <AppBreadcrumb />
                    </Flex>



                    <Flex className="header-container__right" align="center">
                        <Flex className="header-container__center" align="center">
                            <div className="header-container__repo-select-wrapper">
                                <Select
                                    style={{ width: '100%' }}
                                    allowClear
                                    placeholder={
                                        <Flex align="center" gap={6}>
                                            <GithubOutlined />
                                            <span>{t('layout.selectRepository')}</span>
                                        </Flex>
                                    }
                                    value={selectedRepo}
                                    onChange={setSelectedRepo}
                                    showSearch
                                    loading={reposLoading}
                                    onDropdownVisibleChange={(open) => { if (open) fetchRepos() }}
                                    options={repos?.map(repo => ({
                                        value: repo?.full_name,
                                        label: (
                                            <Tooltip title={repo?.full_name} placement="right">
                                                <Flex align="center" justify="space-between" style={{ overflow: 'hidden' }}>
                                                    <Flex align="center" gap={8} style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                                        <GithubOutlined style={{ flexShrink: 0 }} />
                                                        <span className="header-container__repo-name">{repo?.full_name}</span>
                                                    </Flex>
                                                    {repo?.language && (
                                                        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
                                                            <div
                                                                className="header-container__lang-dot"
                                                                style={{ background: getLanguageColor(repo?.language) }}
                                                            />
                                                            <span className="header-container__lang-text">{repo?.language}</span>
                                                        </Flex>
                                                    )}
                                                </Flex>
                                            </Tooltip>
                                        ),
                                    }))}
                                />
                            </div>
                        </Flex>
                        <LanguageSelect />
                        <ThemeSwitch />
                        <Tooltip title="Logout" placement="bottom">
                            <button className="header-container__icon-btn" onClick={logout}>
                                <TbLogout size={18} />
                            </button>
                        </Tooltip>
                    </Flex>
                </Flex>
            </Header>
        </div>
    )
}

export default AppHeader