import { Button, Flex, Layout } from "antd"
import { Icon } from '@iconify-icon/react';
import AppBreadcrumb from "./AppBreadcrumb";
import ThemeSwitch from "../components/ThemeSwitch";
import LanguageSelect from "../components/LanguageSelect";
import "../assets/style/layout/AppHeader.scss"
import { useDispatch, useSelector } from "react-redux";
import { handleCollapsedMenu } from "../redux/Sidebar/sidebarSlice";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const { Header } = Layout;

const AppHeader = () => {

  const dispatch = useDispatch()
  const collapsed = useSelector((state: any) => state.collapsed.collapsed);

  const { logout } = useContext(AuthContext);  // ← keycloak yerine logout al

  return (
    <div className="header-container">
      <Header className='dark:bg-darkColor dark:text-lightColor'>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <Flex className="p-2" justify="space-between" align="center">
            <Button
              type="text"
              icon={collapsed
                ? <Icon className="collapse-icon" icon="ant-design:menu-fold-outline" width='15px' height='18px' />
                : <Icon className="collapse-icon" icon="ant-design:menu-unfold-outlined" width='15px' height='18px' />
              }
              onClick={() => dispatch(handleCollapsedMenu())}
            />
            <AppBreadcrumb />
          </Flex>
          <Flex className="p-2" justify="space-between" align="center">
            <ThemeSwitch />
            <LanguageSelect />
            <Button
              onClick={logout}  // ← direkt logout
              type="text"
              icon={<Icon className="exit-icon" icon="ci:exit" width='25px' />}
            />
          </Flex>
        </Flex>
      </Header>
    </div>
  )
}

export default AppHeader