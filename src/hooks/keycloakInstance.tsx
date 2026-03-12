import Keycloak from 'keycloak-js';

console.log(window.KEYCLOAK_URL)

export const initOptions = {
    url: window.KEYCLOAK_URL, // Keycloak sunucusunun adresi
    realm: window.KEYCLOAK_REALM,              // Keycloak realm adı
    clientId: window.KEYCLOAK_CLIENT,          // Keycloak istemci ID'si
    onLoad: 'login-required',      // Giriş gereksinimi
    // KeycloakResponseType: 'code',       // Opsiyonel: 'code' veya 'id_token token' (default 'code')
}

const keycloakInstance = new Keycloak(initOptions);

export default keycloakInstance;
