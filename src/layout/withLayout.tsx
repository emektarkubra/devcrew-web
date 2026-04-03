import { Flex, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import "../assets/style/layout/layout.scss"
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import logo from "../assets/images/devCrew1.png"

const withLayout = (PageContent: any) => {

  return () => (
    <Layout className="app-container">
      <div>
        <AppHeader />
      </div>
      <Layout className="app-inside-container">
        <Flex vertical className="sidebar-container" >
          {/* <Image
            src={logo}
            preview={false}
            className="app-container__logo"
          /> */}
          <AppSidebar />
        </Flex>
        <Content className="content-container">
          {/* <PageTitle /> */}
          {PageContent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default withLayout;