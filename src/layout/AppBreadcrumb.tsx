import { Icon } from "@iconify-icon/react";
import { Breadcrumb } from "antd";
import "../assets/style/layout/AppBreadcrumbs.scss";
import { MENU_ROUTES } from "../routes";
import { useLocation, Link } from "react-router-dom";

const AppBreadcrumb = () => {
    const { pathname } = useLocation();

    const findBreadcrumbs = () => {
        let breadcrumbArray: any = [];
        let currentPath = '';

        pathname.split('/').forEach((segment) => {
            if (segment) {
                currentPath += `/${segment}`;
                const matchRoute = MENU_ROUTES.find((route) => route.path === currentPath);
                if (matchRoute) {
                    breadcrumbArray.push({
                        title: matchRoute.title,
                        path: matchRoute.path,
                        isCurrent: pathname === matchRoute.path,
                    });
                }
            }
        });

        if (pathname === '/') {
            breadcrumbArray.unshift({
                title: 'Main title',
                path: '/',
                isCurrent: true,
            });
        }

        return breadcrumbArray;
    };

    const breadcrumbItems = [
        {
            title: (
                <Link to="/">
                    <Icon icon="icomoon-free:home" width="15px" height="15px" />
                </Link>
            ),
            key: 'home',
        },
        ...findBreadcrumbs().map((item: any) => ({
            title: item.isCurrent ? item.title : <Link to={item.path}>{item.title}</Link>,
            key: item.path,
        })),
    ];

    return (
        <div className="ml-4 mt-1">
            <Breadcrumb className="custom-breadcrumbs" items={breadcrumbItems} />
        </div>
    );
};

export default AppBreadcrumb;