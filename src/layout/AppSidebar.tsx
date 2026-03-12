import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import "../assets/style/layout/AppSidebar.scss";
import { createModifiedMenu } from "../utils/sidebar";
import { useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";

const AppSidebar = () => {
    const { userRoles } = useContext(AuthContext)
    const menuItems = createModifiedMenu({ userRoles });

    const collapsed = useSelector((state: any) => state.collapsed.collapsed);
    const [openKeys, setOpenKeys] = useState<string[]>(['/dashboard', '/security', '/management', '/reports']);

    useEffect(() => {
        if (collapsed) {
            setOpenKeys([]);
        } else {
            setOpenKeys(['/dashboard', '/security', '/management', '/reports']);
        }
    }, [collapsed]);

    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    return (
        <Sider className={`sider-container ${collapsed ? 'collapsed-sider-container' : ''}`}>
            <Menu
                mode={collapsed ? 'vertical' : 'inline'}
                openKeys={collapsed ? undefined : openKeys}
                onOpenChange={handleOpenChange}
                items={menuItems}
                selectedKeys={[location.pathname]}
            />
        </Sider>
    );
};

export default AppSidebar;