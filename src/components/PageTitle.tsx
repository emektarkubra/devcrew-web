import { Typography } from "antd"
import { MENU_ROUTES } from "../routes";
import { useLocation } from "react-router-dom";
const { Title } = Typography;

const PageTitle = () => {
    const { pathname } = useLocation()

    return (
        <div className="title-container">
            <Title className="page-title" level={4}>
                {MENU_ROUTES?.filter(item => item.path === pathname)[0].title}
            </Title>
            <hr style={{ color: 'rgb(89,89,89,0.2)' }} />
        </div>
    )
}

export default PageTitle