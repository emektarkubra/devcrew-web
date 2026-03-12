export { }

declare global {
    interface Window {
        API_BASE_URL: string;
        KEYCLOAK_URL: string;
        KEYCLOAK_REALM: string;
        KEYCLOAK_CLIENT: string
    }
}