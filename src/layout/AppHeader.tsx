import { Button, Flex, Layout, Tooltip } from "antd"
import { Icon } from '@iconify-icon/react'
import AppBreadcrumb from "./AppBreadcrumb"
import ThemeSwitch from "../components/ThemeSwitch"
import LanguageSelect from "../components/LanguageSelect"
import { useDispatch, useSelector } from "react-redux"
import { handleCollapsedMenu, setCollapsed } from "../redux/Sidebar/sidebarSlice"
import { useContext, useEffect } from "react"
import { AuthContext } from "../context/authContext"
import { TbLogout } from "react-icons/tb"
import "../assets/style/layout/AppHeader.scss"

const { Header } = Layout

const AppHeader = () => {
  const dispatch = useDispatch()
  const collapsed = useSelector((state: any) => state.collapsed.collapsed)
  const { logout } = useContext(AuthContext)

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