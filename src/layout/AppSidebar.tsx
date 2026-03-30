import { Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import "../assets/style/layout/AppSidebar.scss";
import { createModifiedMenu } from "../utils/sidebar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const AppSidebar = () => {
    const menuItems = createModifiedMenu() as MenuProps['items'];

    const collapsed = useSelector((state: any) => state.collapsed.collapsed);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    useEffect(() => {
        if (collapsed) {
            setOpenKeys([]);
        } else {
            setOpenKeys([]);
        }
    }, [collapsed]);

    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    return (
        <Sider className={`sider-container ${collapsed ? 'collapsed-sider-container' : ''}`}>

            <Menu
                mode="inline"
                inlineCollapsed={collapsed}
                openKeys={collapsed ? undefined : openKeys}
                onOpenChange={handleOpenChange}
                items={menuItems}
                selectedKeys={[location.pathname]}
            />
        </Sider>
    );
};

export default AppSidebar;