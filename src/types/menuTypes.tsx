export interface MenuTypes {
    key: string;
    label: string;
    title?: string;
    href?: string;
    icon?: JSX.Element;
    roles?: string[];
    children?: MenuTypes[];
    
}